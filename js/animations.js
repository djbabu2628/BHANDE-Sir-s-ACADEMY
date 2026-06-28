/* ============================================================
   BSA — Animations Module
   Scroll reveal, animated counters, carousel, lightbox
   ============================================================ */

const Animations = (() => {
  'use strict';

  // ─── Scroll Reveal (IntersectionObserver) ────────

  function initScrollReveal() {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger children if parent has data-stagger
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, Number(delay));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => observer.observe(el));
  }

  /**
   * Apply stagger delays to children of a container
   * @param {string} selector - parent container selector
   * @param {number} baseDelay - ms between each child
   */
  function staggerChildren(selector, baseDelay = 100) {
    document.querySelectorAll(selector).forEach(parent => {
      const children = parent.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
      children.forEach((child, i) => {
        child.dataset.delay = i * baseDelay;
      });
    });
  }

  // ─── Animated Counters ───────────────────────────

  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(el => observer.observe(el));
  }

  function animateCounter(el) {
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.suffix || '';
    const duration = parseInt(el.dataset.duration) || 2000;
    const isDecimal = target % 1 !== 0;
    const start = performance.now();

    function step(timestamp) {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      if (isDecimal) {
        el.textContent = current.toFixed(1) + suffix;
      } else {
        el.textContent = Utils.formatNumber(Math.floor(current)) + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  // ─── Testimonial Carousel ───────────────────────

  function initCarousel(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const track = container.querySelector('.carousel-track');
    const slides = container.querySelectorAll('.carousel-slide');
    const dotsContainer = container.querySelector('.carousel-dots');
    const prevBtn = container.querySelector('.carousel-prev');
    const nextBtn = container.querySelector('.carousel-next');

    if (!track || slides.length === 0) return;

    let current = 0;
    let interval;
    const total = slides.length;

    // Create dots
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.onclick = () => goTo(i);
        dotsContainer.appendChild(dot);
      }
    }

    function goTo(index) {
      current = ((index % total) + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      // Update dots
      if (dotsContainer) {
        dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
          d.classList.toggle('active', i === current);
        });
      }
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    if (prevBtn) prevBtn.onclick = () => { prev(); resetAutoplay(); };
    if (nextBtn) nextBtn.onclick = () => { next(); resetAutoplay(); };

    // Autoplay
    function startAutoplay() {
      interval = setInterval(next, 5000);
    }
    function resetAutoplay() {
      clearInterval(interval);
      startAutoplay();
    }
    startAutoplay();

    // Pause on hover
    container.addEventListener('mouseenter', () => clearInterval(interval));
    container.addEventListener('mouseleave', startAutoplay);

    // Touch/swipe support
    let startX = 0, startY = 0, isDragging = false;
    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isDragging = true;
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      const diffX = startX - e.changedTouches[0].clientX;
      const diffY = startY - e.changedTouches[0].clientY;
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        diffX > 0 ? next() : prev();
        resetAutoplay();
      }
      isDragging = false;
    }, { passive: true });

    return { goTo, next, prev };
  }

  // ─── Lightbox ───────────────────────────────────

  let lightbox = null;
  let lightboxImages = [];
  let lightboxCurrent = 0;

  function initLightbox() {
    // Create lightbox if not exists
    if (!document.querySelector('.lightbox')) {
      const lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.id = 'lightbox';
      lb.innerHTML = `
        <button class="lightbox-close" aria-label="Close">✕</button>
        <button class="lightbox-prev" aria-label="Previous">‹</button>
        <img src="" alt="Gallery image" />
        <button class="lightbox-next" aria-label="Next">›</button>
      `;
      document.body.appendChild(lb);
      lightbox = lb;

      lb.querySelector('.lightbox-close').onclick = closeLightbox;
      lb.querySelector('.lightbox-prev').onclick = () => navigateLightbox(-1);
      lb.querySelector('.lightbox-next').onclick = () => navigateLightbox(1);
      lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });

      // Keyboard
      document.addEventListener('keydown', (e) => {
        if (!lb.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
      });
    }
  }

  function openLightbox(images, index = 0) {
    lightboxImages = images;
    lightboxCurrent = index;
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    lb.querySelector('img').src = images[index];
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    lb.classList.remove('active');
    document.body.style.overflow = '';
  }

  function navigateLightbox(dir) {
    if (!lightboxImages.length) return;
    lightboxCurrent = ((lightboxCurrent + dir) % lightboxImages.length + lightboxImages.length) % lightboxImages.length;
    const lb = document.getElementById('lightbox');
    if (lb) lb.querySelector('img').src = lightboxImages[lightboxCurrent];
  }

  // ─── Lazy Loading Images ────────────────────────

  function initLazyLoad() {
    const images = document.querySelectorAll('img[data-src]');
    if (!images.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.onload = () => img.classList.add('loaded');
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '100px' });

    images.forEach(img => observer.observe(img));
  }

  // ─── Smooth Accordion ──────────────────────────

  function initAccordion(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.faq-question');
      if (!btn) return;
      const item = btn.closest('.faq-item');
      const wasActive = item.classList.contains('active');

      // Close all
      container.querySelectorAll('.faq-item.active').forEach(el => {
        el.classList.remove('active');
      });

      // Toggle clicked
      if (!wasActive) {
        item.classList.add('active');
      }
    });
  }

  // ─── Navbar Scroll Effect ─────────────────────

  function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastScroll = 0;
    window.addEventListener('scroll', Utils.throttle(() => {
      const currentScroll = window.pageYOffset;
      if (currentScroll > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      lastScroll = currentScroll;
    }, 100));
  }

  // ─── Active Nav Link Highlighting ─────────────

  function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' });

    sections.forEach(section => observer.observe(section));
  }

  // ─── Back to Top Button ───────────────────────

  function initBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', Utils.throttle(() => {
      btn.classList.toggle('visible', window.pageYOffset > 400);
    }, 200));

    btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ─── Button Ripple Effect ─────────────────────

  function initRipple() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-ripple');
      if (!btn) return;
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
      ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  }

  // ─── Parallax (subtle) ────────────────────────

  function initParallax() {
    const els = document.querySelectorAll('[data-parallax]');
    if (!els.length) return;
    window.addEventListener('scroll', Utils.throttle(() => {
      const scrollY = window.pageYOffset;
      els.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.3;
        el.style.transform = `translateY(${scrollY * speed}px)`;
      });
    }, 50));
  }

  // ─── Initialize All ───────────────────────────

  function initAll() {
    initScrollReveal();
    initCounters();
    initLightbox();
    initLazyLoad();
    initNavbarScroll();
    initActiveNav();
    initBackToTop();
    initRipple();
    initParallax();
  }

  return {
    initAll, initScrollReveal, initCounters, initCarousel,
    initLightbox, openLightbox, closeLightbox,
    initLazyLoad, initAccordion, initNavbarScroll,
    initActiveNav, initBackToTop, initRipple, initParallax,
    staggerChildren
  };
})();
