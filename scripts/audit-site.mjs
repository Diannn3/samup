import { chromium } from '@playwright/test';

const baseURL = process.env.SAM_UP_BASE_URL || 'http://127.0.0.1:4321';
const routes = ['/', '/about/', '/alumni/', '/events/', '/resources/', '/404/'];
const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 900 },
  { name: 'desktop', width: 1440, height: 900 }
];

const issues = [];
const note = [];

const addIssue = (message) => issues.push(message);

const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });

    for (const route of routes) {
      const page = await context.newPage();
      const runtimeErrors = [];

      page.on('pageerror', (error) => runtimeErrors.push(error.message));

      const response = await page.goto(new URL(route, baseURL).href, {
        waitUntil: 'domcontentloaded',
        timeout: 30_000
      });
      await page.waitForTimeout(750);

      const status = response?.status() ?? 0;
      const result = await page.evaluate(() => {
        const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || null;
        const schema = document.querySelector('script[type="application/ld+json"]')?.textContent || null;
        const invalidImages = [...document.images]
          .filter((image) => !image.alt || !image.width || !image.height)
          .map((image) => image.currentSrc || image.src);
        const unsafeBlankLinks = [...document.querySelectorAll('a[target="_blank"]')]
          .filter((link) => !/\bnoopener\b/.test(link.getAttribute('rel') || ''))
          .map((link) => link.getAttribute('href'));

        return {
          title: document.title,
          h1Count: document.querySelectorAll('h1').length,
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          canonical,
          schema,
          invalidImages,
          unsafeBlankLinks,
          hasMain: Boolean(document.querySelector('main#main-content')),
          hasSkipLink: Boolean(document.querySelector('a.skip-link[href="#main-content"]'))
        };
      });

      if (route !== '/404/' && status !== 200) addIssue(`${viewport.name} ${route}: expected 200, got ${status}`);
      if (route === '/404/' && status !== 200) addIssue(`${viewport.name} ${route}: expected generated 404 page to return 200, got ${status}`);
      if (!result.title) addIssue(`${viewport.name} ${route}: missing document title`);
      if (result.h1Count !== 1) addIssue(`${viewport.name} ${route}: expected exactly one h1, got ${result.h1Count}`);
      if (!result.hasMain) addIssue(`${viewport.name} ${route}: missing #main-content main landmark`);
      if (!result.hasSkipLink) addIssue(`${viewport.name} ${route}: missing skip link`);
      if (result.scrollWidth > result.clientWidth) {
        addIssue(`${viewport.name} ${route}: horizontal overflow ${result.scrollWidth}px > ${result.clientWidth}px`);
      }
      if (result.canonical && /localhost|127\.0\.0\.1/.test(result.canonical)) {
        addIssue(`${viewport.name} ${route}: canonical points to a local origin (${result.canonical})`);
      }
      if (result.schema?.includes('sam-up.org')) {
        addIssue(`${viewport.name} ${route}: structured data contains an unconfigured sam-up.org origin`);
      }
      if (result.invalidImages.length) addIssue(`${viewport.name} ${route}: images missing alt or intrinsic dimensions: ${result.invalidImages.join(', ')}`);
      if (result.unsafeBlankLinks.length) addIssue(`${viewport.name} ${route}: target=_blank links missing noopener: ${result.unsafeBlankLinks.join(', ')}`);
      runtimeErrors
        .filter((message) => !/fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(message))
        .forEach((message) => addIssue(`${viewport.name} ${route}: page error: ${message}`));

      await page.close();
    }

    if (viewport.name === 'mobile') {
      const page = await context.newPage();
      await page.goto(new URL('/', baseURL).href, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForTimeout(750);

      const trigger = page.getByRole('button', { name: 'Open Navigation Menu' });
      await trigger.click();
      const drawer = page.locator('#mobile-navigation-drawer');
      const drawerState = await page.evaluate(() => ({
        bodyOverflow: document.body.style.overflow,
        activeInsideDrawer: Boolean(document.querySelector('#mobile-navigation-drawer :focus'))
      }));

      if (!(await drawer.isVisible())) addIssue('mobile navigation: drawer did not open');
      if (drawerState.bodyOverflow !== 'hidden') addIssue('mobile navigation: body scroll was not locked');
      if (!drawerState.activeInsideDrawer) addIssue('mobile navigation: focus did not move into the drawer');

      await page.keyboard.press('Escape');
      if (await drawer.isVisible()) addIssue('mobile navigation: Escape did not close the drawer');
      const afterClose = await page.evaluate(() => ({
        bodyOverflow: document.body.style.overflow,
        activeLabel: document.activeElement?.getAttribute('aria-label') || ''
      }));
      if (afterClose.bodyOverflow) addIssue('mobile navigation: body scroll lock was not released');
      if (afterClose.activeLabel !== 'Open Navigation Menu') addIssue('mobile navigation: focus was not restored to the trigger');

      const controlSizes = await page.locator('.hero-3d-controls button').evaluateAll((buttons) =>
        buttons.map((button) => {
          const rect = button.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        })
      );
      if (controlSizes.some(({ width, height }) => width < 44 || height < 44)) {
        addIssue(`mobile 3D controls: one or more touch targets are smaller than 44px (${JSON.stringify(controlSizes)})`);
      }

      await page.close();
    }

    await context.close();
  }

  const reducedMotionContext = await browser.newContext({
    viewport: viewports[0],
    reducedMotion: 'reduce'
  });
  const reducedMotionPage = await reducedMotionContext.newPage();
  await reducedMotionPage.goto(new URL('/', baseURL).href, {
    waitUntil: 'domcontentloaded',
    timeout: 30_000
  });
  await reducedMotionPage.waitForTimeout(750);
  const rotationButton = reducedMotionPage.locator('.hero-3d-controls button').filter({ hasText: 'Spin' });
  if (!(await rotationButton.isDisabled())) addIssue('reduced motion: 3D rotation control was not disabled');
  await reducedMotionPage.close();
  await reducedMotionContext.close();

  const unknownContext = await browser.newContext({ viewport: viewports[0] });
  const unknownPage = await unknownContext.newPage();
  const unknownResponse = await unknownPage.goto(new URL('/not-a-real-route', baseURL).href, {
    waitUntil: 'domcontentloaded',
    timeout: 30_000
  });
  if (unknownResponse?.status() !== 404) addIssue(`unknown route: expected 404, got ${unknownResponse?.status() ?? 0}`);
  await unknownPage.close();
  await unknownContext.close();
} finally {
  await browser.close();
}

if (issues.length) {
  console.error(`SAM-UP browser audit failed with ${issues.length} issue(s):`);
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exitCode = 1;
} else {
  console.log(`SAM-UP browser audit passed: ${routes.length} routes × ${viewports.length} viewports, plus mobile navigation and unknown-route checks.`);
}
