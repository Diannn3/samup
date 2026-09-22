import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const round = process.argv[2] || 'audit_round1';
const outDir = path.resolve(`artifacts/${round}`);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const BASE_URL = 'http://127.0.0.1:4321';

async function run() {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop captures (1440 x 900)
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();

  const routes = [
    { path: '/', name: '01_desktop_home' },
    { path: '/about/', name: '02_desktop_about' },
    { path: '/events/', name: '03_desktop_events' },
    { path: '/alumni/', name: '04_desktop_alumni' },
    { path: '/resources/', name: '05_desktop_resources' },
    { path: '/reporting/', name: '06_desktop_reporting' },
  ];

  for (const r of routes) {
    console.log(`Capturing Desktop: ${r.path} -> ${r.name}.png`);
    await desktopPage.goto(`${BASE_URL}${r.path}`, { waitUntil: 'networkidle', timeout: 30000 });
    await desktopPage.waitForTimeout(1000);
    await desktopPage.screenshot({ path: path.join(outDir, `${r.name}.png`), fullPage: false });
  }

  // Also capture Reporting Station Inspection & Portfolio on desktop
  console.log('Capturing Reporting Station Inspection & Portfolio...');
  await desktopPage.goto(`${BASE_URL}/reporting/`, { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.keyboard.press('KeyE');
  await desktopPage.waitForTimeout(600);
  await desktopPage.screenshot({ path: path.join(outDir, '07_desktop_reporting_drawer.png') });
  await desktopPage.keyboard.press('Escape');
  await desktopPage.waitForTimeout(300);

  await desktopContext.close();

  // 2. Tablet captures (768 x 1024)
  const tabletContext = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const tabletPage = await tabletContext.newPage();

  console.log('Capturing Tablet Home...');
  await tabletPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await tabletPage.waitForTimeout(1000);
  await tabletPage.screenshot({ path: path.join(outDir, '08_tablet_home.png') });

  console.log('Capturing Tablet Reporting...');
  await tabletPage.goto(`${BASE_URL}/reporting/`, { waitUntil: 'networkidle' });
  await tabletPage.waitForTimeout(1000);
  await tabletPage.screenshot({ path: path.join(outDir, '09_tablet_reporting.png') });
  await tabletContext.close();

  // 3. Mobile captures (390 x 844)
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();

  console.log('Capturing Mobile Home...');
  await mobilePage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(outDir, '10_mobile_home.png') });

  console.log('Capturing Mobile Navigation Menu...');
  const navBtn = mobilePage.getByRole('button', { name: /open navigation menu/i });
  if (await navBtn.isVisible()) {
    await navBtn.click();
    await mobilePage.waitForTimeout(500);
    await mobilePage.screenshot({ path: path.join(outDir, '11_mobile_nav_drawer.png') });
    await mobilePage.keyboard.press('Escape');
    await mobilePage.waitForTimeout(300);
  }

  console.log('Capturing Mobile Reporting...');
  await mobilePage.goto(`${BASE_URL}/reporting/`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(outDir, '12_mobile_reporting.png') });

  await mobileContext.close();
  await browser.close();

  console.log(`All screenshots saved successfully to artifacts/${round}`);
}

run().catch((err) => {
  console.error('Failed to capture audit screenshots:', err);
  process.exit(1);
});
