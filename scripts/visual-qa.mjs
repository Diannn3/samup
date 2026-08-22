// Visual QA: screenshot all routes at required widths, normal + reduced motion.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:4322';
const ROUTES = ['/', '/about', '/alumni', '/events', '/resources'];
const WIDTHS = [
  { name: '375', width: 375, height: 812 },
  { name: '768', width: 768, height: 1024 },
  { name: '1024', width: 1024, height: 768 },
  { name: '1440', width: 1440, height: 900 }
];
const OUT = 'qa-screens';

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
let failures = [];

for (const route of ROUTES) {
  for (const mode of [{ name: 'motion', reduced: false }, { name: 'reduced', reduced: true }]) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: mode.reduced ? 'reduce' : 'no-preference'
    });
    const page = await context.newPage();
    const slug = route === '/' ? 'home' : route.slice(1);
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });

    for (const vp of WIDTHS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${OUT}/${slug}-${vp.name}-${mode.name}.png`, fullPage: false });

      // horizontal overflow check
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 1) failures.push(`${route} ${vp.name} ${mode.name}: overflow ${overflow}px`);
    }

    // keyboard: Tab reaches interactive elements with visible focus (home only)
    if (route === '/' && mode.name === 'motion') {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return 'none';
        const style = getComputedStyle(el);
        return `${el.tagName}.${(el.className || '').toString().slice(0, 40)} shadow=${style.boxShadow.slice(0, 50)}`;
      });
      console.log(`KEYBOARD FOCUS: ${focused}`);
    }

    await context.close();
  }
}

await browser.close();
console.log('SCREENSHOTS SAVED');
if (failures.length) {
  console.log('OVERFLOW FAILURES:');
  failures.forEach((f) => console.log(`  ${f}`));
} else {
  console.log('NO HORIZONTAL OVERFLOW at any width');
}
