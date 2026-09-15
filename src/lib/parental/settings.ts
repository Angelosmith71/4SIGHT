export const PARENTAL_SETTINGS_KEY = 'guardian-parental-notify';

export interface ParentalNotifySettings {
  email: string;
  phone: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  autoNotifyCritical: boolean;
}

export const DEFAULT_PARENTAL_SETTINGS: ParentalNotifySettings = {
  email: '',
  phone: '',
  emailEnabled: true,
  smsEnabled: true,
  autoNotifyCritical: true,
};

export function loadParentalSettings(): ParentalNotifySettings {
  if (typeof window === 'undefined') return DEFAULT_PARENTAL_SETTINGS;
  try {
    const raw = localStorage.getItem(PARENTAL_SETTINGS_KEY);
    if (!raw) return DEFAULT_PARENTAL_SETTINGS;
    return { ...DEFAULT_PARENTAL_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PARENTAL_SETTINGS;
  }
}

export function saveParentalSettings(settings: ParentalNotifySettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PARENTAL_SETTINGS_KEY, JSON.stringify(settings));
}

export const SENT_ALERTS_KEY = 'guardian-parental-sent-alerts';

export function markAlertSent(alertId: string) {
  if (typeof window === 'undefined') return;
  const sent = loadSentAlertIds();
  sent.add(alertId);
  localStorage.setItem(SENT_ALERTS_KEY, JSON.stringify([...sent]));
}

export function loadSentAlertIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(SENT_ALERTS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}
