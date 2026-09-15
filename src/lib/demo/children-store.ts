import type { DbChildProfile } from '@/lib/supabase/types';
import { demoChildren } from '@/lib/demo/data';
import { defaultContentFilterForAge } from '@/lib/parental/content-filter';
import { defaultScreenTimeLimitForAge } from '@/lib/parental/screen-time';

declare global {
  // eslint-disable-next-line no-var
  var __guardianDemoChildren: DbChildProfile[] | undefined;
}

function normalizeChild(c: DbChildProfile): DbChildProfile {
  return {
    ...c,
    screen_time_limit_mins: c.screen_time_limit_mins ?? defaultScreenTimeLimitForAge(c.age),
    content_filter: c.content_filter ?? defaultContentFilterForAge(c.age),
  };
}

export function getDemoChildren(): DbChildProfile[] {
  if (!global.__guardianDemoChildren) {
    global.__guardianDemoChildren = demoChildren.map(c => normalizeChild({ ...c }));
  }
  return global.__guardianDemoChildren;
}

export function setDemoChildren(children: DbChildProfile[]) {
  global.__guardianDemoChildren = children;
}

export function upsertDemoChild(child: DbChildProfile) {
  const list = getDemoChildren();
  const normalized = normalizeChild(child);
  const idx = list.findIndex(c => c.id === child.id);
  if (idx >= 0) list[idx] = normalized;
  else list.push(normalized);
}

export function removeDemoChild(id: string) {
  setDemoChildren(getDemoChildren().filter(c => c.id !== id));
}

export function newDemoChildId() {
  return `c${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
