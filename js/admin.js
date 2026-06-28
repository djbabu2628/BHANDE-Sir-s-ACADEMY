/* ============================================================
   BSA — Admin Dashboard Logic
   CRUD operations, form handling, auth, and dashboard UI
   ============================================================ */

const Admin = (() => {
  'use strict';

  // ─── Auth ─────────────────────────────────────
  const ADMIN_PASSWORD = 'bsa@admin2024';
  let isAuthenticated = false;

  function checkAuth() {
    return sessionStorage.getItem('bsa_admin_auth') === 'true';
  }

  function login(password) {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('bsa_admin_auth', 'true');
      isAuthenticated = true;
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem('bsa_admin_auth');
    isAuthenticated = false;
    location.reload();
  }

  // ─── Dashboard State ──────────────────────────
  let currentSection = 'dashboard';
  let editingId = null;

  // ─── Section Definitions ──────────────────────
  const sections = {
    dashboard: { title: 'Dashboard', icon: 'dashboard' },
    settings: { title: 'Site Settings', icon: 'settings' },
    hero: { title: 'Hero Banner', icon: 'image' },
    courses: { title: 'Courses', icon: 'school' },
    faculty: { title: 'Faculty', icon: 'groups' },
    results: { title: 'Student Results', icon: 'emoji_events' },
    gallery: { title: 'Gallery', icon: 'photo_library' },
    testimonials: { title: 'Testimonials', icon: 'format_quote' },
    faqs: { title: 'FAQs', icon: 'help' },
    notices: { title: 'Notices', icon: 'campaign' },
    theme: { title: 'Theme Colors', icon: 'palette' },
    seo: { title: 'SEO Settings', icon: 'search' },
    backup: { title: 'Backup & Restore', icon: 'cloud_download' },
  };

  // ─── Navigation ───────────────────────────────
  function navigateTo(section) {
    currentSection = section;
    editingId = null;

    // Update sidebar active state
    document.querySelectorAll('.admin-sidebar-link').forEach(link => {
      link.classList.toggle('active', link.dataset.section === section);
    });

    // Update content
    const main = document.getElementById('admin-main');
    if (!main) return;

    const sec = sections[section];
    main.innerHTML = `
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-heading font-bold text-gray-900">${sec.title}</h1>
          <p class="text-sm text-gray-500 mt-1">Manage your ${sec.title.toLowerCase()}</p>
        </div>
        <div id="section-actions"></div>
      </div>
      <div id="section-content"></div>
    `;

    // Render section content
    const renderers = {
      dashboard: renderDashboard,
      settings: renderSettings,
      hero: renderHero,
      courses: renderCourses,
      faculty: renderFaculty,
      results: renderResults,
      gallery: renderGallery,
      testimonials: renderTestimonials,
      faqs: renderFAQs,
      notices: renderNotices,
      theme: renderTheme,
      seo: renderSEO,
      backup: renderBackup,
    };

    if (renderers[section]) renderers[section]();
  }

  // ─── DASHBOARD HOME ───────────────────────────
  function renderDashboard() {
    const content = document.getElementById('section-content');
    const courses = Storage.getAll('courses') || [];
    const faculty = Storage.getAll('faculty') || [];
    const results = Storage.getAll('results') || [];
    const gallery = Storage.getAll('gallery') || [];
    const testimonials = Storage.getAll('testimonials') || [];

    content.innerHTML = `
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        ${dashboardStatCard('Courses', courses.length, 'school', 'bg-blue-500')}
        ${dashboardStatCard('Faculty', faculty.length, 'groups', 'bg-indigo-500')}
        ${dashboardStatCard('Results', results.length, 'emoji_events', 'bg-amber-500')}
        ${dashboardStatCard('Gallery', gallery.length, 'photo_library', 'bg-green-500')}
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${quickActionCard('Add Student Result', 'results', 'Add a new student to the results page', 'emoji_events')}
        ${quickActionCard('Manage Courses', 'courses', 'Add, edit or delete course offerings', 'school')}
        ${quickActionCard('Upload to Gallery', 'gallery', 'Add photos to the campus gallery', 'add_photo_alternate')}
        ${quickActionCard('Edit Faculty', 'faculty', 'Update faculty profiles and photos', 'person_edit')}
        ${quickActionCard('Site Settings', 'settings', 'Update contact info, address, logo', 'settings')}
        ${quickActionCard('Backup Data', 'backup', 'Export or import your site data', 'cloud_download')}
      </div>
    `;

    // Add click handlers to quick actions
    content.querySelectorAll('[data-goto]').forEach(card => {
      card.addEventListener('click', () => navigateTo(card.dataset.goto));
    });
  }

  function dashboardStatCard(label, count, iconName, bgClass) {
    return `
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">${label}</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">${count}</p>
          </div>
          <div class="w-12 h-12 ${bgClass} rounded-xl flex items-center justify-center text-white">
            <span class="material-symbols-outlined">${iconName}</span>
          </div>
        </div>
      </div>`;
  }

  function quickActionCard(title, section, desc, iconName) {
    return `
      <div data-goto="${section}" class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all">
        <div class="flex items-start gap-3">
          <span class="material-symbols-outlined text-xl" style="color:var(--secondary)">${iconName}</span>
          <div>
            <p class="font-semibold text-gray-900 text-sm">${title}</p>
            <p class="text-xs text-gray-500 mt-0.5">${desc}</p>
          </div>
        </div>
      </div>`;
  }

  // ─── SITE SETTINGS ────────────────────────────
  function renderSettings() {
    const content = document.getElementById('section-content');
    const info = Storage.getSettings('institute');
    const social = Storage.getSettings('social');

    content.innerHTML = `
      <form id="settings-form" class="space-y-8">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 class="font-heading font-bold text-gray-900 mb-4">Institute Information</h3>
          <div class="grid sm:grid-cols-2 gap-4">
            ${formField('name', 'Institute Name', info.name)}
            ${formField('shortName', 'Short Name', info.shortName)}
            ${formField('tagline', 'Tagline', info.tagline)}
            ${formField('established', 'Established Year', info.established, 'number')}
            ${formField('phone1', 'Phone 1', info.phone1)}
            ${formField('phone2', 'Phone 2', info.phone2)}
            ${formField('email', 'Email', info.email, 'email')}
            ${formField('hours', 'Business Hours', info.hours)}
            <div class="sm:col-span-2">
              ${formField('address', 'Full Address', info.address)}
            </div>
            <div class="sm:col-span-2">
              ${formTextarea('description', 'Description', info.description)}
            </div>
          </div>
          <!-- Logo Upload -->
          <div class="mt-4">
            <label class="form-label">Logo</label>
            <div class="flex items-center gap-4">
              <div id="logo-preview" class="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                ${info.logo ? `<img src="${info.logo}" class="w-full h-full object-contain" />` : '<span class="text-gray-400 text-xs">No logo</span>'}
              </div>
              <div>
                <input type="file" id="logo-upload" accept="image/*" class="hidden" />
                <button type="button" onclick="document.getElementById('logo-upload').click()" class="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Upload Logo</button>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 class="font-heading font-bold text-gray-900 mb-4">Social Links</h3>
          <div class="grid sm:grid-cols-2 gap-4">
            ${formField('youtube', 'YouTube', social.youtube, 'url')}
            ${formField('instagram', 'Instagram', social.instagram, 'url')}
            ${formField('facebook', 'Facebook', social.facebook, 'url')}
            ${formField('twitter', 'Twitter / X', social.twitter, 'url')}
            ${formField('whatsapp', 'WhatsApp Link', social.whatsapp, 'url')}
            ${formField('playStore', 'Play Store Link', social.playStore, 'url')}
          </div>
        </div>

        <button type="submit" class="px-6 py-3 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-all" style="background:linear-gradient(135deg, var(--secondary), var(--secondary-light))">
          Save Settings
        </button>
      </form>
    `;

    // Logo upload handler
    const logoInput = document.getElementById('logo-upload');
    Utils.handleImageUpload(logoInput, (base64) => {
      document.getElementById('logo-preview').innerHTML = `<img src="${base64}" class="w-full h-full object-contain" />`;
      Storage.updateSettings('institute', { logo: base64 });
      Utils.showToast('Logo updated!', 'success');
    }, 400);

    // Form submit
    document.getElementById('settings-form').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = Object.fromEntries(fd.entries());

      // Separate social links
      const socialFields = ['youtube', 'instagram', 'facebook', 'twitter', 'whatsapp', 'playStore'];
      const socialData = {};
      const instituteData = {};
      for (const [k, v] of Object.entries(data)) {
        if (socialFields.includes(k)) socialData[k] = v;
        else instituteData[k] = v;
      }

      Storage.updateSettings('institute', instituteData);
      Storage.updateSettings('social', socialData);
      Utils.showToast('Settings saved!', 'success');
    };
  }

  // ─── HERO SETTINGS ────────────────────────────
  function renderHero() {
    const content = document.getElementById('section-content');
    const hero = Storage.getSettings('hero');
    const info = Storage.getSettings('institute');

    content.innerHTML = `
      <form id="hero-form" class="space-y-6">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 class="font-heading font-bold text-gray-900 mb-4">Hero Content</h3>
          <div class="space-y-4">
            ${formField('title', 'Main Title', hero.title)}
            ${formTextarea('subtitle', 'Subtitle Text', hero.subtitle)}
            <div class="grid sm:grid-cols-2 gap-4">
              ${formField('cta1Text', 'CTA Button 1 Text', hero.cta1Text)}
              ${formField('cta1Link', 'CTA Button 1 Link', hero.cta1Link)}
              ${formField('cta2Text', 'CTA Button 2 Text', hero.cta2Text)}
              ${formField('cta2Link', 'CTA Button 2 Link', hero.cta2Link)}
            </div>
          </div>
          <!-- Hero Background Image -->
          <div class="mt-4">
            <label class="form-label">Background Image</label>
            <div class="flex items-center gap-4">
              <div id="hero-img-preview" class="w-32 h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                ${info.heroImage ? `<img src="${info.heroImage}" class="w-full h-full object-cover" />` : '<span class="text-gray-400 text-xs">No image</span>'}
              </div>
              <div>
                <input type="file" id="hero-img-upload" accept="image/*" class="hidden" />
                <button type="button" onclick="document.getElementById('hero-img-upload').click()" class="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Upload Image</button>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 class="font-heading font-bold text-gray-900 mb-4">Hero Statistics</h3>
          <div id="hero-stats-list" class="space-y-3">
            ${(hero.stats || []).map((s, i) => `
              <div class="flex gap-3 items-center">
                <input name="stat_label_${i}" class="form-input text-sm flex-grow" value="${Utils.sanitizeHTML(s.label)}" placeholder="Label" />
                <input name="stat_value_${i}" class="form-input text-sm w-24" type="number" step="0.1" value="${s.value}" placeholder="Value" />
                <input name="stat_suffix_${i}" class="form-input text-sm w-16" value="${Utils.sanitizeHTML(s.suffix)}" placeholder="Suffix" />
              </div>
            `).join('')}
          </div>
        </div>

        <button type="submit" class="px-6 py-3 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-all" style="background:linear-gradient(135deg, var(--secondary), var(--secondary-light))">
          Save Hero Settings
        </button>
      </form>
    `;

    // Hero image upload
    const heroInput = document.getElementById('hero-img-upload');
    Utils.handleImageUpload(heroInput, (base64) => {
      document.getElementById('hero-img-preview').innerHTML = `<img src="${base64}" class="w-full h-full object-cover" />`;
      Storage.updateSettings('institute', { heroImage: base64 });
      Utils.showToast('Hero image updated!', 'success');
    }, 1920);

    // Form submit
    document.getElementById('hero-form').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = Object.fromEntries(fd.entries());

      const stats = [];
      for (let i = 0; i < 4; i++) {
        const label = data[`stat_label_${i}`];
        const value = parseFloat(data[`stat_value_${i}`]);
        const suffix = data[`stat_suffix_${i}`];
        if (label && !isNaN(value)) stats.push({ label, value, suffix });
      }

      Storage.updateSettings('hero', {
        title: data.title,
        subtitle: data.subtitle,
        cta1Text: data.cta1Text,
        cta1Link: data.cta1Link,
        cta2Text: data.cta2Text,
        cta2Link: data.cta2Link,
        stats,
      });
      Utils.showToast('Hero settings saved!', 'success');
    };
  }

  // ─── GENERIC CRUD LIST ────────────────────────
  function renderCRUDList(collection, columns, formFields, renderFormFn) {
    const content = document.getElementById('section-content');
    const actions = document.getElementById('section-actions');

    // Add button
    actions.innerHTML = `
      <button id="add-btn" class="px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2" style="background:linear-gradient(135deg, var(--secondary), var(--secondary-light))">
        <span class="material-symbols-outlined text-lg">add</span> Add New
      </button>
    `;

    function renderList() {
      const items = Storage.getAll(collection) || [];
      content.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          ${items.length ? `
            <div class="overflow-x-auto">
              <table class="admin-table">
                <thead>
                  <tr>
                    ${columns.map(c => `<th>${c.label}</th>`).join('')}
                    <th class="w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map(item => `
                    <tr>
                      ${columns.map(c => {
                        if (c.type === 'image') {
                          return `<td><div class="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">${item[c.key] ? `<img src="${item[c.key]}" class="w-full h-full object-cover" />` : '<div class="w-full h-full flex items-center justify-center text-gray-300"><span class="material-symbols-outlined text-sm">image</span></div>'}</div></td>`;
                        }
                        if (c.type === 'badge') {
                          return `<td><span class="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 font-medium">${Utils.sanitizeHTML(item[c.key] || '')}</span></td>`;
                        }
                        return `<td>${Utils.sanitizeHTML(Utils.truncate(String(item[c.key] || ''), 50))}</td>`;
                      }).join('')}
                      <td>
                        <div class="flex gap-1">
                          <button class="edit-btn p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" data-id="${item.id}" title="Edit">
                            <span class="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button class="delete-btn p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors" data-id="${item.id}" title="Delete">
                            <span class="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div class="text-center py-16 text-gray-400">
              <span class="material-symbols-outlined text-4xl mb-2 block">inbox</span>
              <p>No items yet. Click "Add New" to get started.</p>
            </div>
          `}
        </div>
      `;

      // Bind edit/delete
      content.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          editingId = btn.dataset.id;
          const item = Storage.getById(collection, editingId);
          if (item) renderFormFn(item);
        });
      });
      content.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const ok = await Utils.confirmDialog('Delete Item', 'Are you sure you want to delete this item? This cannot be undone.');
          if (ok) {
            Storage.remove(collection, btn.dataset.id);
            Utils.showToast('Item deleted', 'success');
            renderList();
          }
        });
      });
    }

    // Add button handler
    document.getElementById('add-btn').addEventListener('click', () => {
      editingId = null;
      renderFormFn({});
    });

    renderList();
    return renderList;
  }

  // ─── FORM MODAL ───────────────────────────────
  function showFormModal(title, fieldsHTML, onSave) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
      <div class="modal-content" style="max-width:600px;max-height:90vh;overflow-y:auto;padding:24px;">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-heading font-bold text-gray-900 text-lg">${title}</h3>
          <button class="modal-close p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <form id="modal-form" class="space-y-4">
          ${fieldsHTML}
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" class="modal-close px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" class="px-6 py-2.5 rounded-lg text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all" style="background:linear-gradient(135deg, var(--secondary), var(--secondary-light))">Save</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    // Close handlers
    overlay.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => overlay.remove());
    });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    // Submit handler
    document.getElementById('modal-form').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = Object.fromEntries(fd.entries());
      onSave(data);
      overlay.remove();
    };

    return overlay;
  }

  // ─── COURSES CRUD ─────────────────────────────
  function renderCourses() {
    const columns = [
      { key: 'name', label: 'Name' },
      { key: 'duration', label: 'Duration' },
      { key: 'fee', label: 'Fee' },
    ];

    const refreshList = renderCRUDList('courses', columns, null, (item) => {
      const fields = `
        ${formField('name', 'Course Name *', item.name)}
        ${formTextarea('description', 'Description', item.description)}
        ${formField('duration', 'Duration', item.duration)}
        ${formField('fee', 'Fee', item.fee)}
        ${formField('icon', 'Material Icon Name', item.icon || 'school')}
        ${formField('subjects', 'Subjects (comma separated)', (item.subjects || []).join(', '))}
        <div class="flex items-center gap-2">
          <input type="checkbox" name="featured" id="featured-check" ${item.featured ? 'checked' : ''} class="w-4 h-4 rounded" />
          <label for="featured-check" class="text-sm text-gray-700">Featured Course</label>
        </div>
      `;

      showFormModal(editingId ? 'Edit Course' : 'Add Course', fields, (data) => {
        const courseData = {
          name: data.name,
          description: data.description,
          duration: data.duration,
          fee: data.fee,
          icon: data.icon || 'school',
          subjects: data.subjects ? data.subjects.split(',').map(s => s.trim()).filter(Boolean) : [],
          featured: !!data.featured,
        };

        if (editingId) {
          Storage.update('courses', editingId, courseData);
          Utils.showToast('Course updated!', 'success');
        } else {
          Storage.create('courses', courseData);
          Utils.showToast('Course added!', 'success');
        }
        refreshList();
      });
    });
  }

  // ─── FACULTY CRUD ─────────────────────────────
  function renderFaculty() {
    const columns = [
      { key: 'photo', label: 'Photo', type: 'image' },
      { key: 'name', label: 'Name' },
      { key: 'subject', label: 'Subject', type: 'badge' },
      { key: 'experience', label: 'Experience' },
    ];

    const refreshList = renderCRUDList('faculty', columns, null, (item) => {
      let photoBase64 = item.photo || '';

      const fields = `
        <div>
          <label class="form-label">Photo</label>
          <div class="flex items-center gap-4">
            <div id="faculty-photo-preview" class="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
              ${photoBase64 ? `<img src="${photoBase64}" class="w-full h-full object-cover" />` : '<span class="text-gray-400 text-xs">No photo</span>'}
            </div>
            <input type="file" id="faculty-photo-input" accept="image/*" class="hidden" />
            <button type="button" onclick="document.getElementById('faculty-photo-input').click()" class="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Upload</button>
          </div>
        </div>
        ${formField('name', 'Full Name *', item.name)}
        ${formField('subject', 'Subject *', item.subject)}
        ${formField('experience', 'Experience', item.experience)}
        ${formTextarea('bio', 'Bio', item.bio)}
        ${formField('social_youtube', 'YouTube URL', (item.social || {}).youtube, 'url')}
        ${formField('social_instagram', 'Instagram URL', (item.social || {}).instagram, 'url')}
      `;

      const modal = showFormModal(editingId ? 'Edit Faculty' : 'Add Faculty', fields, (data) => {
        const facultyData = {
          name: data.name,
          subject: data.subject,
          experience: data.experience,
          bio: data.bio,
          photo: photoBase64,
          social: {
            youtube: data.social_youtube || '',
            instagram: data.social_instagram || '',
          },
        };

        if (editingId) {
          Storage.update('faculty', editingId, facultyData);
          Utils.showToast('Faculty updated!', 'success');
        } else {
          Storage.create('faculty', facultyData);
          Utils.showToast('Faculty added!', 'success');
        }
        refreshList();
      });

      // Photo upload handler
      const photoInput = modal.querySelector('#faculty-photo-input');
      Utils.handleImageUpload(photoInput, (base64) => {
        photoBase64 = base64;
        modal.querySelector('#faculty-photo-preview').innerHTML = `<img src="${base64}" class="w-full h-full object-cover" />`;
      }, 400);
    });
  }

  // ─── STUDENT RESULTS CRUD ─────────────────────
  function renderResults() {
    const content = document.getElementById('section-content');
    const actions = document.getElementById('section-actions');

    actions.innerHTML = `
      <button id="add-result-btn" class="px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2" style="background:linear-gradient(135deg, var(--secondary), var(--secondary-light))">
        <span class="material-symbols-outlined text-lg">add</span> Add Student
      </button>
    `;

    let searchTerm = '';
    let filterCourse = 'all';
    let filterYear = 'all';
    let sortBy = 'percentage';
    let sortOrder = 'desc';
    let page = 1;
    const perPage = 10;

    function renderTable() {
      const result = Storage.query('results', {
        search: searchTerm,
        searchFields: ['name', 'course', 'rank', 'description'],
        filters: { course: filterCourse, year: filterYear },
        sortBy, sortOrder, page, perPage,
      });

      const allResults = Storage.getAll('results') || [];
      const courses = [...new Set(allResults.map(r => r.course))].sort();
      const years = [...new Set(allResults.map(r => r.year))].sort((a, b) => b - a);

      content.innerHTML = `
        <!-- Filters -->
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <div class="flex flex-wrap gap-3 items-center">
            <div class="relative flex-grow max-w-xs">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">search</span>
              <input type="text" id="res-search" class="form-input pl-9 h-9 text-sm" placeholder="Search students..." value="${Utils.sanitizeHTML(searchTerm)}" />
            </div>
            <select id="res-course" class="form-input h-9 text-sm w-auto">
              <option value="all">All Courses</option>
              ${courses.map(c => `<option value="${c}" ${filterCourse === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
            <select id="res-year" class="form-input h-9 text-sm w-auto">
              <option value="all">All Years</option>
              ${years.map(y => `<option value="${y}" ${filterYear == y ? 'selected' : ''}>${y}</option>`).join('')}
            </select>
            <select id="res-sort" class="form-input h-9 text-sm w-auto">
              <option value="percentage-desc" ${sortBy === 'percentage' && sortOrder === 'desc' ? 'selected' : ''}>Highest Marks</option>
              <option value="percentage-asc" ${sortBy === 'percentage' && sortOrder === 'asc' ? 'selected' : ''}>Lowest Marks</option>
              <option value="name-asc" ${sortBy === 'name' && sortOrder === 'asc' ? 'selected' : ''}>Name A-Z</option>
              <option value="year-desc" ${sortBy === 'year' && sortOrder === 'desc' ? 'selected' : ''}>Newest</option>
            </select>
            <span class="text-xs text-gray-500 ml-auto">${result.total} students</span>
          </div>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          ${result.items.length ? `
            <div class="overflow-x-auto">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Course</th>
                    <th>Marks</th>
                    <th>%</th>
                    <th>Rank</th>
                    <th>Year</th>
                    <th class="w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${result.items.map(r => `
                    <tr>
                      <td><div class="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">${r.photo ? `<img src="${r.photo}" class="w-full h-full object-cover" />` : `<div class="w-full h-full flex items-center justify-center bg-blue-50 text-blue-700 font-bold text-xs">${(r.name || 'S')[0]}</div>`}</div></td>
                      <td class="font-medium">${Utils.sanitizeHTML(r.name)}</td>
                      <td><span class="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 font-medium">${Utils.sanitizeHTML(r.course)}</span></td>
                      <td>${Utils.sanitizeHTML(r.marks)}</td>
                      <td class="font-semibold ${r.percentage >= 90 ? 'text-green-600' : r.percentage >= 75 ? 'text-blue-600' : 'text-orange-600'}">${r.percentage}%</td>
                      <td>${Utils.sanitizeHTML(r.rank || '-')}</td>
                      <td>${r.year}</td>
                      <td>
                        <div class="flex gap-1">
                          <button class="edit-result p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" data-id="${r.id}">
                            <span class="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button class="delete-result p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors" data-id="${r.id}">
                            <span class="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ${result.totalPages > 1 ? `
              <div class="p-4 border-t border-gray-100 flex justify-center">
                ${Components.renderPagination(result.page, result.totalPages)}
              </div>
            ` : ''}
          ` : `
            <div class="text-center py-16 text-gray-400">
              <span class="material-symbols-outlined text-4xl mb-2 block">person_search</span>
              <p>No students found.</p>
            </div>
          `}
        </div>
      `;

      // Bind filter events
      const searchInput = content.querySelector('#res-search');
      if (searchInput) searchInput.addEventListener('input', Utils.debounce((e) => { searchTerm = e.target.value; page = 1; renderTable(); }, 300));
      const courseSel = content.querySelector('#res-course');
      if (courseSel) courseSel.addEventListener('change', (e) => { filterCourse = e.target.value; page = 1; renderTable(); });
      const yearSel = content.querySelector('#res-year');
      if (yearSel) yearSel.addEventListener('change', (e) => { filterYear = e.target.value; page = 1; renderTable(); });
      const sortSel = content.querySelector('#res-sort');
      if (sortSel) sortSel.addEventListener('change', (e) => { const [s, o] = e.target.value.split('-'); sortBy = s; sortOrder = o; page = 1; renderTable(); });

      // Pagination
      content.querySelectorAll('.page-btn[data-page]').forEach(btn => {
        btn.addEventListener('click', () => { page = parseInt(btn.dataset.page); renderTable(); });
      });

      // Edit / Delete
      content.querySelectorAll('.edit-result').forEach(btn => {
        btn.addEventListener('click', () => showResultForm(Storage.getById('results', btn.dataset.id)));
      });
      content.querySelectorAll('.delete-result').forEach(btn => {
        btn.addEventListener('click', async () => {
          const ok = await Utils.confirmDialog('Delete Student', 'Are you sure?');
          if (ok) { Storage.remove('results', btn.dataset.id); Utils.showToast('Deleted', 'success'); renderTable(); }
        });
      });
    }

    function showResultForm(item = {}) {
      let photoBase64 = item.photo || '';

      const fields = `
        <div>
          <label class="form-label">Student Photo</label>
          <div class="flex items-center gap-4">
            <div id="result-photo-preview" class="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
              ${photoBase64 ? `<img src="${photoBase64}" class="w-full h-full object-cover" />` : '<span class="text-gray-400 text-xs">No photo</span>'}
            </div>
            <input type="file" id="result-photo-input" accept="image/*" class="hidden" />
            <button type="button" onclick="document.getElementById('result-photo-input').click()" class="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Upload Photo</button>
          </div>
        </div>
        ${formField('name', 'Student Name *', item.name)}
        ${formField('course', 'Course *', item.course)}
        ${formField('marks', 'Marks (e.g., 680/720) *', item.marks)}
        <div class="grid grid-cols-2 gap-4">
          ${formField('percentage', 'Percentage *', item.percentage, 'number')}
          ${formField('year', 'Year *', item.year, 'number')}
        </div>
        ${formField('rank', 'Rank / Achievement', item.rank)}
        ${formTextarea('description', 'Description', item.description)}
      `;

      const modal = showFormModal(item.id ? 'Edit Student Result' : 'Add Student Result', fields, (data) => {
        const resultData = {
          name: data.name,
          course: data.course,
          marks: data.marks,
          percentage: parseFloat(data.percentage) || 0,
          year: parseInt(data.year) || new Date().getFullYear(),
          rank: data.rank,
          description: data.description,
          photo: photoBase64,
        };

        const { valid, errors } = Utils.validateForm({
          name: { required: true, label: 'Name' },
          course: { required: true, label: 'Course' },
          marks: { required: true, label: 'Marks' },
        }, resultData);

        if (!valid) {
          Utils.showToast(Object.values(errors)[0], 'error');
          return;
        }

        if (item.id) {
          Storage.update('results', item.id, resultData);
          Utils.showToast('Student updated!', 'success');
        } else {
          Storage.create('results', resultData);
          Utils.showToast('Student added!', 'success');
        }
        renderTable();
      });

      // Photo upload handler
      const photoInput = modal.querySelector('#result-photo-input');
      Utils.handleImageUpload(photoInput, (base64) => {
        photoBase64 = base64;
        modal.querySelector('#result-photo-preview').innerHTML = `<img src="${base64}" class="w-full h-full object-cover" />`;
      }, 400);
    }

    // Add button
    document.getElementById('add-result-btn').addEventListener('click', () => showResultForm());

    renderTable();
  }

  // ─── GALLERY ──────────────────────────────────
  function renderGallery() {
    const content = document.getElementById('section-content');
    const actions = document.getElementById('section-actions');

    actions.innerHTML = `
      <div class="flex gap-2">
        <input type="file" id="gallery-upload" accept="image/*" multiple class="hidden" />
        <button onclick="document.getElementById('gallery-upload').click()" class="px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2" style="background:linear-gradient(135deg, var(--secondary), var(--secondary-light))">
          <span class="material-symbols-outlined text-lg">add_photo_alternate</span> Upload Images
        </button>
      </div>
    `;

    function renderGrid() {
      const gallery = Storage.getAll('gallery') || [];
      content.innerHTML = gallery.length ? `
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          ${gallery.map((item, i) => `
            <div class="relative group rounded-xl overflow-hidden bg-gray-100 aspect-square">
              <img src="${item.image || item}" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button class="delete-gallery-item p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors" data-index="${i}">
                  <span class="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
              ${item.caption ? `<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3"><p class="text-white text-xs">${Utils.sanitizeHTML(item.caption)}</p></div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100">
          <span class="material-symbols-outlined text-4xl mb-2 block">add_photo_alternate</span>
          <p>No gallery images yet. Click "Upload Images" to add photos.</p>
        </div>
      `;

      // Delete handler
      content.querySelectorAll('.delete-gallery-item').forEach(btn => {
        btn.addEventListener('click', async () => {
          const ok = await Utils.confirmDialog('Delete Image', 'Remove this image from the gallery?');
          if (ok) {
            const gallery = Storage.getAll('gallery') || [];
            gallery.splice(parseInt(btn.dataset.index), 1);
            Storage.setAll('gallery', gallery);
            Utils.showToast('Image deleted', 'success');
            renderGrid();
          }
        });
      });
    }

    // Upload handler
    const uploadInput = document.getElementById('gallery-upload');
    uploadInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;

      Utils.showToast(`Processing ${files.length} image(s)...`, 'info');

      for (const file of files) {
        try {
          const base64 = await Utils.compressImage(file, 1200, 0.8);
          const gallery = Storage.getAll('gallery') || [];
          gallery.push({ image: base64, caption: file.name.replace(/\.[^/.]+$/, ''), id: Utils.generateId() });
          Storage.setAll('gallery', gallery);
        } catch {
          Utils.showToast(`Failed to process ${file.name}`, 'error');
        }
      }

      Utils.showToast('Images uploaded!', 'success');
      uploadInput.value = '';
      renderGrid();
    });

    renderGrid();
  }

  // ─── TESTIMONIALS CRUD ────────────────────────
  function renderTestimonials() {
    const columns = [
      { key: 'name', label: 'Student' },
      { key: 'course', label: 'Course', type: 'badge' },
      { key: 'rating', label: 'Rating' },
      { key: 'year', label: 'Year' },
    ];

    const refreshList = renderCRUDList('testimonials', columns, null, (item) => {
      let photoBase64 = item.photo || '';
      const fields = `
        <div>
          <label class="form-label">Photo</label>
          <div class="flex items-center gap-4">
            <div id="test-photo-preview" class="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
              ${photoBase64 ? `<img src="${photoBase64}" class="w-full h-full object-cover" />` : '<span class="text-gray-400 text-xs">No</span>'}
            </div>
            <input type="file" id="test-photo-input" accept="image/*" class="hidden" />
            <button type="button" onclick="document.getElementById('test-photo-input').click()" class="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Upload</button>
          </div>
        </div>
        ${formField('name', 'Student Name *', item.name)}
        ${formField('course', 'Course', item.course)}
        ${formField('year', 'Year', item.year, 'number')}
        <div>
          <label class="form-label">Rating (1-5)</label>
          <select name="rating" class="form-input">
            ${[5,4,3,2,1].map(r => `<option value="${r}" ${(item.rating || 5) == r ? 'selected' : ''}>${r} Star${r > 1 ? 's' : ''}</option>`).join('')}
          </select>
        </div>
        ${formTextarea('text', 'Testimonial Text *', item.text)}
      `;

      const modal = showFormModal(editingId ? 'Edit Testimonial' : 'Add Testimonial', fields, (data) => {
        const testData = {
          name: data.name,
          course: data.course,
          year: parseInt(data.year) || new Date().getFullYear(),
          rating: parseInt(data.rating) || 5,
          text: data.text,
          photo: photoBase64,
        };

        if (editingId) {
          Storage.update('testimonials', editingId, testData);
          Utils.showToast('Testimonial updated!', 'success');
        } else {
          Storage.create('testimonials', testData);
          Utils.showToast('Testimonial added!', 'success');
        }
        refreshList();
      });

      const photoInput = modal.querySelector('#test-photo-input');
      Utils.handleImageUpload(photoInput, (base64) => {
        photoBase64 = base64;
        modal.querySelector('#test-photo-preview').innerHTML = `<img src="${base64}" class="w-full h-full object-cover" />`;
      }, 200);
    });
  }

  // ─── FAQs CRUD ────────────────────────────────
  function renderFAQs() {
    const columns = [
      { key: 'question', label: 'Question' },
    ];

    const refreshList = renderCRUDList('faqs', columns, null, (item) => {
      const fields = `
        ${formField('question', 'Question *', item.question)}
        ${formTextarea('answer', 'Answer *', item.answer)}
      `;
      showFormModal(editingId ? 'Edit FAQ' : 'Add FAQ', fields, (data) => {
        if (editingId) {
          Storage.update('faqs', editingId, data);
          Utils.showToast('FAQ updated!', 'success');
        } else {
          Storage.create('faqs', data);
          Utils.showToast('FAQ added!', 'success');
        }
        refreshList();
      });
    });
  }

  // ─── NOTICES CRUD ─────────────────────────────
  function renderNotices() {
    const columns = [
      { key: 'text', label: 'Notice' },
      { key: 'active', label: 'Active' },
    ];

    const refreshList = renderCRUDList('notices', columns, null, (item) => {
      const fields = `
        ${formTextarea('text', 'Notice Text *', item.text)}
        <div class="flex items-center gap-2">
          <input type="checkbox" name="active" id="notice-active" ${item.active !== false ? 'checked' : ''} class="w-4 h-4 rounded" />
          <label for="notice-active" class="text-sm text-gray-700">Active (visible on website)</label>
        </div>
      `;
      showFormModal(editingId ? 'Edit Notice' : 'Add Notice', fields, (data) => {
        const noticeData = { text: data.text, active: !!data.active, date: new Date().toISOString().slice(0, 10) };
        if (editingId) {
          Storage.update('notices', editingId, noticeData);
          Utils.showToast('Notice updated!', 'success');
        } else {
          Storage.create('notices', noticeData);
          Utils.showToast('Notice added!', 'success');
        }
        refreshList();
      });
    });
  }

  // ─── THEME COLORS ─────────────────────────────
  function renderTheme() {
    const content = document.getElementById('section-content');
    const theme = Storage.getSettings('theme');

    const colorFields = [
      { key: 'primary', label: 'Primary (Deep Navy)', desc: 'Main backgrounds & text' },
      { key: 'primaryLight', label: 'Primary Light (Navy)', desc: 'Cards, secondary backgrounds' },
      { key: 'secondary', label: 'Secondary (Steel Blue)', desc: 'Accents, links, buttons' },
      { key: 'secondaryLight', label: 'Secondary Light', desc: 'Hover states' },
      { key: 'accent', label: 'Accent (Gold)', desc: 'CTAs, highlights' },
      { key: 'accentLight', label: 'Accent Light', desc: 'Hover gold' },
    ];

    content.innerHTML = `
      <form id="theme-form" class="space-y-6">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 class="font-heading font-bold text-gray-900 mb-4">Color Palette</h3>
          <div class="grid sm:grid-cols-2 gap-6">
            ${colorFields.map(f => `
              <div class="flex items-center gap-4">
                <input type="color" name="${f.key}" value="${theme[f.key] || '#000000'}" class="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200" />
                <div>
                  <p class="text-sm font-semibold text-gray-900">${f.label}</p>
                  <p class="text-xs text-gray-500">${f.desc}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="flex gap-3">
          <button type="submit" class="px-6 py-3 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-all" style="background:linear-gradient(135deg, var(--secondary), var(--secondary-light))">
            Save Theme
          </button>
          <button type="button" id="reset-theme" class="px-6 py-3 rounded-xl text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 transition-colors">
            Reset to Defaults
          </button>
        </div>
      </form>
    `;

    document.getElementById('theme-form').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      Storage.updateSettings('theme', Object.fromEntries(fd.entries()));
      Utils.showToast('Theme saved! Changes will reflect on the main site.', 'success');
    };

    document.getElementById('reset-theme').addEventListener('click', () => {
      Storage.setAll('theme', SiteConfig.theme);
      Utils.showToast('Theme reset to defaults!', 'info');
      renderTheme();
    });
  }

  // ─── SEO SETTINGS ─────────────────────────────
  function renderSEO() {
    const content = document.getElementById('section-content');
    const seo = Storage.getSettings('seo');

    content.innerHTML = `
      <form id="seo-form" class="space-y-6">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 class="font-heading font-bold text-gray-900 mb-4">SEO Meta Tags</h3>
          <div class="space-y-4">
            ${formField('title', 'Page Title', seo.title)}
            ${formTextarea('description', 'Meta Description', seo.description)}
            ${formField('keywords', 'Keywords (comma separated)', seo.keywords)}
          </div>
        </div>
        <button type="submit" class="px-6 py-3 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-all" style="background:linear-gradient(135deg, var(--secondary), var(--secondary-light))">
          Save SEO Settings
        </button>
      </form>
    `;

    document.getElementById('seo-form').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      Storage.updateSettings('seo', Object.fromEntries(fd.entries()));
      Utils.showToast('SEO settings saved!', 'success');
    };
  }

  // ─── BACKUP & RESTORE ─────────────────────────
  function renderBackup() {
    const content = document.getElementById('section-content');
    content.innerHTML = `
      <div class="space-y-6">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 class="font-heading font-bold text-gray-900 mb-2">Export Data</h3>
          <p class="text-sm text-gray-500 mb-4">Download all your site data as a JSON file for backup purposes.</p>
          <button id="export-btn" class="px-6 py-3 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2" style="background:linear-gradient(135deg, var(--secondary), var(--secondary-light))">
            <span class="material-symbols-outlined">download</span> Export All Data
          </button>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 class="font-heading font-bold text-gray-900 mb-2">Import Data</h3>
          <p class="text-sm text-gray-500 mb-4">Restore data from a previously exported JSON backup file.</p>
          <input type="file" id="import-file" accept=".json" class="hidden" />
          <button onclick="document.getElementById('import-file').click()" class="px-6 py-3 rounded-xl text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-2">
            <span class="material-symbols-outlined">upload</span> Import Backup File
          </button>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border border-red-100">
          <h3 class="font-heading font-bold text-red-600 mb-2">⚠ Reset All Data</h3>
          <p class="text-sm text-gray-500 mb-4">This will delete all your customizations and restore the default data. This action cannot be undone.</p>
          <button id="reset-all-btn" class="px-6 py-3 rounded-xl text-white font-semibold bg-red-500 hover:bg-red-600 shadow-md transition-all flex items-center gap-2">
            <span class="material-symbols-outlined">restart_alt</span> Reset to Defaults
          </button>
        </div>
      </div>
    `;

    document.getElementById('export-btn').addEventListener('click', () => Storage.exportData());
    document.getElementById('import-file').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) Storage.importData(file);
    });
    document.getElementById('reset-all-btn').addEventListener('click', async () => {
      const ok = await Utils.confirmDialog('Reset All Data', 'This will erase all your changes and restore defaults. Are you absolutely sure?');
      if (ok) {
        Storage.resetToDefaults();
        setTimeout(() => location.reload(), 1000);
      }
    });
  }

  // ─── FORM FIELD HELPERS ───────────────────────
  function formField(name, label, value = '', type = 'text') {
    return `
      <div>
        <label class="form-label">${label}</label>
        <input type="${type}" name="${name}" class="form-input" value="${Utils.sanitizeHTML(String(value || ''))}" ${type === 'number' ? 'step="any"' : ''} />
      </div>`;
  }

  function formTextarea(name, label, value = '', rows = 3) {
    return `
      <div>
        <label class="form-label">${label}</label>
        <textarea name="${name}" class="form-input" rows="${rows}">${Utils.sanitizeHTML(String(value || ''))}</textarea>
      </div>`;
  }

  // ─── INIT ─────────────────────────────────────
  function init() {
    Storage.initDefaults();

    // Check auth
    if (!checkAuth()) {
      showLoginScreen();
      return;
    }

    showDashboard();
  }

  function showLoginScreen() {
    const app = document.getElementById('admin-app');
    app.innerHTML = `
      <div class="min-h-screen flex items-center justify-center gradient-hero p-4">
        <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <div class="text-center mb-6">
            <div class="w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center text-white font-heading font-bold text-xl" style="background:linear-gradient(135deg, var(--primary), var(--primary-light))">B</div>
            <h1 class="font-heading font-bold text-xl text-gray-900">Admin Login</h1>
            <p class="text-sm text-gray-500">BHANDE Sir's ACADEMY</p>
          </div>
          <form id="login-form" class="space-y-4">
            <div>
              <label class="form-label">Password</label>
              <input type="password" id="login-password" class="form-input" placeholder="Enter admin password" autofocus required />
            </div>
            <button type="submit" class="w-full py-3 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-all" style="background:linear-gradient(135deg, var(--secondary), var(--secondary-light))">
              Sign In
            </button>
          </form>
          <p class="text-xs text-gray-400 text-center mt-4">
            <a href="index.html" class="hover:text-gray-600 transition-colors">← Back to Website</a>
          </p>
        </div>
      </div>
    `;

    document.getElementById('login-form').onsubmit = (e) => {
      e.preventDefault();
      const pwd = document.getElementById('login-password').value;
      if (login(pwd)) {
        showDashboard();
      } else {
        Utils.showToast('Incorrect password', 'error');
      }
    };
  }

  function showDashboard() {
    const app = document.getElementById('admin-app');
    app.innerHTML = `
      <div class="flex min-h-screen">
        <!-- Sidebar -->
        <aside class="admin-sidebar hidden lg:block flex-shrink-0">
          <div class="p-5 border-b border-white/10">
            <a href="index.html" class="flex items-center gap-3 group">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center text-white font-heading font-bold" style="background:var(--accent)">B</div>
              <div>
                <span class="font-heading font-bold text-white text-sm block">BSA Admin</span>
                <span class="text-[10px] text-blue-300">Dashboard</span>
              </div>
            </a>
          </div>
          <nav class="py-3">
            ${Object.entries(sections).map(([key, sec]) => `
              <a href="#" class="admin-sidebar-link${key === 'dashboard' ? ' active' : ''}" data-section="${key}">
                <span class="material-symbols-outlined text-lg">${sec.icon}</span>
                ${sec.title}
              </a>
            `).join('')}
          </nav>
          <div class="mt-auto p-4 border-t border-white/10">
            <button id="logout-btn" class="admin-sidebar-link w-full text-red-300 hover:text-red-200">
              <span class="material-symbols-outlined text-lg">logout</span>
              Logout
            </button>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="flex-grow bg-gray-50 min-h-screen">
          <!-- Top Bar (Mobile) -->
          <div class="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100">
            <button id="sidebar-toggle" class="p-2 rounded-lg hover:bg-gray-100">
              <span class="material-symbols-outlined">menu</span>
            </button>
            <span class="font-heading font-bold text-sm">BSA Admin</span>
            <a href="index.html" class="text-sm text-gray-500 hover:text-gray-700">View Site</a>
          </div>

          <!-- Mobile Sidebar Overlay -->
          <div id="mobile-sidebar-overlay" class="hidden fixed inset-0 bg-black/50 z-40 lg:hidden"></div>
          <aside id="mobile-sidebar" class="admin-sidebar fixed left-0 top-0 z-50 lg:hidden -translate-x-full">
            <div class="p-5 border-b border-white/10 flex items-center justify-between">
              <span class="font-heading font-bold text-white text-sm">BSA Admin</span>
              <button id="close-sidebar" class="text-white/70 hover:text-white"><span class="material-symbols-outlined">close</span></button>
            </div>
            <nav class="py-3">
              ${Object.entries(sections).map(([key, sec]) => `
                <a href="#" class="admin-sidebar-link mobile-nav${key === 'dashboard' ? ' active' : ''}" data-section="${key}">
                  <span class="material-symbols-outlined text-lg">${sec.icon}</span>
                  ${sec.title}
                </a>
              `).join('')}
            </nav>
          </aside>

          <!-- Content Area -->
          <div id="admin-main" class="p-6 md:p-8 max-w-6xl">
            <!-- Rendered by navigateTo() -->
          </div>
        </div>
      </div>
    `;

    // Sidebar navigation
    document.querySelectorAll('.admin-sidebar-link[data-section]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.dataset.section);
        // Close mobile sidebar
        closeMobileSidebar();
      });
    });

    // Logout
    document.querySelectorAll('#logout-btn').forEach(btn => {
      btn.addEventListener('click', logout);
    });

    // Mobile sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const mobileSidebar = document.getElementById('mobile-sidebar');
    const mobileOverlay = document.getElementById('mobile-sidebar-overlay');
    const closeSidebarBtn = document.getElementById('close-sidebar');

    function openMobileSidebar() {
      mobileSidebar.classList.remove('-translate-x-full');
      mobileOverlay.classList.remove('hidden');
    }
    function closeMobileSidebar() {
      if (mobileSidebar) mobileSidebar.classList.add('-translate-x-full');
      if (mobileOverlay) mobileOverlay.classList.add('hidden');
    }

    if (sidebarToggle) sidebarToggle.addEventListener('click', openMobileSidebar);
    if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeMobileSidebar);

    // Load dashboard
    navigateTo('dashboard');
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init, login, logout, navigateTo };
})();
