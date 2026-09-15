/** Recommended daily limit (minutes) by age when parent hasn't set one. */
export function defaultScreenTimeLimitForAge(age: number): number {
  if (age <= 5) return 60;
  if (age <= 9) return 90;
  if (age <= 12) return 120;
  return 180;
}

export const SCREEN_TIME_PRESETS = [
  { mins: 60, label: '1h' },
  { mins: 90, label: '1.5h' },
  { mins: 120, label: '2h' },
  { mins: 180, label: '3h' },
  { mins: 240, label: '4h' },
] as const;

export function formatScreenTime(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function screenTimePct(used: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

export type ScreenTimeStatus = 'ok' | 'warning' | 'over';

export function screenTimeStatus(used: number, limit: number): ScreenTimeStatus {
  if (limit <= 0) return 'ok';
  const pct = used / limit;
  if (pct >= 1) return 'over';
  if (pct >= 0.8) return 'warning';
  return 'ok';
}

export const SCREEN_TIME_STATUS_COLOR: Record<ScreenTimeStatus, string> = {
  ok: '#A45CFF',
  warning: '#FFB648',
  over: '#FF2E4C',
};
