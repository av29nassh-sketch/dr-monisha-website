import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bg" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#2c3d9e"/>
      <stop offset="100%" stop-color="#111a52"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <!-- Stylised mind/leaf motif -->
  <ellipse cx="256" cy="210" rx="90" ry="110" fill="none" stroke="#c17b6e" stroke-width="18" opacity="0.9"/>
  <ellipse cx="256" cy="210" rx="55" ry="70" fill="none" stroke="#c17b6e" stroke-width="10" opacity="0.5"/>
  <!-- Stem -->
  <line x1="256" y1="320" x2="256" y2="380" stroke="#c17b6e" stroke-width="14" stroke-linecap="round"/>
  <!-- Serif M initial -->
  <text x="256" y="230" text-anchor="middle" dominant-baseline="middle"
    font-family="Georgia, serif" font-size="100" font-weight="700"
    fill="#fdf5f2" opacity="0.15">M</text>
  <!-- Tagline dots -->
  <circle cx="196" cy="390" r="6" fill="#c17b6e" opacity="0.7"/>
  <circle cx="256" cy="390" r="6" fill="#c17b6e" opacity="0.7"/>
  <circle cx="316" cy="390" r="6" fill="#c17b6e" opacity="0.7"/>
</svg>`;

const iconHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { margin: 0; padding: 0; }
  html, body { width: 512px; height: 512px; overflow: hidden; background: transparent; }
  svg { width: 512px; height: 512px; display: block; }
</style>
</head>
<body>${iconSvg}</body>
</html>`;

async function generateIcons() {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: undefined,
  });
  const page = await browser.newPage();
  await page.setContent(iconHtml, { waitUntil: 'networkidle0' });

  const iconsDir = 'icons';
  if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir);

  const sizes = [192, 512];
  for (const size of sizes) {
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    await page.screenshot({
      path: path.join(iconsDir, `icon-${size}x${size}.png`),
      clip: { x: 0, y: 0, width: size, height: size },
      omitBackground: false,
    });
    console.log(`Generated icon-${size}x${size}.png`);
  }

  // Also generate a 180x180 apple touch icon
  await page.setViewport({ width: 180, height: 180, deviceScaleFactor: 1 });
  await page.screenshot({
    path: path.join(iconsDir, 'apple-touch-icon.png'),
    clip: { x: 0, y: 0, width: 180, height: 180 },
    omitBackground: false,
  });
  console.log('Generated apple-touch-icon.png');

  await browser.close();
  console.log('All icons generated.');
}

generateIcons().catch(err => { console.error(err); process.exit(1); });
