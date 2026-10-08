export const XAI_API_BASE = 'https://api.x.ai/v1';

export function getGrokModel(): string {
  return process.env.XAI_MODEL?.trim() || 'grok-3-mini';
}

export function isGrokConfigured(): boolean {
  const key = process.env.XAI_API_KEY?.trim() ?? '';
  return key.length > 20 && !key.includes('...');
}
