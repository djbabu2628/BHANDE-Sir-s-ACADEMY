/* ============================================================
   BSA — Storage Manager
   localStorage CRUD abstraction with search, filter, sort
   ============================================================ */

const Storage = (() => {
  'use strict';

  const PREFIX = 'bsa_';

  // ─── Core CRUD ─────────────────────────────

  function _key(collection) {
    return PREFIX + collection;
  }

  /**
   * Get all items in a collection
   */
  function getAll(collection) {
    try {
      const data = localStorage.getItem(_key(collection));
      return data ? JSON.parse(data) : null;
    } catch {
      console.error(`Storage: Failed to read ${collection}`);
      return null;
    }
  }

  /**
   * Set entire collection data
   */
  function setAll(collection, data) {
    try {
      localStorage.setItem(_key(collection), JSON.stringify(data));
      return true;
    } catch (e) {
      console.error(`Storage: Failed to write ${collection}`, e);
      if (e.name === 'QuotaExceededError') {
        Utils.showToast('Storage full! Please delete some images or data.', 'error');
      }
      return false;
    }
  }

  /**
   * Get a single item from an array collection by ID
   */
  function getById(collection, id) {
    const items = getAll(collection);
    if (!Array.isArray(items)) return null;
    return items.find(item => item.id === id) || null;
  }

  /**
   * Create (add) an item to an array collection
   */
  function create(collection, item) {
    let items = getAll(collection);
    if (!Array.isArray(items)) items = [];
    if (!item.id) item.id = Utils.generateId();
    item.createdAt = new Date().toISOString();
    item.updatedAt = item.createdAt;
    items.push(item);
    setAll(collection, items);
    return item;
  }

  /**
   * Update an item in an array collection by ID
   */
  function update(collection, id, updates) {
    let items = getAll(collection);
    if (!Array.isArray(items)) return false;
    const idx = items.findIndex(item => item.id === id);
    if (idx === -1) return false;
    items[idx] = { ...items[idx], ...updates, id, updatedAt: new Date().toISOString() };
    setAll(collection, items);
    return items[idx];
  }

  /**
   * Delete an item from an array collection by ID
   */
  function remove(collection, id) {
    let items = getAll(collection);
    if (!Array.isArray(items)) return false;
    const filtered = items.filter(item => item.id !== id);
    if (filtered.length === items.length) return false;
    setAll(collection, filtered);
    return true;
  }

  // ─── Object Collections (non-array, like settings) ────

  /**
   * Get a settings object
   */
  function getSettings(key) {
    return getAll(key) || {};
  }

  /**
   * Update a settings object (merge)
   */
  function updateSettings(key, updates) {
    const current = getSettings(key);
    const merged = { ...current, ...updates };
    setAll(key, merged);
    return merged;
  }

  // ─── Search, Filter, Sort, Paginate ────────

  /**
   * Query items with filter, sort, search, pagination
   * @param {string} collection
   * @param {Object} options
   * @returns {{ items: Array, total: number, page: number, totalPages: number }}
   */
  function query(collection, options = {}) {
    let items = getAll(collection);
    if (!Array.isArray(items)) items = [];

    const {
      search = '',
      searchFields = ['name'],
      filters = {},       // { course: 'NEET', year: 2024 }
      sortBy = '',
      sortOrder = 'asc',  // 'asc' | 'desc'
      page = 1,
      perPage = 10,
    } = options;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(item =>
        searchFields.some(field => {
          const val = item[field];
          return val && val.toString().toLowerCase().includes(q);
        })
      );
    }

    // Filter
    for (const [field, value] of Object.entries(filters)) {
      if (value === '' || value === null || value === undefined || value === 'all') continue;
      items = items.filter(item => {
        const itemVal = item[field];
        return itemVal !== undefined && itemVal.toString() === value.toString();
      });
    }

    // Sort
    if (sortBy) {
      items.sort((a, b) => {
        let aVal = a[sortBy], bVal = b[sortBy];
        // Numeric sort
        if (!isNaN(aVal) && !isNaN(bVal)) {
          aVal = Number(aVal); bVal = Number(bVal);
        } else {
          aVal = (aVal || '').toString().toLowerCase();
          bVal = (bVal || '').toString().toLowerCase();
        }
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const total = items.length;
    const totalPages = Math.ceil(total / perPage) || 1;
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * perPage;
    const paged = items.slice(start, start + perPage);

    return { items: paged, total, page: safePage, totalPages };
  }

  // ─── Initialize Defaults ──────────────────

  /**
   * Seed default data from SiteConfig on first visit
   */
  function initDefaults() {
    const initialized = localStorage.getItem(PREFIX + 'initialized');
    if (initialized) return;

    // Object settings
    setAll('institute', SiteConfig.institute);
    setAll('social', SiteConfig.social);
    setAll('seo', SiteConfig.seo);
    setAll('theme', SiteConfig.theme);
    setAll('hero', SiteConfig.hero);

    // Array collections
    setAll('courses', SiteConfig.courses);
    setAll('facilities', SiteConfig.facilities);
    setAll('faculty', SiteConfig.faculty);
    setAll('testimonials', SiteConfig.testimonials);
    setAll('faqs', SiteConfig.faqs);
    setAll('results', SiteConfig.results);
    setAll('gallery', SiteConfig.gallery);
    setAll('notices', SiteConfig.notices);

    localStorage.setItem(PREFIX + 'initialized', 'true');
    console.log('BSA: Default data initialized');
  }

  // ─── Export / Import ──────────────────────

  /**
   * Export all BSA data as JSON
   */
  function exportData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(PREFIX)) {
        try {
          data[key.replace(PREFIX, '')] = JSON.parse(localStorage.getItem(key));
        } catch {
          data[key.replace(PREFIX, '')] = localStorage.getItem(key);
        }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bsa-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    Utils.showToast('Data exported successfully!', 'success');
  }

  /**
   * Import BSA data from JSON file
   */
  function importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          for (const [key, value] of Object.entries(data)) {
            if (key === 'initialized') continue;
            localStorage.setItem(PREFIX + key, JSON.stringify(value));
          }
          Utils.showToast('Data imported successfully! Refreshing...', 'success');
          setTimeout(() => location.reload(), 1500);
          resolve(true);
        } catch {
          Utils.showToast('Invalid backup file', 'error');
          reject(false);
        }
      };
      reader.readAsText(file);
    });
  }

  /**
   * Reset all data to defaults
   */
  function resetToDefaults() {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PREFIX)) {
        localStorage.removeItem(key);
      }
    }
    initDefaults();
    Utils.showToast('Data reset to defaults!', 'info');
  }

  // Public API
  return {
    getAll, setAll, getById, create, update, remove,
    getSettings, updateSettings, query,
    initDefaults, exportData, importData, resetToDefaults
  };
})();
