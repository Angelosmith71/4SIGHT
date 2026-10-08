import { NextRequest, NextResponse } from 'next/server';
import { DEMO_COOKIE, isDemoMode } from '@/lib/demo';
import { grokChat, type GrokMessage } from '@/lib/grok/client';
import { buildDashboardContext, type GrokContextMode } from '@/lib/grok/context';
import { buildGuardianSystemPrompt } from '@/lib/grok/system-prompt';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

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

    const contextBlock = await buildDashboardContext(contextMode);
    const system: GrokMessage = {
      role: 'system',
      content: buildGuardianSystemPrompt(contextBlock),
    };

    const result = await grokChat([system, ...messages]);

    return NextResponse.json({
      message: { role: 'assistant', content: result.content },
      demo: result.demo,
      model: result.demo ? 'demo' : process.env.XAI_MODEL ?? 'grok-3-mini',
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Grok request failed' }, { status: 500 });
  }
}
