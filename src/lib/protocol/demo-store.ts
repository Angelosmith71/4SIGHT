const KEY = 'guardian-protocol-watch';

export interface DemoBot {
  id: string;
  name: string;
  job: string;
  allowedTools: string;
  allowedData: string;
  forbiddenActions: string;
  apiKeyPrefix: string;
  apiKey: string;
}

export interface DemoCheck {
  id: string;
  botId: string;
  botName: string;
  verdict: 'pass' | 'fail';
  violation: string | null;
  createdAt: string;
}

interface DemoState {
  bots: DemoBot[];
  checks: DemoCheck[];
}

const empty = (): DemoState => ({ bots: [], checks: [] });

export function readProtocolDemo(): DemoState {
  if (typeof window === 'undefined') return empty();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as DemoState;
    return { bots: parsed.bots ?? [], checks: parsed.checks ?? [] };
  } catch {
    return empty();
  }
}

export function writeProtocolDemo(state: DemoState) {
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

export function latestProtocolFailure(): { botName: string; alert: string } | null {
  const latest = readProtocolDemo().checks[0];
  if (!latest || latest.verdict !== 'fail' || !latest.violation) return null;
  return { botName: latest.botName, alert: latest.violation };
}
