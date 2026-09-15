const PLATFORMS = [
  { pattern: /youtube\.com|youtu\.be/i, platform: 'YouTube', category: 'video', icon: '▶', baseRating: 'review' },
  { pattern: /tiktok\.com/i, platform: 'TikTok', category: 'social', icon: '♪', baseRating: 'review' },
  { pattern: /instagram\.com/i, platform: 'Instagram', category: 'social', icon: '📷', baseRating: 'review' },
  { pattern: /netflix\.com/i, platform: 'Netflix', category: 'streaming', icon: '🎬', baseRating: 'review' },
  { pattern: /disneyplus\.com|disney\.com/i, platform: 'Disney+', category: 'streaming', icon: '📺', baseRating: 'safe' },
  { pattern: /roblox\.com/i, platform: 'Roblox', category: 'gaming', icon: '🎮', baseRating: 'safe' },
  { pattern: /twitch\.tv/i, platform: 'Twitch', category: 'streaming', icon: '📡', baseRating: 'review' },
  { pattern: /reddit\.com/i, platform: 'Reddit', category: 'social', icon: '💬', baseRating: 'review' },
  { pattern: /twitter\.com|x\.com/i, platform: 'X', category: 'social', icon: '𝕏', baseRating: 'review' },
  { pattern: /facebook\.com/i, platform: 'Facebook', category: 'social', icon: '👥', baseRating: 'review' },
  { pattern: /discord\.com/i, platform: 'Discord', category: 'social', icon: '💬', baseRating: 'review' },
];

const FLAGGED_KEYWORDS = ['porn', 'xxx', 'adult', 'mature', 'nsfw', 'gambling', 'casino', 'weapon', 'violence', 'drug', 'suicide', 'gore', 'hentai', 'onlyfans'];
const REVIEW_KEYWORDS = ['dating', 'chat', 'hookup', 'horror', 'thriller', 'fight', 'challenge', 'prank'];

const FILTER_LEVEL = { G: 0, PG: 1, 'PG-13': 2, R: 3 };
const ACTIVITY_LEVEL = { safe: 0, review: 2, flagged: 3 };

function hostname(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

function classifyUrl(url, documentTitle) {
  const lower = url.toLowerCase();
  const host = hostname(url);

  for (const kw of FLAGGED_KEYWORDS) {
    if (lower.includes(kw)) {
      return { platform: host, category: 'web', rating: 'flagged', icon: '⛔', title: documentTitle || host };
    }
  }

  for (const p of PLATFORMS) {
    if (p.pattern.test(lower)) {
      let rating = p.baseRating;
      for (const kw of REVIEW_KEYWORDS) { if (lower.includes(kw)) { rating = 'review'; break; } }
      for (const kw of FLAGGED_KEYWORDS) { if (lower.includes(kw)) { rating = 'flagged'; break; } }
      return { platform: p.platform, category: p.category, rating, icon: p.icon, title: documentTitle || host };
    }
  }

  let rating = 'safe';
  for (const kw of REVIEW_KEYWORDS) { if (lower.includes(kw)) { rating = 'review'; break; } }
  return { platform: host || 'Web', category: 'web', rating, icon: '🌐', title: documentTitle || host };
}

function contentExceedsFilter(filter, rating) {
  return ACTIVITY_LEVEL[rating] > FILTER_LEVEL[filter];
}

function screenTimeExceeded(used, limit) {
  return limit > 0 && used >= limit;
}

function shouldBlock(config, classified) {
  if (!config?.child) return false;
  if (config.child.status === 'restricted') return true;
  if (screenTimeExceeded(config.child.screen_time_mins, config.child.screen_time_limit_mins)) return true;
  if (config.child.content_filter === 'R') return classified.rating === 'flagged';
  return contentExceedsFilter(config.child.content_filter, classified.rating);
}

export { classifyUrl, contentExceedsFilter, screenTimeExceeded, shouldBlock };
