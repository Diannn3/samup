import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:4322/', { waitUntil: 'networkidle' });

const results = [];
for (let i = 0; i < 10; i++) {
  await page.keyboard.press('Tab');
  await page.waitForTimeout(450); // let any transition settle before reading
  const info = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName,
      text: (el.textContent || '').trim().slice(0, 32),
      focusVisible: el.matches(':focus-visible'),
      hasGoldRing: cs.boxShadow.includes('240, 204, 78') || cs.boxShadow.includes('rgb(240, 204, 78)')
    };
  });
  if (info) results.push(info);
}

results.forEach((r) => console.log(`${r.focusVisible ? 'FOCUS-VISIBLE' : 'no-fv'} ${r.hasGoldRing ? 'GOLD-RING' : 'NO-RING '} | ${r.tag} "${r.text}"`));
await browser.close();
