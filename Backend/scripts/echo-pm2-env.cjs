#!/usr/bin/env node
/**
 * Print the env object PM2 would pass to fleet-api (same as ecosystem.config.cjs).
 * Run from repo: cd Backend && node scripts/echo-pm2-env.cjs
 */
const path = require('path');

const root = path.resolve(__dirname, '..');
process.chdir(root);

const eco = require(path.join(root, 'ecosystem.config.cjs'));
const e = eco.apps[0].env;

console.log('fleet-api env from ecosystem + Backend/.env:');
console.log('  DB_SYNCHRONIZE =', e.DB_SYNCHRONIZE ?? '(missing — tables will NOT auto-create in production)');
console.log('  DB_NAME        =', e.DB_NAME ?? '(missing)');
console.log('  DB_HOST        =', e.DB_HOST ?? '(missing)');
console.log('  NODE_ENV       =', e.NODE_ENV);
