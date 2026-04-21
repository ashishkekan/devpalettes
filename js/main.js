/* ============================================
   Devpalettes - Main JavaScript
   Shared functionality across all pages
   ============================================ */

// ==========================================
// Theme Management
// ==========================================

const ThemeManager = {
  init() {
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('colorpallates-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('colorpallates-theme')) {
        document.documentElement.classList.toggle('dark', e.matches);
      }
    });
    
    this.updateToggleIcon();
  },
  
  toggle() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('colorpallates-theme', isDark ? 'dark' : 'light');
    this.updateToggleIcon();
  },
  
  updateToggleIcon() {
    // Icons are handled by Tailwind classes (dark:hidden / dark:block)
    // No JS changes needed
  }
};


const Toast = {
  container: null,
  
  init() {
    // Create container if it doesn't exist
    if (!document.querySelector('.toast-container')) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
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
    
    // Remove toast after duration
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, duration);
  }
};

const ColorUtils = {
  // Generate random hex color
  randomHex() {
    const letters = '0123456789abcdef';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  },
  
  // Generate random HSL (better for pleasing colors)
  randomHSL(saturation = null, lightness = null) {
    const h = Math.floor(Math.random() * 360);
    const s = saturation ?? Math.floor(Math.random() * 30) + 50; // 50-80%
    const l = lightness ?? Math.floor(Math.random() * 30) + 40; // 40-70%
    return { h, s, l };
  },
  
  // HSL to HEX
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
  
  // HEX to RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },
  
  // RGB to HEX
  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  },
  
  // RGB to HSL
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
  
  // HSL to RGB
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
  
  // Calculate contrast color (black or white)
  getContrastColor(hex) {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return '#000000';
    
    // Calculate relative luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#ffffff';
  },
  
  // Get color name (simplified)
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
      // Fallback for older browsers
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


const Navbar = {
  init() {
    this.navbar = document.querySelector('.navbar');
    this.hamburger = document.querySelector('.hamburger');
    this.mobileMenu = document.querySelector('.mobile-menu');

    // Scroll effect
    window.addEventListener('scroll', () => this.handleScroll());

    // Desktop dropdowns
    this.initDropdowns();

    // Mobile menu toggle
    if (this.hamburger && this.mobileMenu) {
      this.hamburger.addEventListener('click', () => this.toggleMobile());

      // Close on link click
      this.mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => this.closeMobile());
      });

      // Mobile dropdown toggles
      this.mobileMenu.querySelectorAll('[data-mobile-dropdown-button]').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-mobile-dropdown-button');
          const menu = this.mobileMenu.querySelector(`[data-mobile-dropdown-menu="${key}"]`);
          if (!menu) return;
          const isOpen = !menu.classList.contains('hidden');
          menu.classList.toggle('hidden', isOpen);
          btn.setAttribute('aria-expanded', String(!isOpen));
        });
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

      if (!e.target.closest('[data-dropdown]')) {
        closeAll();
      }
    }, true);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAll();
    });

    dropdowns.forEach(dropdown => {
      dropdown.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => closeAll());
      });
    });
  },

  handleScroll() {
    if (this.navbar) {
      this.navbar.classList.toggle('scrolled', window.scrollY > 20);
    }
  },

  toggleMobile() {
    const isOpen = !this.mobileMenu.classList.contains('translate-x-0');

    if (isOpen) {
      this.mobileMenu.classList.remove('translate-x-full');
      this.mobileMenu.classList.add('translate-x-0');
      document.body.style.overflow = 'hidden';
    } else {
      this.mobileMenu.classList.remove('translate-x-0');
      this.mobileMenu.classList.add('translate-x-full');
      document.body.style.overflow = '';
    }

    this.hamburger.classList.toggle('active');
  },

  closeMobile() {
    if (this.hamburger && this.mobileMenu) {
      this.mobileMenu.classList.remove('translate-x-0');
      this.mobileMenu.classList.add('translate-x-full');
      this.hamburger.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
};

const NAV_CATEGORIES = [
  {
    label: 'Color Lab',
    tools: [
      { label: 'Color from image', path: 'color-from-image/' },
      { label: 'AI Palette generator', path: 'palettes/' },
      { label: 'Gradient Maker', path: 'gradient/' },
      { label: 'Color Converter', path: 'converter/' },
      { label: 'Color Wheel', path: 'color-wheel/' },
    ]
  },
  {
    label: 'UI Forge',
    tools: [
      { label: 'Box Shadow Generator', path: 'box-shadow-generator/' },
      { label: 'Border Radius Generator', path: 'border-radius-generator/' },
      { label: 'CSS Animation Generator', path: 'css-animation-generator/' },
      { label: 'Glassmorphism', path: 'glassmorphism-generator/' },
      { label: 'Neumorphism', path: 'neumorphism-generator/' },
      // { label: 'Button Maker', path: 'button-generator/' },
      // { label: 'Card UI', path: 'card-generator/' },
      // { label: 'Gradient Border Generator', path: 'gradient-border-generator/' }
    ]
  },
  {
    label: 'Dev Utilities',
    tools: [
      // { label: 'Lorem Ipsum', path: 'lorem-ipsum-generator/' },
      // { label: 'REM ↔ PX', path: 'rem-px-converter/' },
      // { label: 'Text Diff', path: 'text-diff-checker/' },
      { label: 'Snippets', path: 'code-snippet-manager/' },
      // { label: 'Scroll Bar', path: 'scroll-progress-generator/' },
      { label: 'Meta Tags Generator', path: 'meta-tag-generator/' },
      { label: 'Keyword Checker', path: 'keyword-density-checker/' },
      // { label: 'Text Formatter', path: 'text-formatter/' },
      { label: 'SEO Analyzer', path: 'seo-analyzer/' },
      { label: 'Open Graph Generator', path: 'open-graph-generator/' },
      { label: 'JSON Formatter', path: 'json-formatter/' },
    ]
  },
  {
    label: 'Accessibility',
    tools: [
      { label: 'WCAG Contrast Checker', path: 'wcag-contrast-checker/' },
      { label: 'Color Accessibility Test', path: 'color-accessibility/' },
      { label: 'Robots Txt Generator', path: 'robots-txt-generator/' },
      { label: 'Sitemap Generator', path: 'sitemap-xml-generator/'},
      // { label: 'Opacity Checker', path: 'color-opacity/' },
      // { label: 'Color Diff', path: 'color-diff-checker/' },
      // { label: 'Color Preview', path: 'color-preview/' }
    ]
  },
  {
    label: 'Layout',
    tools: [
      { label: 'Flexbox', path: 'flexbox/' },
      { label: 'CSS Grid Generator', path: 'css-grid-generator/' },
      // { label: 'Aspect Ratio', path: 'aspect-ratio-calculator/' },
      { label: '3D Transform Tool', path: 'css-3d-transform-tool/' },
      { label: 'Clip Path Generator', path: 'clip-path-generator/' },
      // { label: 'CSS Filters', path: 'css-filter-generator/' }
    ]
  },
  {
    label: 'Palettes',
    tools: [
      { label: 'Pastel Color Palette', path: 'pastel-color-palettes/' },
      { label: 'Dark Color Palette', path: 'dark-color-palettes/' },
      { label: 'Neon Color Palette', path: 'neon-color-palettes/' },
      { label: 'Aesthetic Color Palette', path: 'aesthetic-color-palettes/' },
      { label: 'Gradient Color Palette', path: 'gradient-color-palettes/' },
      { label: 'Minimal Color Palette', path: 'minimal-color-palettes/' },
    ]
  },
  {
    label: 'Pro Tools',
    tools: [
      { label: 'Image to Gradient', path: 'image-to-gradient-generator/' },
      { label: 'Extract Brand Colors', path: 'brand-color-extractor/' },
      // { label: 'Tailwind Colors', path: 'tailwind-color-palette-generator/' },
      // { label: 'Bootstrap Colors', path: 'bootstrap-color-palette-generator/' },
      // { label: 'SVG Editor', path: 'svg-color-editor/' },
      { label: 'Social Preview Maker', path: 'social-meta-preview/' },
      { label: 'Landing Page Builder', path: 'page-builder/' },
      { label: 'ATS Resume Checker', path: 'ats-checker/' },
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
      // Check if user is typing in an input
      const isTyping = ['INPUT', 'TEXTAREA'].includes(e.target.tagName) || 
                       e.target.isContentEditable;
      
      // Spacebar shortcut
      if (e.code === 'Space' && !isTyping && this.callbacks.space) {
        e.preventDefault();
        this.callbacks.space();
      }
      
      // Other shortcuts
      if (!isTyping) {
        Object.entries(this.callbacks).forEach(([key, callback]) => {
          if (e.key.toLowerCase() === key.toLowerCase()) {
            callback(e);
          }
        });
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
    // --- Create Back to Top Button ---
    this.btnTop = document.createElement('button');
    this.btnTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    this.btnTop.className = 'back-to-top';
    this.btnTop.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(this.btnTop);

    this.btnTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // --- Create Back to Bottom Button ---
    this.btnBottom = document.createElement('button');
    this.btnBottom.innerHTML = '<i class="fas fa-arrow-down"></i>'; // Down Arrow
    this.btnBottom.className = 'back-to-bottom';
    this.btnBottom.setAttribute('aria-label', 'Back to bottom');
    document.body.appendChild(this.btnBottom);

    this.btnBottom.addEventListener('click', () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });

    // --- Scroll Event Listener ---
    window.addEventListener('scroll', () => this.handleScroll());
    
    // Initial check on load
    this.handleScroll();
  },

  handleScroll() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.body.scrollHeight;
    
    // Threshold for showing buttons (e.g., 100px)
    const threshold = 100;
    
    // Check if at Top
    const isAtTop = scrollY < threshold;
    
    // Check if at Bottom (with a small threshold)
    const isAtBottom = (scrollY + windowHeight) >= (docHeight - threshold);

    // --- Visibility Logic ---
    // Requirement: "at a time ek hi dikhana hai"
    
    if (isAtTop) {
      // We are at the top: Show "Back to Bottom", Hide "Back to Top"
      this.btnBottom.classList.add('visible');
      this.btnTop.classList.remove('visible');
    } else {
      // We have scrolled down: Show "Back to Top", Hide "Back to Bottom"
      this.btnTop.classList.add('visible');
      this.btnBottom.classList.remove('visible');
    }
    
    // Optional: If strictly at the very bottom, we can hide both if you want, 
    // but usually keeping "Back to Top" at the bottom is standard UX.
    // Current logic keeps "Back to Top" visible whenever scrolled down.
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
        <div class="hidden flex flex-col gap-2 pb-2" data-mobile-dropdown-menu="${idx}">
          ${toolLinks}
        </div>
      </div>
    `;
  }).join('');

  const navHTML = `
    <nav class="navbar glass shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_25px_rgba(255,255,255,0.2)]">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14 sm:h-12">
          <!-- Logo -->
          <a href="${navHref('')}" class="flex items-center gap-2 group">
            <div class="flex items-center gap-2 sm:gap-3 group cursor-pointer">
              <div class="w-8 h-8 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-black
                flex items-center justify-center
                shadow-[0_0_15px_rgba(34,211,238,0.6)]
                transition group-hover:shadow-[0_0_25px_rgba(34,211,238,1)] overflow-hidden">
                <img src="${navHref('images/devpalettes_zoom_180.png')}" 
                  alt="Devpalettes Logo"
                  class="w-6 h-6 sm:w-6 sm:h-6 object-contain mx-auto" />
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
            <a href="${navHref('palettes/')}" class="hidden sm:flex btn-primary text-sm small-btn">
              <i class="fas fa-palette"></i>
              Create Free
            </a>
            <div class="hamburger md:hidden h-5 px-2 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              <span class="block w-6 h-0.5 bg-slate-800 dark:bg-white mb-1.5 transition-all"></span>
              <span class="block w-6 h-0.5 bg-slate-800 dark:bg-white mb-1.5 transition-all"></span>
              <span class="block w-6 h-0.5 bg-slate-800 dark:bg-white transition-all"></span>
            </div>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- Mobile Menu -->
    <div class="mobile-menu fixed inset-0 z-40 bg-white dark:bg-slate-900 transform transition-transform duration-300 translate-x-full md:hidden pt-16">
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
          <!-- Product -->
          <div class="mb-5">
            <h3 class="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-500 mb-3 sm:mb-4">Product</h3>
            <ul class="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <li><a href="/palettes/" class="hover:text-emerald-500 transition-colors">Palette Generator</a></li>
              <li><a href="/gradient/" class="hover:text-emerald-500 transition-colors">Gradient Builder</a></li>
              <li><a href="/converter/" class="hover:text-emerald-500 transition-colors">Color Converter</a></li>
              <li><a href="/pastel-color-palettes/" class="hover:text-emerald-500 transition-colors">Browse Palettes</a></li>
            </ul>
          </div>
          
          <!-- Resources -->
          <div class="mb-5">
            <h3 class="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-500 mb-3 sm:mb-4">Resources</h3>
            <ul class="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <li><a href="/about/" class="hover:text-emerald-500 transition-colors">About Us</a></li>
              <li><a href="/contact/" class="hover:text-emerald-500 transition-colors">Contact Us</a></li>
              <li><a href="/blog/" class="hover:text-emerald-500 transition-colors">Blog</a></li>
              <li><a href="/sitemap/" class="hover:text-emerald-500 transition-colors">Sitemap</a></li>
            </ul>
          </div>
          
          <!-- Legal -->
          <div>
            <h3 class="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-500 mb-3 sm:mb-4">Legal</h3>
            <ul class="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <li><a href="/privacy-policy/" class="hover:text-emerald-500 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms/" class="hover:text-emerald-500 transition-colors">Terms of Service</a></li>
              <li><a href="/cookie-policy/" class="hover:text-emerald-500 transition-colors">Cookie Policy</a></li>
              <li><a href="/disclaimer/" class="hover:text-emerald-500 transition-colors">Disclaimer</a></li>
            </ul>
          </div>

          <!-- Support -->
          <div>
            <h3 class="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-500 mb-3 sm:mb-4">Support</h3>
            <ul class="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <li><a href="/faq/" class="hover:text-emerald-500 transition-colors">FAQ</a></li>
              <li><a href="/help-center/" class="hover:text-emerald-500 transition-colors">Help Center</a></li>
              <li><a href="/why-trust-us/" class="hover:text-emerald-500 transition-colors">Why Trust Us</a></li>
            </ul>
          </div>
          
          <!-- Newsletter -->
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
              <div class="w-8 h-8 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-black
                flex items-center justify-center
                shadow-[0_0_15px_rgba(34,211,238,0.6)]
                transition group-hover:shadow-[0_0_25px_rgba(34,211,238,1)] overflow-hidden">
                <img src="/images/devpalettes_zoom_180.png" 
                  alt="Devpalettes Logo"
                  class="w-6 h-6 sm:w-6 sm:h-6 object-contain mx-auto" />
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
         <a href="https://x.com/AshishKekaan99" target="_blank" class="text-slate-400 hover:text-emerald-500 transition-colors"><i class="fab fa-twitter text-lg sm:text-xl"></i></a>
         <a href="https://github.com/ashishkekan/devpalettes" target="_blank" class="text-slate-400 hover:text-emerald-500 transition-colors"><i class="fab fa-github text-lg sm:text-xl"></i></a>
      </div>
    </div>
  `;
}


document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme
  ThemeManager.init();
  
  // Initialize toast
  Toast.init();
  
  // Render navbar and footer
  renderNavbar();
  renderFooter();
  
  // Render Author Bio if container exists (for blog pages)
  renderAuthorBio();
  
  // Initialize navbar
  Navbar.init();
  
  // Initialize keyboard shortcuts
  KeyboardShortcuts.init();
  
  // Initialize Back to Top Button
  ScrollButtons.init();
  
  // Theme toggle button
  document.addEventListener('click', (e) => {
    if (e.target.closest('#theme-toggle')) {
      ThemeManager.toggle();
    }
  });
  
  console.log('Devpalettes initialized successfully');
});

// Export utilities for use in other scripts
window.Devpalettes = {
  ThemeManager,
  Toast,
  ColorUtils,
  Clipboard,
  Storage,
  KeyboardShortcuts
};
