import { createBrowserClient } from '@supabase/ssr';

const DEMO_URL = 'https://placeholder.supabase.co';
const DEMO_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEMO_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEMO_KEY;
  return createBrowserClient(url, key);
}
