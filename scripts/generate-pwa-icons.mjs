import { spawnSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const script = join(dirname(fileURLToPath(import.meta.url)), 'generate-pwa-icons.ps1');
const result = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script], { stdio: 'inherit' });
process.exit(result.status ?? 1);
