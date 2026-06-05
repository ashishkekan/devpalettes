/* ============================================
   Devpalettes - Main JavaScript
   Shared functionality across all pages
   ============================================ */

// ==========================================
// Theme Management
// ==========================================

const ThemeManager = {
  init() {
    const savedTheme = localStorage.getItem('colorpallates-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
    }
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('colorpallates-theme')) {
        document.documentElement.classList.toggle('dark', e.matches);
      }
    });
  },
  
  toggle() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('colorpallates-theme', isDark ? 'dark' : 'light');
  }
};

// ==========================================
// Cookie Consent (GDPR-friendly, lightweight)
// ==========================================

const CookieConsent = {
  STORAGE_KEY: 'devpalettes-cookie-consent-v1',

  get() {
    try { return localStorage.getItem(this.STORAGE_KEY); } catch { return null; }
  },

  set(value) {
    try { localStorage.setItem(this.STORAGE_KEY, value); } catch {}
  },

  _deleteCookie(name) {
    const base = `${name}=; Max-Age=0; path=/; samesite=lax`;
    document.cookie = base;
    document.cookie = `${base}; domain=${location.hostname}`;
    document.cookie = `${base}; domain=.${location.hostname}`;
  },

  _applyGoogleConsent(choice) {
    const allowed = choice === 'accepted';

    window[`ga-disable-G-F252PEQ1JC`] = !allowed;

    try {
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          ad_storage: allowed ? 'granted' : 'denied',
          analytics_storage: allowed ? 'granted' : 'denied',
          ad_user_data: allowed ? 'granted' : 'denied',
          ad_personalization: allowed ? 'granted' : 'denied'
        });
      }
    } catch {}

    if (!allowed) {
      ['_ga', '_ga_G-F252PEQ1JC', '_gid', '_gat', '__gads', '__gpi', '__gpi_optout'].forEach((c) => {
        this._deleteCookie(c);
      });
    }
  },

  hide() {
    document.getElementById('cookie-consent')?.remove();
  },

  show() {
    if (document.getElementById('cookie-consent')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'cookie-consent';
    wrapper.className = 'fixed inset-x-0 bottom-0 z-[9998] px-4 pb-4 sm:pb-6';
    wrapper.setAttribute('role', 'dialog');
    wrapper.setAttribute('aria-modal', 'true');
    wrapper.setAttribute('aria-label', 'Cookie consent');

    wrapper.innerHTML = `
      <div class="max-w-3xl mx-auto glass-card p-4 sm:p-5 shadow-2xl border border-slate-200/70 dark:border-slate-700/70">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="min-w-0">
            <p class="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100">
              We use cookies to improve Devpalettes
            </p>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              We use cookies for basic site functionality and, with your consent, analytics and ads measurement. Read our
              <a href="/privacy-policy/" class="text-emerald-500 hover:underline font-medium">Privacy Policy</a>
              and
              <a href="/cookie-policy/" class="text-emerald-500 hover:underline font-medium">Cookie Policy</a>.
            </p>
          </div>
          <div class="d-flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center shrink-0">
            <a href="/cookie-policy/" class="btn-secondary text-sm py-2 px-4 justify-center" aria-label="Learn more about cookies">Learn more</a>
            <button type="button" class="btn-secondary text-sm py-2 px-4 justify-center" data-consent="reject">Reject</button>
            <button type="button" class="btn-primary btn-glow text-sm py-2 px-4 justify-center" data-consent="accept">Accept</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper);

    var focusableElements = wrapper.querySelectorAll('button, a[href], input');
    var firstFocusable = focusableElements[0];
    var lastFocusable = focusableElements[focusableElements.length - 1];

    wrapper.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        CookieConsent.set('rejected');
        CookieConsent._applyGoogleConsent('rejected');
        CookieConsent.hide();
        return;
      }
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    });

    wrapper.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-consent]');
      if (!btn) return;
      const action = btn.getAttribute('data-consent');
      if (action === 'accept') {
        this.set('accepted');
        this._applyGoogleConsent('accepted');
        ThirdPartyAnalytics.load();
        this.hide();
      } else if (action === 'reject') {
        this.set('rejected');
        this._applyGoogleConsent('rejected');
        this.hide();
      }
    });

    wrapper.querySelector('button[data-consent="accept"]')?.focus({ preventScroll: true });
  },

  init() {
    const choice = this.get();
    if (choice === 'accepted' || choice === 'rejected') {
      this._applyGoogleConsent(choice);
      if (choice === 'accepted') ThirdPartyAnalytics.load();
      return;
    }
    window[`ga-disable-G-F252PEQ1JC`] = true;
    this.show();
  }
};

// ==========================================
// Third-party Analytics (consent-aware)
// ==========================================

const ThirdPartyAnalytics = {
  _loaded: false,

  load() {
    if (this._loaded) return;
    this._loaded = true;

    const run = () => {
      if (document.querySelector('script[data-gtag-loader]')) return;

      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };

      try {
        window.gtag('consent', 'default', {
          ad_storage: 'granted',
          analytics_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted'
        });
      } catch {}

      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=G-F252PEQ1JC';
      s.setAttribute('data-gtag-loader', 'true');
      s.onload = () => {
        try {
          window.gtag('js', new Date());
          window.gtag('config', 'G-F252PEQ1JC');
        } catch {}
      };
      document.head.appendChild(s);
    };

    const rIC = window.requestIdleCallback || function(cb){ return setTimeout(cb, 250); };
    rIC(run);
  }
};

const Toast = {
  container: null,
  
  init() {
    if (!document.querySelector('.toast-container')) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      this.container.setAttribute('role', 'status');
      this.container.setAttribute('aria-live', 'polite');
      this.container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(this.container);
    } else {
      this.container = document.querySelector('.toast-container');
    }
  },
  
  show(message, type = 'success', duration = 3000) {
    if (!this.container) this.init();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    const iconColor = type === 'success' ? 'text-emerald-400' : 'text-red-400';
    
    toast.innerHTML = `
      <i class="fas ${icon} ${iconColor}"></i>
      <span>${message}</span>
    `;
    
    this.container.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, duration);
  }
};

const ColorUtils = {
  randomHex() {
    return '#' + Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, '0');
  },
  
  randomHSL(saturation = null, lightness = null) {
    const h = Math.floor(Math.random() * 360);
    const s = saturation ?? Math.floor(Math.random() * 30) + 50;
    const l = lightness ?? Math.floor(Math.random() * 30) + 40;
    return { h, s, l };
  },
  
  hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  },
  
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },
  
  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  },
  
  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  },
  
  hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  },
  
  getContrastColor(hex) {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return '#000000';
    
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#ffffff';
  },
  
  getColorName(hex) {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 'Unknown';
    
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    if (hsl.s < 10) {
      if (hsl.l < 20) return 'Black';
      if (hsl.l > 80) return 'White';
      return 'Gray';
    }
    
    const hue = hsl.h;
    
    if (hue < 15 || hue >= 345) return 'Red';
    if (hue < 45) return 'Orange';
    if (hue < 75) return 'Yellow';
    if (hue < 150) return 'Green';
    if (hue < 195) return 'Cyan';
    if (hue < 255) return 'Blue';
    if (hue < 285) return 'Purple';
    if (hue < 345) return 'Pink';
    
    return 'Unknown';
  }
};


const Clipboard = {
  async copy(text, message = 'Copied to clipboard!') {
    try {
      await navigator.clipboard.writeText(text);
      Toast.show(message, 'success');
      return true;
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      
      try {
        document.execCommand('copy');
        Toast.show(message, 'success');
        return true;
      } catch (e) {
        Toast.show('Failed to copy', 'error');
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }
};

const CopyLinkButton = {
  init() {
    document.addEventListener('click', async (e) => {
      const button = e.target.closest('#copy-link-btn');
      if (!button) return;

      e.preventDefault();

      if (!button.dataset.originalHtml) {
        button.dataset.originalHtml = button.innerHTML;
      }

      const ok = await Clipboard.copy(window.location.href, 'Link copied!');
      if (!ok) return;

      button.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Copied!';
      window.clearTimeout(button._copyLinkResetTimer);
      button._copyLinkResetTimer = window.setTimeout(() => {
        button.innerHTML = button.dataset.originalHtml || '<i class="fas fa-link" aria-hidden="true"></i> Copy Link';
      }, 2000);
    });
  }
};

// ==========================================
// Shared Scroll Handler (rAF-batched)
// Batches all layout reads before writes
// to eliminate forced reflow during scroll.
// ==========================================
const ScrollManager = {
  _ticking: false,
  _handlers: [],

  register(fn) {
    this._handlers.push(fn);
  },

  _process() {
    // Batch all layout reads upfront, then call handlers (which write)
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.body.scrollHeight;
    const state = { scrollY, windowHeight, docHeight };
    for (let i = 0; i < this._handlers.length; i++) {
      this._handlers[i](state);
    }
  },

  init() {
    window.addEventListener('scroll', () => {
      if (!this._ticking) {
        this._ticking = true;
        requestAnimationFrame(() => {
          this._process();
          this._ticking = false;
        });
      }
    }, { passive: true });
  },

  // Call synchronously to set initial state without waiting for scroll
  triggerNow() {
    this._process();
  }
};

// ==========================================
// Navbar
// ==========================================

const Navbar = {
  _isToggling: false,

  init() {
    this.navbar = document.querySelector('.navbar');
    this.hamburger = document.querySelector('.hamburger');
    this.mobileMenu = document.querySelector('.mobile-menu');

    // Register with ScrollManager instead of adding own scroll listener
    ScrollManager.register((state) => this.handleScroll(state.scrollY));
    this.handleScroll(window.scrollY);

    // Desktop dropdowns
    this.initDropdowns();

    // Mobile menu toggle + delegation (replaces per-link/per-button listeners)
    if (this.hamburger && this.mobileMenu) {

      // Double rAF avoids forced synchronous layout from void offsetHeight
      this.mobileMenu.classList.add('no-transition');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.mobileMenu.classList.remove('no-transition');
        });
      });

      this.hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.toggleMobile();
      });

      // Single delegated listener for mobile menu links + dropdown buttons
      this.mobileMenu.addEventListener('click', (e) => {
        // Mobile dropdown toggle
        const mobileBtn = e.target.closest('[data-mobile-dropdown-button]');
        if (mobileBtn) {
          e.stopPropagation();
          const key = mobileBtn.getAttribute('data-mobile-dropdown-button');
          const menu = this.mobileMenu.querySelector(`[data-mobile-dropdown-menu="${key}"]`);
          if (!menu) return;

          const isOpen = menu.classList.contains('flex');
          menu.classList.toggle('hidden', isOpen);
          menu.classList.toggle('flex', !isOpen);
          menu.classList.toggle('flex-col', !isOpen);
          mobileBtn.setAttribute('aria-expanded', String(!isOpen));
          return;
        }

        // Close on any link click inside mobile menu
        if (e.target.closest('a')) {
          this.closeMobile();
        }
      });
    }
  },

  initDropdowns() {
    const dropdowns = Array.from(document.querySelectorAll('[data-dropdown]'));
    if (!dropdowns.length) return;

    const closeAll = (except = null) => {
      dropdowns.forEach(dropdown => {
        if (except && dropdown === except) return;
        const menu = dropdown.querySelector('[data-dropdown-menu]');
        const button = dropdown.querySelector('[data-dropdown-button]');
        if (menu) menu.classList.add('hidden');
        if (button) button.setAttribute('aria-expanded', 'false');
      });
    };

    // Single delegated document click handler for all dropdown interactions
    document.addEventListener('click', (e) => {
      const button = e.target.closest('[data-dropdown-button]');
      if (button) {
        const dropdown = button.closest('[data-dropdown]');
        const menu = dropdown?.querySelector('[data-dropdown-menu]');
        if (!dropdown || !menu) return;

        const isOpen = !menu.classList.contains('hidden');
        closeAll(dropdown);
        menu.classList.toggle('hidden', isOpen);
        button.setAttribute('aria-expanded', String(!isOpen));
        e.preventDefault();
        return;
      }

      // Close on link click inside dropdown (replaces per-link listeners)
      if (e.target.closest('[data-dropdown] a')) {
        closeAll();
        return;
      }

      if (!e.target.closest('[data-dropdown]')) {
        closeAll();
      }
    }, true);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAll();
    });
  },

  handleScroll(scrollY) {
    if (this.navbar) {
      this.navbar.classList.toggle('scrolled', scrollY > 20);
    }
  },

  toggleMobile() {
    if (this._isToggling) return;
    this._isToggling = true;

    const isCurrentlyOpen = this.mobileMenu.classList.contains('translate-x-0');

    if (isCurrentlyOpen) {
      this.mobileMenu.classList.remove('translate-x-0');
      this.mobileMenu.classList.add('translate-x-full');
      this.hamburger.classList.remove('active');
      this.hamburger.setAttribute('aria-expanded', 'false');
      this.hamburger.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
    } else {
      this.mobileMenu.classList.remove('translate-x-full');
      this.mobileMenu.classList.add('translate-x-0');
      this.hamburger.classList.add('active');
      this.hamburger.setAttribute('aria-expanded', 'true');
      this.hamburger.setAttribute('aria-label', 'Close menu');
      document.body.style.overflow = 'hidden';
    }

    setTimeout(() => {
      this._isToggling = false;
    }, 350);
  },

  closeMobile() {
    if (this.hamburger && this.mobileMenu) {
      this.mobileMenu.classList.remove('translate-x-0');
      this.mobileMenu.classList.add('translate-x-full');
      this.hamburger.classList.remove('active');
      this.hamburger.setAttribute('aria-expanded', 'false');
      this.hamburger.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
      
      this.mobileMenu.querySelectorAll('[data-mobile-dropdown-menu]').forEach(menu => {
        menu.classList.add('hidden');
        menu.classList.remove('flex', 'flex-col');
      });
      this.mobileMenu.querySelectorAll('[data-mobile-dropdown-button]').forEach(btn => {
        btn.setAttribute('aria-expanded', 'false');
      });

      this._isToggling = false;
    }
  }
};

const NAV_CATEGORIES = [
  {
    label: 'Color Tools',
    tools: [
      { label: 'Extract Colors from Image', path: 'color-from-image/' },
      { label: 'AI Color Palette Generator', path: 'palettes/' },
      { label: 'CSS Gradient Generator', path: 'gradient/' },
      { label: 'HEX to RGB Color Converter', path: 'converter/' },
      { label: 'Interactive Color Wheel Tool', path: 'color-wheel/' },
    ]
  },
  {
    label: 'UI/UX',
    tools: [
      { label: 'Box Shadow CSS Generator', path: 'box-shadow-generator/' },
      { label: 'Border Radius Generator', path: 'border-radius-generator/' },
      { label: 'CSS Animation Generator', path: 'css-animation-generator/' },
      { label: 'Glassmorphism CSS Generator', path: 'glassmorphism-generator/' },
      { label: 'Neumorphism CSS Generator', path: 'neumorphism-generator/' },
      { label: 'CSS Clip Path Generator', path: 'clip-path-generator/' },
    ]
  },
  {
    label: 'Dev Tools',
    tools: [
      { label: 'HTML Minifier', path: 'html-minifier/' },
      { label: 'CSS Minifier', path: 'css-minifier/' },
      { label: 'JavaScript Minifier', path: 'js-minifier/' },
      { label: 'JSON Formatter', path: 'json-formatter/' },
      { label: 'cURL Converter', path: 'curl-converter/' },
      { label: 'Code Snippet Manager', path: 'code-snippet-manager/' },
    ]
  },
  {
    label: 'SEO Tools',
    tools: [
      { label: 'Meta Tags Generator Tool', path: 'meta-tag-generator/' },
      { label: 'SEO Analyzer Tool', path: 'seo-analyzer/' },
      { label: 'Google Ranking Tracker', path: 'google-ranking-tracker/' },
      { label: 'Open Graph Meta Generator', path: 'open-graph-generator/' },
      { label: 'Robots.txt Generator Tool', path: 'robots-txt-generator/' },
      { label: 'XML Sitemap Generator', path: 'sitemap-xml-generator/' },
      { label: 'UTM Builder', path: 'utm-builder/' },
      { label: 'Social Media Preview', path: 'social-meta-preview/' },
    ]
  },
  {
    label: 'Accessibility',
    tools: [
      { label: 'WCAG Contrast Checker Tool', path: 'wcag-contrast-checker/' },
      { label: 'Color Accessibility Checker', path: 'color-accessibility/' },
      { label: 'Color Difference Checker', path: 'color-diff-checker/' },
    ]
  },
  {
    label: 'Layouts Tools',
    tools: [
      { label: 'Aspect Ratio Calculator', path: 'aspect-ratio-calculator/' },
      { label: 'Flexbox Layout Generator', path: 'flexbox/' },
      { label: 'CSS Grid Generator Tool', path: 'css-grid-generator/' },
      { label: 'CSS 3D Transform Tool', path: 'css-3d-transform-tool/' },
      { label: 'CSS Filter Generator', path: 'css-filter-generator/' }
    ]
  },
  {
    label: 'Pro Tools',
    tools: [
      { label: 'Image Compressor', path: 'image-compressor/' },
      { label: 'PDF Compressor', path: 'pdf-compressor/' },
      { label: 'ATS Resume Checker Tool', path: 'ats-checker/' },
      { label: 'Brand Color Extractor Tool', path: 'brand-color-extractor/' },
      { label: 'Tailwind Color Palette Generator', path: 'tailwind-color-palette-generator/' },
      { label: 'SVG Color Editor Tool', path: 'svg-color-editor/' },
      { label: 'Image to Gradient Generator', path: 'image-to-gradient-generator/' },
    ]
  }
];

function getRootRelativePrefix() {
  const pathname = window.location.pathname || '/';
  const withoutLeadingSlash = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  if (!withoutLeadingSlash) return '';

  const segments = withoutLeadingSlash.split('/').filter(Boolean);
  if (!segments.length) return '';

  const last = segments[segments.length - 1];
  const isFile = last.includes('.');
  const depth = isFile ? Math.max(0, segments.length - 1) : segments.length;
  return depth ? '../'.repeat(depth) : '';
}

function navHref(path = '') {
  const prefix = getRootRelativePrefix();
  if (!path) return prefix || './';
  return prefix + String(path).replace(/^\/+/, '');
}


const KeyboardShortcuts = {
  callbacks: {},
  
  init() {
    document.addEventListener('keydown', (e) => {
      const target = e.target;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || 
                       target.isContentEditable;
      
      if (e.code === 'Space' && !isTyping && this.callbacks.space) {
        e.preventDefault();
        this.callbacks.space();
      }
      
      if (!isTyping) {
        // Direct property lookup avoids Object.entries array allocation per keypress
        const callback = this.callbacks[e.key.toLowerCase()];
        if (callback) callback(e);
      }
    });
  },
  
  on(key, callback) {
    this.callbacks[key] = callback;
  }
};


const Storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(`colorpallates-${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(`colorpallates-${key}`, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  
  remove(key) {
    localStorage.removeItem(`colorpallates-${key}`);
  }
};

const ScrollButtons = {
  btnTop: null,
  btnBottom: null,

  init() {
    // DocumentFragment: single reflow instead of two separate appendChild calls
    const fragment = document.createDocumentFragment();

    this.btnTop = document.createElement('button');
    this.btnTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    this.btnTop.className = 'back-to-top';
    this.btnTop.setAttribute('aria-label', 'Back to top');
    this.btnTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    fragment.appendChild(this.btnTop);

    this.btnBottom = document.createElement('button');
    this.btnBottom.innerHTML = '<i class="fas fa-arrow-down"></i>';
    this.btnBottom.className = 'back-to-bottom';
    this.btnBottom.setAttribute('aria-label', 'Back to bottom');
    this.btnBottom.addEventListener('click', () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
    fragment.appendChild(this.btnBottom);

    document.body.appendChild(fragment);

    // Register with ScrollManager — reads are batched in rAF, no per-scroll forced reflow
    ScrollManager.register((state) => this.updateVisibility(state));

    // Set initial visibility with a synchronous read (one-time cost during init)
    this.updateVisibility({
      scrollY: window.scrollY,
      windowHeight: window.innerHeight,
      docHeight: document.body.scrollHeight
    });
  },

  updateVisibility({ scrollY, windowHeight, docHeight }) {
    const threshold = 100;
    const isAtTop = scrollY < threshold;
    const isAtBottom = (scrollY + windowHeight) >= (docHeight - threshold);

    if (isAtTop) {
      this.btnBottom.classList.add('visible');
      this.btnTop.classList.remove('visible');
    } else {
      this.btnTop.classList.add('visible');
      this.btnBottom.classList.remove('visible');
    }
  }
};

function renderNavbar() {
  const desktopDropdownsHTML = NAV_CATEGORIES.map((category, idx) => {
    const toolLinks = category.tools.map(tool => `
      <a href="${navHref(tool.path)}"
        class="block px-3 py-2 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors"
        role="menuitem">${tool.label}</a>
    `).join('');

    return `
      <div class="relative group" data-dropdown>
        <button type="button"
          class="text-sm font-medium hover:text-emerald-500 transition-colors flex items-center gap-1"
          data-dropdown-button
          aria-haspopup="true"
          aria-expanded="false">
          ${category.label}
          <i class="fas fa-chevron-down text-[10px] opacity-70"></i>
        </button>
        <div class="hidden absolute left-0 mt-2 min-w-[15rem] max-w-[19rem] max-h-80 overflow-auto
          group-hover:block
          bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
          shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.12)]
          rounded-xl p-2 z-50"
          data-dropdown-menu
          role="menu">
          ${toolLinks}
        </div>
      </div>
    `;
  }).join('');

  const mobileCategoriesHTML = NAV_CATEGORIES.map((category, idx) => {
    const toolLinks = category.tools.map(tool => `
      <a href="${navHref(tool.path)}"
        class="text-base font-medium hover:text-emerald-500 transition-colors py-1 pl-3">
        ${tool.label}
      </a>
    `).join('');

    return `
      <div class="py-2 border-b border-slate-100 dark:border-slate-800">
        <button type="button"
          class="w-full text-lg font-medium hover:text-emerald-500 transition-colors py-2 flex items-center justify-between"
          data-mobile-dropdown-button="${idx}"
          aria-expanded="false">
          <span>${category.label}</span>
          <i class="fas fa-chevron-down text-xs opacity-70"></i>
        </button>
        <div class="hidden gap-2 pb-2" data-mobile-dropdown-menu="${idx}">
          ${toolLinks}
        </div>
      </div>
    `;
  }).join('');

  const navHTML = `
    <nav class="navbar glass shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_25px_rgba(255,255,255,0.2)]" aria-label="Primary navigation">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14 sm:h-11">
          <!-- Logo -->
          <a href="${navHref('')}" class="flex items-center gap-2 group">
            <div class="flex items-center gap-2 sm:gap-3 group cursor-pointer">
              <div class="w-7 h-7 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-black
                flex items-center justify-center
                shadow-[0_0_15px_rgba(34,211,238,0.6)]
                transition group-hover:shadow-[0_0_25px_rgba(34,211,238,1)] overflow-hidden">
                <img src="${navHref('images/devpalettes_zoom_180.png')}"
                  alt="Devpalettes Logo"
                  width="20"
                  height="20"
                  decoding="async"
                  class="w-5 h-5 sm:w-5 sm:h-5 object-contain mx-auto"/>
              </div>
              <span class="text-lg sm:text-2xl font-bold text-cyan-400">
                Devpalettes
              </span>
            </div>
          </a>
          
          <!-- Desktop Nav -->
          <div class="nav-links hidden md:flex items-center gap-6 lg:gap-8">
            ${desktopDropdownsHTML}
           </div>
          
          <!-- Right side -->
          <div class="flex items-center gap-2 sm:gap-4">
            <button id="theme-toggle" 
              class="h-8 px-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors" 
              aria-label="Toggle theme">
              <i class="fas fa-moon text-lg sm:text-xl dark:hidden"></i>
              <i class="fas fa-sun text-lg sm:text-xl hidden dark:block"></i>
            </button>
            <a 
              href="${navHref('palettes/')}" 
              class="btn-primary text-sm small-btn create-free-btn"
            >
              <i class="fas fa-palette"></i>
              Create Free
            </a>
            <button type="button" class="hamburger md:hidden h-5 px-2 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer" aria-label="Open menu" aria-controls="mobile-menu" aria-expanded="false">
              <span class="block w-6 h-0.5 bg-slate-800 dark:bg-white mb-1.5 transition-all"></span>
              <span class="block w-6 h-0.5 bg-slate-800 dark:bg-white mb-1.5 transition-all"></span>
              <span class="block w-6 h-0.5 bg-slate-800 dark:bg-white transition-all"></span>
            </button>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- Mobile Menu -->
    <div id="mobile-menu" class="mobile-menu fixed inset-0 z-40 bg-white dark:bg-slate-900 transform transition-transform duration-300 translate-x-full md:hidden pt-16" role="dialog" aria-label="Mobile menu">
      <div class="flex flex-col gap-4 p-6 h-full overflow-y-auto">
        ${mobileCategoriesHTML}
        <hr class="border-slate-200 dark:border-slate-700 my-4">
        <a href="${navHref('about/')}" class="text-lg font-medium hover:text-emerald-500 transition-colors py-2">About Us</a>
        <a href="${navHref('contact/')}" class="text-lg font-medium hover:text-emerald-500 transition-colors py-2">Contact Us</a>
        <a href="${navHref('blog/')}" class="text-lg font-medium hover:text-emerald-500 transition-colors py-2">Blog</a>
        <div class="mt-auto pb-8">
          <a href="${navHref('palettes/')}" class="btn-primary text-center mt-4 w-full justify-center">
            <i class="fas fa-palette"></i>
            Create Free Palette
          </a>
        </div>
      </div>
    </div>
  `;
  
  const navbarContainer = document.getElementById('navbar-container');
  if (navbarContainer) {
    navbarContainer.innerHTML = navHTML;
  }
}

function renderFooter() {
  const footerHTML = `
    <footer class="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div class="grid grid-cols-2 md:grid-cols-5">
          <div class="mb-5">
            <h3 class="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-500 mb-3 sm:mb-4">Product</h3>
            <ul class="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <li><a href="/palettes/" class="hover:text-emerald-500 transition-colors">Palette Generator</a></li>
              <li><a href="/gradient/" class="hover:text-emerald-500 transition-colors">Gradient Builder</a></li>
              <li><a href="/converter/" class="hover:text-emerald-500 transition-colors">Color Converter</a></li>
              <li><a href="/pastel-color-palettes/" class="hover:text-emerald-500 transition-colors">Browse Palettes</a></li>
            </ul>
          </div>
          
          <div class="mb-5">
            <h3 class="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-500 mb-3 sm:mb-4">Resources</h3>
            <ul class="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <li><a href="/about/" class="hover:text-emerald-500 transition-colors">About Us</a></li>
              <li><a href="/contact/" class="hover:text-emerald-500 transition-colors">Contact Us</a></li>
              <li><a href="/blog/" class="hover:text-emerald-500 transition-colors">Blog</a></li>
              <li><a href="/sitemap.html" class="hover:text-emerald-500 transition-colors">Sitemap</a></li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-500 mb-3 sm:mb-4">Legal</h3>
            <ul class="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <li><a href="/privacy-policy/" class="hover:text-emerald-500 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms/" class="hover:text-emerald-500 transition-colors">Terms of Service</a></li>
              <li><a href="/cookie-policy/" class="hover:text-emerald-500 transition-colors">Cookie Policy</a></li>
              <li><a href="/disclaimer/" class="hover:text-emerald-500 transition-colors">Disclaimer</a></li>
            </ul>
          </div>

          <div>
            <h3 class="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-500 mb-3 sm:mb-4">Support</h3>
            <ul class="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <li><a href="/faq/" class="hover:text-emerald-500 transition-colors">FAQ</a></li>
              <li><a href="/help-center/" class="hover:text-emerald-500 transition-colors">Help Center</a></li>
              <li><a href="/why-trust-us/" class="hover:text-emerald-500 transition-colors">Why Trust Us</a></li>
            </ul>
          </div>
          
          <div class="col-span-2 md:col-span-1 mt-6 sm:mt-0">
            <h3 class="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-500 mb-3 sm:mb-4">Stay Updated</h3>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3 sm:mb-4">Get the latest color trends and updates.</p>
            <form action="https://formspree.io/f/mrbklgzn" method="POST" class="flex gap-2">
              <input type="email" name="email" placeholder="Your email"
              class="input-field text-sm flex-1" required>
              <input type="hidden" name="_subject" value="New Newsletter Subscriber!">
              <input type="hidden" name="_captcha" value="false">
              <button type="submit" class="btn-primary text-sm px-4 btn-size">
              <i class="fas fa-arrow-right"></i>
              </button>
            </form>
          </div>
        </div>
        
        <div class="border-t border-slate-200 dark:border-slate-800 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <a href="/" class="flex items-center gap-2 group mb-4 sm:mb-0">
            <div class="flex items-center gap-2 sm:gap-3 group cursor-pointer">
              <div class="w-7 h-7 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-black
                flex items-center justify-center
                shadow-[0_0_15px_rgba(34,211,238,0.6)]
                transition group-hover:shadow-[0_0_25px_rgba(34,211,238,1)] overflow-hidden">
                <img src="/images/devpalettes_zoom_180.png"
                  alt="Devpalettes Logo"
                  width="20"
                  height="20"
                  decoding="async"
                  class="w-5 h-5 sm:w-5 sm:h-5 object-contain mx-auto" />
              </div>
              <span class="text-xl sm:text-2xl font-bold text-cyan-400">
                Devpalettes
              </span>
            </div>
          </a>
          <p class="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
            &copy; ${new Date().getFullYear()} Devpalettes. All rights reserved.
          </p>
          <div class="flex items-center gap-4">
            <a href="https://x.com/devpalettes" class="text-slate-400 hover:text-emerald-500 transition-colors" aria-label="Twitter">
              <i class="fab fa-twitter text-lg sm:text-xl"></i>
            </a>
            <a href="https://github.com/Devpalettes" class="text-slate-400 hover:text-emerald-500 transition-colors" aria-label="GitHub">
              <i class="fab fa-github text-lg sm:text-xl"></i>
            </a>
            <a href="https://www.instagram.com/devpalettes/" class="text-slate-400 hover:text-emerald-500 transition-colors" aria-label="Instagram">
              <i class="fab fa-instagram text-lg sm:text-xl"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  `;
  
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    footerContainer.innerHTML = footerHTML;
  }
}

function renderAuthorBio(author = 'Devpalettes Team', date = null) {
  const container = document.getElementById('author-bio-container');
  if (!container) return;

  const displayDate = date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  container.innerHTML = `
    <div class="glass-card p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-6 sm:mt-8 not-prose">
      <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg flex-shrink-0">
        CPH
      </div>
      <div class="flex-1 texflex items-center gap-2 sm:gap-3 group cursor-pointert-center sm:text-left">
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-1">Written by</p>
        <h4 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">${author}</h4>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-2">
          <i class="far fa-calendar-alt"></i>
          Updated on ${displayDate}
        </p>
        <p class="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-2">
          Devpalettes Team creates tools and resources for designers and developers worldwide.
        </p>
      </div>
      <div class="flex gap-3">
         <a href="https://x.com/AshishKekaan99" target="_blank" rel="noopener noreferrer" class="text-slate-400 hover:text-emerald-500 transition-colors" aria-label="Creator Twitter"><i class="fab fa-twitter text-lg sm:text-xl" aria-hidden="true"></i></a>
         <a href="https://github.com/ashishkekan/devpalettes" target="_blank" rel="noopener noreferrer" class="text-slate-400 hover:text-emerald-500 transition-colors" aria-label="Project GitHub"><i class="fab fa-github text-lg sm:text-xl" aria-hidden="true"></i></a>
      </div>
    </div>
  `;
}


document.addEventListener('DOMContentLoaded', () => {
  const main = document.querySelector('main');
  if (main && !main.id) main.id = 'main-content';

  // ── Critical path: above-the-fold, must render before paint ──
  ThemeManager.init();
  renderNavbar();
  ScrollManager.init();
  Navbar.init();
  ScrollManager.triggerNow(); // Set initial navbar state for restored scroll position

  // ── Quick setup: lightweight listener registration ──
  Toast.init();
  CopyLinkButton.init();
  KeyboardShortcuts.init();

  document.addEventListener('click', (e) => {
    if (e.target.closest('#theme-toggle')) {
      ThemeManager.toggle();
    }
  });

  // ── Deferred: below-the-fold and non-critical (reduces long task / TBT) ──
  const deferInit = window.requestIdleCallback || (cb => setTimeout(cb, 1));
  deferInit(() => {
    renderFooter();
    renderAuthorBio();
    ScrollButtons.init();
    CookieConsent.init();

    console.log('Devpalettes initialized successfully');
  });
});

window.Devpalettes = {
  ThemeManager,
  CookieConsent,
  Toast,
  ColorUtils,
  Clipboard,
  CopyLinkButton,
  Storage,
  KeyboardShortcuts
};
