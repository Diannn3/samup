import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4322';
const browser = await chromium.launch();

// 1. Reduced motion: split-flap must render settled text, no flap animation
const ctx1 = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const p1 = await ctx1.newPage();
await p1.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await p1.waitForTimeout(6000); // wait past one full cycle delay (2600ms) — animation must NOT have advanced
const reduced = await p1.evaluate(() => {
  const flap = document.querySelector('.split-flap-text');
  if (!flap) return { found: false };
  return {
    found: true,
    label: flap.getAttribute('aria-label'),
    flapCount: flap.querySelectorAll('.split-flap-text__flap').length,
    // settled text = first phrase tiles only, no flipping elements
    settled: flap.querySelectorAll('.split-flap-text__flap').length === 0
  };
});
console.log('REDUCED-MOTION SPLIT-FLAP:', JSON.stringify(reduced));
await ctx1.close();

// 2. Normal motion: flap animation runs (flipping elements present after hydration + cycle)
const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const p2 = await ctx2.newPage();
await p2.goto(`${BASE}/`, { waitUntil: 'networkidle' });
// scroll proof strip into view to trigger client:visible hydration
await p2.evaluate(() => document.querySelector('section[aria-label="Verified society facts"]')?.scrollIntoView({ block: 'center' }));
await p2.waitForTimeout(3200); // past first cycle delay — should be mid-animation to phrase 2
const animated = await p2.evaluate(() => {
  const flap = document.querySelector('.split-flap-text');
  if (!flap) return { found: false };
  return {
    found: true,
    label: flap.getAttribute('aria-label')?.slice(0, 60),
    ariaLabelChanged: flap.getAttribute('aria-label') !== 'Active term 2nd Sem 26-27, 46 leadership terms, founded 1984',
    flapCount: flap.querySelectorAll('.split-flap-text__flap').length
  };
});
console.log('NORMAL-MOTION SPLIT-FLAP:', JSON.stringify(animated));

// 3. JS disabled: SSR fallback shows settled first phrase
const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
const p3 = await ctx3.newPage();
await p3.goto(`${BASE}/`, { waitUntil: 'load' });
const nojs = await p3.evaluate(() => {
  const flap = document.querySelector('.split-flap-text');
  if (!flap) return { found: false };
  const chars = [...flap.querySelectorAll('.split-flap-text__char')].map((c) => c.textContent).join('');
  return { found: true, ssrText: chars.trim() };
});
console.log('NO-JS SPLIT-FLAP SSR:', JSON.stringify(nojs));
await ctx3.close();

// 4. Touch coarse: no magnet transform; cards present
const ctx4 = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });
const p4 = await ctx4.newPage();
await ctx4.addInitScript(() => { Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 5 }); });
await p4.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await p4.waitForTimeout(2500);
const touch = await p4.evaluate(() => {
  const magnet = document.querySelector('[style*="translate3d"]');
  return { magnetWrappers: magnet ? 1 : 0, magnetTransform: magnet ? magnet.style.transform : 'none' };
});
console.log('TOUCH MAGNET STATE:', JSON.stringify(touch));
await ctx4.close();

await browser.close();
