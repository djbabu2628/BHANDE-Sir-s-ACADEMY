/* ============================================================
   BSA — Main Application
   Initializes all sections, renders content from storage
   ============================================================ */

const App = (() => {
  'use strict';

  // ─── Apply Theme Colors ───────────────────────
  function applyTheme() {
    const theme = Storage.getSettings('theme');
    const root = document.documentElement;
    if (theme.primary) root.style.setProperty('--primary', theme.primary);
    if (theme.primaryLight) root.style.setProperty('--primary-light', theme.primaryLight);
    if (theme.secondary) root.style.setProperty('--secondary', theme.secondary);
    if (theme.secondaryLight) root.style.setProperty('--secondary-light', theme.secondaryLight);
    if (theme.accent) root.style.setProperty('--accent', theme.accent);
    if (theme.accentLight) root.style.setProperty('--accent-light', theme.accentLight);
  }

  // ─── Apply SEO ────────────────────────────────
  function applySEO() {
    const seo = Storage.getSettings('seo');
    if (seo.title) document.title = seo.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && seo.description) metaDesc.setAttribute('content', seo.description);
    const metaKeys = document.querySelector('meta[name="keywords"]');
    if (metaKeys && seo.keywords) metaKeys.setAttribute('content', seo.keywords);
  }

  // ─── Render Notice Bar ────────────────────────
  function renderNotices() {
    const container = document.getElementById('notice-bar');
    if (!container) return;
    const notices = Storage.getAll('notices') || [];
    container.innerHTML = Components.renderNoticeBar(notices);
  }

  // ─── Render Navbar Logo/Name ──────────────────
  function renderNavbar() {
    const info = Storage.getSettings('institute');
    const logoEl = document.getElementById('nav-logo');
    const nameEl = document.getElementById('nav-name');
    if (logoEl && info.logo) {
      logoEl.innerHTML = `<img src="${info.logo}" alt="${Utils.sanitizeHTML(info.name)}" class="h-10 w-auto" />`;
    }
    if (nameEl) nameEl.textContent = info.name || 'BHANDE Sir\'s ACADEMY';
  }

  // ─── Render Hero Section ──────────────────────
  function renderHero() {
    const hero = Storage.getSettings('hero');
    const info = Storage.getSettings('institute');

    const titleEl = document.getElementById('hero-title');
    const subEl = document.getElementById('hero-subtitle');
    const statsEl = document.getElementById('hero-stats');
    const cta1 = document.getElementById('hero-cta1');
    const cta2 = document.getElementById('hero-cta2');

    if (titleEl) titleEl.textContent = hero.title || 'Your Future Begins Here';
    if (subEl) subEl.textContent = hero.subtitle || info.description || '';

    if (cta1) {
      cta1.textContent = hero.cta1Text || 'Explore Courses';
      cta1.href = hero.cta1Link || '#courses';
    }
    if (cta2) {
      cta2.textContent = hero.cta2Text || 'Get In Touch';
      cta2.href = hero.cta2Link || '#contact';
    }

    if (statsEl && hero.stats) {
      statsEl.innerHTML = hero.stats.map((s, i) => Components.renderStatCard(s, i)).join('');
    }

    // Hero background
    const heroBg = document.getElementById('hero-section');
    if (heroBg && info.heroImage) {
      heroBg.style.backgroundImage = `linear-gradient(135deg, rgba(10,22,40,.92), rgba(27,45,79,.88)), url('${info.heroImage}')`;
      heroBg.style.backgroundSize = 'cover';
      heroBg.style.backgroundPosition = 'center';
    }
  }

  // ─── Render About Section ─────────────────────
  function renderAbout() {
    const info = Storage.getSettings('institute');
    const el = document.getElementById('about-description');
    if (el) el.textContent = info.description || '';
    const estEl = document.getElementById('about-established');
    if (estEl) estEl.textContent = info.established || '2008';
  }

  // ─── Render Courses ───────────────────────────
  function renderCourses() {
    const container = document.getElementById('courses-grid');
    if (!container) return;
    const courses = Storage.getAll('courses') || [];
    container.innerHTML = courses.map((c, i) => Components.renderCourseCard(c, i)).join('');
  }

  // ─── Render Facilities ────────────────────────
  function renderFacilities() {
    const container = document.getElementById('facilities-grid');
    if (!container) return;
    const facilities = Storage.getAll('facilities') || [];
    container.innerHTML = facilities.map((f, i) => Components.renderFacilityCard(f, i)).join('');
  }

  // ─── Render Faculty ───────────────────────────
  function renderFaculty() {
    const container = document.getElementById('faculty-grid');
    if (!container) return;
    const faculty = Storage.getAll('faculty') || [];
    container.innerHTML = faculty.map((f, i) => Components.renderFacultyCard(f, i)).join('');
  }

  // ─── Render Results ───────────────────────────
  let resultsState = { page: 1, perPage: 6, search: '', course: 'all', year: 'all', sortBy: 'percentage', sortOrder: 'desc' };

  function renderResults() {
    const container = document.getElementById('results-grid');
    const paginationEl = document.getElementById('results-pagination');
    const countEl = document.getElementById('results-count');
    if (!container) return;

    const { items, total, page, totalPages } = Storage.query('results', {
      search: resultsState.search,
      searchFields: ['name', 'course', 'rank', 'description'],
      filters: { course: resultsState.course, year: resultsState.year },
      sortBy: resultsState.sortBy,
      sortOrder: resultsState.sortOrder,
      page: resultsState.page,
      perPage: resultsState.perPage,
    });

    container.innerHTML = items.length
      ? items.map((r, i) => Components.renderResultCard(r, i)).join('')
      : '<p class="col-span-full text-center text-gray-500 py-12">No results found matching your filters.</p>';

    if (countEl) countEl.textContent = `Showing ${items.length} of ${total} results`;

    if (paginationEl) {
      paginationEl.innerHTML = Components.renderPagination(page, totalPages);
      paginationEl.querySelectorAll('.page-btn[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
          resultsState.page = parseInt(btn.dataset.page);
          renderResults();
          // Scroll to results section
          document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Re-init reveal for new items
          setTimeout(() => Animations.initScrollReveal(), 100);
        });
      });
    }

    // Re-init scroll reveals for new cards
    setTimeout(() => Animations.initScrollReveal(), 100);
  }

  function initResultsFilters() {
    const searchInput = document.getElementById('results-search');
    const courseFilter = document.getElementById('results-course-filter');
    const yearFilter = document.getElementById('results-year-filter');
    const sortSelect = document.getElementById('results-sort');

    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        resultsState.search = e.target.value;
        resultsState.page = 1;
        renderResults();
      }, 300));
    }

    // Populate filter dropdowns
    if (courseFilter) {
      const courses = Storage.getAll('courses') || [];
      courseFilter.innerHTML = '<option value="all">All Courses</option>' +
        courses.map(c => `<option value="${Utils.sanitizeHTML(c.name)}">${Utils.sanitizeHTML(c.name)}</option>`).join('');
      courseFilter.addEventListener('change', (e) => {
        resultsState.course = e.target.value;
        resultsState.page = 1;
        renderResults();
      });
    }

    if (yearFilter) {
      const results = Storage.getAll('results') || [];
      const years = [...new Set(results.map(r => r.year))].sort((a, b) => b - a);
      yearFilter.innerHTML = '<option value="all">All Years</option>' +
        years.map(y => `<option value="${y}">${y}</option>`).join('');
      yearFilter.addEventListener('change', (e) => {
        resultsState.year = e.target.value;
        resultsState.page = 1;
        renderResults();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        const [sortBy, sortOrder] = e.target.value.split('-');
        resultsState.sortBy = sortBy;
        resultsState.sortOrder = sortOrder;
        resultsState.page = 1;
        renderResults();
      });
    }
  }

  // ─── Render Testimonials ──────────────────────
  function renderTestimonials() {
    const track = document.getElementById('testimonials-track');
    if (!track) return;
    const testimonials = Storage.getAll('testimonials') || [];
    track.innerHTML = testimonials.map(t => Components.renderTestimonialSlide(t)).join('');
    Animations.initCarousel('#testimonials-carousel');
  }

  // ─── Render Gallery ───────────────────────────
  function renderGallery() {
    const container = document.getElementById('gallery-grid');
    if (!container) return;
    const gallery = Storage.getAll('gallery') || [];

    if (!gallery.length) {
      container.innerHTML = '<p class="text-center text-gray-500 py-12">Gallery images coming soon. Stay tuned!</p>';
      return;
    }

    container.innerHTML = gallery.map((item, i) => Components.renderGalleryItem(item, i)).join('');

    // Lightbox click handler
    container.addEventListener('click', (e) => {
      const item = e.target.closest('.masonry-item');
      if (!item) return;
      const images = gallery.map(g => g.image || g.url || g);
      const index = parseInt(item.dataset.index) || 0;
      Animations.openLightbox(images, index);
    });

    // Init lazy load for gallery images
    setTimeout(() => Animations.initLazyLoad(), 100);
  }

  // ─── Render FAQs ──────────────────────────────
  function renderFAQs() {
    const container = document.getElementById('faq-list');
    if (!container) return;
    const faqs = Storage.getAll('faqs') || [];
    container.innerHTML = faqs.map(f => Components.renderFAQItem(f)).join('');
    Animations.initAccordion('#faq-list');
  }

  // ─── Render Contact Info ──────────────────────
  function renderContact() {
    const info = Storage.getSettings('institute');
    const social = Storage.getSettings('social');

    const setContent = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val || '';
    };
    const setHref = (id, val) => {
      const el = document.getElementById(id);
      if (el && val) el.href = val;
    };

    setContent('contact-address', info.address);
    setContent('contact-phone1', info.phone1);
    setContent('contact-phone2', info.phone2);
    setContent('contact-email', info.email);
    setContent('contact-hours', info.hours);

    setHref('contact-phone1-link', `tel:${(info.phone1 || '').replace(/\s/g, '')}`);
    setHref('contact-phone2-link', `tel:${(info.phone2 || '').replace(/\s/g, '')}`);
    setHref('contact-email-link', `mailto:${info.email}`);

    // Social links
    const socialContainer = document.getElementById('social-links');
    if (socialContainer) {
      const socialIcons = {
        youtube: { icon: 'smart_display', color: '#FF0000' },
        instagram: { icon: 'photo_camera', color: '#E1306C' },
        facebook: { icon: 'diversity_3', color: '#1877F2' },
        twitter: { icon: 'tag', color: '#1DA1F2' },
        whatsapp: { icon: 'chat', color: '#25D366' },
      };
      socialContainer.innerHTML = Object.entries(social)
        .filter(([, url]) => url)
        .map(([platform, url]) => {
          const s = socialIcons[platform] || { icon: 'link', color: '#666' };
          return `<a href="${url}" target="_blank" rel="noopener" class="w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform" style="background:${s.color}">${Components.icon(s.icon, 'text-white text-lg')}</a>`;
        }).join('');
    }

    // Google Map
    const mapEl = document.getElementById('contact-map');
    if (mapEl && info.mapEmbed) {
      mapEl.innerHTML = `<iframe src="${info.mapEmbed}" width="100%" height="100%" style="border:0;border-radius:12px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
    }
  }

  // ─── Render Footer ────────────────────────────
  function renderFooter() {
    const info = Storage.getSettings('institute');
    const nameEl = document.getElementById('footer-name');
    const descEl = document.getElementById('footer-description');
    const yearEl = document.getElementById('footer-year');
    if (nameEl) nameEl.textContent = info.name || 'BHANDE Sir\'s ACADEMY';
    if (descEl) descEl.textContent = info.description || '';
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  // ─── Mobile Menu ──────────────────────────────
  function initMobileMenu() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      menu.classList.toggle('hidden');
      const isOpen = !menu.classList.contains('hidden');
      toggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu on link click
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }



  // ─── WhatsApp Float Button ────────────────────
  function initWhatsApp() {
    const social = Storage.getSettings('social');
    const btn = document.getElementById('whatsapp-float');
    if (btn && social.whatsapp) {
      btn.href = social.whatsapp;
      btn.classList.remove('hidden');
    }
  }

  // ─── Initialize Everything ────────────────────
  function init() {
    // Seed defaults on first load
    Storage.initDefaults();

    // Apply customizations
    applyTheme();
    applySEO();

    // Render all sections
    renderNotices();
    renderNavbar();
    renderHero();
    renderAbout();
    renderCourses();
    renderFacilities();
    renderFaculty();
    renderResults();
    initResultsFilters();
    renderTestimonials();
    renderGallery();
    renderFAQs();
    renderContact();
    renderFooter();

    // Init interactions
    initMobileMenu();
    initWhatsApp();

    // Stagger animation children
    Animations.staggerChildren('#courses-grid', 100);
    Animations.staggerChildren('#facilities-grid', 80);
    Animations.staggerChildren('#faculty-grid', 120);

    // Init all animations
    Animations.initAll();

    console.log('🎓 BSA Website loaded successfully');
  }

  // Boot on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init, renderResults, resultsState };
})();
