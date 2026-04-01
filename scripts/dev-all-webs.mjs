#!/usr/bin/env node
/**
 * Start all 8 Fleet Management Next.js apps in parallel (dev servers).
 *
 *   cd scripts && npm install && npm run dev:all-webs
 *
 * Ports: 3001 transport-admin, 3002 college-dean, 3003 department, 3004 driver,
 *        3005 deployment-office, 3007 system-admin, 3008 employee, 3009 president
 *
 * API: run the Nest backend separately (default http://localhost:3000).
 */

import concurrently from 'concurrently';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function resolveAppsRoot() {
  const upper = path.join(repoRoot, 'Frontend', 'apps');
  const lower = path.join(repoRoot, 'frontend', 'apps');
  if (fs.existsSync(upper)) return upper;
  if (fs.existsSync(lower)) return lower;
  throw new Error('Neither Frontend/apps nor frontend/apps found.');
}

const appsRoot = resolveAppsRoot();

const APPS = [
  ['transport-admin', '3001-transport'],
  ['college-dean', '3002-dean'],
  ['department', '3003-dept'],
  ['driver', '3004-driver'],
  ['deployment-office', '3005-deploy'],
  ['system-admin', '3007-sysadmin'],
  ['employee', '3008-employee'],
  ['president', '3009-president'],
];

for (const [slug] of APPS) {
  const pkg = path.join(appsRoot, slug, 'package.json');
  if (!fs.existsSync(pkg)) {
    console.error(`Missing app: ${slug} (${pkg})`);
    process.exit(1);
  }
}

const { result } = concurrently(
  APPS.map(([slug, name]) => ({
    command: 'npm run dev',
    cwd: path.join(appsRoot, slug),
    name,
    env: { ...process.env },
  })),
  {
    prefixColors: 'auto',
    restartTries: 0,
  },
);

result.then(
  () => process.exit(0),
  () => process.exit(1),
);
