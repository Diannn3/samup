import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:4322/', { waitUntil: 'networkidle' });

const results = [];
for (let i = 0; i < 6; i++) {
  await page.keyboard.press('Tab');
  const info = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName,
      text: (el.textContent || '').trim().slice(0, 30),
      focusVisible: el.matches(':focus-visible'),
      boxShadow: cs.boxShadow.slice(0, 80),
    };
  });
  if (info) results.push(info);
}

results.forEach((r) =>
  console.log(
    `${r.focusVisible ? 'FOCUS-VISIBLE' : 'no-focus-visible'} | ${r.tag} "${r.text}" | ${r.boxShadow}`,
  ),
);
await browser.close();
