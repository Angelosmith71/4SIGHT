export function isDemoMode(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return true;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  if (!url || !anon) return true;
  if (url.includes('your-project') || url.includes('your-actual-project')) return true;
  if (anon === 'eyJ...' || anon.length < 50) return true;
  return false;
}

export const DEMO_COOKIE = 'guardian-demo';
