import { NextResponse } from 'next/server';
import { BOT_LIMIT, createApiKey, hashApiKey, requireProtocolUser } from '@/lib/protocol/server';

export async function GET() {
  const auth = await requireProtocolUser();
  if (auth.error) return auth.error;
  const { user, admin } = auth;
  const { data, error } = await admin
    .from('protocol_bots')
    .select('id, name, job, allowed_tools, allowed_data, forbidden_actions, api_key_prefix, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bots: data ?? [], limit: BOT_LIMIT });
}

export async function POST(request: Request) {
  const auth = await requireProtocolUser();
  if (auth.error) return auth.error;
  const { user, admin } = auth;

  const body = await request.json().catch(() => null) as {
    name?: string; job?: string; allowedTools?: string; allowedData?: string; forbiddenActions?: string;
  } | null;
  const name = body?.name?.trim() ?? '';
  if (!name) return NextResponse.json({ error: 'Name the bot.' }, { status: 400 });

  const { count } = await admin.from('protocol_bots').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
  if ((count ?? 0) >= BOT_LIMIT) {
    return NextResponse.json({ error: `Protocol Check includes ${BOT_LIMIT} bots.` }, { status: 400 });
  }

  const { key, prefix } = createApiKey();
  const { data, error } = await admin.from('protocol_bots').insert({
    user_id: user.id,
    name,
    job: body?.job?.trim() ?? '',
    allowed_tools: body?.allowedTools?.trim() ?? '',
    allowed_data: body?.allowedData?.trim() ?? '',
    forbidden_actions: body?.forbiddenActions?.trim() ?? '',
    api_key_hash: hashApiKey(key),
    api_key_prefix: prefix,
  }).select('id, name, job, allowed_tools, allowed_data, forbidden_actions, api_key_prefix, created_at').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bot: data, apiKey: key });
}

export async function DELETE(request: Request) {
  const auth = await requireProtocolUser();
  if (auth.error) return auth.error;
  const { user, admin } = auth;
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing bot id.' }, { status: 400 });
  const { error } = await admin.from('protocol_bots').delete().eq('id', id).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
