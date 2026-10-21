import { NextResponse } from 'next/server';
import { requireProtocolUser } from '@/lib/protocol/server';

export async function GET() {
  const auth = await requireProtocolUser();
  if (auth.error || !auth.user) return NextResponse.json({ alert: null });

  const { user, admin } = auth;
  const { data: rows } = await admin
    .from('protocol_checks')
    .select('violation, bot_id, verdict')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1);
  const data = rows?.[0];

  if (!data || data.verdict !== 'fail' || !data.violation) return NextResponse.json({ alert: null });

  const { data: bot } = await admin.from('protocol_bots').select('name').eq('id', data.bot_id).single();
  return NextResponse.json({
    alert: data.violation as string,
    botName: (bot?.name as string | undefined) ?? 'Bot',
  });
}
