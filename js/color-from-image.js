/**
 * Color From Image - Image Color Extraction Tool
 * Devpalettes.com
 */

(function() {
  'use strict';
  
  // Get global utilities (Same as gradient.js)
  const { Toast, Clipboard } = window.Devpalettes || {};
  
  // ========== Color Extraction Algorithms ==========
  const ColorExtractor = {
    /**
     * Extract dominant colors using quantization
     */
    extractDominantColors(imageData, colorCount) {
      const pixels = this.getPixels(imageData);
      const colors = this.quantize(pixels, colorCount);
      return colors.sort((a, b) => b.count - a.count).slice(0, colorCount);
    },
    
    /**
     * Extract vibrant colors
     */
    extractVibrantColors(imageData, colorCount) {
      const pixels = this.getPixels(imageData);
      const vibrantPixels = pixels.filter(p => {
        const hsl = this.rgbToHsl(p.r, p.g, p.b);
        return hsl.s > 30 && hsl.l > 20 && hsl.l < 80;
      });
      
      const colors = this.quantize(vibrantPixels.length > 0 ? vibrantPixels : pixels, colorCount);
      
      // Sort by saturation
      return colors.sort((a, b) => {
        const hslA = this.rgbToHsl(a.r, a.g, a.b);
        const hslB = this.rgbToHsl(b.r, b.g, b.b);
        return hslB.s - hslA.s;
      }).slice(0, colorCount);
    },
    
    /**
     * Get pixel data from ImageData
     */
    getPixels(imageData) {
      const pixels = [];
      const data = imageData.data;
      const step = Math.max(1, Math.floor(data.length / 4 / 10000)); // Sample for performance
      
      for (let i = 0; i < data.length; i += 4 * step) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        // Skip transparent and near-white/black pixels
        if (a < 128) continue;
        const brightness = (r + g + b) / 3;
        if (brightness < 15 || brightness > 240) continue;
        
        pixels.push({ r, g, b });
      }
      
      return pixels;
    },
    
    /**
     * Color quantization using median cut
     */
    quantize(pixels, colorCount) {
      if (pixels.length === 0) return [];
      
      let boxes = [pixels];
      
      while (boxes.length < colorCount) {
        // Find the box with the largest range
        let maxRange = -1;
        let maxIndex = 0;
        let maxChannel = 0;
        
        boxes.forEach((box, index) => {
          if (box.length < 2) return;
          
          ['r', 'g', 'b'].forEach(channel => {
            const values = box.map(p => p[channel]);
            const range = Math.max(...values) - Math.min(...values);
            if (range > maxRange) {
              maxRange = range;
              maxIndex = index;
              maxChannel = channel;
            }
          });
        });
        
        if (maxRange <= 0) break;
        
        // Split the box
        const box = boxes[maxIndex];
        box.sort((a, b) => a[maxChannel] - b[maxChannel]);
        const mid = Math.floor(box.length / 2);
        
        boxes.splice(maxIndex, 1, box.slice(0, mid), box.slice(mid));
      }
      
      // Calculate average color for each box
      return boxes.map(box => {
        if (box.length === 0) return null;
        
        const avg = box.reduce((acc, p) => ({
          r: acc.r + p.r,
          g: acc.g + p.g,
          b: acc.b + p.b
        }), { r: 0, g: 0, b: 0 });
        
        return {
          r: Math.round(avg.r / box.length),
          g: Math.round(avg.g / box.length),
          b: Math.round(avg.b / box.length),
          count: box.length
        };
      }).filter(c => c !== null);
    },
    
    /**
     * RGB to HSL conversion
     */
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
    
    /**
     * RGB to HEX
     */
    rgbToHex(r, g, b) {
      return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    }
  };
  
  // ========== UI Controller ==========
  class ImageColorTool {
    constructor() {
      this.imageData = null;
      this.extractedColors = [];
      this.pickedColors = [];
      this.extractionMethod = 'dominant';
      this.colorCount = 6;
      this.currentImage = null;
      
      this.initElements();
      this.bindEvents();
    }
    
    initElements() {
      // Upload elements
      this.dropZone = document.getElementById('drop-zone');
      this.fileInput = document.getElementById('file-input');
      this.uploadContent = document.getElementById('upload-content');
      this.previewContent = document.getElementById('preview-content');
      this.imagePreview = document.getElementById('image-preview');
      
      // Controls
      this.colorCountSlider = document.getElementById('color-count');
      this.colorCountValue = document.getElementById('color-count-value');
      this.methodButtons = document.querySelectorAll('.method-btn');
      this.extractBtn = document.getElementById('extract-btn');
      
      // Results
      this.emptyState = document.getElementById('empty-state');
      this.resultsContainer = document.getElementById('results-container');
      this.colorSwatches = document.getElementById('color-swatches');
      this.selectedColorInfo = document.getElementById('selected-color-info');
      
      // Picker
      this.pickerContainer = document.getElementById('picker-container');
      this.pickerPlaceholder = document.getElementById('picker-placeholder');
      this.pickerCanvas = document.getElementById('picker-canvas');
      this.pickedColorsContainer = document.getElementById('picked-colors');
      
      // Sample buttons
      this.sampleButtons = document.querySelectorAll('.sample-btn');
    }
    
    bindEvents() {
      // Drag and drop
      this.dropZone.addEventListener('click', () => this.fileInput.click());
      this.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.dropZone.classList.add('dragover');
      });
      this.dropZone.addEventListener('dragleave', () => {
        this.dropZone.classList.remove('dragover');
      });
      this.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        this.dropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
          this.handleFile(file);
        }
      });
      
      // File input
      this.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) this.handleFile(file);
      });
      
      // Color count slider
      this.colorCountSlider.addEventListener('input', (e) => {
        this.colorCount = parseInt(e.target.value);
        this.colorCountValue.textContent = this.colorCount;
      });
      
      // Method buttons
      this.methodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          this.methodButtons.forEach(b => {
            b.classList.remove('active', 'border-emerald-500', 'bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400');
            b.classList.add('border-slate-200', 'dark:border-slate-700', 'text-slate-600', 'dark:text-slate-400');
          });
          btn.classList.add('active', 'border-emerald-500', 'bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400');
          btn.classList.remove('border-slate-200', 'dark:border-slate-700', 'text-slate-600', 'dark:text-slate-400');
          this.extractionMethod = btn.dataset.method;
        });
      });
      
      // Extract button
      this.extractBtn.addEventListener('click', () => this.extractColors());
      
      // Sample images
      this.sampleButtons.forEach(btn => {
        btn.addEventListener('click', () => this.loadSampleImage(btn.dataset.sample));
      });
      
      // Picker canvas
      this.pickerCanvas.addEventListener('click', (e) => this.pickColor(e));
      
      // Clear picked colors
      document.getElementById('clear-picked-btn').addEventListener('click', () => {
        this.pickedColors = [];
        this.renderPickedColors();
      });
      
      // Copy all button
      document.getElementById('copy-all-btn').addEventListener('click', () => {
        const colors = this.extractedColors.map(c => c.hex).join(', ');
        this.copyToClipboard(colors, 'All colors copied!');
      });
      
      // Export CSS
      document.getElementById('export-css-btn').addEventListener('click', () => this.exportCSS());
      
      // Export JSON
      document.getElementById('export-json-btn').addEventListener('click', () => this.exportJSON());
      
      // Share buttons
      document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', () => this.sharePalette(btn.dataset.platform));
      });
    }
    
    handleFile(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.currentImage = new Image();
        this.currentImage.onload = () => {
          this.showPreview(e.target.result);
          this.setupPicker();
          this.extractBtn.disabled = false;
        };
        this.currentImage.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
    
    loadSampleImage(sample) {
      const sampleUrls = {
        sunset: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=800',
        forest: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        ocean: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800',
        city: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800'
      };
      
      this.currentImage = new Image();
      this.currentImage.crossOrigin = 'anonymous';
      this.currentImage.onload = () => {
        this.showPreview(sampleUrls[sample]);
        this.setupPicker();
        this.extractBtn.disabled = false;
      };
      this.currentImage.src = sampleUrls[sample];
    }
    
    showPreview(src) {
      this.imagePreview.src = src;
      this.uploadContent.classList.add('hidden');
      this.previewContent.classList.remove('hidden');
    }
    
    setupPicker() {
      if (!this.currentImage) return;
      
      const canvas = this.pickerCanvas;
      const ctx = canvas.getContext('2d');
      
      // Calculate dimensions
      const maxWidth = this.pickerContainer.clientWidth - 32;
      const maxHeight = 400;
      let width = this.currentImage.width;
      let height = this.currentImage.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(this.currentImage, 0, 0, width, height);
      
      this.pickerPlaceholder.classList.add('hidden');
      canvas.classList.remove('hidden');
    }
    
    extractColors() {
      if (!this.currentImage) return;
      
      // Create canvas for extraction
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Use smaller size for performance
      const maxSize = 200;
      let width = this.currentImage.width;
      let height = this.currentImage.height;
      
      if (width > height) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else {
        width = (width * maxSize) / height;
        height = maxSize;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(this.currentImage, 0, 0, width, height);
      
      const imageData = ctx.getImageData(0, 0, width, height);
      
      // Extract colors
      let colors;
      if (this.extractionMethod === 'vibrant') {
        colors = ColorExtractor.extractVibrantColors(imageData, this.colorCount);
      } else {
        colors = ColorExtractor.extractDominantColors(imageData, this.colorCount);
      }
      
      // Format colors
      this.extractedColors = colors.map(c => ({
        hex: ColorExtractor.rgbToHex(c.r, c.g, c.b),
        rgb: { r: c.r, g: c.g, b: c.b },
        hsl: ColorExtractor.rgbToHsl(c.r, c.g, c.b),
        count: c.count
      }));
      
      this.renderResults();
      
      // Use Global Toast
      if (Toast) Toast.show('Colors extracted successfully!', 'success');
    }
    
    renderResults() {
      this.emptyState.classList.add('hidden');
      this.resultsContainer.classList.remove('hidden');
      
      // Calculate grid columns based on count
      const cols = this.extractedColors.length <= 4 ? this.extractedColors.length : 
                   this.extractedColors.length <= 6 ? 3 : 4;
      
      this.colorSwatches.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      this.colorSwatches.innerHTML = '';
      
      this.extractedColors.forEach((color, index) => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch rounded-xl p-4 cursor-pointer text-center';
        swatch.style.backgroundColor = color.hex;
        swatch.style.color = this.getContrastColor(color.hex);
        swatch.innerHTML = `
          <p class="font-mono font-bold text-sm">${color.hex}</p>
          <p class="text-xs opacity-75 mt-1">${color.hsl.s}% saturation</p>
        `;
        
        swatch.addEventListener('click', () => this.selectColor(color));
        this.colorSwatches.appendChild(swatch);
      });
    }
    
    selectColor(color) {
      this.selectedColorInfo.classList.remove('hidden');
      
      document.getElementById('selected-color-preview').style.backgroundColor = color.hex;
      document.getElementById('selected-hex').textContent = color.hex.toUpperCase();
      document.getElementById('selected-rgb').textContent = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
      document.getElementById('selected-hsl').textContent = `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
      
      // Copy to clipboard using Global Clipboard utility
      this.copyToClipboard(color.hex, `${color.hex} copied!`);
    }
    
    pickColor(e) {
      const canvas = this.pickerCanvas;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
      const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
      
      const ctx = canvas.getContext('2d');
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      
      const color = {
        hex: ColorExtractor.rgbToHex(pixel[0], pixel[1], pixel[2]),
        rgb: { r: pixel[0], g: pixel[1], b: pixel[2] },
        hsl: ColorExtractor.rgbToHsl(pixel[0], pixel[1], pixel[2])
      };
      
      this.pickedColors.unshift(color);
      if (this.pickedColors.length > 12) this.pickedColors.pop();
      
      this.renderPickedColors();
      this.copyToClipboard(color.hex, `${color.hex} picked!`);
    }
    
    renderPickedColors() {
      if (this.pickedColors.length === 0) {
        this.pickedColorsContainer.innerHTML = '<p class="text-sm text-slate-500">Click on image to pick colors</p>';
        return;
      }
      
      this.pickedColorsContainer.innerHTML = this.pickedColors.map(color => `
        <div class="flex items-center gap-3 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors" onclick="if(window.Devpalettes && window.Devpalettes.Clipboard) window.Devpalettes.Clipboard.copy('${color.hex}', '${color.hex} copied!')">
          <div class="w-8 h-8 rounded-lg shadow-inner" style="background-color: ${color.hex}"></div>
          <div class="flex-1">
            <p class="font-mono text-sm font-semibold">${color.hex}</p>
            <p class="text-xs text-slate-500">rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})</p>
          </div>
          <i class="fas fa-copy text-slate-400"></i>
        </div>
      `).join('');
    }
    
    exportCSS() {
      const css = `:root {\n${this.extractedColors.map((c, i) => 
        `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`;
      this.copyToClipboard(css, 'CSS copied!');
    }
    
    exportJSON() {
      const json = JSON.stringify(this.extractedColors.map(c => ({
        hex: c.hex,
        rgb: c.rgb,
        hsl: c.hsl
      })), null, 2);
      this.copyToClipboard(json, 'JSON copied!');
    }
    
    sharePalette(platform) {
      const text = `Check out this color palette: ${this.extractedColors.map(c => c.hex).join(', ')}`;
      const url = window.location.href;
      
      const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`
      };
      
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
    
    getContrastColor(hex) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5 ? '#1e293b' : '#f8fafc';
    }
    
    // Updated to use Global Clipboard utility (Same as gradient.js)
    copyToClipboard(text, message) {
      if (Clipboard) {
        Clipboard.copy(text, message);
      } else {
        // Fallback if global utility not found
        navigator.clipboard.writeText(text).then(() => {
          if (Toast) Toast.show(message, 'success');
        });
      }
    }
  }
  
  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    new ImageColorTool();
  });
})();
