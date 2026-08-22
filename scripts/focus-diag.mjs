import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:4322/', { waitUntil: 'networkidle' });

// Tab to the "Home" nav link (3rd tab stop) and inspect applied rules
for (let i = 0; i < 3; i++) await page.keyboard.press('Tab');

const diag = await page.evaluate(() => {
  const el = document.activeElement;
  const out = { tag: el.tagName, cls: el.className.toString().slice(0, 120), matches: el.matches(':focus-visible') };
  // walk stylesheets for rules matching this element mentioning box-shadow
  const hits = [];
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const rule of rules) {
      if (!rule.selectorText) continue;
      let matchesEl = false;
      try { matchesEl = el.matches(rule.selectorText); } catch { continue; }
      if (matchesEl && rule.style && rule.style.boxShadow) {
        hits.push({ sel: rule.selectorText, shadow: rule.style.boxShadow.slice(0, 90), important: rule.style.getPropertyPriority('box-shadow') });
      }
    }
  }
  out.rules = hits;
  return out;
});
console.log(JSON.stringify(diag, null, 2));
await browser.close();
