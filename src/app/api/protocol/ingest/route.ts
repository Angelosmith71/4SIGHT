import { NextResponse } from 'next/server';
import { checkActivity } from '@/lib/protocol/check';
import { hashApiKey } from '@/lib/protocol/server';
import { createServiceClient } from '@/lib/supabase/server';
import { isDemoMode } from '@/lib/demo';
import { isProtocolWatchActive } from '@/lib/stripe/protocol-plan';

export async function POST(request: Request) {
  if (isDemoMode()) {
    return NextResponse.json({ error: 'Demo mode checks bots in the browser. Use the Protocol Check page.' }, { status: 400 });
  }

  const header = request.headers.get('authorization') ?? '';
  const key = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
  if (!key.startsWith('pw_')) {
    return NextResponse.json({ error: 'Send the bot API key as Authorization: Bearer pw_…' }, { status: 401 });
  }

  const admin = createServiceClient();
  const { data: bot } = await admin
    .from('protocol_bots')
    .select('id, user_id, name, job, allowed_tools, allowed_data, forbidden_actions')
    .eq('api_key_hash', hashApiKey(key))
    .single();
  if (!bot) return NextResponse.json({ error: 'Unknown API key.' }, { status: 401 });

  const { data: sub } = await admin.from('protocol_watch_subscriptions').select('status').eq('user_id', bot.user_id).single();
  if (!isProtocolWatchActive(sub?.status)) {
    return NextResponse.json({ error: 'Protocol Check is not active for this bot.' }, { status: 402 });
  }

  const body = await request.json().catch(() => null) as {
    prompt?: string; tool?: string; data?: string; action?: string; reply?: string;
  } | null;

  const result = checkActivity(
    {
      job: bot.job,
      allowedTools: bot.allowed_tools,
      allowedData: bot.allowed_data,
      forbiddenActions: bot.forbidden_actions,
    },
    {
      prompt: body?.prompt,
      tool: body?.tool,
      data: body?.data,
      action: body?.action,
      reply: body?.reply,
    },
  );

  await admin.from('protocol_checks').insert({
    user_id: bot.user_id,
    bot_id: bot.id,
    prompt: body?.prompt?.trim() || null,
    tool: body?.tool?.trim() || null,
    data_accessed: body?.data?.trim() || null,
    action: body?.action?.trim() || null,
    reply: body?.reply?.trim() || null,
    verdict: result.verdict,
    violation: result.violation,
  });

  return NextResponse.json({ bot: bot.name, verdict: result.verdict, violation: result.violation });
}
