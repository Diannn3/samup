// Visual QA: screenshot core public routes at representative widths,
// in normal and reduced-motion environments.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.SAM_UP_BASE_URL || 'http://127.0.0.1:4321';
const ROUTES = [
  '/',
  '/explore',
  '/join',
  '/partners',
  '/governance',
  '/events',
  '/events/nimp-2026',
  '/resources',
  '/archive',
  '/search',
  '/about',
];

const WIDTHS = [
  { name: '375', width: 375, height: 812 },
  { name: '768', width: 768, height: 1024 },
  { name: '1024', width: 1024, height: 768 },
  { name: '1440', width: 1440, height: 900 },
];

const OUT = process.env.SAM_UP_QA_DIR || 'qa-screens';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const failures = [];

for (const route of ROUTES) {
  for (const mode of [
    { name: 'motion', reduced: false },
    { name: 'reduced', reduced: true },
  ]) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: mode.reduced ? 'reduce' : 'no-preference',
    });

    const page = await context.newPage();
    const slug = route === '/' ? 'home' : route.slice(1).replaceAll('/', '-');
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });

    for (const vp of WIDTHS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(250);
      await page.screenshot({
        path: `${OUT}/${slug}-${vp.name}-${mode.name}.png`,
        fullPage: false,
      });

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      if (overflow > 1) failures.push(`${route} ${vp.name} ${mode.name}: overflow ${overflow}px`);
    }

    if (route === '/' && mode.name === 'motion') {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.keyboard.press('Tab');
      const focusState = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return { tag: 'none', visible: false };
        const style = getComputedStyle(el);
        return {
          tag: el.tagName,
          href: el.getAttribute('href'),
          label: el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 60) || '',
          visible: style.outlineStyle !== 'none' || style.boxShadow !== 'none',
        };
      });

      if (!focusState.visible) failures.push(`home keyboard: first focused element lacks visible focus (${JSON.stringify(focusState)})`);
    }

    await context.close();
  }
}

await browser.close();

if (failures.length) {
  console.error('Visual QA failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Visual QA passed: ${ROUTES.length} routes × ${WIDTHS.length} widths × 2 motion modes.`);
}
