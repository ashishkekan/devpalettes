// image-compressor.js

(function () {
  'use strict';

  // ─── DOM Elements ───
  var dropZone = document.getElementById('drop-zone');
  var fileInput = document.getElementById('file-input');
  var dropContent = document.getElementById('drop-content');
  var dropLoaded = document.getElementById('drop-loaded');
  var dropThumb = document.getElementById('drop-thumb');
  var dropFilename = document.getElementById('drop-filename');
  var dropFilesize = document.getElementById('drop-filesize');
  var dropRemove = document.getElementById('drop-remove');

  var qualitySlider = document.getElementById('quality-slider');
  var qualityValue = document.getElementById('quality-value');
  var qualityBar = document.getElementById('quality-bar');
  var maxWidthInput = document.getElementById('max-width');
  var maxHeightInput = document.getElementById('max-height');

  var beforePlaceholder = document.getElementById('before-placeholder');
  var beforeImageWrap = document.getElementById('before-image-wrap');
  var beforeImage = document.getElementById('before-image');
  var afterPlaceholder = document.getElementById('after-placeholder');
  var afterImageWrap = document.getElementById('after-image-wrap');
  var afterImage = document.getElementById('after-image');
  var comparePlaceholder = document.getElementById('compare-placeholder');
  var compareWrap = document.getElementById('compare-wrap');
  var compareBefore = document.getElementById('compare-before');
  var compareAfter = document.getElementById('compare-after');

  var downloadBtn = document.getElementById('download-btn');
  var resetBtn = document.getElementById('reset-btn');

  var statOriginal = document.getElementById('stat-original');
  var statCompressed = document.getElementById('stat-compressed');
  var statPercent = document.getElementById('stat-percent');
  var statFormat = document.getElementById('stat-format');

  var infoName = document.getElementById('info-name');
  var infoOriginal = document.getElementById('info-original');
  var infoCompressed = document.getElementById('info-compressed');
  var infoSaved = document.getElementById('info-saved');
  var infoDimensions = document.getElementById('info-dimensions');
  var infoFormat = document.getElementById('info-format');

  var validationList = document.getElementById('validation-list');

  // ─── State ───
  var originalFile = null;
  var originalDataUrl = null;
  var compressedBlob = null;
  var compressedDataUrl = null;
  var originalWidth = 0;
  var originalHeight = 0;
  var outputFormat = 'jpeg';
  var debounceTimer = null;

  // ─── Presets ───
  var presets = {
    low: { quality: 90, format: 'jpeg' },
    medium: { quality: 70, format: 'jpeg' },
    high: { quality: 40, format: 'jpeg' },
    'webp-opt': { quality: 75, format: 'webp' }
  };

  // ─── Helpers ───
  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    var sizes = ['B', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(1024));
    var val = bytes / Math.pow(1024, i);
    return val.toFixed(i === 0 ? 0 : 1) + ' ' + sizes[i];
  }

  function getMimeType(format) {
    if (format === 'png') return 'image/png';
    if (format === 'webp') return 'image/webp';
    return 'image/jpeg';
  }

  function getExtension(format) {
    if (format === 'png') return '.png';
    if (format === 'webp') return '.webp';
    return '.jpg';
  }

  function getFormatLabel(format) {
    if (format === 'png') return 'PNG';
    if (format === 'webp') return 'WebP';
    return 'JPEG';
  }

  // ─── Validation ───
  function setCheck(key, passed) {
    var el = validationList.querySelector('[data-check="' + key + '"]');
    if (!el) return;
    var icon = el.querySelector('i');
    var text = el.querySelector('span');
    if (passed === true) {
      icon.className = 'fas fa-circle-check text-[10px] text-emerald-500';
      text.className = 'text-emerald-600 dark:text-emerald-400';
    } else if (passed === false) {
      icon.className = 'fas fa-circle-xmark text-[10px] text-red-400';
      text.className = 'text-red-400';
    } else {
      icon.className = 'fas fa-circle text-[8px] text-slate-300 dark:text-slate-600';
      text.className = 'text-slate-400';
    }
  }

  function resetChecks() {
    ['file-loaded', 'file-valid', 'file-size', 'compressed', 'size-reduced', 'ready-download'].forEach(function (k) {
      setCheck(k, null);
    });
  }

  // ─── File Handling ───
  function handleFile(file) {
    if (!file) return;

    // Validate type
    var validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (validTypes.indexOf(file.type) === -1) {
      showToast('Invalid format. Please use JPG, PNG, or WebP.', 'error');
      setCheck('file-valid', false);
      return;
    }

    // Validate size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      showToast('File too large. Maximum size is 20MB.', 'error');
      setCheck('file-size', false);
      return;
    }

    originalFile = file;
    setCheck('file-loaded', true);
    setCheck('file-valid', true);
    setCheck('file-size', true);

    // Update drop zone UI
    dropContent.classList.add('hidden');
    dropLoaded.classList.remove('hidden');
    dropFilename.textContent = file.name;
    dropFilesize.textContent = formatBytes(file.size);

    // Read file
    var reader = new FileReader();
    reader.onload = function (e) {
      originalDataUrl = e.target.result;

      // Set thumb
      dropThumb.src = originalDataUrl;

      // Set before preview
      beforePlaceholder.classList.add('hidden');
      beforeImageWrap.classList.remove('hidden');
      beforeImage.src = originalDataUrl;

      // Get dimensions
      var img = new Image();
      img.onload = function () {
        originalWidth = img.naturalWidth;
        originalHeight = img.naturalHeight;
        infoDimensions.textContent = originalWidth + ' × ' + originalHeight + ' px';
        infoDimensions.className = 'text-sm font-medium text-slate-700 dark:text-slate-300';
        compress();
      };
      img.src = originalDataUrl;

      // Update file info
      infoName.textContent = file.name;
      infoName.className = 'text-sm font-medium text-slate-700 dark:text-slate-300 truncate';
      infoOriginal.textContent = formatBytes(file.size);
      infoOriginal.className = 'text-sm font-medium text-slate-700 dark:text-slate-300';
      statOriginal.textContent = formatBytes(file.size);
      statOriginal.className = 'text-3xl font-bold text-slate-700 dark:text-slate-300';
    };
    reader.readAsDataURL(file);
  }

  // ─── Compression ───
  function compress() {
    if (!originalDataUrl) return;

    var quality = parseInt(qualitySlider.value, 10) / 100;
    var maxW = parseInt(maxWidthInput.value, 10) || 0;
    var maxH = parseInt(maxHeightInput.value, 10) || 0;
    var mimeType = getMimeType(outputFormat);

    var img = new Image();
    img.onload = function () {
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      var w = img.naturalWidth;
      var h = img.naturalHeight;

      // Resize if needed
      if (maxW > 0 && w > maxW) {
        var ratio = maxW / w;
        w = maxW;
        h = Math.round(h * ratio);
      }
      if (maxH > 0 && h > maxH) {
        var ratioH = maxH / h;
        h = maxH;
        w = Math.round(w * ratioH);
      }

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      // For PNG, quality param is ignored by toBlob but we pass it anyway
      var qualityParam = outputFormat === 'png' ? undefined : quality;

      canvas.toBlob(function (blob) {
        if (!blob) {
          showToast('Compression failed. Try a different format.', 'error');
          setCheck('compressed', false);
          return;
        }

        compressedBlob = blob;

        var urlReader = new FileReader();
        urlReader.onload = function (e) {
          compressedDataUrl = e.target.result;

          // Update after preview
          afterPlaceholder.classList.add('hidden');
          afterImageWrap.classList.remove('hidden');
          afterImage.src = compressedDataUrl;

          // Update compare
          comparePlaceholder.classList.add('hidden');
          compareWrap.classList.remove('hidden');
          compareBefore.src = originalDataUrl;
          compareAfter.src = compressedDataUrl;

          // Stats
          var originalSize = originalFile.size;
          var compressedSize = blob.size;
          var percentReduced = Math.max(0, ((originalSize - compressedSize) / originalSize) * 100);

          statCompressed.textContent = formatBytes(compressedSize);
          statCompressed.className = 'text-3xl font-bold ' + (compressedSize < originalSize ? 'text-emerald-500' : 'text-amber-500');

          statPercent.textContent = percentReduced.toFixed(1) + '%';
          statPercent.className = 'text-3xl font-bold ' + (percentReduced > 0 ? 'text-emerald-500' : 'text-amber-500');

          statFormat.textContent = getFormatLabel(outputFormat);
          statFormat.className = 'text-3xl font-bold text-blue-500';

          infoCompressed.textContent = formatBytes(compressedSize);
          infoCompressed.className = 'text-sm font-medium text-emerald-600 dark:text-emerald-400';

          var saved = originalSize - compressedSize;
          if (saved > 0) {
            infoSaved.textContent = '-' + formatBytes(saved);
            infoSaved.className = 'text-sm font-medium text-emerald-600 dark:text-emerald-400';
          } else {
            infoSaved.textContent = '+' + formatBytes(Math.abs(saved));
            infoSaved.className = 'text-sm font-medium text-amber-500';
          }

          if (maxW > 0 || maxH > 0) {
            infoDimensions.textContent = w + ' × ' + h + ' px (resized)';
          } else {
            infoDimensions.textContent = w + ' × ' + h + ' px';
          }
          infoFormat.textContent = getFormatLabel(outputFormat) + ' (' + Math.round(quality * 100) + '% quality)';
          infoFormat.className = 'text-sm font-medium text-blue-600 dark:text-blue-400';

          // Validation
          setCheck('compressed', true);
          setCheck('size-reduced', compressedSize < originalSize);
          setCheck('ready-download', true);

          // Enable download
          downloadBtn.disabled = false;
          downloadBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        };
        urlReader.readAsDataURL(blob);
      }, mimeType, qualityParam);
    };
    img.src = originalDataUrl;
  }

  function debouncedCompress() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(compress, 200);
  }

  // ─── Drag & Drop ───
  dropZone.addEventListener('dragover', function (e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('border-emerald-500', 'bg-emerald-500/5');
  });

  dropZone.addEventListener('dragleave', function (e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('border-emerald-500', 'bg-emerald-500/5');
  });

  dropZone.addEventListener('drop', function (e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('border-emerald-500', 'bg-emerald-500/5');
    var files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });

  fileInput.addEventListener('change', function () {
    if (this.files.length > 0) {
      handleFile(this.files[0]);
    }
  });

  // ─── Remove File ───
  dropRemove.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    resetAll();
  });

  // ─── Quality Slider ───
  qualitySlider.addEventListener('input', function () {
    var val = this.value;
    qualityValue.textContent = val + '%';
    qualityBar.style.width = val + '%';

    // Color the bar based on value
    if (val >= 70) {
      qualityBar.className = 'h-full rounded-full transition-all duration-300 bg-emerald-500';
    } else if (val >= 40) {
      qualityBar.className = 'h-full rounded-full transition-all duration-300 bg-amber-500';
    } else {
      qualityBar.className = 'h-full rounded-full transition-all duration-300 bg-red-500';
    }

    debouncedCompress();
  });

  // ─── Format Buttons ───
  document.querySelectorAll('.format-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      outputFormat = this.getAttribute('data-format');

      document.querySelectorAll('.format-btn').forEach(function (b) {
        b.className = 'format-btn px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-sm font-medium transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 text-slate-600 dark:text-slate-400';
      });
      this.className = 'format-btn active-format px-4 py-3 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 text-sm font-medium transition-all text-emerald-600 dark:text-emerald-400';

      debouncedCompress();
    });
  });

  // ─── Max Width / Height ───
  maxWidthInput.addEventListener('input', debouncedCompress);
  maxHeightInput.addEventListener('input', debouncedCompress);

  // ─── Presets ───
  document.querySelectorAll('.preset-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = this.getAttribute('data-preset');
      var preset = presets[key];
      if (!preset) return;

      qualitySlider.value = preset.quality;
      qualityValue.textContent = preset.quality + '%';
      qualityBar.style.width = preset.quality + '%';

      if (preset.quality >= 70) {
        qualityBar.className = 'h-full rounded-full transition-all duration-300 bg-emerald-500';
      } else if (preset.quality >= 40) {
        qualityBar.className = 'h-full rounded-full transition-all duration-300 bg-amber-500';
      } else {
        qualityBar.className = 'h-full rounded-full transition-all duration-300 bg-red-500';
      }

      // Set format
      outputFormat = preset.format;
      document.querySelectorAll('.format-btn').forEach(function (b) {
        b.className = 'format-btn px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-sm font-medium transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 text-slate-600 dark:text-slate-400';
        if (b.getAttribute('data-format') === preset.format) {
          b.className = 'format-btn active-format px-4 py-3 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 text-sm font-medium transition-all text-emerald-600 dark:text-emerald-400';
        }
      });

      debouncedCompress();
      showToast('Preset "' + key + '" applied', 'success');
    });
  });

  // ─── Preview Tabs ───
  document.querySelectorAll('.preview-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var view = this.getAttribute('data-view');

      document.querySelectorAll('.preview-tab').forEach(function (t) {
        t.className = 'preview-tab px-3 py-1.5 rounded-lg text-xs font-medium border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 transition-all hover:border-emerald-500/50';
      });
      this.className = 'preview-tab active-tab px-3 py-1.5 rounded-lg text-xs font-medium border-2 border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-all';

      document.getElementById('view-before').classList.toggle('hidden', view !== 'before');
      document.getElementById('view-after').classList.toggle('hidden', view !== 'after');
      document.getElementById('view-compare').classList.toggle('hidden', view !== 'compare');
    });
  });

  // ─── Download ───
  downloadBtn.addEventListener('click', function () {
    if (!compressedBlob) return;

    var baseName = originalFile.name.replace(/\.[^.]+$/, '');
    var ext = getExtension(outputFormat);
    var fileName = baseName + '-compressed' + ext;

    var url = URL.createObjectURL(compressedBlob);
    var a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Image downloaded: ' + fileName, 'success');
  });

  // ─── Reset ───
  function resetAll() {
    originalFile = null;
    originalDataUrl = null;
    compressedBlob = null;
    compressedDataUrl = null;
    originalWidth = 0;
    originalHeight = 0;

    fileInput.value = '';
    qualitySlider.value = 75;
    qualityValue.textContent = '75%';
    qualityBar.style.width = '75%';
    qualityBar.className = 'h-full rounded-full transition-all duration-300 bg-emerald-500';
    maxWidthInput.value = '';
    maxHeightInput.value = '';
    outputFormat = 'jpeg';

    // Reset format buttons
    document.querySelectorAll('.format-btn').forEach(function (b) {
      b.className = 'format-btn px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-sm font-medium transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 text-slate-600 dark:text-slate-400';
      if (b.getAttribute('data-format') === 'jpeg') {
        b.className = 'format-btn active-format px-4 py-3 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 text-sm font-medium transition-all text-emerald-600 dark:text-emerald-400';
      }
    });

    // Reset drop zone
    dropContent.classList.remove('hidden');
    dropLoaded.classList.add('hidden');
    dropThumb.src = '';

    // Reset previews
    beforePlaceholder.classList.remove('hidden');
    beforeImageWrap.classList.add('hidden');
    beforeImage.src = '';
    afterPlaceholder.classList.remove('hidden');
    afterImageWrap.classList.add('hidden');
    afterImage.src = '';
    comparePlaceholder.classList.remove('hidden');
    compareWrap.classList.add('hidden');
    compareBefore.src = '';
    compareAfter.src = '';

    // Reset stats
    statOriginal.textContent = '—';
    statOriginal.className = 'text-3xl font-bold text-slate-400';
    statCompressed.textContent = '—';
    statCompressed.className = 'text-3xl font-bold text-slate-400';
    statPercent.textContent = '—';
    statPercent.className = 'text-3xl font-bold text-slate-400';
    statFormat.textContent = '—';
    statFormat.className = 'text-3xl font-bold text-slate-400';

    // Reset file info
    infoName.textContent = '—';
    infoName.className = 'text-sm font-medium text-slate-400';
    infoOriginal.textContent = '—';
    infoOriginal.className = 'text-sm font-medium text-slate-400';
    infoCompressed.textContent = '—';
    infoCompressed.className = 'text-sm font-medium text-slate-400';
    infoSaved.textContent = '—';
    infoSaved.className = 'text-sm font-medium text-slate-400';
    infoDimensions.textContent = '—';
    infoDimensions.className = 'text-sm font-medium text-slate-400';
    infoFormat.textContent = '—';
    infoFormat.className = 'text-sm font-medium text-slate-400';

    // Disable download
    downloadBtn.disabled = true;
    downloadBtn.classList.add('opacity-50', 'cursor-not-allowed');

    // Reset validation
    resetChecks();
  }

  resetBtn.addEventListener('click', function () {
    resetAll();
    showToast('All settings reset', 'info');
  });

  // ─── Toast Helper ───
  function showToast(message, type) {
    var container = document.getElementById('toast-container');
    var toast = document.createElement('div');
    var iconClass = 'fas fa-circle-check text-emerald-500';
    var borderClass = 'border-emerald-500/30';
    if (type === 'error') {
      iconClass = 'fas fa-circle-xmark text-red-400';
      borderClass = 'border-red-400/30';
    } else if (type === 'info') {
      iconClass = 'fas fa-circle-info text-blue-400';
      borderClass = 'border-blue-400/30';
    }
    toast.className = 'flex items-center gap-3 px-5 py-3 rounded-xl border ' + borderClass + ' bg-white dark:bg-slate-800 shadow-lg text-sm transform translate-x-full transition-transform duration-300';
    toast.innerHTML = '<i class="' + iconClass + '"></i><span class="text-slate-700 dark:text-slate-200">' + message + '</span>';
    container.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.remove('translate-x-full');
      toast.classList.add('translate-x-0');
    });

    setTimeout(function () {
      toast.classList.remove('translate-x-0');
      toast.classList.add('translate-x-full');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 2500);
  }

})();
