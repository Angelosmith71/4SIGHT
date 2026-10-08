export const GROQ_AGENT_PLAN = {
  id: 'groqAgent' as const,
  name: 'Grok xAI Agent',
  tagline: 'Grok from xAI for your Guardian dashboard',
  color: '#FFB648',
  monthlyPrice: 1500, // $15.00
  trialDays: 7,
  monthlyTokenCap: 500_000,
  stripePriceId: process.env.NEXT_PUBLIC_STRIPE_GROQ_AGENT_MONTHLY ?? '',
  features: [
    'Grok (xAI) chat inside Guardian',
    'Live dashboard context (threats, metrics, Family Watch)',
    '500,000 tokens per billing month',
    'Separate from Pro and from Grok Advisor',
    'Cancel anytime',
  ],
};

export type GroqAgentPlanId = typeof GROQ_AGENT_PLAN.id;

export function isGroqAgentActive(status: string | null | undefined): boolean {
  return status === 'active' || status === 'trialing';
}
