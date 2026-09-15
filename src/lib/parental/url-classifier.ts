import type { DbViewingActivity } from '@/lib/supabase/types';

type Category = DbViewingActivity['category'];
type Rating = DbViewingActivity['rating'];

interface ClassifiedSite {
  platform: string;
  category: Category;
  rating: Rating;
  icon: string;
  title: string;
}

const PLATFORMS: { pattern: RegExp; platform: string; category: Category; icon: string; baseRating: Rating }[] = [
  { pattern: /youtube\.com|youtu\.be/i, platform: 'YouTube', category: 'video', icon: 'ti-brand-youtube', baseRating: 'review' },
  { pattern: /tiktok\.com/i, platform: 'TikTok', category: 'social', icon: 'ti-brand-tiktok', baseRating: 'review' },
  { pattern: /instagram\.com/i, platform: 'Instagram', category: 'social', icon: 'ti-brand-instagram', baseRating: 'review' },
  { pattern: /netflix\.com/i, platform: 'Netflix', category: 'streaming', icon: 'ti-movie', baseRating: 'review' },
  { pattern: /disneyplus\.com|disney\.com/i, platform: 'Disney+', category: 'streaming', icon: 'ti-device-tv', baseRating: 'safe' },
  { pattern: /roblox\.com/i, platform: 'Roblox', category: 'gaming', icon: 'ti-device-gamepad-2', baseRating: 'safe' },
  { pattern: /twitch\.tv/i, platform: 'Twitch', category: 'streaming', icon: 'ti-brand-twitch', baseRating: 'review' },
  { pattern: /reddit\.com/i, platform: 'Reddit', category: 'social', icon: 'ti-brand-reddit', baseRating: 'review' },
  { pattern: /twitter\.com|x\.com/i, platform: 'X', category: 'social', icon: 'ti-brand-x', baseRating: 'review' },
  { pattern: /facebook\.com/i, platform: 'Facebook', category: 'social', icon: 'ti-brand-facebook', baseRating: 'review' },
  { pattern: /discord\.com/i, platform: 'Discord', category: 'social', icon: 'ti-brand-discord', baseRating: 'review' },
  { pattern: /hulu\.com|max\.com|hbomax\.com|primevideo\.com/i, platform: 'Streaming', category: 'streaming', icon: 'ti-device-tv', baseRating: 'review' },
];

const FLAGGED_KEYWORDS = [
  'porn', 'xxx', 'adult', 'mature', 'nsfw', 'gambling', 'casino', 'weapon', 'violence',
  'drug', 'suicide', 'self-harm', 'gore', 'hentai', 'onlyfans',
];

const REVIEW_KEYWORDS = [
  'dating', 'chat', 'hookup', 'horror', 'thriller', 'fight', 'challenge', 'prank',
];

function hostname(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

function pageTitle(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\//g, ' ').trim();
    return path ? `${hostname(url)} — ${path.slice(0, 60)}` : hostname(url);
  } catch {
    return url.slice(0, 80);
  }
}

export function classifyUrl(url: string, documentTitle?: string): ClassifiedSite {
  const lower = url.toLowerCase();
  const host = hostname(url);

  for (const kw of FLAGGED_KEYWORDS) {
    if (lower.includes(kw)) {
      return { platform: host, category: 'web', rating: 'flagged', icon: 'ti-world-exclamation', title: documentTitle || pageTitle(url) };
    }
  }

  for (const p of PLATFORMS) {
    if (p.pattern.test(lower)) {
      let rating = p.baseRating;
      for (const kw of REVIEW_KEYWORDS) {
        if (lower.includes(kw)) { rating = 'review'; break; }
      }
      for (const kw of FLAGGED_KEYWORDS) {
        if (lower.includes(kw)) { rating = 'flagged'; break; }
      }
      return { platform: p.platform, category: p.category, rating, icon: p.icon, title: documentTitle || pageTitle(url) };
    }
  }

  let rating: Rating = 'safe';
  for (const kw of REVIEW_KEYWORDS) {
    if (lower.includes(kw)) { rating = 'review'; break; }
  }

  return { platform: host || 'Web', category: 'web', rating, icon: 'ti-world', title: documentTitle || pageTitle(url) };
}
