import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { DEMO_COOKIE, isDemoMode } from '@/lib/demo';
import { groqAccessError, loadGroqAccess, recordGroqTokens, tokensUsedThisPeriod } from '@/lib/groq/access';
import { demoGroqReply } from '@/lib/groq/demo';
import { buildGroqSystemPrompt } from '@/lib/groq/system-prompt';
import { grokChat, type GrokMessage } from '@/lib/grok/client';
import { getGrokModel, isGrokConfigured } from '@/lib/grok/config';
import { buildDashboardContext, type GrokContextMode } from '@/lib/grok/context';
import { GROQ_AGENT_PLAN } from '@/lib/stripe/groq-plan';
import { createClient } from '@/lib/supabase/server';

async function isAuthorized(): Promise<boolean> {
  if (isDemoMode()) {
    const store = await cookies();
    return store.get(DEMO_COOKIE)?.value === '1';
  }
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  return !!user;
}

export async function POST(request: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const rawMessages = Array.isArray(body.messages) ? body.messages : [];
    const contextMode = (body.context ?? 'auto') as GrokContextMode;

    const messages: GrokMessage[] = rawMessages
      .filter((m: { role?: string; content?: string }) => m.role && m.content)
      .slice(-20)
      .map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content).slice(0, 8000),
      }));

    if (!messages.length || messages[messages.length - 1].role !== 'user') {
      return NextResponse.json({ error: 'Last message must be from user' }, { status: 400 });
    }

    const lastUser = messages[messages.length - 1].content;

    if (isDemoMode()) {
      return NextResponse.json({
        message: { role: 'assistant', content: demoGroqReply(lastUser) },
        demo: true,
        model: 'demo',
        usage: { tokensUsed: 0, tokenCap: GROQ_AGENT_PLAN.monthlyTokenCap },
      });
    }

    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const row = await loadGroqAccess(user.id);
    const denied = groqAccessError(row);
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });
    if (!row) return NextResponse.json({ error: 'Grok xAI Agent subscription required' }, { status: 402 });

    if (!isGrokConfigured()) {
      return NextResponse.json({ error: 'Grok is not configured' }, { status: 503 });
    }

    const contextBlock = await buildDashboardContext(contextMode);
    const system: GrokMessage = { role: 'system', content: buildGroqSystemPrompt(contextBlock) };
    const result = await grokChat([system, ...messages]);

    const usedBefore = tokensUsedThisPeriod(row);
    const nextUsed = usedBefore + result.totalTokens;
    try {
      await recordGroqTokens(user.id, row.current_period_start, nextUsed);
    } catch (err) {
      console.error(err);
    }

    return NextResponse.json({
      message: { role: 'assistant', content: result.content },
      demo: false,
      model: getGrokModel(),
      usage: { tokensUsed: nextUsed, tokenCap: GROQ_AGENT_PLAN.monthlyTokenCap },
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Grok request failed' }, { status: 500 });
  }
}
