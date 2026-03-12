/**
 * Color Blindness Simulator
 * ColorPalettesHub.com
 * 
 * Uses Brettel, Viénot, Mollon algorithm for accurate simulation
 */

(function() {
  'use strict';
  
  // ========== Color Space Transformations ==========
  const ColorTransform = {
    // sRGB to linear RGB
    srgbToLinear(c) {
      c = c / 255;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    },
    
    // Linear RGB to sRGB
    linearToSrgb(c) {
      c = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1/2.4) - 0.055;
      return Math.round(Math.max(0, Math.min(255, c * 255)));
    },
    
    // RGB to LMS (Long, Medium, Short - cone responses)
    rgbToLms(r, g, b) {
      // Convert to linear RGB first
      const rLin = this.srgbToLinear(r);
      const gLin = this.srgbToLinear(g);
      const bLin = this.srgbToLinear(b);
      
      // Transform to LMS using Hunt-Pointer-Estevez matrix
      return {
        l: 0.38971 * rLin + 0.68898 * gLin + -0.07868 * bLin,
        m: -0.22981 * rLin + 1.18340 * gLin + 0.04641 * bLin,
        s: 0.00000 * rLin + 0.00000 * gLin + 1.00000 * bLin
      };
    },
    
    // LMS to RGB
    lmsToRgb(l, m, s) {
      // Inverse of Hunt-Pointer-Estevez matrix
      const rLin = 1.91020 * l + -1.11212 * m + 0.20191 * s;
      const gLin = 0.37095 * l + 0.62905 * m + 0.00000 * s;
      const bLin = 0.00000 * l + 0.00000 * m + 1.00000 * s;
      
      return {
        r: this.linearToSrgb(rLin),
        g: this.linearToSrgb(gLin),
        b: this.linearToSrgb(bLin)
      };
    }
  };
  
  // ========== Color Blindness Simulations ==========
  const ColorBlindness = {
    // Severity levels (0 = normal, 1 = complete)
    severity: 1,
    
    setSeverity(value) {
      this.severity = value;
    },
    
    /**
     * Protanopia simulation (no L-cones)
     * Red appears as dark
     */
    protanopia(r, g, b) {
      const lms = ColorTransform.rgbToLms(r, g, b);
      
      // Simulate missing L-cone by projecting onto M-cone axis
      // Using Brettel, Viénot, Mollon algorithm
      const lSim = 2.02344 * lms.m - 1.08820 * lms.s;
      const mSim = lms.m;
      const sSim = lms.s;
      
      // Apply severity
      const lFinal = lms.l + this.severity * (lSim - lms.l);
      
      return ColorTransform.lmsToRgb(lFinal, mSim, sSim);
    },
    
    /**
     * Deuteranopia simulation (no M-cones)
     * Most common form - green appears brown
     */
    deuteranopia(r, g, b) {
      const lms = ColorTransform.rgbToLms(r, g, b);
      
      // Simulate missing M-cone by projecting onto L-cone axis
      const lSim = lms.l;
      const mSim = 0.49421 * lms.l + 0.50579 * lms.s;
      const sSim = lms.s;
      
      // Apply severity
      const mFinal = lms.m + this.severity * (mSim - lms.m);
      
      return ColorTransform.lmsToRgb(lSim, mFinal, sSim);
    },
    
    /**
     * Tritanopia simulation (no S-cones)
     * Blue appears greenish
     */
    tritanopia(r, g, b) {
      const lms = ColorTransform.rgbToLms(r, g, b);
      
      // Simulate missing S-cone
      const lSim = lms.l;
      const mSim = lms.m;
      const sSim = -0.39591 * lms.l + 0.80111 * lms.m;
      
      // Apply severity
      const sFinal = lms.s + this.severity * (sSim - lms.s);
      
      return ColorTransform.lmsToRgb(lSim, mSim, sFinal);
    },
    
    /**
     * Achromatopsia (complete color blindness - grayscale)
     */
    achromatopsia(r, g, b) {
      // Use luminance-based grayscale
      // BT.709 coefficients for HD
      const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      
      // Apply severity
      const finalGray = gray * this.severity + (0.299 * r + 0.587 * g + 0.114 * b) * (1 - this.severity);
      
      return {
        r: Math.round(finalGray),
        g: Math.round(finalGray),
        b: Math.round(finalGray)
      };
    }
  };
  
  // ========== Utility Functions ==========
  const Utils = {
    // Parse hex color
    hexToRgb(hex) {
      hex = hex.replace('#', '');
      if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
      }
      const num = parseInt(hex, 16);
      return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
      };
    },
    
    // RGB to hex
    rgbToHex(r, g, b) {
      return '#' + [r, g, b].map(x => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    },
    
    // Calculate relative luminance
    getLuminance(r, g, b) {
      const rLin = ColorTransform.srgbToLinear(r);
      const gLin = ColorTransform.srgbToLinear(g);
      const bLin = ColorTransform.srgbToLinear(b);
      return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
    },
    
    // Calculate contrast ratio
    getContrastRatio(color1, color2) {
      const l1 = this.getLuminance(color1.r, color1.g, color1.b);
      const l2 = this.getLuminance(color2.r, color2.g, color2.b);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    },
    
    // Random color
    randomColor() {
      const h = Math.random() * 360;
      const s = 40 + Math.random() * 40;
      const l = 30 + Math.random() * 40;
      return this.hslToHex(h, s, l);
    },
    
    // HSL to Hex
    hslToHex(h, s, l) {
      s /= 100;
      l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    }
  };
  
  // ========== Main Application ==========
  class ColorBlindnessSimulator {
    constructor() {
      this.colors = ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'];
      this.severity = 1;
      
      this.initElements();
      this.bindEvents();
      this.updateAllSimulations();
    }
    
    initElements() {
      this.colorInputs = document.querySelectorAll('.color-input');
      this.simulateBtn = document.getElementById('simulate-btn');
      this.randomBtn = document.getElementById('random-palette-btn');
      this.exampleBtn = document.getElementById('load-example-btn');
      this.severityBtns = document.querySelectorAll('.severity-btn');
      this.comparisonTable = document.getElementById('comparison-table');
      
      // Contrast checker
      this.contrastFgInput = document.getElementById('contrast-fg-input');
      this.contrastBgInput = document.getElementById('contrast-bg-input');
    }
    
    bindEvents() {
      // Color inputs
      this.colorInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
          const value = e.target.value.trim();
          if (/^#?[0-9A-Fa-f]{3,6}$/.test(value)) {
            const hex = value.startsWith('#') ? value : '#' + value;
            this.colors[index] = hex;
            this.updateInputPreview(input, hex);
          }
        });
        
        input.addEventListener('blur', () => {
          input.value = this.colors[index];
          this.updateInputPreview(input, this.colors[index]);
        });
      });
      
      // Simulate button
      this.simulateBtn.addEventListener('click', () => this.updateAllSimulations());
      
      // Random palette
      this.randomBtn.addEventListener('click', () => this.generateRandomPalette());
      
      // Example palettes
      this.exampleBtn.addEventListener('click', () => this.loadExample());
      
      // Severity buttons
      this.severityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          this.severityBtns.forEach(b => {
            b.classList.remove('border-emerald-500', 'bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400');
            b.classList.add('border-slate-200', 'dark:border-slate-700', 'text-slate-600', 'dark:text-slate-400');
          });
          btn.classList.add('border-emerald-500', 'bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400');
          btn.classList.remove('border-slate-200', 'dark:border-slate-700', 'text-slate-600', 'dark:text-slate-400');
          
          const severity = btn.dataset.severity;
          this.setSeverity(severity);
        });
      });
      
      // Contrast checker
      this.contrastFgInput.addEventListener('input', () => this.updateContrast());
      this.contrastBgInput.addEventListener('input', () => this.updateContrast());
    }
    
    updateInputPreview(input, hex) {
      const preview = input.parentElement.querySelector('.color-input-preview');
      if (preview) {
        preview.style.backgroundColor = hex;
      }
    }
    
    setSeverity(level) {
      const severityMap = {
        'normal': 0,
        'mild': 0.3,
        'moderate': 0.5,
        'severe': 1
      };
      this.severity = severityMap[level] || 1;
      ColorBlindness.setSeverity(this.severity);
      this.updateAllSimulations();
    }
    
    updateAllSimulations() {
      // Update input values
      this.colorInputs.forEach((input, index) => {
        input.value = this.colors[index];
        this.updateInputPreview(input, this.colors[index]);
      });
      
      // Update simulation previews
      this.updateSimulationPreview('sim-normal', this.colors, null);
      this.updateSimulationPreview('sim-protanopia', this.colors, 'protanopia');
      this.updateSimulationPreview('sim-deuteranopia', this.colors, 'deuteranopia');
      this.updateSimulationPreview('sim-tritanopia', this.colors, 'tritanopia');
      this.updateSimulationPreview('sim-achromatopsia', this.colors, 'achromatopsia');
      
      // Update comparison table
      this.updateComparisonTable();
      
      // Update contrast checker
      this.updateContrast();
    }
    
    updateSimulationPreview(elementId, colors, type) {
      const element = document.getElementById(elementId);
      if (!element) return;
      
      const simulatedColors = colors.map(hex => {
        const rgb = Utils.hexToRgb(hex);
        let simRgb;
        
        switch(type) {
          case 'protanopia':
            simRgb = ColorBlindness.protanopia(rgb.r, rgb.g, rgb.b);
            break;
          case 'deuteranopia':
            simRgb = ColorBlindness.deuteranopia(rgb.r, rgb.g, rgb.b);
            break;
          case 'tritanopia':
            simRgb = ColorBlindness.tritanopia(rgb.r, rgb.g, rgb.b);
            break;
          case 'achromatopsia':
            simRgb = ColorBlindness.achromatopsia(rgb.r, rgb.g, rgb.b);
            break;
          default:
            simRgb = rgb;
        }
        
        return Utils.rgbToHex(simRgb.r, simRgb.g, simRgb.b);
      });
      
      element.style.background = `linear-gradient(135deg, ${simulatedColors.join(', ')})`;
    }
    
    updateComparisonTable() {
      const tbody = this.comparisonTable;
      tbody.innerHTML = '';
      
      this.colors.forEach(color => {
        const rgb = Utils.hexToRgb(color);
        
        const protRgb = ColorBlindness.protanopia(rgb.r, rgb.g, rgb.b);
        const deutRgb = ColorBlindness.deuteranopia(rgb.r, rgb.g, rgb.b);
        const tritRgb = ColorBlindness.tritanopia(rgb.r, rgb.g, rgb.b);
        const achroRgb = ColorBlindness.achromatopsia(rgb.r, rgb.g, rgb.b);
        
        const row = document.createElement('tr');
        row.className = 'border-b border-slate-100 dark:border-slate-800';
        row.innerHTML = `
          <td class="py-3 px-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg shadow-inner" style="background-color: ${color}"></div>
              <span class="font-mono text-sm">${color}</span>
            </div>
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg shadow-inner" style="background-color: ${Utils.rgbToHex(protRgb.r, protRgb.g, protRgb.b)}"></div>
              <span class="font-mono text-sm text-slate-500">${Utils.rgbToHex(protRgb.r, protRgb.g, protRgb.b)}</span>
            </div>
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg shadow-inner" style="background-color: ${Utils.rgbToHex(deutRgb.r, deutRgb.g, deutRgb.b)}"></div>
              <span class="font-mono text-sm text-slate-500">${Utils.rgbToHex(deutRgb.r, deutRgb.g, deutRgb.b)}</span>
            </div>
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg shadow-inner" style="background-color: ${Utils.rgbToHex(tritRgb.r, tritRgb.g, tritRgb.b)}"></div>
              <span class="font-mono text-sm text-slate-500">${Utils.rgbToHex(tritRgb.r, tritRgb.g, tritRgb.b)}</span>
            </div>
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg shadow-inner" style="background-color: ${Utils.rgbToHex(achroRgb.r, achroRgb.g, achroRgb.b)}"></div>
              <span class="font-mono text-sm text-slate-500">${Utils.rgbToHex(achroRgb.r, achroRgb.g, achroRgb.b)}</span>
            </div>
          </td>
        `;
        tbody.appendChild(row);
      });
    }
    
    updateContrast() {
      const fgHex = this.contrastFgInput.value.trim() || '#264653';
      const bgHex = this.contrastBgInput.value.trim() || '#ffffff';
      
      const fgRgb = Utils.hexToRgb(fgHex.replace('#', ''));
      const bgRgb = Utils.hexToRgb(bgHex.replace('#', ''));
      
      // Update preview boxes
      document.getElementById('contrast-fg').style.backgroundColor = fgHex;
      document.getElementById('contrast-bg').style.backgroundColor = bgHex;
      
      // Calculate contrast
      const ratio = Utils.getContrastRatio(fgRgb, bgRgb);
      document.getElementById('contrast-ratio').textContent = ratio.toFixed(2) + ':1';
      
      // WCAG checks
      const passesAA = ratio >= 4.5;
      const passesAAA = ratio >= 7;
      
      const wcagBadge = document.getElementById('wcag-badge');
      const wcagAA = document.getElementById('wcag-aa');
      const wcagAAA = document.getElementById('wcag-aaa');
      
      if (passesAAA) {
        wcagBadge.textContent = 'AAA Pass';
        wcagBadge.className = 'text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
        wcagAA.className = 'fas fa-check-circle text-emerald-500';
        wcagAAA.className = 'fas fa-check-circle text-emerald-500';
      } else if (passesAA) {
        wcagBadge.textContent = 'AA Pass';
        wcagBadge.className = 'text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400';
        wcagAA.className = 'fas fa-check-circle text-emerald-500';
        wcagAAA.className = 'fas fa-times-circle text-red-500';
      } else {
        wcagBadge.textContent = 'Fail';
        wcagBadge.className = 'text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400';
        wcagAA.className = 'fas fa-times-circle text-red-500';
        wcagAAA.className = 'fas fa-times-circle text-red-500';
      }
    }
    
    generateRandomPalette() {
      this.colors = [];
      for (let i = 0; i < 5; i++) {
        this.colors.push(Utils.randomColor());
      }
      this.updateAllSimulations();
      this.showToast('Random palette generated!', 'success');
    }
    
    loadExample() {
      const examples = [
        ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'], // Earthy Sunset
        ['#003049', '#d62828', '#f77f00', '#fcbf49', '#eae2b7'], // Vibrant Retro
        ['#606c38', '#283618', '#fefae0', '#dda15e', '#bc6c25'], // Forest Glow
        ['#0d1b2a', '#1b263b', '#415a77', '#778da9', '#e0e1dd'], // Ocean Depth
        ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff'], // Neon Pop
        ['#f72585', '#7209b7', '#3a0ca3', '#4361ee', '#4cc9f0']  // Purple Dreams
      ];
      
      this.colors = examples[Math.floor(Math.random() * examples.length)];
      this.updateAllSimulations();
      this.showToast('Example palette loaded!', 'success');
    }
    
    showToast(message, type = 'info') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      
      const bgColor = type === 'success' ? 'bg-emerald-500' : 
                      type === 'error' ? 'bg-red-500' : 'bg-blue-500';
      
      toast.className = `${bgColor} text-white px-6 py-3 rounded-xl shadow-lg transform transition-all duration-300 translate-x-full`;
      toast.innerHTML = `
        <div class="flex items-center gap-3">
          <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
          <span>${message}</span>
        </div>
      `;
      
      container.appendChild(toast);
      
      requestAnimationFrame(() => {
        toast.classList.remove('translate-x-full');
      });
      
      setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
  }
  
  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    new ColorBlindnessSimulator();
  });
})();
