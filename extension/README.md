# 4Sight Guardian — Chrome Extension (Family Watch)

Monitors browsing on a child's Chromebook or PC, reports activity to the Guardian dashboard, and enforces per-child content filters and screen time limits.

## Install (developer / local)

1. Start the Guardian dashboard: `npm run dev` (default `http://localhost:3000`)
2. Open **Family Watch** → select a child → **Link device** → copy the 6-character code
3. In Chrome, go to `chrome://extensions`
4. Enable **Developer mode**
5. Click **Load unpacked** → select this `extension/` folder
6. Click the Guardian extension icon → enter server URL + pairing code → **Pair device**

## How it works

- **Pairing:** Parent generates a 15-minute code in the dashboard; the extension exchanges it for a device token
- **Content filter:** Blocks navigation when a site's rating exceeds the child's max (G / PG / PG-13 / R)
- **Screen time:** Blocks further browsing when the daily limit is reached
- **Reporting:** Sends viewing activity and alerts to `/api/parental/agent/report`

## Permissions

| Permission | Why |
|------------|-----|
| `tabs`, `webNavigation` | Detect and block page loads |
| `storage` | Save pairing token locally |
| `alarms` | Periodic config refresh & screen time flush |
| `<all_urls>` | Classify and report visited sites |

## Production

Replace `http://localhost:3000` with your deployed Guardian URL (e.g. `https://your-app.vercel.app`). Re-run `setup-all.sql` in Supabase so the `guardian_devices` table exists.

## Icons

Run from repo root to generate placeholder icons:

```bash
node scripts/generate-extension-icons.mjs
```
