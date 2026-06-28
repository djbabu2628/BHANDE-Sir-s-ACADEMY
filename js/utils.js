/* ============================================================
   BSA — Utility Helpers
   Shared functions used across the application
   ============================================================ */

const Utils = (() => {
  'use strict';

  /**
   * Generate a unique ID (UUID v4-like)
   */
  function generateId() {
    return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  /**
   * Format a date string
   * @param {string|Date} date
   * @param {string} format - 'short' | 'long' | 'relative'
   */
  function formatDate(date, format = 'short') {
    const d = new Date(date);
    if (isNaN(d)) return '';
    const options = {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
    };
    if (format === 'relative') {
      const diff = Date.now() - d.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      if (days < 30) return `${days}d ago`;
      return d.toLocaleDateString('en-IN', options.short);
    }
    return d.toLocaleDateString('en-IN', options[format] || options.short);
  }

  /**
   * Debounce a function
   */
  function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  /**
   * Throttle a function
   */
  function throttle(fn, limit = 200) {
    let inThrottle = false;
    return (...args) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => { inThrottle = false; }, limit);
      }
    };
  }

  /**
   * Sanitize HTML to prevent XSS
   */
  function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Compress and resize image before storing
   * @param {File} file
   * @param {number} maxWidth
   * @param {number} quality - 0 to 1
   * @returns {Promise<string>} base64 string
   */
  function compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (w > maxWidth) {
            h = (h * maxWidth) / w;
            w = maxWidth;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/webp', quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Show a toast notification
   */
  function showToast(message, type = 'success', duration = 3000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    };
    toast.innerHTML = `<span style="font-size:1.1em">${icons[type] || ''}</span> ${sanitizeHTML(message)}`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  /**
   * Show a confirm dialog
   * @returns {Promise<boolean>}
   */
  function confirmDialog(title, message) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay active';
      overlay.innerHTML = `
        <div class="modal-content" style="text-align:center;">
          <h3 style="margin:0 0 12px;font-family:'Outfit',sans-serif;font-size:1.2rem;">${sanitizeHTML(title)}</h3>
          <p style="color:var(--text-muted);margin:0 0 24px;font-size:.95rem;">${sanitizeHTML(message)}</p>
          <div style="display:flex;gap:12px;justify-content:center;">
            <button class="confirm-cancel" style="padding:10px 24px;border:1.5px solid #e2e8f0;background:#fff;border-radius:8px;cursor:pointer;font-weight:600;font-size:.9rem;">Cancel</button>
            <button class="confirm-ok" style="padding:10px 24px;border:none;background:#EF4444;color:#fff;border-radius:8px;cursor:pointer;font-weight:600;font-size:.9rem;">Confirm</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      overlay.querySelector('.confirm-cancel').onclick = () => { overlay.remove(); resolve(false); };
      overlay.querySelector('.confirm-ok').onclick = () => { overlay.remove(); resolve(true); };
      overlay.addEventListener('click', (e) => { if (e.target === overlay) { overlay.remove(); resolve(false); } });
    });
  }

  /**
   * Validate form data
   * @param {Object} rules - { fieldName: { required: true, minLength: 2, ... } }
   * @param {Object} data - { fieldName: value }
   * @returns {{ valid: boolean, errors: Object }}
   */
  function validateForm(rules, data) {
    const errors = {};
    for (const [field, rule] of Object.entries(rules)) {
      const val = (data[field] || '').toString().trim();
      if (rule.required && !val) {
        errors[field] = `${rule.label || field} is required`;
      } else if (rule.minLength && val.length < rule.minLength) {
        errors[field] = `${rule.label || field} must be at least ${rule.minLength} characters`;
      } else if (rule.pattern && !rule.pattern.test(val)) {
        errors[field] = rule.patternMessage || `${rule.label || field} is invalid`;
      } else if (rule.min !== undefined && Number(val) < rule.min) {
        errors[field] = `${rule.label || field} must be at least ${rule.min}`;
      } else if (rule.max !== undefined && Number(val) > rule.max) {
        errors[field] = `${rule.label || field} must be at most ${rule.max}`;
      }
    }
    return { valid: Object.keys(errors).length === 0, errors };
  }

  /**
   * Create a slug from text
   */
  function slugify(text) {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  }

  /**
   * Truncate text with ellipsis
   */
  function truncate(str, len = 100) {
    if (!str || str.length <= len) return str || '';
    return str.substring(0, len).trim() + '…';
  }

  /**
   * Simple number formatter (e.g., 10000 → "10,000")
   */
  function formatNumber(num) {
    return Number(num).toLocaleString('en-IN');
  }

  /**
   * Handle image file input and return base64
   * @param {HTMLInputElement} input
   * @param {Function} callback - receives base64 string
   */
  function handleImageUpload(input, callback, maxWidth = 800) {
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be under 5MB', 'error');
        return;
      }
      try {
        const base64 = await compressImage(file, maxWidth);
        callback(base64);
      } catch {
        showToast('Failed to process image', 'error');
      }
    });
  }

  // Public API
  return {
    generateId, formatDate, debounce, throttle,
    sanitizeHTML, compressImage, showToast, confirmDialog,
    validateForm, slugify, truncate, formatNumber, handleImageUpload
  };
})();
