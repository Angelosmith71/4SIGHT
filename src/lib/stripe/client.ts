import Stripe from 'stripe';
import { isDemoMode } from '@/lib/demo';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (isDemoMode()) {
    throw new Error('Stripe is not configured in demo mode');
  }
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('Missing STRIPE_SECRET_KEY');
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20', typescript: true });
  }
  return _stripe;
}

/** @deprecated use getStripe() */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
