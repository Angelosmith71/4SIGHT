import { classifyUrl, shouldBlock } from './lib/classify.js';
import { fetchConfig, reportVisit, getSettings } from './lib/api.js';

const BLOCKED_PAGE = chrome.runtime.getURL('blocked.html');
const activeTabs = new Map();
let cachedConfig = null;
let configFetchedAt = 0;

async function refreshConfig() {
  try {
    cachedConfig = await fetchConfig();
    configFetchedAt = Date.now();
    await chrome.storage.local.set({
      childName: cachedConfig.child?.name,
      contentFilter: cachedConfig.child?.content_filter,
    });
  } catch {
    cachedConfig = null;
  }
  return cachedConfig;
}

async function getConfig() {
  if (!cachedConfig || Date.now() - configFetchedAt > 60000) {
    await refreshConfig();
  }
  return cachedConfig;
}

function isInternalUrl(url) {
  return !url || url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('about:');
}

function blockReason(config, classified) {
  if (config?.child?.status === 'restricted') return 'Device is in restricted mode.';
  const limit = config?.child?.screen_time_limit_mins ?? 0;
  const used = config?.child?.screen_time_mins ?? 0;
  if (limit > 0 && used >= limit) return `Daily screen time limit reached (${used}/${limit} min).`;
  return `Content exceeds ${config?.child?.content_filter} filter (${classified.platform}).`;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('guardian-heartbeat', { periodInMinutes: 1 });
  chrome.alarms.create('guardian-config', { periodInMinutes: 2 });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'guardian-config') await refreshConfig();
  if (alarm.name === 'guardian-heartbeat') await flushActiveTabs();
});

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;
  const { deviceToken } = await getSettings();
  if (!deviceToken) return;
  if (isInternalUrl(details.url)) return;
  if (details.url.startsWith(BLOCKED_PAGE)) return;

  const config = await getConfig();
  if (!config) return;

  const classified = classifyUrl(details.url);
  if (shouldBlock(config, classified)) {
    const reason = encodeURIComponent(blockReason(config, classified));
    const child = encodeURIComponent(config.child?.name || 'Child');
    chrome.tabs.update(details.tabId, {
      url: `${BLOCKED_PAGE}?reason=${reason}&child=${child}&site=${encodeURIComponent(classified.platform)}`,
    });

    try {
      await reportVisit({ url: details.url, title: classified.title, duration_mins: 1, blocked: true });
      if (cachedConfig?.child) {
        cachedConfig.child.alerts_today = (cachedConfig.child.alerts_today || 0) + 1;
      }
      await refreshConfig();
    } catch { /* offline */ }
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  await startTracking(tabId);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    await startTracking(tabId, tab.url, tab.title);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  void flushTab(tabId);
});

async function startTracking(tabId, url, title) {
  await flushTab(tabId);
  if (!url || isInternalUrl(url)) return;
  activeTabs.set(tabId, { url, title: title || '', startedAt: Date.now() });
}

async function flushTab(tabId) {
  const session = activeTabs.get(tabId);
  if (!session) return;
  activeTabs.delete(tabId);

  const { deviceToken } = await getSettings();
  if (!deviceToken) return;

  const elapsedMs = Date.now() - session.startedAt;
  const duration_mins = Math.max(1, Math.round(elapsedMs / 60000));
  if (elapsedMs < 15000) return;

  try {
    const result = await reportVisit({
      url: session.url,
      title: session.title,
      duration_mins,
      blocked: false,
    });
    if (cachedConfig?.child && result.screen_time_mins != null) {
      cachedConfig.child.screen_time_mins = result.screen_time_mins;
      if (result.blocked) cachedConfig.child.status = 'restricted';
    }
  } catch { /* offline */ }
}

async function flushActiveTabs() {
  for (const tabId of activeTabs.keys()) {
    await flushTab(tabId);
  }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'GET_STATUS') {
    void (async () => {
      const settings = await getSettings();
      const config = settings.deviceToken ? await getConfig() : null;
      sendResponse({ settings, config });
    })();
    return true;
  }
  if (msg.type === 'REFRESH_CONFIG') {
    void refreshConfig().then(() => sendResponse({ ok: true }));
    return true;
  }
});
