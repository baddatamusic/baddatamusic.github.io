# The Charred Rebellion — website

Static site for **The Charred Rebellion**, a grunge-inspired band from South Houston, TX.
Plain HTML/CSS/JS — no framework, no build step required to view it.

## Run it

Any static file server works. Two easy options:

```sh
# with Node installed
npm run serve          # serves on http://localhost:3000

# or with Python
python -m http.server 8000
```

Then open the printed URL. (Opening `index.html` directly from disk mostly works too,
but the Bandcamp/YouTube embeds behave better over http.)

## Project structure

```
index.html              The main page (single page, anchor nav)
merch.html              Merch page (Stripe-ready, see below)
css/style.css           All styling — design tokens are at the top under :root
js/main.js              Nav toggle, scroll reveal, lightbox, lite YouTube embed, hero embers
assets/img/             Optimized responsive images (generated — don't edit by hand)
assets/fonts/           Self-hosted woff2 fonts (Special Elite, IBM Plex Mono/Sans)
band-photos/            Original photos (source of truth; member folders inside)
tools/optimize-images.mjs  Image pipeline (sharp): crops, resizes, webp+jpeg
package.json            npm scripts + sharp dev-dependency
```

## Design notes

The site is styled as a **recovered case file**: dossier section labels (FILE 01–04),
"EXHIBIT" captions in the gallery, a CASE NO. built from the 713 area code, real
South Houston coordinates, scorched torn-edge dividers, film grain, and the band's
burned-paper TCR seal. Photos render in a xeroxed burnt duotone and restore to full
color on hover/focus. Design tokens (colors, fonts) live at the top of `css/style.css`.

## Updating content

### Add a show
In `index.html`, find `FILE 03 — SHOWS`. Copy the commented `<li class="show-row">`
template into the `<ol class="show-list">`, fill in date/venue/city/ticket link,
and delete the `.shows-empty` div once you have at least one date.

### Add / change photos
1. Drop originals into `band-photos/` (member photos go in their folders).
2. Add or edit the entry in the `JOBS` list in `tools/optimize-images.mjs`
   (slug, file, optional crop, widths).
3. Run `npm install` once, then `npm run images`.
4. Add a matching `<li>` in the gallery (copy an existing one and update the
   slug, width/height, alt text, and caption).

### Member cards
Members with a photo use a `<picture>` block; members without one use the
"NO PHOTO ON FILE" sigil placeholder — copy either pattern in `FILE 01 — THE BAND`.

### Music embeds
- Bandcamp: the album player uses album ID `2181243397` (TCR-Demos & Jams).
  For a different album, replace the number in the iframe `src`.
- YouTube: the featured video is set by `data-video-id` on the `.lite-yt` div
  (currently `BMaMKRzQ8o8`, "Truth Hurts"). The extra video links below it are
  plain anchors.

### Merch + Stripe
`merch.html` ships with the products stubbed and buy buttons showing
"Coming soon". To open the register, per product:

1. In the [Stripe dashboard](https://dashboard.stripe.com), create the
   product + price, then create a **Payment Link** for it.
2. In `merch.html`, paste that URL into the button's `data-payment-link`
   attribute:
   ```html
   <a class="btn buy-button" data-payment-link="https://buy.stripe.com/XXXX" ...>
   ```
3. That's it — `js/main.js` sees the link and flips the button to a live
   "Buy" link. No backend needed; Stripe hosts the checkout page.

To add a product, copy a `<li class="product-card">` block. If you later
want cart/quantities instead of one-click links, that's a switch to Stripe
Checkout with a small serverless function — the markup won't need to change.

### Before going live
- Update the `og:image` absolute URL in `<head>` if the domain isn't
  `www.thecharredrebellion.com`.
- Deploy by uploading everything **except** `node_modules/`, `tools/`, and
  `band-photos/` (only `index.html`, `css/`, `js/`, `assets/` are needed).
  Netlify/GitHub Pages/Cloudflare Pages all work as-is.
