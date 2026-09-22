import { chromium } from '@playwright/test';

const BASE = process.env.SAM_UP_BASE_URL || 'http://127.0.0.1:4321';
const failures = [];
const browser = await chromium.launch();

// 1. Reduced motion remains supported globally and the public homepage does not
// depend on legacy decorative animation components.
const reducedContext = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
});
const reducedPage = await reducedContext.newPage();
await reducedPage.goto(`${BASE}/`, { waitUntil: 'networkidle' });
const reduced = await reducedPage.evaluate(() => ({
  prefersReduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  legacySplitFlap: Boolean(document.querySelector('.split-flap-text')),
  legacy3DControls: Boolean(document.querySelector('.hero-3d-controls')),
  canvasCount: document.querySelectorAll('canvas').length,
}));
if (!reduced.prefersReduced) failures.push('reduced motion: browser context did not expose prefers-reduced-motion');
if (reduced.legacySplitFlap) failures.push('homepage: legacy split-flap animation is still mounted');
if (reduced.legacy3DControls) failures.push('homepage: legacy 3D hero controls are still mounted');
if (reduced.canvasCount > 0) failures.push(`homepage: expected static-first public hero, found ${reduced.canvasCount} canvas element(s)`);
await reducedContext.close();

// 2. Core public homepage tasks must survive with JavaScript disabled.
const noJsContext = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  javaScriptEnabled: false,
});
const noJsPage = await noJsContext.newPage();
await noJsPage.goto(`${BASE}/`, { waitUntil: 'load' });
const noJsHome = await noJsPage.evaluate(() => ({
  h1: document.querySelector('h1')?.textContent?.trim() || '',
  explore: Boolean(document.querySelector('a[href="/explore"]')),
  join: Boolean(document.querySelector('a[href="/join"]')),
  partners: Boolean(document.querySelector('a[href="/partners"]')),
  mainTextLength: document.querySelector('main')?.textContent?.trim().length || 0,
}));
if (!noJsHome.h1) failures.push('no-js homepage: missing h1');
if (!noJsHome.explore || !noJsHome.join || !noJsHome.partners) {
  failures.push(`no-js homepage: core task links missing (${JSON.stringify(noJsHome)})`);
}
if (noJsHome.mainTextLength < 500) failures.push('no-js homepage: core content appears to depend on JavaScript');

await noJsPage.goto(`${BASE}/explore/shortest-paths/`, { waitUntil: 'load' });
const noJsExplainer = await noJsPage.evaluate(() => ({
  h1: document.querySelector('h1')?.textContent?.trim() || '',
  graph: Boolean(document.querySelector('svg[role="img"]')),
  graphDescription: Boolean(document.querySelector('svg[role="img"] desc')),
  articleTextLength: document.querySelector('article')?.textContent?.trim().length || 0,
}));
if (!noJsExplainer.h1) failures.push('no-js explainer: missing h1');
if (!noJsExplainer.graph || !noJsExplainer.graphDescription) failures.push('no-js explainer: accessible graph fallback is missing');
if (noJsExplainer.articleTextLength < 500) failures.push('no-js explainer: article content appears incomplete');
await noJsContext.close();

// 3. Touch targets in the mobile institutional drawer should meet the planned
// 44px practical minimum.
const touchContext = await browser.newContext({
  viewport: { width: 375, height: 812 },
  hasTouch: true,
  isMobile: true,
});
const touchPage = await touchContext.newPage();
await touchPage.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await touchPage.getByRole('button', { name: 'Open Navigation Menu' }).click();
const targetSizes = await touchPage.locator('#mobile-navigation-drawer a, #mobile-navigation-drawer button').evaluateAll((elements) =>
  elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return {
      label: element.getAttribute('aria-label') || element.textContent?.trim().slice(0, 50) || element.tagName,
      width: rect.width,
      height: rect.height,
    };
  }),
);
const undersized = targetSizes.filter(({ width, height }) => width < 44 || height < 44);
if (undersized.length) failures.push(`touch targets: below 44px minimum: ${JSON.stringify(undersized)}`);
await touchContext.close();

await browser.close();

if (failures.length) {
  console.error(`Motion/progressive-enhancement QA failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('Motion/progressive-enhancement QA passed: static-first homepage, no-JS core tasks, accessible explainer, and mobile target sizing.');
}
