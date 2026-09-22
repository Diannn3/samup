import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const imagePath = path.resolve('public/piu-outline-2.png');
const data = fs.readFileSync(imagePath);
const png = PNG.sync.read(data);

const width = png.width;
const height = png.height;
console.log(`Image decoded: ${width}x${height}`);

// Binary matrix: 1 if yellow/opaque, 0 otherwise
const grid = new Uint8Array(width * height);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const r = png.data[idx];
    const g = png.data[idx + 1];
    const b = png.data[idx + 2];
    const a = png.data[idx + 3];
    // Yellow pixel check: high alpha and yellow color
    if (a > 100 && r > 100 && g > 100) {
      grid[y * width + x] = 1;
    } else {
      grid[y * width + x] = 0;
    }
  }
}

// Moore-Neighbor Tracing Algorithm
const dx = [0, 1, 1, 1, 0, -1, -1, -1];
const dy = [-1, -1, 0, 1, 1, 1, 0, -1];

function traceBoundary(startX, startY, isHole = false) {
  const points = [];
  let cx = startX;
  let cy = startY;
  let dir = isHole ? 3 : 7;
  const startPt = { x: startX, y: startY };
  points.push(startPt);

  const maxSteps = 100000;
  for (let s = 0; s < maxSteps; s++) {
    let found = false;
    const searchStart = (dir + 1) % 8;
    for (let i = 0; i < 8; i++) {
      const testDir = (searchStart + i) % 8;
      const nx = cx + dx[testDir];
      const ny = cy + dy[testDir];
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        if (grid[ny * width + nx] === 1) {
          cx = nx;
          cy = ny;
          dir = (testDir + 5) % 8; // backtrack direction
          points.push({ x: cx, y: cy });
          found = true;
          break;
        }
      }
    }
    if (!found || (cx === startX && cy === startY && points.length > 2)) {
      break;
    }
  }
  return points;
}

// Find outer contour starting point (first 1 from top-left)
let outerStart = null;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (grid[y * width + x] === 1) {
      outerStart = { x, y };
      break;
    }
  }
  if (outerStart) break;
}

console.log('Outer start found at:', outerStart);
const outerRaw = traceBoundary(outerStart.x, outerStart.y, false);
console.log(`Outer raw contour length: ${outerRaw.length}`);

// Find inner hole starting point (inside the central square counter-space)
let holeStart = null;
for (let y = Math.floor(height * 0.35); y < Math.floor(height * 0.65); y++) {
  for (let x = Math.floor(width * 0.4); x < Math.floor(width * 0.65); x++) {
    // 0 pixel that has a 1 pixel directly above it
    if (grid[y * width + x] === 0 && grid[(y - 1) * width + x] === 1) {
      holeStart = { x, y: y - 1 };
      break;
    }
  }
  if (holeStart) break;
}

console.log('Hole start found at:', holeStart);
const holeRaw = holeStart ? traceBoundary(holeStart.x, holeStart.y, true) : [];
console.log(`Hole raw contour length: ${holeRaw.length}`);

// Ramer-Douglas-Peucker algorithm for smooth polyline reduction
function rdp(pts, epsilon) {
  if (pts.length < 3) return pts;
  const first = pts[0];
  const last = pts[pts.length - 1];
  let maxDist = 0;
  let index = 0;
  const denom = Math.hypot(last.x - first.x, last.y - first.y);

  for (let i = 1; i < pts.length - 1; i++) {
    let d = 0;
    if (denom === 0) {
      d = Math.hypot(pts[i].x - first.x, pts[i].y - first.y);
    } else {
      d =
        Math.abs(
          (last.y - first.y) * pts[i].x - (last.x - first.x) * pts[i].y + last.x * first.y - last.y * first.x,
        ) / denom;
    }
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }

  if (maxDist > epsilon) {
    const left = rdp(pts.slice(0, index + 1), epsilon);
    const right = rdp(pts.slice(index), epsilon);
    return left.slice(0, -1).concat(right);
  }
  return [first, last];
}

// Simplify with epsilon = 2.5 pixels (captures all subtle curves and serifs with zero self-intersections)
const simplifiedOuter = rdp(outerRaw, 2.5);
const simplifiedHole = rdp(holeRaw, 2.5);

console.log(`Simplified outer points: ${simplifiedOuter.length}, hole points: ${simplifiedHole.length}`);

// Center and normalize coordinates for Three.js (scale to approx 3.6 units wide/high)
const cx = width / 2;
const cy = height / 2;
const scale = 3.6 / Math.max(width, height);

const normalizedOuter = simplifiedOuter.map((pt) => ({
  x: parseFloat(((pt.x - cx) * scale).toFixed(4)),
  y: parseFloat((-(pt.y - cy) * scale).toFixed(4)),
}));

const normalizedHole = simplifiedHole.map((pt) => ({
  x: parseFloat(((pt.x - cx) * scale).toFixed(4)),
  y: parseFloat((-(pt.y - cy) * scale).toFixed(4)),
}));

// Create SVG path string for 400x400 viewBox
const svgScale = 220 / Math.max(width, height);
const svgOffsetX = 200 - cx * svgScale;
const svgOffsetY = 200 - cy * svgScale;

function makeSvgPath(pts) {
  if (!pts || pts.length === 0) return '';
  return (
    pts
      .map((pt, i) => {
        const sx = (pt.x * svgScale + svgOffsetX).toFixed(1);
        const sy = (pt.y * svgScale + svgOffsetY).toFixed(1);
        return `${i === 0 ? 'M' : 'L'} ${sx} ${sy}`;
      })
      .join(' ') + ' Z'
  );
}

const outerSvgPath = makeSvgPath(simplifiedOuter);
const holeSvgPath = makeSvgPath(simplifiedHole);
const combinedSvgPath = `${outerSvgPath} ${holeSvgPath}`;

const outputData = {
  width,
  height,
  outer: normalizedOuter,
  hole: normalizedHole,
  svgPath: combinedSvgPath,
};

fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/piu_contour.json', JSON.stringify(outputData, null, 2));
console.log('Saved src/data/piu_contour.json successfully!');
