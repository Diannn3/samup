import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const distDir = resolve(process.env.SAM_UP_DIST_DIR || 'dist');
const homePath = join(distDir, 'index.html');

if (!existsSync(homePath)) {
  console.error('Bundle budget: dist/index.html does not exist. Run npm run build first.');
  process.exit(1);
}

const html = readFileSync(homePath, 'utf8');
const referenced = new Set();

const assetPatterns = [
  /<script[^>]+src=["']([^"']+\.js(?:\?[^"']*)?)["']/gi,
  /<link[^>]+rel=["']modulepreload["'][^>]+href=["']([^"']+\.js(?:\?[^"']*)?)["']/gi,
  /<link[^>]+href=["']([^"']+\.js(?:\?[^"']*)?)["'][^>]+rel=["']modulepreload["']/gi,
];

for (const pattern of assetPatterns) {
  for (const match of html.matchAll(pattern)) {
    referenced.add(match[1].split('?')[0]);
  }
}

const toDiskPath = (assetPath) => {
  if (assetPath.startsWith('/')) return join(distDir, assetPath.slice(1));
  return resolve(dirname(homePath), assetPath);
};

const files = [...referenced]
  .map((assetPath) => ({ assetPath, diskPath: toDiskPath(assetPath) }))
  .filter(({ diskPath }) => existsSync(diskPath));

const totals = files.reduce(
  (acc, file) => {
    const bytes = readFileSync(file.diskPath);
    acc.raw += bytes.length;
    acc.gzip += gzipSync(bytes).length;
    return acc;
  },
  { raw: 0, gzip: 0 },
);

const maxHomeJsGzip = Number(process.env.SAM_UP_HOME_JS_GZIP_BUDGET || 153600);
const maxSingleJsGzip = Number(process.env.SAM_UP_SINGLE_JS_GZIP_BUDGET || 102400);

const failures = [];

if (totals.gzip > maxHomeJsGzip) {
  failures.push(
    `homepage referenced JavaScript is ${totals.gzip} bytes gzip, above the ${maxHomeJsGzip}-byte budget`,
  );
}

for (const file of files) {
  const bytes = readFileSync(file.diskPath);
  const gzip = gzipSync(bytes).length;
  if (gzip > maxSingleJsGzip) {
    failures.push(
      `${file.assetPath} is ${gzip} bytes gzip, above the ${maxSingleJsGzip}-byte single-chunk budget`,
    );
  }
}

const reportingAssets = [];
const reportingDir = join(distDir, '_astro');
if (existsSync(reportingDir)) {
  for (const name of readdirSync(reportingDir)) {
    const path = join(reportingDir, name);
    if (statSync(path).isFile() && /\.(js|mjs)$/.test(name)) {
      reportingAssets.push(name);
    }
  }
}

console.log(
  `Homepage JS budget: ${files.length} referenced JS asset(s), ${totals.raw} raw bytes, ${totals.gzip} gzip bytes.`,
);

if (files.length === 0) {
  console.log('Homepage is currently static-first with no external JavaScript bundle references.');
}

if (failures.length) {
  console.error(`Bundle budget failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Bundle budget passed.');
