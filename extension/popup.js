import { pairDevice, fetchConfig, getSettings } from './lib/api.js';

const pairView = document.getElementById('pair-view');
const pairedView = document.getElementById('paired-view');
const errorEl = document.getElementById('error');

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.classList.remove('hidden');
}

function clearError() {
  errorEl.classList.add('hidden');
}

async function renderPaired() {
  const settings = await getSettings();
  if (!settings.deviceToken) {
    pairView.classList.remove('hidden');
    pairedView.classList.add('hidden');
    return;
  }

  pairView.classList.add('hidden');
  pairedView.classList.remove('hidden');

  document.getElementById('server-url').textContent = settings.apiUrl || '—';

  try {
    const config = await fetchConfig();
    const child = config.child;
    document.getElementById('child-name').textContent = child?.name || '—';
    document.getElementById('filter-label').textContent = child?.content_filter || '—';
    const limit = child?.screen_time_limit_mins ?? 0;
    const used = child?.screen_time_mins ?? 0;
    document.getElementById('screen-time').textContent = limit > 0 ? `${used} / ${limit} min` : `${used} min`;
  } catch {
    document.getElementById('child-name').textContent = settings.childName || 'Connected';
  }
}

document.getElementById('pair-btn').addEventListener('click', async () => {
  clearError();
  const apiUrl = document.getElementById('api-url').value.trim();
  const code = document.getElementById('pair-code').value.trim().toUpperCase();
  const deviceName = document.getElementById('device-name').value.trim() || 'Chrome Device';

  if (!apiUrl || !code) {
    showError('Server URL and pairing code are required.');
    return;
  }

  try {
    const result = await pairDevice(apiUrl, code, deviceName);
    await chrome.storage.local.set({
      apiUrl,
      deviceToken: result.device_token,
      childName: result.child?.name,
      contentFilter: result.child?.content_filter,
    });
    await renderPaired();
  } catch (e) {
    showError(e.message || 'Pairing failed');
  }
});

document.getElementById('refresh-btn').addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'REFRESH_CONFIG' });
  await renderPaired();
});

document.getElementById('unpair-btn').addEventListener('click', async () => {
  await chrome.storage.local.clear();
  pairView.classList.remove('hidden');
  pairedView.classList.add('hidden');
});

renderPaired();
