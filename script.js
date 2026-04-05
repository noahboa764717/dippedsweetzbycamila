/* ---------- DYNAMIC NAV ACTIVE STATE ---------- */
(function () {
  const page = location.pathname.split('/').pop() || 'index.html';
  const link = document.querySelector(`nav a[href="${page}"]`);
  if (link) {
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
  }
})();

/* ---------- GALLERY AUTO LOAD ---------- */
const gallery = document.querySelector('.gallery-grid');

if (gallery) {
  const images = [
    { src: 'gallery/strawberry1.png',  label: 'Dipped Strawberry',   cat: 'strawberries' },
    { src: 'gallery/strawberry2.png',  label: 'Dipped Strawberry',   cat: 'strawberries' },
    { src: 'gallery/strawberry3.png',  label: 'Dipped Strawberry',   cat: 'strawberries' },
    { src: 'gallery/dessertbox1.png',  label: 'Dessert Box',         cat: 'boxes' },
    { src: 'gallery/box1.png',         label: 'Treat Box',           cat: 'boxes' },
    { src: 'gallery/IMG_1888.jpeg',    label: 'Custom Creation',     cat: 'strawberries' },
    { src: 'gallery/IMG_1889.jpeg',    label: 'Custom Creation',     cat: 'strawberries' },
  ];

  function buildGallery(filter) {
    gallery.innerHTML = '';
    const filtered = filter === 'all' ? images : images.filter(i => i.cat === filter);
    filtered.forEach(({ src, label, cat }) => {
      const item = document.createElement('div');
      item.className = 'gallery-item fade-up';
      item.dataset.cat = cat;

      const img = document.createElement('img');
      img.src = src;
      img.alt = label;
      img.loading = 'lazy';

      const overlay = document.createElement('div');
      overlay.className = 'gallery-item-overlay';
      overlay.innerHTML = `<span>${label}</span>`;

      item.appendChild(img);
      item.appendChild(overlay);
      gallery.appendChild(item);

      img.addEventListener('click', () => openLightbox(src, label));

      requestAnimationFrame(() => {
        setTimeout(() => item.classList.add('visible'), 50);
      });
    });
  }

  buildGallery('all');

  /* Filter buttons */
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

function openLightbox(src, alt) {
  if (!lightbox) return;
  const img = lightbox.querySelector('img');
  img.src = src;
  img.alt = alt || '';
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

if (lightbox) {
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
      closeLightbox();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

/* ---------- SCROLL FADE-IN OBSERVER ---------- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
