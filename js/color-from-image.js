/**
 * Color From Image - Image Color Extraction Tool
 * Devpalettes.com
 */

(function() {
  'use strict';
  
  var Toast = (window.Devpalettes && window.Devpalettes.Toast) ? window.Devpalettes.Toast : null;
  var Clipboard = (window.Devpalettes && window.Devpalettes.Clipboard) ? window.Devpalettes.Clipboard : null;
  
  // ========== Color Extraction Algorithms ==========
  var ColorExtractor = {
    extractDominantColors: function(imageData, colorCount) {
      var pixels = this.getPixels(imageData);
      var colors = this.quantize(pixels, colorCount);
      return colors.sort(function(a, b) { return b.count - a.count; }).slice(0, colorCount);
    },
    
    extractVibrantColors: function(imageData, colorCount) {
      var pixels = this.getPixels(imageData);
      var vibrantPixels = pixels.filter(function(p) {
        var hsl = ColorExtractor.rgbToHsl(p.r, p.g, p.b);
        return hsl.s > 30 && hsl.l > 20 && hsl.l < 80;
      });
      
      var colors = this.quantize(vibrantPixels.length > 0 ? vibrantPixels : pixels, colorCount);
      
      return colors.sort(function(a, b) {
        var hslA = ColorExtractor.rgbToHsl(a.r, a.g, a.b);
        var hslB = ColorExtractor.rgbToHsl(b.r, b.g, b.b);
        return hslB.s - hslA.s;
      }).slice(0, colorCount);
    },
    
    getPixels: function(imageData) {
      var pixels = [];
      var data = imageData.data;
      var step = Math.max(1, Math.floor(data.length / 4 / 10000));
      
      for (var i = 0; i < data.length; i += 4 * step) {
        var r = data[i];
        var g = data[i + 1];
        var b = data[i + 2];
        var a = data[i + 3];
        
        if (a < 128) continue;
        var brightness = (r + g + b) / 3;
        if (brightness < 15 || brightness > 240) continue;
        
        pixels.push({ r: r, g: g, b: b });
      }
      
      return pixels;
    },
    
    quantize: function(pixels, colorCount) {
      if (pixels.length === 0) return [];
      
      var boxes = [pixels];
      
      while (boxes.length < colorCount) {
        var maxRange = -1;
        var maxIndex = 0;
        var maxChannel = 'r';
        
        boxes.forEach(function(box, index) {
          if (box.length < 2) return;
          
          ['r', 'g', 'b'].forEach(function(channel) {
            var values = box.map(function(p) { return p[channel]; });
            var range = Math.max.apply(null, values) - Math.min.apply(null, values);
            if (range > maxRange) {
              maxRange = range;
              maxIndex = index;
              maxChannel = channel;
            }
          });
        });
        
        if (maxRange <= 0) break;
        
        var box = boxes[maxIndex];
        box.sort(function(a, b) { return a[maxChannel] - b[maxChannel]; });
        var mid = Math.floor(box.length / 2);
        
        boxes.splice(maxIndex, 1, box.slice(0, mid), box.slice(mid));
      }
      
      return boxes.map(function(box) {
        if (box.length === 0) return null;
        
        var avg = box.reduce(function(acc, p) {
          return { r: acc.r + p.r, g: acc.g + p.g, b: acc.b + p.b };
        }, { r: 0, g: 0, b: 0 });
        
        return {
          r: Math.round(avg.r / box.length),
          g: Math.round(avg.g / box.length),
          b: Math.round(avg.b / box.length),
          count: box.length
        };
      }).filter(function(c) { return c !== null; });
    },
    
    rgbToHsl: function(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      
      var max = Math.max(r, g, b);
      var min = Math.min(r, g, b);
      var h, s, l = (max + min) / 2;
      
      if (max === min) {
        h = s = 0;
      } else {
        var d = max - min;
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
    
    rgbToHex: function(r, g, b) {
      return '#' + [r, g, b].map(function(x) {
        var hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    }
  };
  
  // ========== UI Controller ==========
  var ImageColorTool = (function() {
    
    function ImageColorTool() {
      this.imageData = null;
      this.extractedColors = [];
      this.pickedColors = [];
      this.extractionMethod = 'dominant';
      this.colorCount = 6;
      this.currentImage = null;
      
      this.initElements();
      this.bindEvents();
    }
    
    ImageColorTool.prototype.initElements = function() {
      this.dropZone = document.getElementById('drop-zone');
      this.fileInput = document.getElementById('file-input');
      this.uploadContent = document.getElementById('upload-content');
      this.previewContent = document.getElementById('preview-content');
      this.imagePreview = document.getElementById('image-preview');
      
      this.colorCountSlider = document.getElementById('color-count');
      this.colorCountValue = document.getElementById('color-count-value');
      this.methodButtons = document.querySelectorAll('.method-btn');
      this.extractBtn = document.getElementById('extract-btn');
      
      this.emptyState = document.getElementById('empty-state');
      this.resultsContainer = document.getElementById('results-container');
      this.colorSwatches = document.getElementById('color-swatches');
      this.selectedColorInfo = document.getElementById('selected-color-info');
      
      this.pickerContainer = document.getElementById('picker-container');
      this.pickerPlaceholder = document.getElementById('picker-placeholder');
      this.pickerCanvas = document.getElementById('picker-canvas');
      this.pickedColorsContainer = document.getElementById('picked-colors');
      
      this.sampleButtons = document.querySelectorAll('.sample-btn');
      this.extractionAnnouncer = document.getElementById('extraction-announcer');
    };
    
    ImageColorTool.prototype.bindEvents = function() {
      var self = this;
      
      // Drop zone click
      this.dropZone.addEventListener('click', function() { self.fileInput.click(); });
      
      // Drop zone keyboard support
      this.dropZone.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          self.fileInput.click();
        }
      });
      
      // Drag and drop
      this.dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        self.dropZone.classList.add('dragover');
      });
      this.dropZone.addEventListener('dragleave', function() {
        self.dropZone.classList.remove('dragover');
      });
      this.dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        self.dropZone.classList.remove('dragover');
        var file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
          self.handleFile(file);
        }
      });
      
      // File input
      this.fileInput.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (file) self.handleFile(file);
      });
      
      // Color count slider
      this.colorCountSlider.addEventListener('input', function(e) {
        self.colorCount = parseInt(e.target.value);
        self.colorCountValue.textContent = self.colorCount;
      });
      
      // Method buttons
      this.methodButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
          self.methodButtons.forEach(function(b) {
            b.classList.remove('active', 'border-emerald-500', 'bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400');
            b.classList.add('border-slate-200', 'dark:border-slate-700', 'text-slate-600', 'dark:text-slate-400');
            b.setAttribute('aria-pressed', 'false');
          });
          btn.classList.add('active', 'border-emerald-500', 'bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400');
          btn.classList.remove('border-slate-200', 'dark:border-slate-700', 'text-slate-600', 'dark:text-slate-400');
          btn.setAttribute('aria-pressed', 'true');
          self.extractionMethod = btn.dataset.method;
        });
      });
      
      // Extract button
      this.extractBtn.addEventListener('click', function() { self.extractColors(); });
      
      // Sample images
      this.sampleButtons.forEach(function(btn) {
        btn.addEventListener('click', function() { self.loadSampleImage(btn.dataset.sample); });
      });
      
      // Picker canvas
      this.pickerCanvas.addEventListener('click', function(e) { self.pickColor(e); });
      
      // Clear picked colors
      document.getElementById('clear-picked-btn').addEventListener('click', function() {
        self.pickedColors = [];
        self.renderPickedColors();
        self.announce('All picked colors cleared');
      });
      
      // Copy all button
      document.getElementById('copy-all-btn').addEventListener('click', function() {
        var colors = self.extractedColors.map(function(c) { return c.hex; }).join(', ');
        self.copyToClipboard(colors, 'All colors copied!');
      });
      
      // Export CSS
      document.getElementById('export-css-btn').addEventListener('click', function() { self.exportCSS(); });
      
      // Export JSON
      document.getElementById('export-json-btn').addEventListener('click', function() { self.exportJSON(); });
      
      // Share buttons (event delegation)
      document.querySelectorAll('.share-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { self.sharePalette(btn.dataset.platform); });
      });
      
      // Picked colors event delegation (replaces inline onclick)
      this.pickedColorsContainer.addEventListener('click', function(e) {
        var item = e.target.closest('[data-picked-hex]');
        if (item) {
          var hex = item.getAttribute('data-picked-hex');
          self.copyToClipboard(hex, hex + ' copied!');
        }
      });
      
      // Copy link button
      var copyLinkBtn = document.getElementById('copy-link-btn');
      if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', function() {
          var url = window.location.href;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(function() {
              self.showToast('Link copied to clipboard!', 'success');
            });
          } else {
            var ta = document.createElement('textarea');
            ta.value = url;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); } catch(e) {}
            document.body.removeChild(ta);
            self.showToast('Link copied to clipboard!', 'success');
          }
        });
      }
    };
    
    ImageColorTool.prototype.handleFile = function(file) {
      var self = this;
      var reader = new FileReader();
      reader.onload = function(e) {
        self.currentImage = new Image();
        self.currentImage.onload = function() {
          self.showPreview(e.target.result);
          self.setupPicker();
          self.extractBtn.disabled = false;
        };
        self.currentImage.src = e.target.result;
      };
      reader.readAsDataURL(file);
    };
    
    ImageColorTool.prototype.loadSampleImage = function(sample) {
      var self = this;
      var sampleUrls = {
        sunset: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=800',
        forest: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        ocean: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800',
        city: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800'
      };
      
      this.currentImage = new Image();
      this.currentImage.crossOrigin = 'anonymous';
      this.currentImage.onload = function() {
        self.showPreview(sampleUrls[sample]);
        self.setupPicker();
        self.extractBtn.disabled = false;
      };
      this.currentImage.src = sampleUrls[sample];
    };
    
    ImageColorTool.prototype.showPreview = function(src) {
      this.imagePreview.src = src;
      this.uploadContent.classList.add('hidden');
      this.previewContent.classList.remove('hidden');
    };
    
    ImageColorTool.prototype.setupPicker = function() {
      if (!this.currentImage) return;
      
      var canvas = this.pickerCanvas;
      var ctx = canvas.getContext('2d');
      
      var maxWidth = this.pickerContainer.clientWidth - 32;
      var maxHeight = 400;
      var width = this.currentImage.width;
      var height = this.currentImage.height;
      
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
    };
    
    ImageColorTool.prototype.extractColors = function() {
      if (!this.currentImage) return;
      
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      
      var maxSize = 200;
      var width = this.currentImage.width;
      var height = this.currentImage.height;
      
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
      
      var imageData = ctx.getImageData(0, 0, width, height);
      
      var colors;
      if (this.extractionMethod === 'vibrant') {
        colors = ColorExtractor.extractVibrantColors(imageData, this.colorCount);
      } else {
        colors = ColorExtractor.extractDominantColors(imageData, this.colorCount);
      }
      
      this.extractedColors = colors.map(function(c) {
        return {
          hex: ColorExtractor.rgbToHex(c.r, c.g, c.b),
          rgb: { r: c.r, g: c.g, b: c.b },
          hsl: ColorExtractor.rgbToHsl(c.r, c.g, c.b),
          count: c.count
        };
      });
      
      this.renderResults();
      this.announce(this.extractedColors.length + ' colors extracted using ' + this.extractionMethod + ' method');
      
      if (Toast) Toast.show('Colors extracted successfully!', 'success');
    };
    
    ImageColorTool.prototype.renderResults = function() {
      this.emptyState.classList.add('hidden');
      this.resultsContainer.classList.remove('hidden');
      
      var cols = this.extractedColors.length <= 4 ? this.extractedColors.length : 
                 this.extractedColors.length <= 6 ? 3 : 4;
      
      this.colorSwatches.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
      this.colorSwatches.innerHTML = '';
      
      var self = this;
      
      this.extractedColors.forEach(function(color, index) {
        var swatch = document.createElement('div');
        swatch.setAttribute('role', 'listitem');
        swatch.setAttribute('tabindex', '0');
        swatch.setAttribute('aria-label', 'Color ' + color.hex.toUpperCase() + ', ' + color.hsl.s + '% saturation. Click to copy.');
        swatch.className = 'color-swatch rounded-xl p-4 cursor-pointer text-center transition-transform hover:scale-105';
        swatch.style.backgroundColor = color.hex;
        swatch.style.color = self.getContrastColor(color.hex);
        swatch.innerHTML =
          '<p class="font-mono font-bold text-sm">' + color.hex + '</p>' +
          '<p class="text-xs opacity-75 mt-1">' + color.hsl.s + '% saturation</p>';
        
        swatch.addEventListener('click', function() { self.selectColor(color); });
        swatch.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            self.selectColor(color);
          }
        });
        self.colorSwatches.appendChild(swatch);
      });
    };
    
    ImageColorTool.prototype.selectColor = function(color) {
      this.selectedColorInfo.classList.remove('hidden');
      
      document.getElementById('selected-color-preview').style.backgroundColor = color.hex;
      document.getElementById('selected-hex').textContent = color.hex.toUpperCase();
      document.getElementById('selected-rgb').textContent = 'rgb(' + color.rgb.r + ', ' + color.rgb.g + ', ' + color.rgb.b + ')';
      document.getElementById('selected-hsl').textContent = 'hsl(' + color.hsl.h + ', ' + color.hsl.s + '%, ' + color.hsl.l + '%)';
      
      this.copyToClipboard(color.hex, color.hex + ' copied!');
    };
    
    ImageColorTool.prototype.pickColor = function(e) {
      var canvas = this.pickerCanvas;
      var rect = canvas.getBoundingClientRect();
      var x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
      var y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
      
      var ctx = canvas.getContext('2d');
      var pixel = ctx.getImageData(x, y, 1, 1).data;
      
      var color = {
        hex: ColorExtractor.rgbToHex(pixel[0], pixel[1], pixel[2]),
        rgb: { r: pixel[0], g: pixel[1], b: pixel[2] },
        hsl: ColorExtractor.rgbToHsl(pixel[0], pixel[1], pixel[2])
      };
      
      this.pickedColors.unshift(color);
      if (this.pickedColors.length > 12) this.pickedColors.pop();
      
      this.renderPickedColors();
      this.copyToClipboard(color.hex, color.hex + ' picked!');
    };
    
    ImageColorTool.prototype.renderPickedColors = function() {
      if (this.pickedColors.length === 0) {
        this.pickedColorsContainer.innerHTML = '<p class="text-sm text-slate-500">Click on image to pick colors</p>';
        return;
      }
      
      this.pickedColorsContainer.innerHTML = this.pickedColors.map(function(color) {
        return '<div class="flex items-center gap-3 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors" role="listitem" tabindex="0" data-picked-hex="' + color.hex + '" aria-label="Picked color ' + color.hex + '. Click to copy.">' +
          '<div class="w-8 h-8 rounded-lg shadow-inner" style="background-color: ' + color.hex + '" aria-hidden="true"></div>' +
          '<div class="flex-1">' +
            '<p class="font-mono text-sm font-semibold">' + color.hex + '</p>' +
            '<p class="text-xs text-slate-500">rgb(' + color.rgb.r + ', ' + color.rgb.g + ', ' + color.rgb.b + ')</p>' +
          '</div>' +
          '<i class="fas fa-copy text-slate-400" aria-hidden="true"></i>' +
        '</div>';
      }).join('');
    };
    
    ImageColorTool.prototype.exportCSS = function() {
      var css = ':root {\n' + this.extractedColors.map(function(c, i) { 
        return '  --color-' + (i + 1) + ': ' + c.hex + ';';
      }).join('\n') + '\n}';
      this.copyToClipboard(css, 'CSS copied!');
    };
    
    ImageColorTool.prototype.exportJSON = function() {
      var json = JSON.stringify(this.extractedColors.map(function(c) {
        return { hex: c.hex, rgb: c.rgb, hsl: c.hsl };
      }), null, 2);
      this.copyToClipboard(json, 'JSON copied!');
    };
    
    ImageColorTool.prototype.sharePalette = function(platform) {
      var text = 'Check out this color palette: ' + this.extractedColors.map(function(c) { return c.hex; }).join(', ');
      var url = window.location.href;
      
      var shareUrls = {
        twitter: 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url),
        facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url),
        linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url),
        whatsapp: 'https://wa.me/?text=' + encodeURIComponent(text + ' ' + url),
        pinterest: 'https://pinterest.com/pin/create/button/?url=' + encodeURIComponent(url) + '&description=' + encodeURIComponent(text)
      };
      
      if (platform === 'copylink') {
        this.copyToClipboard(url, 'Link copied!');
        return;
      }
      
      if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      }
    };
    
    ImageColorTool.prototype.getContrastColor = function(hex) {
      var r = parseInt(hex.slice(1, 3), 16);
      var g = parseInt(hex.slice(3, 5), 16);
      var b = parseInt(hex.slice(5, 7), 16);
      var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5 ? '#1e293b' : '#f8fafc';
    };
    
    ImageColorTool.prototype.copyToClipboard = function(text, message) {
      var self = this;
      if (Clipboard) {
        Clipboard.copy(text, message);
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
          self.showToast(message, 'success');
        });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); self.showToast(message, 'success'); } catch(e) {}
        document.body.removeChild(ta);
      }
    };
    
    ImageColorTool.prototype.showToast = function(message, type) {
      if (Toast) {
        Toast.show(message, type);
      } else {
        var container = document.getElementById('toast-container');
        var toast = document.createElement('div');
        toast.setAttribute('role', 'status');
        var bgClass = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
        toast.className = bgClass + ' text-white px-6 py-3 rounded-xl shadow-lg transform transition-all duration-300';
        toast.innerHTML = '<span>' + message + '</span>';
        container.appendChild(toast);
        setTimeout(function() {
          toast.style.opacity = '0';
          setTimeout(function() { toast.remove(); }, 300);
        }, 3000);
      }
    };
    
    ImageColorTool.prototype.announce = function(message) {
      if (this.extractionAnnouncer) {
        this.extractionAnnouncer.textContent = message;
        var self = this;
        setTimeout(function() { self.extractionAnnouncer.textContent = ''; }, 3000);
      }
    };
    
    return ImageColorTool;
  })();
  
  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    new ImageColorTool();
  });
})();
