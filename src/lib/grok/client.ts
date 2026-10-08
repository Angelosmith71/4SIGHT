import { XAI_API_BASE, getGrokModel, isGrokConfigured } from '@/lib/grok/config';
import { demoGrokReply } from '@/lib/grok/demo';

export type GrokMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export async function grokChat(messages: GrokMessage[]): Promise<{ content: string; demo: boolean; totalTokens: number }> {
  if (!isGrokConfigured()) {
    const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';
    return { content: demoGrokReply(lastUser), demo: true, totalTokens: 0 };
  }

  const res = await fetch(`${XAI_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: getGrokModel(),
      messages,
      temperature: 0.4,
      max_tokens: 1200,
    }),
  });

  const json = await res.json() as {
    error?: { message?: string };
    choices?: { message?: { content?: string } }[];
    usage?: { total_tokens?: number };
  };

  if (!res.ok) {
    throw new Error(json.error?.message ?? `Grok API error (${res.status})`);
  }

  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty response from Grok');
  return { content, demo: false, totalTokens: json.usage?.total_tokens ?? 0 };
}
