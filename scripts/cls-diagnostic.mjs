import { chromium } from '@playwright/test';

const baseURL = process.env.SAM_UP_BASE_URL || 'http://127.0.0.1:4321';
const routes = ['/explore/', '/programs/'];
const browser = await chromium.launch({ headless: true });

try {
  for (const route of routes) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(() => {
      window.__samupLayoutShifts = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          window.__samupLayoutShifts.push({
            value: entry.value,
            startTime: entry.startTime,
            sources: (entry.sources || []).map((source) => ({
              previousRect: source.previousRect,
              currentRect: source.currentRect,
              node: source.node
                ? {
                    tag: source.node.tagName,
                    id: source.node.id || '',
                    className: typeof source.node.className === 'string' ? source.node.className : '',
                    text: (source.node.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 180),
                  }
                : null,
            })),
          });
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });

    const page = await context.newPage();
    await page.goto(new URL(route, baseURL).href, { waitUntil: 'networkidle', timeout: 30_000 });
    await page.evaluate(() => document.fonts?.ready);
    await page.waitForTimeout(1500);

    const result = await page.evaluate(() => {
      const shifts = window.__samupLayoutShifts || [];
      return {
        total: shifts.reduce((sum, entry) => sum + entry.value, 0),
        shifts,
        fonts: document.fonts
          ? [...document.fonts].map((font) => ({
              family: font.family,
              status: font.status,
              display: font.display,
            }))
          : [],
      };
    });

    console.log('\n' + route + ' observed CLS: ' + result.total.toFixed(4));
    console.log(JSON.stringify(result, null, 2));
    await context.close();
  }
} finally {
  await browser.close();
}
