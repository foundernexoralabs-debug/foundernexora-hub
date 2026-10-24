import { createRequire } from 'node:module';
import path from 'node:path';

const [appRoot, outDir] = process.argv.slice(2);
const require = createRequire(path.join(appRoot, 'package.json'));
const { chromium } = require('playwright-core');
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const here = path.dirname(new URL(import.meta.url).pathname);
const sizes = {
  og: [1200, 630, 'renor-launch-og-1200x630.png'],
  square: [1080, 1080, 'renor-launch-square-1080.png'],
  story: [1080, 1920, 'renor-launch-story-1080x1920.png'],
};
for (const [kind, [width, height, name]] of Object.entries(sizes)) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(`file://${here}/graphic.html?kind=${kind}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, name) });
  await page.close();
  process.stdout.write(`rendered ${name}\n`);
}
await browser.close();
