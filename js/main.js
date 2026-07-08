/* The Charred Rebellion — site behavior
   Everything degrades gracefully: with JS disabled the page is fully
   usable (no reveal animations, gallery images simply don't zoom). */

document.documentElement.classList.add('js');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- Mobile nav ---------- */
const topbar = document.querySelector('.topbar');
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.getElementById('site-nav');

if (navToggle && topbar) {
  navToggle.addEventListener('click', () => {
    const open = topbar.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  // close the panel after choosing a section
  siteNav.addEventListener('click', (e) => {
    if (e.target.matches('a')) {
      topbar.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ---------- Scroll reveal ---------- */
const revealables = document.querySelectorAll(
  '.file-head, .file-intro, .member-card, .product-card, .music-grid > div, .shows-empty, .evidence-grid li'
);

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  revealables.forEach((el) => el.classList.add('reveal'));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  revealables.forEach((el) => io.observe(el));
}

/* ---------- Lite YouTube embed ---------- */
document.querySelectorAll('.lite-yt').forEach((box) => {
  const play = box.querySelector('.lite-yt-play');
  if (!play) return;
  play.addEventListener('click', () => {
    const id = box.dataset.videoId;
    const title = box.dataset.title || 'YouTube video';
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    iframe.title = title;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    box.innerHTML = '';
    box.appendChild(iframe);
  });
});

/* ---------- Gallery lightbox ---------- */
const lightbox = document.querySelector('.lightbox');

if (lightbox && typeof lightbox.showModal === 'function') {
  const lbImg = lightbox.querySelector('.lightbox-img');
  const lbCaption = lightbox.querySelector('.lightbox-caption');
  const items = Array.from(document.querySelectorAll('.evidence-item'));
  let current = -1;
  let lastTrigger = null;

  function show(index) {
    current = (index + items.length) % items.length;
    const item = items[current];
    const caption = item.querySelector('figcaption');
    lbImg.src = item.dataset.full;
    lbImg.alt = item.querySelector('img').alt;
    lbCaption.textContent = caption ? caption.textContent : '';
  }

  items.forEach((item, i) => {
    item.addEventListener('click', () => {
      lastTrigger = item;
      show(i);
      lightbox.showModal();
    });
  });

  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => show(current - 1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => show(current + 1));

  lightbox.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  // click on the backdrop closes
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.close();
  });

  lightbox.addEventListener('close', () => {
    lbImg.src = '';
    if (lastTrigger) lastTrigger.focus();
  });
}

/* ---------- Merch buy buttons ----------
   Paste a Stripe Payment Link into data-payment-link to open a product
   for sale; the button flips from "Coming soon" to a live Buy link. */
document.querySelectorAll('.buy-button').forEach((btn) => {
  const link = btn.dataset.paymentLink;
  if (link) {
    btn.href = link;
    btn.textContent = 'Buy';
    btn.removeAttribute('aria-disabled');
    btn.removeAttribute('role');
  }
});

/* ---------- Hero embers ---------- */
const canvas = document.querySelector('.hero-embers');

if (canvas && !reducedMotion.matches && window.innerWidth > 640) {
  const ctx = canvas.getContext('2d');
  const hero = canvas.closest('.hero');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let width, height, embers, raf = null;

  function resize() {
    width = hero.offsetWidth;
    height = hero.offsetHeight;
    canvas.width = width * DPR;
    canvas.height = height * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function spawn() {
    return {
      x: Math.random() * width,
      y: height * (0.55 + Math.random() * 0.45),
      r: 0.6 + Math.random() * 1.7,
      vy: 0.25 + Math.random() * 0.7,
      vx: (Math.random() - 0.5) * 0.3,
      life: 0,
      span: 240 + Math.random() * 320,
      flicker: Math.random() * Math.PI * 2,
    };
  }

  function init() {
    resize();
    embers = Array.from({ length: 38 }, () => {
      const e = spawn();
      e.life = Math.random() * e.span; // stagger
      return e;
    });
  }

  function tick() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < embers.length; i++) {
      const e = embers[i];
      e.life++;
      if (e.life > e.span || e.y < -8) { embers[i] = spawn(); continue; }
      e.y -= e.vy;
      e.x += e.vx + Math.sin((e.life + e.flicker) * 0.03) * 0.25;
      const fade = 1 - e.life / e.span;
      const glow = 0.35 + 0.3 * Math.sin(e.life * 0.15 + e.flicker);
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${228 + Math.floor(20 * glow)}, ${90 + Math.floor(60 * glow)}, 27, ${(fade * (0.45 + glow * 0.4)).toFixed(3)})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  }

  function start() { if (raf === null) raf = requestAnimationFrame(tick); }
  function stop() { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } }

  init();

  // only animate while the hero is on screen and the tab is visible
  const visibility = new IntersectionObserver((entries) => {
    entries[0].isIntersecting && !document.hidden ? start() : stop();
  });
  visibility.observe(hero);
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 200);
  });
}
