import { createHash, randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { isDemoMode } from '@/lib/demo';
import { isProtocolWatchActive, PROTOCOL_WATCH_PLAN } from '@/lib/stripe/protocol-plan';

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export function createApiKey(): { key: string; prefix: string } {
  const key = `pw_${randomBytes(24).toString('base64url')}`;
  return { key, prefix: `${key.slice(0, 10)}…` };
}

export async function requireProtocolUser() {
  if (isDemoMode()) {
    return { error: NextResponse.json({ error: 'Demo mode keeps bots in this browser.' }, { status: 400 }) };
  }
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };

  const admin = createServiceClient();
  const { data: sub } = await admin.from('protocol_watch_subscriptions').select('status').eq('user_id', user.id).single();
  if (!isProtocolWatchActive(sub?.status)) {
    return { error: NextResponse.json({ error: 'Protocol Check subscription required' }, { status: 402 }) };
  }
  return { user, admin, error: null as null };
}

export const BOT_LIMIT = PROTOCOL_WATCH_PLAN.botLimit;
