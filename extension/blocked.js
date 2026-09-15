const params = new URLSearchParams(window.location.search);
const reason = params.get('reason');
const child = params.get('child');
const site = params.get('site');

if (reason) document.getElementById('reason').textContent = decodeURIComponent(reason);
if (child) document.getElementById('child-line').textContent = `Profile: ${decodeURIComponent(child)}${site ? ` · ${decodeURIComponent(site)}` : ''}`;
