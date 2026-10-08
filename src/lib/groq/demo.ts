export function demoGroqReply(userMessage: string): string {
  const q = userMessage.toLowerCase();
  if (q.includes('threat') || q.includes('attack')) {
    return `[Demo — Grok xAI Agent is not calling the live API]

**Threats**
- Review critical items first: injection attempts and edge spikes.
- Confirm blocked sources stay blocked before investigating medium alerts.

Subscribe to Grok xAI Agent for live answers on your dashboard data.`;
  }
  if (q.includes('family') || q.includes('child') || q.includes('screen')) {
    return `[Demo — Grok xAI Agent is not calling the live API]

**Family Watch**
- Check children near their screen-time limit and any unread high-severity alerts.
- Pair the Chrome extension if a device has not reported in.

Subscribe to Grok xAI Agent for live answers on your dashboard data.`;
  }
  return `[Demo — Grok xAI Agent is not calling the live API]

Ask about threats, Family Watch, or what to fix first. A paid Grok xAI Agent subscription unlocks live Grok responses with your dashboard context.`;
}
