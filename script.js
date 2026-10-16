'use strict';
const WHATSAPP_NUMBER = '201017455556';
const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER}`;
const generalMessage = 'السلام عليكم، أرغب في الاستفسار عن خدمات مؤسسة الأصلي مع الشيف رامي سلام. أود معرفة التفاصيل المناسبة لطلبي.';

function whatsappUrl(message) {
  return `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;
}

// Missing local images are replaced with designed placeholders rather than broken-image icons.
document.querySelectorAll('.media-frame img').forEach((img) => {
  const frame = img.closest('.media-frame');
  const markMissing = () => frame?.classList.add('image-missing');
  img.addEventListener('error', markMissing, { once: true });
  if (img.complete && img.naturalWidth === 0) markMissing();
});

document.querySelectorAll('.gallery-item').forEach((item) => {
  const img = item.querySelector('img');
  const markMissing = () => item.classList.add('image-missing');
  img.addEventListener('error', markMissing, { once: true });
  if (img.complete && img.naturalWidth === 0) markMissing();
});

// Mobile navigation: close after selecting a section or pressing Escape.
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
function setMenuOpen(open) {
  menuToggle?.setAttribute('aria-expanded', String(open));
  menuToggle?.setAttribute('aria-label', open ? 'إغلاق قائمة التنقل' : 'فتح قائمة التنقل');
  mainNav?.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
}
menuToggle?.addEventListener('click', () => setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true'));
mainNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setMenuOpen(false);
    closeLightbox();
  }
});

// Service-specific WhatsApp messages.
document.querySelectorAll('.service-link').forEach((link) => {
  const service = link.dataset.service || 'الخدمات';
  const message = `السلام عليكم، أرغب في الاستفسار عن خدمة ${service} لدى مؤسسة الأصلي مع الشيف رامي سلام. برجاء توضيح التفاصيل المتاحة.`;
  link.href = whatsappUrl(message);
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
});

// Inquiry form prepares a message only; the visitor reviews and sends it from WhatsApp.
const inquiryForm = document.getElementById('inquiry-form');
inquiryForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(inquiryForm);
  const fields = [
    ['نوع المناسبة', data.get('eventType')],
    ['المحافظة', data.get('governorate')],
    ['التاريخ', data.get('eventDate')],
    ['عدد الضيوف التقريبي', data.get('guests')],
    ['تفاصيل إضافية', data.get('details')]
  ];
  const lines = ['السلام عليكم، أرغب في الاستفسار عن خدمات مؤسسة الأصلي مع الشيف رامي سلام.'];
  fields.forEach(([label, value]) => {
    const cleaned = typeof value === 'string' ? value.trim() : '';
    if (cleaned) lines.push(`${label}: ${cleaned}`);
  });
  lines.push('برجاء التواصل معي لمناقشة التفاصيل.');
  const url = whatsappUrl(lines.join('\n'));
  const status = document.getElementById('form-status');
  if (status) status.textContent = 'ستُفتح رسالة واتساب في نافذة جديدة. راجع بياناتك ثم أرسل الرسالة بنفسك.';
  window.open(url, '_blank', 'noopener,noreferrer');
});

// Gallery lightbox. Missing placeholder images are intentionally not opened.
const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxCaption = document.getElementById('lightbox-caption');
let currentGalleryIndex = 0;
let previousFocus = null;
function openLightbox(index) {
  const item = galleryItems[index];
  const image = item?.querySelector('img');
  if (!item || item.classList.contains('image-missing') || !image?.naturalWidth) return;
  currentGalleryIndex = index;
  previousFocus = document.activeElement;
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = item.querySelector('.gallery-caption')?.textContent || image.alt;
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  lightbox.querySelector('.lightbox-close')?.focus();
}
function closeLightbox() {
  if (!lightbox || lightbox.hidden) return;
  lightbox.hidden = true;
  lightboxImage.removeAttribute('src');
  document.body.style.overflow = '';
  previousFocus?.focus?.();
}
function moveLightbox(direction) {
  if (!galleryItems.length) return;
  for (let attempt = 0; attempt < galleryItems.length; attempt += 1) {
    currentGalleryIndex = (currentGalleryIndex + direction + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentGalleryIndex];
    const img = item.querySelector('img');
    if (!item.classList.contains('image-missing') && img?.naturalWidth) {
      openLightbox(currentGalleryIndex);
      return;
    }
  }
}
galleryItems.forEach((item, index) => item.addEventListener('click', () => openLightbox(index)));
lightbox?.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
lightbox?.querySelector('.lightbox-prev')?.addEventListener('click', () => moveLightbox(-1));
lightbox?.querySelector('.lightbox-next')?.addEventListener('click', () => moveLightbox(1));
lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (event) => {
  if (lightbox && !lightbox.hidden) {
    if (event.key === 'ArrowLeft') moveLightbox(1);
    if (event.key === 'ArrowRight') moveLightbox(-1);
  }
});

// Keep the video section hidden unless at least one local video file is present.
const videoSection = document.querySelector('.video-section');
const videos = Array.from(document.querySelectorAll('.video-card video'));
let checkedVideos = 0;
let availableVideos = 0;
function finishVideoCheck() {
  checkedVideos += 1;
  if (checkedVideos >= videos.length && videoSection) videoSection.hidden = availableVideos === 0;
}
videos.forEach((video) => {
  video.addEventListener('loadedmetadata', () => { availableVideos += 1; finishVideoCheck(); }, { once: true });
  video.addEventListener('error', finishVideoCheck, { once: true });
  video.querySelector('source')?.addEventListener('error', () => {
    if (videoSection && checkedVideos >= videos.length) videoSection.hidden = availableVideos === 0;
  }, { once: true });
  video.load();
});
if (videos.length === 0 && videoSection) videoSection.hidden = true;

// Dynamic copyright year.
const year = document.getElementById('current-year');
if (year) year.textContent = String(new Date().getFullYear());
