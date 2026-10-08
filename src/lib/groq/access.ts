import { createServiceClient } from '@/lib/supabase/server';
import { GROQ_AGENT_PLAN, isGroqAgentActive } from '@/lib/stripe/groq-plan';

export type GroqAccessRow = {
  status: string;
  tokens_used: number;
  token_period_start: string | null;
  current_period_start: string | null;
};

export function tokensUsedThisPeriod(row: GroqAccessRow): number {
  const used = row.tokens_used ?? 0;
  if (!row.token_period_start) return 0;
  if (row.current_period_start && new Date(row.token_period_start) < new Date(row.current_period_start)) {
    return 0;
  }
  return used;
}

export async function loadGroqAccess(userId: string): Promise<GroqAccessRow | null> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('groq_agent_subscriptions')
    .select('status, tokens_used, token_period_start, current_period_start')
    .eq('user_id', userId)
    .single();
  if (error || !data) return null;
  return data as GroqAccessRow;
}

export function groqAccessError(row: GroqAccessRow | null): { status: number; error: string } | null {
  if (!row || !isGroqAgentActive(row.status)) {
    return { status: 402, error: 'Grok xAI Agent subscription required' };
  }
  if (tokensUsedThisPeriod(row) >= GROQ_AGENT_PLAN.monthlyTokenCap) {
    return { status: 429, error: 'Monthly Grok token allowance used. It resets at the next billing period.' };
  }
  return null;
}

export async function recordGroqTokens(userId: string, periodStart: string | null, nextUsed: number) {
  const sb = createServiceClient();
  await sb.from('groq_agent_subscriptions').update({
    tokens_used: nextUsed,
    token_period_start: periodStart ?? new Date().toISOString(),
  }).eq('user_id', userId);
}
