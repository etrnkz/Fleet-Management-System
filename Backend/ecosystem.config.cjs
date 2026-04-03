/**
 * PM2 — run from the Backend directory.
 *
 *   cd /path/to/Backend
 *   cp .env.production.example .env   # edit secrets
 *   npm run build && npm run migrate
 *   pm2 start ecosystem.config.cjs
 *   pm2 save && pm2 startup
 *
 * Reads ./.env for PASSTHROUGH_KEYS (manual parse + dotenv) so values like
 * DB_SYNCHRONIZE=true always reach the app. After changing .env: pm2 delete fleet-api && pm2 start ecosystem.config.cjs
 */
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const PASSTHROUGH_KEYS = [
  'PORT',
  'DATABASE_URL',
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_NAME',
  'DB_SSL',
  'DB_SSL_REJECT_UNAUTHORIZED',
  'DB_LOGGING',
  'DB_SYNCHRONIZE',
  'DB_RUN_MIGRATIONS',
  'JWT_SECRET',
  'JWT_EXPIRATION',
  'JWT_REFRESH_SECRET',
  'JWT_REFRESH_EXPIRATION',
  'REDIS_HOST',
  'REDIS_PORT',
  'REDIS_PASSWORD',
  'THROTTLE_TTL',
  'THROTTLE_LIMIT',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_SECURE',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'EMAIL_FROM',
];

/** Parse .env lines (first = only). Skips # comments; trims CR; strips simple quotes. */
function parseEnvFile(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  let text = fs.readFileSync(filePath, 'utf8');
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  for (let line of text.split(/\r?\n/)) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('export ')) line = line.slice(7).trim();
    const i = line.indexOf('=');
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    val = val.replace(/\r$/, '').trim();
    out[key] = val;
  }
  return out;
}

function pickEnv() {
  const filePath = path.join(__dirname, '.env');
  const fromFile = parseEnvFile(filePath);
  const env = { NODE_ENV: 'production' };
  for (const k of PASSTHROUGH_KEYS) {
    const raw = fromFile[k] ?? process.env[k];
    if (raw === undefined || raw === '') continue;
    env[k] = String(raw).replace(/\r$/, '').trim();
  }
  if (!env.DB_SYNCHRONIZE) {
    console.warn(
      '[ecosystem] DB_SYNCHRONIZE not set in Backend/.env — with NODE_ENV=production the API will not auto-create tables. Add DB_SYNCHRONIZE=true once for an empty DB, then set false.',
    );
  }
  return env;
}

module.exports = {
  apps: [
    {
      name: 'fleet-api',
      cwd: __dirname,
      script: 'dist/src/main.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '1G',
      env: pickEnv(),
    },
  ],
};
