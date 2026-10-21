import { NextResponse } from 'next/server';
import { checkActivity } from '@/lib/protocol/check';
import { requireProtocolUser } from '@/lib/protocol/server';

export async function GET() {
  const auth = await requireProtocolUser();
  if (auth.error) return auth.error;
  const { user, admin } = auth;
  const { data, error } = await admin
    .from('protocol_checks')
    .select('id, bot_id, prompt, tool, data_accessed, action, reply, verdict, violation, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ checks: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireProtocolUser();
  if (auth.error) return auth.error;
  const { user, admin } = auth;

  const body = await request.json().catch(() => null) as {
    botId?: string; prompt?: string; tool?: string; data?: string; action?: string; reply?: string;
  } | null;
  if (!body?.botId) return NextResponse.json({ error: 'Choose a bot.' }, { status: 400 });

  const { data: bot } = await admin
    .from('protocol_bots')
    .select('id, job, allowed_tools, allowed_data, forbidden_actions')
    .eq('id', body.botId)
    .eq('user_id', user.id)
    .single();
  if (!bot) return NextResponse.json({ error: 'Bot not found.' }, { status: 404 });

  const result = checkActivity(
    {
      job: bot.job,
      allowedTools: bot.allowed_tools,
      allowedData: bot.allowed_data,
      forbiddenActions: bot.forbidden_actions,
    },
    { prompt: body.prompt, tool: body.tool, data: body.data, action: body.action, reply: body.reply },
  );

  const { data, error } = await admin.from('protocol_checks').insert({
    user_id: user.id,
    bot_id: bot.id,
    prompt: body.prompt?.trim() || null,
    tool: body.tool?.trim() || null,
    data_accessed: body.data?.trim() || null,
    action: body.action?.trim() || null,
    reply: body.reply?.trim() || null,
    verdict: result.verdict,
    violation: result.violation,
  }).select('id, bot_id, verdict, violation, created_at').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ check: data, ...result });
}
