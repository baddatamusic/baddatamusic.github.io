/**
 * Image pipeline for thecharredrebellion.com
 * Reads originals from ./band-photos, writes optimized responsive
 * variants (webp + jpeg fallback) into ./assets/img.
 *
 * Run:  npm run images
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'band-photos';
const OUT = 'assets/img';

const JPEG_OPTS = { quality: 72, progressive: true, mozjpeg: true };
const WEBP_OPTS = { quality: 70 };

/** slug -> { file, widths, crop? {left,top,width,height}, heights? } */
const JOBS = [
  // Hero — full-bleed background
  { slug: 'hero', file: 'IMG_6756.JPG', widths: [2400, 1600, 1080, 720] },

  // Member cards (square crops from each member's folder)
  { slug: 'member-tiffany', file: 'tiffany/tiff_tcr_web.jpg', crop: { left: 60, top: 0, width: 1080, height: 1080 }, widths: [900, 520] },
  { slug: 'member-ashley', file: 'ashley/ash_tcr_web.jpg', crop: { left: 340, top: 0, width: 1080, height: 1080 }, widths: [900, 520] },
  { slug: 'member-jeffrey', file: 'jeff/IMG_6776.JPG', crop: { left: 1150, top: 350, width: 2722, height: 2722 }, widths: [900, 520] },
  { slug: 'member-jacoby', file: 'jacoby/sunnspots1-156.jpg', crop: { left: 3480, top: 260, width: 1680, height: 1680 }, widths: [900, 520] },
  // Doug's source is only 400px wide — single size, no upscaling
  { slug: 'member-doug', file: 'doug/wrekk-profile-2.jpg', crop: { left: 0, top: 8, width: 400, height: 400 }, widths: [400] },

  // Gallery exhibits
  { slug: 'ex-a', file: 'IMG_6724.JPG', widths: [1400, 900, 520] },
  { slug: 'ex-b', file: 'IMG_6731.JPG', widths: [1400, 900, 520] },
  { slug: 'ex-c', file: 'IMG_6732.JPG', widths: [1400, 900, 520] },
  { slug: 'ex-d', file: 'IMG_6737.JPG', widths: [1400, 900, 520] },
  { slug: 'ex-e', file: 'IMG_6749.JPG', widths: [1400, 900, 520] },
  { slug: 'ex-f', file: 'IMG_6762.JPG', widths: [1400, 900, 520] },
  { slug: 'ex-g', file: 'Mark_Kidney_Ash_Guitar_Truth_Hurts_7.jpg', widths: [1400, 900, 520] },
  { slug: 'ex-h', file: 'TCR_Wire_RD_5-14-26_27.JPG', widths: [1400, 900, 520] },
  { slug: 'ex-i', file: 'TCR_Wire_RD_5-14-26_28.JPG', widths: [1400, 900, 520] },
  { slug: 'ex-j', file: 'TCR_Wire_RD_5-14-26_32.JPG', widths: [1400, 900, 520] },
  { slug: 'ex-k', file: 'TCR_Wire_RD_5-14-26_33.JPG', widths: [1400, 900, 520] },
  { slug: 'ex-l', file: 'jacoby/sunnspots1-151.jpg', widths: [1400, 900, 520] },
  { slug: 'ex-m', file: 'jacoby/sunnspots1-153.jpg', widths: [1400, 900, 520] },

  // Brand seal (burned-paper logo)
  { slug: 'seal', file: 'tcr_brun_logo.jpg', widths: [640, 320, 160] },
];

async function run() {
  await mkdir(OUT, { recursive: true });

  for (const job of JOBS) {
    const srcPath = path.join(SRC, job.file);
    const meta = await sharp(srcPath).metadata();

    let base = sharp(srcPath).rotate(); // respect EXIF orientation
    if (job.crop) {
      const c = job.crop;
      // clamp crop to image bounds
      const left = Math.max(0, Math.min(c.left, meta.width - 10));
      const top = Math.max(0, Math.min(c.top, meta.height - 10));
      const width = Math.min(c.width, meta.width - left);
      const height = Math.min(c.height, meta.height - top);
      base = base.extract({ left, top, width, height });
    }

    for (const w of job.widths) {
      const resized = base.clone().resize({ width: w, withoutEnlargement: true });
      const jpgOut = path.join(OUT, `${job.slug}-${w}.jpg`);
      const webpOut = path.join(OUT, `${job.slug}-${w}.webp`);
      const [j, we] = await Promise.all([
        resized.clone().jpeg(JPEG_OPTS).toFile(jpgOut),
        resized.clone().webp(WEBP_OPTS).toFile(webpOut),
      ]);
      console.log(`${job.slug}-${w}: jpg ${(j.size / 1024).toFixed(0)}kB / webp ${(we.size / 1024).toFixed(0)}kB (${j.width}x${j.height})`);
    }
  }

  // Favicons + OG image
  const logo = sharp(path.join(SRC, 'tcr_brun_logo.jpg')).rotate();
  await logo.clone().resize(32, 32).png().toFile(path.join(OUT, 'favicon-32.png'));
  await logo.clone().resize(180, 180).png().toFile(path.join(OUT, 'apple-touch-icon.png'));
  await logo.clone().resize(512, 512).png().toFile(path.join(OUT, 'icon-512.png'));

  await sharp(path.join(SRC, 'tcr_bus_card_ai6.jpg'))
    .rotate()
    .resize(1200, 630, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 80, progressive: true, mozjpeg: true })
    .toFile(path.join(OUT, 'og-card.jpg'));

  console.log('favicons + og-card done');
}

run().catch((e) => { console.error(e); process.exit(1); });
