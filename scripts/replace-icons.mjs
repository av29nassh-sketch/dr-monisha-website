import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imgData = fs.readFileSync(path.join(__dirname, 'brand assets', 'Untitled.png'));
const b64 = imgData.toString('base64');

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { margin: 0; padding: 0; }
  html, body { overflow: hidden; background: transparent; }
  img { display: block; width: 100%; height: 100%; object-fit: cover; }
</style>
</head>
<body><img src="data:image/png;base64,${b64}" /></body>
</html>`;

async function run() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const iconsDir = path.join(__dirname, 'icons');

  const sizes = [192, 512];
  for (const size of sizes) {
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    await page.screenshot({
      path: path.join(iconsDir, `icon-${size}x${size}.png`),
      clip: { x: 0, y: 0, width: size, height: size },
    });
    console.log(`Generated icon-${size}x${size}.png`);
  }

  await page.setViewport({ width: 180, height: 180, deviceScaleFactor: 1 });
  await page.screenshot({
    path: path.join(iconsDir, 'apple-touch-icon.png'),
    clip: { x: 0, y: 0, width: 180, height: 180 },
  });
  console.log('Generated apple-touch-icon.png');

  await browser.close();
  console.log('Done.');
}

run().catch(err => { console.error(err); process.exit(1); });
