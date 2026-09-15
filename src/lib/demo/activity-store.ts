import type { DbViewingActivity } from '@/lib/supabase/types';
import { demoViewingActivity } from '@/lib/demo/data';

declare global {
  // eslint-disable-next-line no-var
  var __guardianDemoActivity: DbViewingActivity[] | undefined;
}

export function getDemoActivity(): DbViewingActivity[] {
  if (!global.__guardianDemoActivity) {
    global.__guardianDemoActivity = demoViewingActivity.map(a => ({ ...a }));
  }
  return global.__guardianDemoActivity;
}

export function addDemoActivity(entry: DbViewingActivity) {
  const list = getDemoActivity();
  list.unshift(entry);
  if (list.length > 100) list.length = 100;
}

export function newActivityId() {
  return `v${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
