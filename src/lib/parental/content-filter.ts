import type { DbChildProfile, DbViewingActivity } from '@/lib/supabase/types';

export type ContentFilter = DbChildProfile['content_filter'];

export const CONTENT_FILTERS: { value: ContentFilter; label: string; desc: string; color: string }[] = [
  { value: 'G', label: 'G', desc: 'General audiences — kid-safe only', color: '#00FF9C' },
  { value: 'PG', label: 'PG', desc: 'Parental guidance — mild themes OK', color: '#00E6FF' },
  { value: 'PG-13', label: 'PG-13', desc: 'Teens — no mature or violent content', color: '#A45CFF' },
  { value: 'R', label: 'R', desc: 'Restricted — alerts only, minimal blocking', color: '#FFB648' },
];

const FILTER_LEVEL: Record<ContentFilter, number> = { G: 0, PG: 1, 'PG-13': 2, R: 3 };
const ACTIVITY_LEVEL: Record<DbViewingActivity['rating'], number> = { safe: 0, review: 2, flagged: 3 };

export function defaultContentFilterForAge(age: number): ContentFilter {
  if (age <= 8) return 'G';
  if (age <= 12) return 'PG';
  if (age <= 15) return 'PG-13';
  return 'PG-13';
}

export function contentFilterInfo(filter: ContentFilter) {
  return CONTENT_FILTERS.find(f => f.value === filter) ?? CONTENT_FILTERS[1];
}

export function contentExceedsFilter(filter: ContentFilter, rating: DbViewingActivity['rating']): boolean {
  return ACTIVITY_LEVEL[rating] > FILTER_LEVEL[filter];
}

export function isValidContentFilter(value: unknown): value is ContentFilter {
  return typeof value === 'string' && value in FILTER_LEVEL;
}
