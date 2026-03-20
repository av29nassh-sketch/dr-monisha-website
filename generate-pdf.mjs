import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

const htmlPath = join(__dirname, 'website-walkthrough.html');
const htmlContent = readFileSync(htmlPath, 'utf-8');

await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
await page.emulateMediaType('print');

await page.pdf({
  path: join(__dirname, 'website-walkthrough.pdf'),
  format: 'A4',
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
  printBackground: true,
});

await browser.close();
console.log('PDF generated: website-walkthrough.pdf');
