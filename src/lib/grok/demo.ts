export function demoGrokReply(userMessage: string): string {
  const q = userMessage.toLowerCase();

  if (q.includes('family') || q.includes('child') || q.includes('parent') || q.includes('screen time')) {
    return `[Demo — add XAI_API_KEY for live Grok]

**Family Watch summary**
- Emma (12, PG filter): 94/120 min screen time — approaching limit; 2 alerts today including PG-13 content on Netflix.
- Jake (15, PG-13): flagged web visit logged — review recommended.
- Lily (9): offline, within limits.

**Suggested actions**
1. Review Jake's flagged site in Family Watch → Alerts.
2. Consider tightening Emma's filter or enabling auto-notify for high severity.
3. Pair the Chrome extension if devices aren't linked yet.`;
  }

  if (q.includes('threat') || q.includes('attack') || q.includes('sql') || q.includes('ddos')) {
    return `[Demo — add XAI_API_KEY for live Grok]

**Threat posture**
- Active critical items include SQL injection attempts and a DDoS spike on edge nodes.
- Privacy score ~86; threat score elevated at 6.4.

**Priorities**
1. Keep SQL injection source (192.168.4.21) blocked and verify WAF rules.
2. Confirm DDoS mitigation is still engaged on edge-01.
3. Investigate medium-severity auth anomalies on svc_deploy.`;
  }

  if (q.includes('bot') || q.includes('tracker') || q.includes('cookie')) {
    return `[Demo — add XAI_API_KEY for live Grok]

**Bot & privacy**
- Bot Monitor shows clipboard and cookie-scan attempts — most blocked or quarantined.
- Cookie Shield and Tracker Defense are doing the heavy lifting.

**Tip:** Review Bot Monitor for anything in "Monitoring" status and promote to block if behavior repeats.`;
  }

  return `[Demo — add XAI_API_KEY for live Grok]

I'm your Guardian advisor (Grok integration). Ask about:
- **Threats** — severity, what to fix first
- **Family Watch** — alerts, screen time, content filters
- **Bots & privacy** — trackers, cookies, suspicious extensions

Example: "Summarize my top threats" or "What should I do about Emma's alerts?"`;
}
