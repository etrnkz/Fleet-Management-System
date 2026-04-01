#!/usr/bin/env node
/**
 * Deploy all 8 Next.js apps to Vercel (one Vercel project per app).
 *
 *   cd scripts && npm install && npx vercel login
 *   npm run deploy:vercel
 *
 * Flags:
 *   --preview          Preview deploy (no --prod)
 *   --force            Clear remote build cache per deploy (fixes stuck builds)
 *   --stop-on-error    Exit on first failure (default: run all 8, report failures at end)
 *
 * Git auto-deploy: In Vercel, create 8 projects from the same repo; for each set
 * Root Directory to Frontend/apps/<slug> (see APPS below). Push to main → all redeploy.
 *
 * Env on each Vercel project: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_WS_URL (where used).
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const preview = process.argv.includes('--preview');
const force = process.argv.includes('--force');
const stopOnError = process.argv.includes('--stop-on-error');

const APPS = [
  { slug: 'college-dean', project: 'fms-college-dean' },
  { slug: 'department', project: 'fms-department' },
  { slug: 'deployment-office', project: 'fms-deployment-office' },
  { slug: 'driver', project: 'fms-driver' },
  { slug: 'employee', project: 'fms-employee' },
  { slug: 'president', project: 'fms-president' },
  { slug: 'system-admin', project: 'fms-system-admin' },
  { slug: 'transport-admin', project: 'fms-transport-admin' },
];

function resolveAppsRoot() {
  const upper = path.join(repoRoot, 'Frontend', 'apps');
  const lower = path.join(repoRoot, 'frontend', 'apps');
  if (fs.existsSync(upper)) return upper;
  if (fs.existsSync(lower)) return lower;
  throw new Error('Neither Frontend/apps nor frontend/apps found.');
}

function vercelBin() {
  const win = process.platform === 'win32';
  const local = path.join(
    __dirname,
    'node_modules',
    '.bin',
    win ? 'vercel.cmd' : 'vercel',
  );
  if (fs.existsSync(local)) return local;
  return null;
}

/** @returns {number} exit code, 0 = success */
function runVercel(cwd, args) {
  const localBin = vercelBin();
  const cmd = localBin || 'npx';
  const spawnArgs = localBin
    ? args
    : ['--yes', 'vercel@latest', ...args];
  const r = spawnSync(cmd, spawnArgs, {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env },
  });
  if (r.error) throw r.error;
  if (r.signal) return 1;
  return r.status ?? 0;
}

function ensureLinked(cwd, project) {
  const linked = path.join(cwd, '.vercel', 'project.json');
  if (fs.existsSync(linked)) return;
  console.log(`Linking to Vercel project "${project}" (first time in this clone)...`);
  const code = runVercel(cwd, ['link', '--yes', '--project', project]);
  if (code !== 0) {
    console.error(`\nvercel link failed for "${project}" (exit ${code}).`);
    process.exit(code);
  }
}

const appsRoot = resolveAppsRoot();
console.log(
  preview ? 'Preview deploy' : 'Production deploy',
  '|',
  appsRoot,
  force ? '| --force' : '',
  stopOnError ? '| stop-on-error' : '| continue-on-error',
);

const failures = [];

for (const { slug, project } of APPS) {
  const cwd = path.join(appsRoot, slug);
  if (!fs.existsSync(path.join(cwd, 'package.json'))) {
    console.warn(`[skip] ${slug}: missing package.json`);
    failures.push({ slug, project, reason: 'missing package.json' });
    if (stopOnError) process.exit(1);
    continue;
  }

  ensureLinked(cwd, project);

  const args = ['deploy', '--yes'];
  if (force) args.push('--force');
  if (!preview) args.push('--prod');

  console.log(`\n========== ${slug} → ${project} ==========\n`);
  const code = runVercel(cwd, args);
  if (code !== 0) {
    failures.push({ slug, project, code });
    console.error(`\n✖ ${slug} failed (exit ${code}).`);
    if (stopOnError) process.exit(code);
  }
}

if (failures.length > 0) {
  console.error('\n========== Deploy finished with errors ==========');
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log('\n========== All 8 apps deployed successfully ==========\n');
