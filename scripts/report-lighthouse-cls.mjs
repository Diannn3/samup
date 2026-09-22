import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dir = resolve('.lighthouseci');

if (!existsSync(dir)) {
  console.log('No .lighthouseci directory found.');
  process.exit(0);
}

const reportFiles = readdirSync(dir).filter((name) => /^lhr-.*\.json$/.test(name));

if (!reportFiles.length) {
  console.log('No Lighthouse JSON reports found.');
  process.exit(0);
}

for (const name of reportFiles) {
  const report = JSON.parse(readFileSync(resolve(dir, name), 'utf8'));
  const cls = report.audits?.['cumulative-layout-shift']?.numericValue ?? 0;

  if (cls <= 0.1) continue;

  console.log('\nCLS ' + cls.toFixed(4) + ' — ' + (report.finalDisplayedUrl || report.finalUrl || name));

  const audits = [
    report.audits?.['layout-shift-elements'],
    report.audits?.['layout-shifts'],
  ].filter(Boolean);

  let printed = false;

  for (const audit of audits) {
    const items = audit?.details?.items ?? [];

    for (const item of items) {
      const node = item.node ?? item.nodes?.[0] ?? {};
      const score = item.score ?? item.cumulativeLayoutShiftScore ?? item.weightedScore ?? null;
      const snippet = node.snippet ?? node.nodeLabel ?? node.selector ?? '(unknown element)';
      const selector = node.selector ?? '';

      console.log('- ' + (score ?? 'n/a') + ' ' + selector + ' ' + snippet);
      printed = true;
    }
  }

  if (!printed) {
    console.log('- Lighthouse did not expose layout-shift element details in this report.');
  }
}
