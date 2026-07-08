/**
 * QA screenshot harness — drives the locally installed Chrome.
 * Usage: node tools/screenshot.mjs [baseUrl]
 * Writes desktop + mobile section screenshots into the scratch dir given
 * by SHOT_DIR (defaults to ./shots).
 */
import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';

const BASE = process.argv[2] || 'http://localhost:8321';
const OUT = process.env.SHOT_DIR || 'shots';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SECTIONS = ['band', 'music', 'shows', 'evidence'];

await mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise((r) => setTimeout(r, 800));
await page.screenshot({ path: `${OUT}/q-top.png` });

for (const id of SECTIONS) {
  await page.evaluate((target) => {
    document.getElementById(target).scrollIntoView({ behavior: 'instant', block: 'start' });
    window.scrollBy(0, -70);
  }, id);
  await new Promise((r) => setTimeout(r, 900)); // let reveals + lazy images settle
  await page.screenshot({ path: `${OUT}/q-${id}.png` });
}

// footer
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await new Promise((r) => setTimeout(r, 900));
await page.screenshot({ path: `${OUT}/q-footer.png` });

// mobile pass
await page.setViewport({ width: 390, height: 844 });
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise((r) => setTimeout(r, 600));
await page.screenshot({ path: `${OUT}/q-mob-top.png` });
for (const id of ['band', 'music']) {
  await page.evaluate((target) => {
    document.getElementById(target).scrollIntoView({ behavior: 'instant', block: 'start' });
    window.scrollBy(0, -60);
  }, id);
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: `${OUT}/q-mob-${id}.png` });
}

// mobile nav open state
await page.evaluate(() => window.scrollTo(0, 0));
await page.click('.nav-toggle');
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: `${OUT}/q-mob-nav.png` });

await browser.close();
console.log('screenshots written to', OUT);
