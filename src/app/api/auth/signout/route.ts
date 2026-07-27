import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DEMO_COOKIE, isDemoMode } from '@/lib/demo';

export async function POST() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const res = NextResponse.redirect(new URL('/login', base));
  if (isDemoMode()) {
    res.cookies.set(DEMO_COOKIE, '', { path: '/', maxAge: 0 });
    return res;
  }
  const sb = await createClient();
  await sb.auth.signOut();
  return res;
}
