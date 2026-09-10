import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ROUND = process.argv[2] || "round2";
const OUT_DIR = path.resolve(`artifacts/${ROUND}`);
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Navigating to http://127.0.0.1:4327/reporting/ ...");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:4327/reporting/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // 1. Flagship Desktop View
  console.log("Capturing 01_desktop_spatial_canvas.png ...");
  await page.screenshot({ path: path.join(OUT_DIR, "01_desktop_spatial_canvas.png") });

  // 2. Open Station Inspection (Press 'E' or click station 01)
  console.log("Opening station 01 inspection ...");
  await page.keyboard.press("KeyE");
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT_DIR, "02_desktop_station_inspection.png") });

  // 3. Close Station Inspection
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  // 4. Open Portfolio Modal (Press 'Cmd+P' / 'Control+P' or click portfolio button)
  console.log("Opening portfolio modal ...");
  await page.keyboard.down("Control");
  await page.keyboard.press("KeyP");
  await page.keyboard.up("Control");
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT_DIR, "03_desktop_portfolio_modal.png") });

  // 5. Close Portfolio Modal
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  // 6. Open Command Palette (Control+K)
  console.log("Opening command palette ...");
  await page.keyboard.down("Control");
  await page.keyboard.press("KeyK");
  await page.keyboard.up("Control");
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT_DIR, "04_desktop_command_palette.png") });

  // 7. Close Command Palette
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  // 8. Tablet Viewport (768x1024)
  console.log("Capturing 05_tablet_view.png ...");
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, "05_tablet_view.png") });

  // 9. Mobile Viewport (390x844)
  console.log("Capturing 06_mobile_view.png ...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, "06_mobile_view.png") });

  await browser.close();
  console.log("All screenshots captured successfully in artifacts/round1!");
}

run().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
