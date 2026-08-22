import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:4322/', { waitUntil: 'networkidle' });

for (let i = 0; i < 3; i++) await page.keyboard.press('Tab');

const info = await page.evaluate(() => {
  const el = document.activeElement;
  const cs = getComputedStyle(el);
  return {
    boxShadow: cs.boxShadow,
    outline: cs.outline,
    zIndex: cs.zIndex,
    isolation: cs.isolation,
    parentCls: el.parentElement?.className?.toString().slice(0, 80),
    navHasBackdrop: !!el.closest('nav') && getComputedStyle(el.closest('nav')).backdropFilter
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
