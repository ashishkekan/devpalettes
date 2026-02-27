/* ============================================
   ColorPallates - Main JavaScript
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
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;
    
    const isDark = document.documentElement.classList.contains('dark');
    const icon = toggleBtn.querySelector('i');
    if (icon) {
      icon.className = isDark ? 'fas fa-sun text-xl' : 'fas fa-moon text-xl';
    }
  }
};

// ==========================================
// Toast Notifications
// ==========================================

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

// ==========================================
// Color Utilities
// ==========================================

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

// ==========================================
// Clipboard
// ==========================================

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

// ==========================================
// Navbar & Mobile Menu
// ==========================================

const Navbar = {
  init() {
    this.navbar = document.querySelector('.navbar');
    this.hamburger = document.querySelector('.hamburger');
    this.mobileMenu = document.querySelector('.mobile-menu');
    
    // Scroll effect
    window.addEventListener('scroll', () => this.handleScroll());
    
    // Mobile menu toggle
    if (this.hamburger && this.mobileMenu) {
      this.hamburger.addEventListener('click', () => this.toggleMobile());
      
      // Close on link click
      this.mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => this.closeMobile());
      });
    }
  },
  
  handleScroll() {
    if (this.navbar) {
      this.navbar.classList.toggle('scrolled', window.scrollY > 20);
    }
  },
  
  toggleMobile() {
    this.hamburger.classList.toggle('active');
    this.mobileMenu.classList.toggle('active');
    document.body.style.overflow = this.mobileMenu.classList.contains('active') ? 'hidden' : '';
  },
  
  closeMobile() {
    if (this.hamburger && this.mobileMenu) {
      this.hamburger.classList.remove('active');
      this.mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
};

// ==========================================
// Keyboard Shortcuts
// ==========================================

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

// ==========================================
// Local Storage Helpers
// ==========================================

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

// ==========================================
// Render Shared Components
// ==========================================

function renderNavbar() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  const navHTML = `
    <nav class="navbar glass shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_25px_rgba(255,255,255,0.2)]">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-12">
          <!-- Logo -->
          <a href="index.html" class="flex items-center gap-2 group">
            <div class="flex items-center gap-3 group cursor-pointer">
              <div class="w-9 h-9 rounded-xl bg-black
                flex items-center justify-center text-cyan-400 font-bold text-xl
                shadow-[0_0_15px_rgba(34,211,238,0.6)]
                transition group-hover:shadow-[0_0_25px_rgba(34,211,238,1)]">🎨
              </div>
              <span class="text-2xl font-bold text-cyan-400">
                Color Palettes
              </span>
            </div>
          </a>
          
          <!-- Desktop Nav -->
          <div class="nav-links hidden md:flex items-center gap-8">
            <a href="palette.html" class="text-sm font-medium hover:text-emerald-500 transition-colors ${currentPage === 'palette.html' ? 'text-emerald-500' : ''}">Generator</a>
            <a href="pastel-color-palettes.html" class="text-sm font-medium hover:text-emerald-500 transition-colors ${currentPage === 'pastel-color-palettes.html' ? 'text-emerald-500' : ''}">Explore</a>
            <a href="gradient.html" class="text-sm font-medium hover:text-emerald-500 transition-colors ${currentPage === 'gradient.html' ? 'text-emerald-500' : ''}">Gradients</a>
            <a href="converter.html" class="text-sm font-medium hover:text-emerald-500 transition-colors ${currentPage === 'converter.html' ? 'text-emerald-500' : ''}">Converter</a>
            <a href="rgb-hex-converter.html" class="text-sm font-medium hover:text-emerald-500 transition-colors ${currentPage === 'rgb-hex-converter.html' ? 'text-emerald-500' : ''}">Conversion</a>
            <a href="color-names-chart.html" class="text-sm font-medium hover:text-emerald-500 transition-colors ${currentPage === 'color-names-chart.html' ? 'text-emerald-500' : ''}">Color Chart</a>
          </div>
          
          <!-- Right side -->
          <div class="flex items-center gap-4">
            <button id="theme-toggle" class="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Toggle theme">
              <i class="fas fa-sun text-xl hidden dark:block"></i>
            </button>
            <a href="palette.html" class="hidden sm:flex btn-primary text-sm">
              <i class="fas fa-palette"></i>
              Create Free
            </a>
            <div class="hamburger md:hidden">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- Mobile Menu -->
    <div class="mobile-menu md:hidden">
      <div class="flex flex-col gap-6">
        <a href="palette.html" class="text-lg font-medium hover:text-emerald-500 transition-colors">Generator</a>
        <a href="pastel-color-palettes.html" class="text-lg font-medium hover:text-emerald-500 transition-colors">Explore Palettes</a>
        <a href="gradient.html" class="text-lg font-medium hover:text-emerald-500 transition-colors">Gradients</a>
        <a href="converter.html" class="text-lg font-medium hover:text-emerald-500 transition-colors">Converter</a>
        <hr class="border-slate-200 dark:border-slate-700 my-4">
        <a href="about.html" class="text-lg font-medium hover:text-emerald-500 transition-colors">About</a>
        <a href="contact.html" class="text-lg font-medium hover:text-emerald-500 transition-colors">Contact</a>
        <a href="palette.html" class="btn-primary text-center mt-4">
          <i class="fas fa-palette"></i>
          Create Free Palette
        </a>
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
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <!-- Product -->
          <div>
            <h3 class="font-bold text-sm uppercase tracking-wider text-slate-500 mb-4">Product</h3>
            <ul class="space-y-3">
              <li><a href="palette.html" class="hover:text-emerald-500 transition-colors">Palette Generator</a></li>
              <li><a href="gradient.html" class="hover:text-emerald-500 transition-colors">Gradient Builder</a></li>
              <li><a href="converter.html" class="hover:text-emerald-500 transition-colors">Color Converter</a></li>
              <li><a href="pastel-color-palettes.html" class="hover:text-emerald-500 transition-colors">Browse Palettes</a></li>
            </ul>
          </div>
          
          <!-- Resources -->
          <div>
            <h3 class="font-bold text-sm uppercase tracking-wider text-slate-500 mb-4">Resources</h3>
            <ul class="space-y-3">
              <li><a href="about.html" class="hover:text-emerald-500 transition-colors">About Us</a></li>
              <li><a href="contact.html" class="hover:text-emerald-500 transition-colors">Contact</a></li>
              <li><a href="#" class="hover:text-emerald-500 transition-colors">Blog</a></li>
              <li><a href="#" class="hover:text-emerald-500 transition-colors">Tutorials</a></li>
            </ul>
          </div>
          
          <!-- Legal -->
          <div>
            <h3 class="font-bold text-sm uppercase tracking-wider text-slate-500 mb-4">Legal</h3>
            <ul class="space-y-3">
              <li><a href="privacy-policy.html" class="hover:text-emerald-500 transition-colors">Privacy Policy</a></li>
              <li><a href="terms.html" class="hover:text-emerald-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" class="hover:text-emerald-500 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
          
          <!-- Newsletter -->
          <div>
            <h3 class="font-bold text-sm uppercase tracking-wider text-slate-500 mb-4">Stay Updated</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Get the latest color trends and updates.</p>
            <form class="flex gap-2" onsubmit="event.preventDefault(); Toast.show('Thanks for subscribing!');">
              <input type="email" placeholder="Your email" class="input-field text-sm flex-1" required>
              <button type="submit" class="btn-primary text-sm px-4">
                <i class="fas fa-arrow-right"></i>
              </button>
            </form>
          </div>
        </div>
        
        <div class="border-t border-slate-200 dark:border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <a href="index.html" class="flex items-center gap-2 group">
            <div class="flex items-center gap-3 group cursor-pointer">
              <div class="w-8 h-8 rounded-xl bg-black
                flex items-center justify-center text-cyan-400 font-bold text-xl
                shadow-[0_0_15px_rgba(34,211,238,0.6)]
                transition group-hover:shadow-[0_0_25px_rgba(34,211,238,1)]">🎨
              </div>
              <span class="text-2xl font-bold text-cyan-400">
                Color Palettes
              </span>
            </div>
          </a>
          <p class="text-sm text-slate-500">
            &copy; ${new Date().getFullYear()} ColorPallates. All rights reserved.
          </p>
          <div class="flex items-center gap-4">
            <a href="#" class="text-slate-400 hover:text-emerald-500 transition-colors" aria-label="Twitter">
              <i class="fab fa-twitter text-xl"></i>
            </a>
            <a href="https://github.com/ashishkekan" class="text-slate-400 hover:text-emerald-500 transition-colors" aria-label="GitHub">
              <i class="fab fa-github text-xl"></i>
            </a>
            <a href="https://www.instagram.com/ashkingtechiez/" class="text-slate-400 hover:text-emerald-500 transition-colors" aria-label="Instagram">
              <i class="fab fa-instagram text-xl"></i>
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

// ==========================================
// Initialize Everything
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme
  ThemeManager.init();
  
  // Initialize toast
  Toast.init();
  
  // Render navbar and footer
  renderNavbar();
  renderFooter();
  
  // Initialize navbar
  Navbar.init();
  
  // Initialize keyboard shortcuts
  KeyboardShortcuts.init();
  
  // Theme toggle button
  document.addEventListener('click', (e) => {
    if (e.target.closest('#theme-toggle')) {
      ThemeManager.toggle();
    }
  });
  
  console.log('ColorPallates initialized successfully');
});

// Export utilities for use in other scripts
window.ColorPallates = {
  ThemeManager,
  Toast,
  ColorUtils,
  Clipboard,
  Storage,
  KeyboardShortcuts
};