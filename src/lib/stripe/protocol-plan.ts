export const PROTOCOL_WATCH_PLAN = {
  id: 'protocolWatch' as const,
  name: 'Protocol Check',
  tagline: 'Check that business AI bots stay inside their written rules',
  color: '#00E6FF',
  monthlyPrice: 4900, // $49.00
  trialDays: 7,
  botLimit: 3,
  stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PROTOCOL_WATCH_MONTHLY ?? '',
  features: [
    'Register up to 3 business bots',
    'Write the tools, data, and actions each bot is allowed',
    'Pass or fail on every step the bot reports',
    'Dashboard alert when a bot leaves its protocol',
    'Separate from Pro, Family Watch, and Grok xAI Agent',
    'Cancel anytime',
  ],
};

export type ProtocolWatchPlanId = typeof PROTOCOL_WATCH_PLAN.id;

export function isProtocolWatchActive(status: string | null | undefined): boolean {
  return status === 'active' || status === 'trialing';
}
