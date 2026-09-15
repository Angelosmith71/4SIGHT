const EXT_VERSION = '1.0.0';

async function getSettings() {
  return chrome.storage.local.get(['apiUrl', 'deviceToken', 'childName']);
}

async function apiFetch(path, options = {}) {
  const { apiUrl, deviceToken } = await getSettings();
  if (!apiUrl || !deviceToken) throw new Error('Extension not paired');

  const url = `${apiUrl.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${deviceToken}`,
      ...(options.headers || {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

export async function pairDevice(apiUrl, code, deviceName) {
  const url = `${apiUrl.replace(/\/$/, '')}/api/parental/agent/pair`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, device_name: deviceName, extension_version: EXT_VERSION }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Pairing failed');
  return json;
}

export async function fetchConfig() {
  return apiFetch('/api/parental/agent/config');
}

export async function reportVisit({ url, title, duration_mins, blocked }) {
  return apiFetch('/api/parental/agent/report', {
    method: 'POST',
    body: JSON.stringify({ url, title, duration_mins, blocked, extension_version: EXT_VERSION }),
  });
}

export { getSettings, EXT_VERSION };
