import { chromium } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

const baseURL = process.env.SAM_UP_BASE_URL || 'http://127.0.0.1:4321';

const routes = [
  '/',
  '/explore/',
  '/explore/shortest-paths/',
  '/programs/',
  '/resources/',
  '/join/',
  '/partners/',
  '/about/',
  '/governance/',
  '/governance/constitution-2018/',
  '/archive/',
  '/chronicle/',
  '/search/',
  '/alumni/',
];

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
];

const violations = [];
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });

    for (const route of routes) {
      const page = await context.newPage();
      await page.goto(new URL(route, baseURL).href, {
        waitUntil: 'networkidle',
        timeout: 30_000,
      });

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      for (const violation of results.violations) {
        violations.push({
          viewport: viewport.name,
          route,
          id: violation.id,
          impact: violation.impact,
          help: violation.help,
          helpUrl: violation.helpUrl,
          targets: violation.nodes.flatMap((node) => node.target),
        });
      }

      await page.close();
    }

    await context.close();
  }
} finally {
  await browser.close();
}

if (violations.length) {
  console.error(`Accessibility audit failed with ${violations.length} violation group(s):`);
  for (const violation of violations) {
    console.error(
      `- [${violation.impact ?? 'unknown'}] ${violation.viewport} ${violation.route} ${violation.id}: ${violation.help}`,
    );
    console.error(`  Targets: ${violation.targets.join(', ')}`);
    console.error(`  Help: ${violation.helpUrl}`);
  }
  process.exit(1);
}

console.log(
  `Accessibility audit passed: ${routes.length} institutional routes × ${viewports.length} viewports.`,
);
