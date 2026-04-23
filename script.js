/* ---------- DYNAMIC NAV ACTIVE STATE ---------- */
(function () {
  const page = location.pathname.split('/').pop() || 'index.html';
  const link = document.querySelector(`nav a[href="${page}"]`);
  if (link) {
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
  }
})();

/* ---------- DEFAULT GALLERY IMAGES ----------
   cat is now an ARRAY so images can appear in multiple categories.
   e.g. cat: ['cakepops', 'boxes'] shows in both filters.
--------------------------------------------------------- */
const defaultImages = [
  { src: 'gallery/1stcatering.png', label: 'Cake Pops',        caption: 'Fresh cake pops made for a catering order 🍭',        cat: ['cakepops'] },
  { src: 'gallery/strawberry1.png', label: 'Dipped Strawberry', caption: 'Fresh strawberries dipped in premium chocolate 🍫',   cat: ['strawberries'] },
  { src: 'gallery/strawberry2.png', label: 'Dipped Strawberry', caption: 'Custom colored chocolate strawberries 🍓',            cat: ['strawberries'] },
  { src: 'gallery/strawberry3.png', label: 'Dipped Strawberry', caption: 'White chocolate drizzle strawberries ✨',             cat: ['strawberries'] },
  { src: 'gallery/dessertbox1.png', label: 'Dessert Box',       caption: 'Our signature dessert box — perfect for gifting 🎁',  cat: ['boxes'] },
  { src: 'gallery/box1.png',        label: 'Treat Box',         caption: 'Custom treat box for any occasion 🎉',                cat: ['boxes'] },
  { src: 'gallery/IMG_1888.jpeg',   label: 'Custom Creation',   caption: 'Handcrafted with love 💕',                            cat: ['strawberries'] },
  { src: 'gallery/IMG_1889.jpeg',   label: 'Custom Creation',   caption: 'Every order made fresh to order 🍓',                  cat: ['strawberries'] },
];

/* ---------- GALLERY (used on pages WITHOUT Drive logic) ---------- */
const gallery = document.querySelector('.gallery-grid');

// getCats: normalise cat to always be an array
function getCats(img) {
  if (Array.isArray(img.cat)) return img.cat;
  if (typeof img.cat === 'string' && img.cat) return [img.cat];
  return [];
}

if (gallery && !gallery.dataset.drive) {
  // only run this if gallery.html hasn't claimed the grid with Drive logic

  function getAdminImages() {
    try {
      const stored = localStorage.getItem('ds_gallery_images');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  }

  function getAllImages() {
    return [...defaultImages, ...getAdminImages()];
  }

  function buildGallery(filter) {
    gallery.innerHTML = '';
    const all = getAllImages();
    const filtered = filter === 'all'
      ? all
      : all.filter(i => getCats(i).includes(filter));

    if (filtered.length === 0) {
      gallery.innerHTML = '<p style="text-align:center;color:var(--text-soft);padding:40px;grid-column:1/-1;">No photos in this category yet.</p>';
      return;
    }

    filtered.forEach(({ src, label, caption }, idx) => {
      const item = document.createElement('div');
      item.className = 'gallery-item fade-up';

      const img = document.createElement('img');
      img.src = src; img.alt = label; img.loading = 'lazy';

      const overlay = document.createElement('div');
      overlay.className = 'gallery-item-overlay';
      overlay.innerHTML = `<span>${label}</span>`;

      item.appendChild(img);
      item.appendChild(overlay);
      gallery.appendChild(item);
      item.addEventListener('click', () => openLightbox(src, label, caption || label));
      setTimeout(() => item.classList.add('visible'), idx * 60);
    });
  }

  buildGallery('all');

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      buildGallery(btn.dataset.filter);
    });
  });
}

/* ---------- LIGHTBOX ---------- */
const lightbox = document.getElementById('lightbox');

function openLightbox(src, alt, caption) {
  if (!lightbox) return;
  const img = lightbox.querySelector('img');
  const cap = document.getElementById('lightbox-caption');
  img.src = src; img.alt = alt || '';
  if (cap) cap.textContent = caption || '';
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

if (lightbox) {
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-close')) closeLightbox();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}

/* ---------- SCROLL FADE-IN ---------- */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

/* ---------- DARK MODE ---------- */
(function initDarkMode() {
  const saved = localStorage.getItem('ds_dark_mode');
  if (saved === 'true') document.body.classList.add('dark-mode');

  // Inject toggle button on every page
  const btn = document.createElement('button');
  btn.className = 'dark-mode-toggle';
  btn.setAttribute('aria-label', 'Toggle dark mode');
  btn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
  btn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('ds_dark_mode', isDark);
    btn.textContent = isDark ? '☀️' : '🌙';
  });
  document.body.appendChild(btn);
})();

/* ---------- SEASONAL THEME + BANNER ---------- */
(function initSeasonal() {
  try {
    const config = JSON.parse(localStorage.getItem('ds_seasonal') || 'null');
    if (!config || !config.active) return;

    // Apply theme class
    if (config.theme) {
      document.body.classList.add('theme-' + config.theme);
    }

    // Apply custom colors if set
    if (config.primaryColor) {
      document.documentElement.style.setProperty('--rose', config.primaryColor);
      // Derive tint variables from the primary color
      const hex = config.primaryColor.replace('#','');
      const r = parseInt(hex.substring(0,2),16);
      const g = parseInt(hex.substring(2,4),16);
      const b = parseInt(hex.substring(4,6),16);
      document.documentElement.style.setProperty('--tint-light', `rgba(${r},${g},${b},.08)`);
      document.documentElement.style.setProperty('--tint-mid',   `rgba(${r},${g},${b},.18)`);
      document.documentElement.style.setProperty('--tint-grad',  `linear-gradient(135deg,rgba(${r},${g},${b},.1),rgba(${r},${g},${b},.2))`);
    }
    if (config.navColor) {
      document.documentElement.style.setProperty('--nav-bg', config.navColor);
    }
    if (config.bgColor) {
      document.documentElement.style.setProperty('--blush', config.bgColor);
    }

    // Show banner if set
    if (config.bannerText && !sessionStorage.getItem('ds_banner_closed')) {
      const banner = document.createElement('div');
      banner.className = 'seasonal-banner';
      if (config.bannerColor) banner.style.background = config.bannerColor;
      if (config.bannerTextColor) banner.style.color = config.bannerTextColor;

      // Default link to Bakesy order page if none set
      const link     = config.bannerLink || 'https://bakesy.shop/b/dipped-sweetz-by-camila';
      const linkText = config.bannerLinkText || 'Order Now →';

      // Strip trailing → from bannerText since the link handles it
      const cleanText = (config.bannerText || '').replace(/\s*→\s*$/, '').trim();

      banner.innerHTML = `
        <span>${config.bannerEmoji || '🎉'} ${cleanText}</span>
        <a href="${link}" target="_blank" style="color:inherit;font-weight:700;margin-left:10px;text-decoration:underline;">${linkText}</a>
        <button class="seasonal-banner-close" onclick="this.parentElement.remove();sessionStorage.setItem('ds_banner_closed','1')">✕</button>
      `;
      document.body.insertBefore(banner, document.body.firstChild);
    }
  } catch {}
})();

/* ---------- RETURNING VISITOR GREETING ---------- */
(function initGreeting() {
  const page = location.pathname.split('/').pop() || 'index.html';
  if (page !== 'index.html' && page !== '') return;

  const visits = parseInt(localStorage.getItem('ds_visits') || '0') + 1;
  localStorage.setItem('ds_visits', visits);
  localStorage.setItem('ds_last_visit', new Date().toISOString());

  if (visits > 1 && !sessionStorage.getItem('ds_greeted')) {
    sessionStorage.setItem('ds_greeted', '1');
    const greet = document.createElement('div');
    greet.className = 'return-greeting show';
    const messages = [
      'Welcome back! 🍓 So glad to see you again!',
      'Hey, you\'re back! 🍓 Check out what\'s new.',
      'Welcome back! 🍓 Ready for something sweet?',
      'Great to see you again! 🍓',
    ];
    greet.innerHTML = `
      ${messages[Math.floor(Math.random() * messages.length)]}
      <button class="return-greeting-close" onclick="this.parentElement.remove()">✕</button>
    `;
    // Insert after nav
    const nav = document.querySelector('nav');
    if (nav) nav.insertAdjacentElement('afterend', greet);
  }
})();

/* ---------- FAQ ACCORDION ---------- */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    // Open this one if it wasn't open
    if (!isOpen) item.classList.add('open');
  });
});

/* ---------- GALLERY SHARE BUTTON ---------- */
function shareGallery() {
  const url  = window.location.href;
  const text = 'Check out Dipped Sweetz by Camila! 🍓';
  if (navigator.share) {
    navigator.share({ title: 'Dipped Sweetz Gallery', text, url });
  } else {
    navigator.clipboard?.writeText(url).then(() => {
      const btn = document.getElementById('share-gallery-btn');
      if (btn) { btn.textContent = '✅ Link Copied!'; setTimeout(() => btn.textContent = '🔗 Share Gallery', 2000); }
    });
  }
}

