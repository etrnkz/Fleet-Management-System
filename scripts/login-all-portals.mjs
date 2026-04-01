/**
 * Opens one browser window with a tab per portal, fills test credentials, submits login.
 * Prereqs: API + Next apps running; seed users via Backend/create_test_users.py,
 * create_system_admin_users.py, and create_maintenance_users.py (all use password123).
 * Maintenance team uses Transport Admin at port 3001; after login open /maintenance.
 */
import { chromium } from 'playwright';

const PASSWORD = process.env.FLEET_TEST_PASSWORD || 'password123';

const PORTALS = [
  { name: 'Transport Admin', origin: 'http://localhost:3001', email: 'transport@test.com' },
  {
    name: 'Transport Admin (maintenance user)',
    origin: 'http://localhost:3001',
    email: 'maintenance@test.com',
  },
  { name: 'College Dean', origin: 'http://localhost:3002', email: 'dean@test.com' },
  { name: 'Department', origin: 'http://localhost:3003', email: 'depthead@test.com' },
  { name: 'Driver', origin: 'http://localhost:3004', email: 'driver@test.com' },
  { name: 'Deployment Office', origin: 'http://localhost:3005', email: 'deployment@test.com' },
  { name: 'President', origin: 'http://localhost:3006', email: 'president@test.com' },
  { name: 'System Admin', origin: 'http://localhost:3007', email: 'sysadmin@hu.edu.et' },
  { name: 'Employee', origin: 'http://localhost:3008', email: 'employee@test.com' },
];

async function loginTab(page, { origin, email, password }) {
  const url = `${origin.replace(/\/$/, '')}/login`;
  await page.goto(url, { waitUntil: 'commit', timeout: 120_000 });
  const emailInput = page.locator('input[type="email"]').first();
  const passInput = page.locator('input[type="password"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 30_000 });
  await emailInput.fill(email);
  await passInput.fill(password);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(5000);
}

async function launchBrowser() {
  for (const channel of ['msedge', 'chrome', undefined]) {
    try {
      return await chromium.launch({
        headless: false,
        ...(channel ? { channel } : {}),
      });
    } catch {
      /* try next */
    }
  }
  throw new Error('Could not launch a browser. Install Edge/Chrome or run: npx playwright install chromium');
}

const browser = await launchBrowser();

const context = await browser.newContext();
for (const p of PORTALS) {
  const page = await context.newPage();
  try {
    await loginTab(page, { origin: p.origin, email: p.email, password: PASSWORD });
    console.log(`OK  ${p.name} (${p.email})`);
  } catch (e) {
    console.error(`FAIL ${p.name}:`, e?.message || e);
  }
}

console.log('\nBrowser left open with logged-in tabs. Close it when finished.\n');
