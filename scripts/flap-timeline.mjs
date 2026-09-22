import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:4322/', { waitUntil: 'networkidle' });

// scroll proof strip into view and wait for hydration + animation start
await page.evaluate(() =>
  document.querySelector('section[aria-label="Verified society facts"]')?.scrollIntoView({ block: 'center' }),
);

// sample flap state every 500ms for 6s to catch mid-animation frames
for (let t = 0; t <= 6000; t += 500) {
  await page.waitForTimeout(500);
  const state = await page.evaluate(() => {
    const flap = document.querySelector('.split-flap-text');
    if (!flap) return 'not-found';
    const flaps = flap.querySelectorAll('.split-flap-text__flap').length;
    const label = flap.getAttribute('aria-label');
    return `flaps=${flaps} label="${label?.slice(0, 24)}"`;
  });
  console.log(`t=${t}ms: ${state}`);
}
await browser.close();
