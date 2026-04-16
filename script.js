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

