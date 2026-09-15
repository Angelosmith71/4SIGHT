import type { DbParentalAlert } from '@/lib/supabase/types';
import { demoParentalAlerts } from '@/lib/demo/data';

declare global {
  // eslint-disable-next-line no-var
  var __guardianDemoAlerts: DbParentalAlert[] | undefined;
}

export function getDemoAlerts(): DbParentalAlert[] {
  if (!global.__guardianDemoAlerts) {
    global.__guardianDemoAlerts = demoParentalAlerts.map(a => ({ ...a }));
  }
  return global.__guardianDemoAlerts;
}

export function addDemoAlert(entry: DbParentalAlert) {
  getDemoAlerts().unshift(entry);
}

export function newAlertId() {
  return `p${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
