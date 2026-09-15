export const FAMILY_WATCH_PLAN = {
  id: 'familyWatch' as const,
  name: 'Family Watch',
  tagline: 'Parental monitoring for children under 18',
  color: '#00FF9C',
  monthlyPrice: 2000, // $20.00
  trialDays: 7,
  stripePriceId: process.env.NEXT_PUBLIC_STRIPE_FAMILY_WATCH_MONTHLY ?? '',
  features: [
    'Monitor viewing activity on child devices',
    'Per-child content filters (G, PG, PG-13)',
    'Daily screen time limits',
    'Instant parent email & SMS alerts',
    'Guardian Chrome extension',
    'Cancel anytime',
  ],
};

export type FamilyWatchPlanId = typeof FAMILY_WATCH_PLAN.id;

export function isFamilyWatchActive(status: string | null | undefined): boolean {
  return status === 'active' || status === 'trialing';
}
