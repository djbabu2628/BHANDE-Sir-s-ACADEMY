/* ============================================================
   BSA — Reusable UI Components
   Data-driven render functions returning HTML strings
   ============================================================ */

const Components = (() => {
  'use strict';

  // ─── Material Icon helper ─────────────────────
  function icon(name, cls = '') {
    return `<span class="material-symbols-outlined ${cls}">${name}</span>`;
  }

  // ─── Default avatar placeholder ───────────────
  function avatarPlaceholder(name) {
    const initials = (name || 'S')
      .split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    return `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-800 to-blue-600 text-white text-2xl font-bold">${initials}</div>`;
  }

  // ─── Course Card ──────────────────────────────
  function renderCourseCard(course, index = 0) {
    const subjects = (course.subjects || []).map(s =>
      `<span class="inline-block px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 font-medium">${Utils.sanitizeHTML(s)}</span>`
    ).join('');

    return `
      <div class="card hover-lift reveal p-6 flex flex-col h-full" data-delay="${index * 100}">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center text-white mb-4">
          ${icon(course.icon || 'school')}
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">${Utils.sanitizeHTML(course.name)}</h3>
        <p class="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">${Utils.sanitizeHTML(course.description)}</p>
        <div class="flex flex-wrap gap-1.5 mb-4">${subjects}</div>
        <div class="flex items-center justify-between pt-4 border-t border-gray-100">
          <span class="text-xs text-gray-500 flex items-center gap-1">${icon('schedule', 'text-sm')} ${Utils.sanitizeHTML(course.duration)}</span>
          <span class="text-sm font-semibold" style="color:var(--accent)">${Utils.sanitizeHTML(course.fee)}</span>
        </div>
      </div>`;
  }

  // ─── Faculty Card ─────────────────────────────
  function renderFacultyCard(faculty, index = 0) {
    const photoHTML = faculty.photo
      ? `<img src="${faculty.photo}" alt="${Utils.sanitizeHTML(faculty.name)}" class="w-full h-full object-cover" />`
      : avatarPlaceholder(faculty.name);

    const socialLinks = Object.entries(faculty.social || {})
      .filter(([, url]) => url)
      .map(([platform, url]) => {
        const icons = { youtube: 'smart_display', instagram: 'photo_camera', facebook: 'diversity_3', linkedin: 'work', twitter: 'tag' };
        return `<a href="${url}" target="_blank" rel="noopener" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">${icon(icons[platform] || 'link', 'text-sm')}</a>`;
      }).join('');

    return `
      <div class="card hover-lift reveal group" data-delay="${index * 120}">
        <div class="relative h-56 overflow-hidden bg-gray-200">
          ${photoHTML}
          <div class="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <div class="flex gap-2">${socialLinks}</div>
          </div>
        </div>
        <div class="p-5 text-center">
          <h3 class="font-bold text-gray-900 text-lg">${Utils.sanitizeHTML(faculty.name)}</h3>
          <p class="text-sm font-medium mb-1" style="color:var(--secondary)">${Utils.sanitizeHTML(faculty.subject)}</p>
          <p class="text-xs text-gray-500 mb-2">${icon('work_history', 'text-sm align-middle')} ${Utils.sanitizeHTML(faculty.experience)}</p>
          <p class="text-sm text-gray-600 leading-relaxed">${Utils.sanitizeHTML(Utils.truncate(faculty.bio, 100))}</p>
        </div>
      </div>`;
  }

  // ─── Student Result Card ──────────────────────
  function renderResultCard(result, index = 0) {
    const photoHTML = result.photo
      ? `<img src="${result.photo}" alt="${Utils.sanitizeHTML(result.name)}" class="w-full h-full object-cover" />`
      : avatarPlaceholder(result.name);

    const percColor = result.percentage >= 90 ? 'text-green-600' : result.percentage >= 75 ? 'text-blue-600' : 'text-orange-600';

    return `
      <div class="card hover-lift reveal" data-delay="${index * 80}">
        <div class="flex items-start p-5 gap-4">
          <div class="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
            ${photoHTML}
          </div>
          <div class="flex-grow min-w-0">
            <h4 class="font-bold text-gray-900 truncate">${Utils.sanitizeHTML(result.name)}</h4>
            <div class="flex flex-wrap gap-2 mt-1 mb-2">
              <span class="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 font-medium">${Utils.sanitizeHTML(result.course)}</span>
              <span class="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 font-medium">${result.year}</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <span class="font-semibold ${percColor}">${result.percentage}%</span>
              <span class="text-gray-400">|</span>
              <span class="text-gray-600">${Utils.sanitizeHTML(result.marks)}</span>
            </div>
            ${result.rank ? `<p class="text-xs font-semibold mt-1" style="color:var(--accent)">${icon('emoji_events', 'text-sm align-middle')} ${Utils.sanitizeHTML(result.rank)}</p>` : ''}
            ${result.description ? `<p class="text-xs text-gray-500 mt-1">${Utils.sanitizeHTML(result.description)}</p>` : ''}
          </div>
        </div>
      </div>`;
  }

  // ─── Testimonial Slide ────────────────────────
  function renderTestimonialSlide(testimonial) {
    const stars = '★'.repeat(testimonial.rating || 5) + '☆'.repeat(5 - (testimonial.rating || 5));
    const photoHTML = testimonial.photo
      ? `<img src="${testimonial.photo}" alt="${Utils.sanitizeHTML(testimonial.name)}" class="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" />`
      : `<div class="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-blue-800 to-blue-600 border-2 border-white shadow-md">${(testimonial.name || 'S')[0]}</div>`;

    return `
      <div class="carousel-slide">
        <div class="max-w-2xl mx-auto text-center px-4">
          <div class="text-4xl mb-6" style="color:var(--accent)">❝</div>
          <p class="text-lg text-gray-700 leading-relaxed mb-6 italic">"${Utils.sanitizeHTML(testimonial.text)}"</p>
          <div class="flex items-center justify-center gap-4">
            ${photoHTML}
            <div class="text-left">
              <p class="font-bold text-gray-900">${Utils.sanitizeHTML(testimonial.name)}</p>
              <p class="text-sm text-gray-500">${Utils.sanitizeHTML(testimonial.course)} · ${testimonial.year}</p>
              <p class="text-sm" style="color:var(--accent)">${stars}</p>
            </div>
          </div>
        </div>
      </div>`;
  }

  // ─── Facility Card ────────────────────────────
  function renderFacilityCard(facility, index = 0) {
    return `
      <div class="reveal text-center p-6 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 group" data-delay="${index * 80}">
        <div class="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center bg-blue-50 group-hover:bg-gradient-to-br group-hover:from-blue-900 group-hover:to-blue-700 transition-all duration-300">
          ${icon(facility.icon, 'text-2xl text-blue-700 group-hover:text-white transition-colors')}
        </div>
        <h3 class="font-bold text-gray-900 mb-2">${Utils.sanitizeHTML(facility.title)}</h3>
        <p class="text-sm text-gray-600 leading-relaxed">${Utils.sanitizeHTML(facility.description)}</p>
      </div>`;
  }

  // ─── FAQ Item ─────────────────────────────────
  function renderFAQItem(faq) {
    return `
      <div class="faq-item">
        <button class="faq-question">
          <span>${Utils.sanitizeHTML(faq.question)}</span>
          <svg class="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <div class="faq-answer">
          <p class="text-gray-600 text-sm leading-relaxed pb-2">${Utils.sanitizeHTML(faq.answer)}</p>
        </div>
      </div>`;
  }

  // ─── Gallery Item ─────────────────────────────
  function renderGalleryItem(item, index = 0) {
    const src = item.image || item.url || item;
    const caption = item.caption || '';
    return `
      <div class="masonry-item reveal-scale" data-delay="${index * 60}" data-index="${index}">
        <img data-src="${src}" alt="${Utils.sanitizeHTML(caption)}" class="w-full" loading="lazy" />
        <div class="overlay">
          <span class="text-white text-sm font-medium">${Utils.sanitizeHTML(caption)}</span>
        </div>
      </div>`;
  }

  // ─── Notice Bar ───────────────────────────────
  function renderNoticeBar(notices) {
    const active = (notices || []).filter(n => n.active);
    if (!active.length) return '';
    const text = active.map(n => Utils.sanitizeHTML(n.text)).join('  &nbsp;&nbsp;•&nbsp;&nbsp;  ');
    return `
      <div class="bg-gradient-to-r from-yellow-500 to-amber-500 text-white py-2 text-sm font-medium no-print">
        <div class="marquee-wrap">
          <span class="marquee-content">${text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${text}</span>
        </div>
      </div>`;
  }

  // ─── Stat Card (Hero) ─────────────────────────
  function renderStatCard(stat, index = 0) {
    return `
      <div class="glass p-4 rounded-xl text-center animate-fade-in-up delay-${(index + 2) * 100} hover-lift">
        <div class="text-2xl md:text-3xl font-bold text-white mb-1" data-counter="${stat.value}" data-suffix="${stat.suffix || ''}" data-duration="2500">0</div>
        <div class="text-xs md:text-sm text-blue-200">${Utils.sanitizeHTML(stat.label)}</div>
      </div>`;
  }

  // ─── Pagination ───────────────────────────────
  function renderPagination(page, totalPages, onPageChange) {
    if (totalPages <= 1) return '';

    let html = '<div class="pagination justify-center mt-8 flex-wrap">';
    html += `<button class="page-btn" ${page <= 1 ? 'disabled' : ''} data-page="${page - 1}">‹</button>`;

    const range = [];
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    let prev = 0;
    range.forEach(i => {
      if (prev && i - prev > 1) {
        html += `<span class="page-btn" style="border:none;cursor:default;">…</span>`;
      }
      html += `<button class="page-btn${i === page ? ' active' : ''}" data-page="${i}">${i}</button>`;
      prev = i;
    });

    html += `<button class="page-btn" ${page >= totalPages ? 'disabled' : ''} data-page="${page + 1}">›</button>`;
    html += '</div>';
    return html;
  }

  // ─── Section Header ──────────────────────────
  function renderSectionHeader(title, subtitle = '', align = 'center') {
    return `
      <div class="mb-12 reveal ${align === 'center' ? 'text-center' : ''}">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-3">${title}</h2>
        <div class="section-divider ${align === 'center' ? '' : 'mx-0'}"></div>
        ${subtitle ? `<p class="mt-4 text-gray-600 max-w-2xl ${align === 'center' ? 'mx-auto' : ''}">${subtitle}</p>` : ''}
      </div>`;
  }

  return {
    icon, avatarPlaceholder,
    renderCourseCard, renderFacultyCard, renderResultCard,
    renderTestimonialSlide, renderFacilityCard, renderFAQItem,
    renderGalleryItem, renderNoticeBar, renderStatCard,
    renderPagination, renderSectionHeader
  };
})();
