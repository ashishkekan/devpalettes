// pdf-compressor.js

(function () {
  'use strict';

  // ─── Check Dependencies ───
  if (typeof pdfjsLib === 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      var main = document.querySelector('main');
      if (main) {
        var errDiv = document.createElement('div');
        errDiv.className = 'max-w-7xl mx-auto px-4 py-8';
        errDiv.innerHTML = '<div class="glass-card p-8 text-center"><i class="fas fa-triangle-exclamation text-3xl text-red-400 mb-4"></i><h2 class="text-xl font-bold mb-2">Failed to Load PDF.js</h2><p class="text-slate-500 text-sm">The PDF rendering library could not be loaded. Please check your internet connection and refresh the page.</p></div>';
        main.prepend(errDiv);
      }
    });
    return;
  }

  if (typeof PDFLib === 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      var main = document.querySelector('main');
      if (main) {
        var errDiv = document.createElement('div');
        errDiv.className = 'max-w-7xl mx-auto px-4 py-8';
        errDiv.innerHTML = '<div class="glass-card p-8 text-center"><i class="fas fa-triangle-exclamation text-3xl text-red-400 mb-4"></i><h2 class="text-xl font-bold mb-2">Failed to Load pdf-lib</h2><p class="text-slate-500 text-sm">The PDF creation library could not be loaded. Please check your internet connection and refresh the page.</p></div>';
        main.prepend(errDiv);
      }
    });
    return;
  }

  // ─── Set PDF.js Worker ───
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  // ─── DOM Elements ───
  var dropZone = document.getElementById('drop-zone');
  var fileInput = document.getElementById('file-input');
  var dropContent = document.getElementById('drop-content');
  var dropLoaded = document.getElementById('drop-loaded');
  var dropFilename = document.getElementById('drop-filename');
  var dropFilesize = document.getElementById('drop-filesize');
  var dropRemove = document.getElementById('drop-remove');

  var qualitySlider = document.getElementById('quality-slider');
  var qualityValue = document.getElementById('quality-value');
  var qualityBar = document.getElementById('quality-bar');
  var scaleSlider = document.getElementById('scale-slider');
  var scaleValue = document.getElementById('scale-value');
  var scaleBar = document.getElementById('scale-bar');

  var compressBtn = document.getElementById('compress-btn');
  var resetBtn = document.getElementById('reset-btn');
  var downloadBtn = document.getElementById('download-btn');

  var progressOverlay = document.getElementById('progress-overlay');
  var progressText = document.getElementById('progress-text');
  var progressBar = document.getElementById('progress-bar');
  var progressPercent = document.getElementById('progress-percent');

  var beforePlaceholder = document.getElementById('before-placeholder');
  var beforeImageWrap = document.getElementById('before-image-wrap');
  var beforeCanvas = document.getElementById('before-canvas');
  var afterPlaceholder = document.getElementById('after-placeholder');
  var afterImageWrap = document.getElementById('after-image-wrap');
  var afterCanvas = document.getElementById('after-canvas');
  var comparePlaceholder = document.getElementById('compare-placeholder');
  var compareWrap = document.getElementById('compare-wrap');
  var compareBeforeCanvas = document.getElementById('compare-before-canvas');
  var compareAfterCanvas = document.getElementById('compare-after-canvas');

  var statOriginal = document.getElementById('stat-original');
  var statCompressed = document.getElementById('stat-compressed');
  var statPercent = document.getElementById('stat-percent');
  var statPages = document.getElementById('stat-pages');

  var infoName = document.getElementById('info-name');
  var infoOriginal = document.getElementById('info-original');
  var infoCompressed = document.getElementById('info-compressed');
  var infoSaved = document.getElementById('info-saved');
  var infoPages = document.getElementById('info-pages');
  var infoSettings = document.getElementById('info-settings');

  var validationList = document.getElementById('validation-list');

  // ─── State ───
  var originalFile = null;
  var pdfDoc = null;
  var compressedBlob = null;
  var pageCount = 0;
  var isCompressing = false;
  var cancelCompression = false;

  // ─── Presets ───
  var presets = {
    light:    { quality: 95, scale: 1.0 },
    balanced: { quality: 75, scale: 0.85 },
    strong:   { quality: 50, scale: 0.7 },
    maximum:  { quality: 25, scale: 0.5 }
  };

  // ─── Helpers ───
  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    var sizes = ['B', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(1024));
    var val = bytes / Math.pow(1024, i);
    return val.toFixed(i === 0 ? 0 : 1) + ' ' + sizes[i];
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
    ['file-loaded', 'file-valid', 'file-size', 'not-encrypted', 'compressed', 'size-reduced', 'ready-download'].forEach(function (k) {
      setCheck(k, null);
    });
  }

  // ─── Progress ───
  function showProgress() {
    progressOverlay.classList.remove('hidden');
    progressBar.style.width = '0%';
    progressPercent.textContent = '0%';
    progressText.textContent = 'Preparing...';
  }

  function updateProgress(current, total) {
    var pct = Math.round((current / total) * 100);
    progressBar.style.width = pct + '%';
    progressPercent.textContent = pct + '%';
    progressText.textContent = 'Processing page ' + current + ' of ' + total;
  }

  function hideProgress() {
    progressOverlay.classList.add('hidden');
  }

  // ─── Render page to canvas ───
  function renderPageToCanvas(pdfPage, canvas, scale) {
    var viewport = pdfPage.getViewport({ scale: scale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    return pdfPage.render(renderContext).promise;
  }

  // ─── File Handling ───
  function handleFile(file) {
    if (!file) return;

    // Validate type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Invalid format. Please upload a PDF file.', 'error');
      setCheck('file-valid', false);
      return;
    }

    // Validate size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      showToast('File too large. Maximum size is 50MB.', 'error');
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

    // Update file info
    infoName.textContent = file.name;
    infoName.className = 'text-sm font-medium text-slate-700 dark:text-slate-300 truncate';
    infoOriginal.textContent = formatBytes(file.size);
    infoOriginal.className = 'text-sm font-medium text-slate-700 dark:text-slate-300';
    statOriginal.textContent = formatBytes(file.size);
    statOriginal.className = 'text-3xl font-bold text-slate-700 dark:text-slate-300';

    // Clear previous compressed data
    compressedBlob = null;
    downloadBtn.disabled = true;
    downloadBtn.classList.add('opacity-50', 'cursor-not-allowed');
    statCompressed.textContent = '—';
    statCompressed.className = 'text-3xl font-bold text-slate-400';
    statPercent.textContent = '—';
    statPercent.className = 'text-3xl font-bold text-slate-400';
    infoCompressed.textContent = '—';
    infoCompressed.className = 'text-sm font-medium text-slate-400';
    infoSaved.textContent = '—';
    infoSaved.className = 'text-sm font-medium text-slate-400';
    infoSettings.textContent = '—';
    infoSettings.className = 'text-sm font-medium text-slate-400';
    afterPlaceholder.classList.remove('hidden');
    afterImageWrap.classList.add('hidden');
    comparePlaceholder.classList.remove('hidden');
    compareWrap.classList.add('hidden');
    setCheck('compressed', null);
    setCheck('size-reduced', null);
    setCheck('ready-download', null);

    // Read and load PDF
    var reader = new FileReader();
    reader.onload = function (e) {
      var typedArray = new Uint8Array(e.target.result);
      loadPdf(typedArray);
    };
    reader.readAsArrayBuffer(file);
  }

  async function loadPdf(data) {
    try {
      pdfDoc = await pdfjsLib.getDocument({ data: data }).promise;
      pageCount = pdfDoc.numPages;

      // Check if encrypted (pdf.js would have thrown, but let's be safe)
      setCheck('not-encrypted', true);

      // Update page count
      statPages.textContent = pageCount;
      statPages.className = 'text-3xl font-bold text-amber-500';
      infoPages.textContent = pageCount + ' pages';
      infoPages.className = 'text-sm font-medium text-slate-700 dark:text-slate-300';

      // Render first page preview
      var firstPage = await pdfDoc.getPage(1);
      await renderPageToCanvas(firstPage, beforeCanvas, 1.0);

      beforePlaceholder.classList.add('hidden');
      beforeImageWrap.classList.remove('hidden');

      // Also render to compare-before canvas
      await renderPageToCanvas(firstPage, compareBeforeCanvas, 1.0);

      // Enable compress button
      compressBtn.disabled = false;
      compressBtn.classList.remove('opacity-50', 'cursor-not-allowed');

    } catch (err) {
      console.error('PDF load error:', err);
      if (err.name === 'PasswordException') {
        showToast('This PDF is password-protected. Please remove the password first.', 'error');
        setCheck('not-encrypted', false);
      } else {
        showToast('Failed to load PDF. The file may be corrupted.', 'error');
        setCheck('file-valid', false);
      }
    }
  }

  // ─── Compression ───
  async function compressPdf() {
    if (!pdfDoc || isCompressing) return;

    isCompressing = true;
    cancelCompression = false;
    compressBtn.disabled = true;
    compressBtn.classList.add('opacity-50', 'cursor-not-allowed');
    showProgress();

    var quality = parseInt(qualitySlider.value, 10) / 100;
    var scale = parseFloat(scaleSlider.value);

    try {
      var newPdf = await PDFLib.PDFDocument.create();
      var jpegBlobs = [];

      for (var i = 1; i <= pageCount; i++) {
        if (cancelCompression) break;

        updateProgress(i, pageCount);

        var page = await pdfDoc.getPage(i);

        // Create offscreen canvas for rendering
        var offCanvas = document.createElement('canvas');
        var viewport = page.getViewport({ scale: scale });

        // Cap canvas dimensions to prevent memory issues
        var maxDim = 4000;
        var renderScale = scale;
        if (viewport.width > maxDim || viewport.height > maxDim) {
          var dimScale = Math.min(maxDim / viewport.width, maxDim / viewport.height);
          renderScale = scale * dimScale;
          viewport = page.getViewport({ scale: renderScale });
        }

        offCanvas.width = Math.max(1, Math.round(viewport.width));
        offCanvas.height = Math.max(1, Math.round(viewport.height));

        var ctx = offCanvas.getContext('2d');

        var renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };

        await page.render(renderContext).promise;

        // Convert to JPEG blob
        var blob = await new Promise(function (resolve) {
          offCanvas.toBlob(resolve, 'image/jpeg', quality);
        });

        jpegBlobs.push({
          blob: blob,
          origWidth: page.getViewport({ scale: 1 }).width,
          origHeight: page.getViewport({ scale: 1 }).height
        });

        // Clean up canvas
        offCanvas.width = 0;
        offCanvas.height = 0;
        offCanvas = null;
      }

      if (cancelCompression) {
        hideProgress();
        showToast('Compression cancelled.', 'info');
        isCompressing = false;
        compressBtn.disabled = false;
        compressBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        return;
      }

      // Update progress for PDF assembly
      progressText.textContent = 'Assembling PDF...';
      progressBar.style.width = '95%';
      progressPercent.textContent = '95%';

      // Create new PDF with pdf-lib
      for (var j = 0; j < jpegBlobs.length; j++) {
        var item = jpegBlobs[j];
        var arrayBuffer = await item.blob.arrayBuffer();
        var jpgBytes = new Uint8Array(arrayBuffer);

        var jpgImage;
        try {
          jpgImage = await newPdf.embedJpg(jpgBytes);
        } catch (embedErr) {
          console.error('Failed to embed JPEG for page ' + (j + 1) + ':', embedErr);
          // Skip this page if embedding fails
          continue;
        }

        var newPage = newPdf.addPage([item.origWidth, item.origHeight]);
        newPage.drawImage(jpgImage, {
          x: 0,
          y: 0,
          width: item.origWidth,
          height: item.origHeight
        });
      }

      var pdfBytes = await newPdf.save();
      compressedBlob = new Blob([pdfBytes], { type: 'application/pdf' });

      // Render first page of compressed PDF for preview
      progressText.textContent = 'Generating preview...';
      progressBar.style.width = '98%';
      progressPercent.textContent = '98%';

      try {
        var compressedPdfDoc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
        var compressedFirstPage = await compressedPdfDoc.getPage(1);
        await renderPageToCanvas(compressedFirstPage, afterCanvas, 1.0);

        afterPlaceholder.classList.add('hidden');
        afterImageWrap.classList.remove('hidden');

        // Compare view
        await renderPageToCanvas(compressedFirstPage, compareAfterCanvas, 1.0);
        comparePlaceholder.classList.add('hidden');
        compareWrap.classList.remove('hidden');

        compressedPdfDoc.destroy();
      } catch (previewErr) {
        console.error('Preview render error:', previewErr);
      }

      // Update stats
      var originalSize = originalFile.size;
      var compressedSize = compressedBlob.size;
      var percentReduced = Math.max(0, ((originalSize - compressedSize) / originalSize) * 100);

      progressBar.style.width = '100%';
      progressPercent.textContent = '100%';
      progressText.textContent = 'Done!';

      setTimeout(function () {
        hideProgress();
      }, 500);

      statCompressed.textContent = formatBytes(compressedSize);
      statCompressed.className = 'text-3xl font-bold ' + (compressedSize < originalSize ? 'text-emerald-500' : 'text-amber-500');

      statPercent.textContent = percentReduced.toFixed(1) + '%';
      statPercent.className = 'text-3xl font-bold ' + (percentReduced > 0 ? 'text-emerald-500' : 'text-amber-500');

      infoCompressed.textContent = formatBytes(compressedSize);
      infoCompressed.className = 'text-sm font-medium ' + (compressedSize < originalSize ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500');

      var saved = originalSize - compressedSize;
      if (saved > 0) {
        infoSaved.textContent = '-' + formatBytes(saved);
        infoSaved.className = 'text-sm font-medium text-emerald-600 dark:text-emerald-400';
      } else {
        infoSaved.textContent = '+' + formatBytes(Math.abs(saved));
        infoSaved.className = 'text-sm font-medium text-amber-500';
      }

      infoSettings.textContent = Math.round(quality * 100) + '% quality, ' + scale + 'x scale';
      infoSettings.className = 'text-sm font-medium text-blue-600 dark:text-blue-400';

      // Validation
      setCheck('compressed', true);
      if (compressedSize < originalSize) {
        setCheck('size-reduced', true);
        setCheck('ready-download', true);
        downloadBtn.disabled = false;
        downloadBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        showToast('PDF compressed! Saved ' + formatBytes(saved) + ' (' + percentReduced.toFixed(1) + '% reduction)', 'success');
      } else {
        setCheck('size-reduced', false);
        showToast('Compressed PDF is larger than original. Try lowering quality or scale.', 'error');
        // Still allow download in case user wants it
        downloadBtn.disabled = false;
        downloadBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        setCheck('ready-download', true);
      }

    } catch (err) {
      hideProgress();
      console.error('Compression error:', err);
      showToast('Compression failed: ' + (err.message || 'Unknown error'), 'error');
      setCheck('compressed', false);
    }

    isCompressing = false;
    compressBtn.disabled = false;
    compressBtn.classList.remove('opacity-50', 'cursor-not-allowed');
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
    if (isCompressing) return;
    var files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });

  fileInput.addEventListener('change', function () {
    if (isCompressing) return;
    if (this.files.length > 0) {
      handleFile(this.files[0]);
    }
  });

  // ─── Remove File ───
  dropRemove.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (isCompressing) {
      cancelCompression = true;
      setTimeout(resetAll, 500);
    } else {
      resetAll();
    }
  });

  // ─── Quality Slider ───
  qualitySlider.addEventListener('input', function () {
    var val = this.value;
    qualityValue.textContent = val + '%';
    qualityBar.style.width = val + '%';

    if (val >= 70) {
      qualityBar.className = 'h-full rounded-full transition-all duration-300 bg-emerald-500';
    } else if (val >= 40) {
      qualityBar.className = 'h-full rounded-full transition-all duration-300 bg-amber-500';
    } else {
      qualityBar.className = 'h-full rounded-full transition-all duration-300 bg-red-500';
    }
  });

  // ─── Scale Slider ───
  scaleSlider.addEventListener('input', function () {
    var val = parseFloat(this.value);
    scaleValue.textContent = val.toFixed(val % 1 === 0 ? 1 : 2) + 'x';

    // Map 0.5-2.0 range to 0-100% for bar width
    var pct = ((val - 0.5) / 1.5) * 100;
    scaleBar.style.width = pct + '%';

    if (val >= 1.0) {
      scaleBar.className = 'h-full rounded-full transition-all duration-300 bg-blue-500';
    } else if (val >= 0.7) {
      scaleBar.className = 'h-full rounded-full transition-all duration-300 bg-amber-500';
    } else {
      scaleBar.className = 'h-full rounded-full transition-all duration-300 bg-red-500';
    }
  });

  // ─── Compress Button ───
  compressBtn.addEventListener('click', function () {
    compressPdf();
  });

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

      scaleSlider.value = preset.scale;
      var scaleDisplay = preset.scale.toFixed(preset.scale % 1 === 0 ? 1 : 2);
      scaleValue.textContent = scaleDisplay + 'x';
      var scalePct = ((preset.scale - 0.5) / 1.5) * 100;
      scaleBar.style.width = scalePct + '%';
      if (preset.scale >= 1.0) {
        scaleBar.className = 'h-full rounded-full transition-all duration-300 bg-blue-500';
      } else if (preset.scale >= 0.7) {
        scaleBar.className = 'h-full rounded-full transition-all duration-300 bg-amber-500';
      } else {
        scaleBar.className = 'h-full rounded-full transition-all duration-300 bg-red-500';
      }

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

    var baseName = originalFile.name.replace(/\.pdf$/i, '');
    var fileName = baseName + '-compressed.pdf';

    var url = URL.createObjectURL(compressedBlob);
    var a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('PDF downloaded: ' + fileName, 'success');
  });

  // ─── Reset ───
  function resetAll() {
    cancelCompression = true;
    isCompressing = false;
    originalFile = null;
    pdfDoc = null;
    compressedBlob = null;
    pageCount = 0;

    if (pdfDoc) {
      try { pdfDoc.destroy(); } catch (e) { /* ignore */ }
    }

    fileInput.value = '';
    qualitySlider.value = 75;
    qualityValue.textContent = '75%';
    qualityBar.style.width = '75%';
    qualityBar.className = 'h-full rounded-full transition-all duration-300 bg-emerald-500';
    scaleSlider.value = 1.0;
    scaleValue.textContent = '1.0x';
    scaleBar.style.width = '33%';
    scaleBar.className = 'h-full rounded-full transition-all duration-300 bg-blue-500';

    // Reset drop zone
    dropContent.classList.remove('hidden');
    dropLoaded.classList.add('hidden');

    // Reset previews
    beforePlaceholder.classList.remove('hidden');
    beforeImageWrap.classList.add('hidden');
    beforeCanvas.width = 0;
    beforeCanvas.height = 0;
    afterPlaceholder.classList.remove('hidden');
    afterImageWrap.classList.add('hidden');
    afterCanvas.width = 0;
    afterCanvas.height = 0;
    comparePlaceholder.classList.remove('hidden');
    compareWrap.classList.add('hidden');
    compareBeforeCanvas.width = 0;
    compareBeforeCanvas.height = 0;
    compareAfterCanvas.width = 0;
    compareAfterCanvas.height = 0;

    // Reset stats
    statOriginal.textContent = '—';
    statOriginal.className = 'text-3xl font-bold text-slate-400';
    statCompressed.textContent = '—';
    statCompressed.className = 'text-3xl font-bold text-slate-400';
    statPercent.textContent = '—';
    statPercent.className = 'text-3xl font-bold text-slate-400';
    statPages.textContent = '—';
    statPages.className = 'text-3xl font-bold text-slate-400';

    // Reset file info
    infoName.textContent = '—';
    infoName.className = 'text-sm font-medium text-slate-400';
    infoOriginal.textContent = '—';
    infoOriginal.className = 'text-sm font-medium text-slate-400';
    infoCompressed.textContent = '—';
    infoCompressed.className = 'text-sm font-medium text-slate-400';
    infoSaved.textContent = '—';
    infoSaved.className = 'text-sm font-medium text-slate-400';
    infoPages.textContent = '—';
    infoPages.className = 'text-sm font-medium text-slate-400';
    infoSettings.textContent = '—';
    infoSettings.className = 'text-sm font-medium text-slate-400';

    // Disable buttons
    compressBtn.disabled = true;
    compressBtn.classList.add('opacity-50', 'cursor-not-allowed');
    downloadBtn.disabled = true;
    downloadBtn.classList.add('opacity-50', 'cursor-not-allowed');

    // Hide progress
    hideProgress();

    // Reset validation
    resetChecks();
  }

  resetBtn.addEventListener('click', function () {
    if (isCompressing) {
      cancelCompression = true;
      setTimeout(function () {
        resetAll();
        showToast('All settings reset', 'info');
      }, 500);
    } else {
      resetAll();
      showToast('All settings reset', 'info');
    }
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
    }, 3000);
  }

  // ─── FAQ Toggle ───
  setTimeout(function initFaqToggles() {
    var faqToggles = document.querySelectorAll('.faq-toggle');
    if (faqToggles.length === 0) {
      setTimeout(initFaqToggles, 100);
      return;
    }

    faqToggles.forEach(function (toggle) {
      var clone = toggle.cloneNode(true);
      toggle.parentNode.replaceChild(clone, toggle);
      clone.addEventListener('click', function (e) {
        e.preventDefault();
        var content = this.nextElementSibling;
        var icon = this.querySelector('i');
        if (!content) return;

        var isHidden = content.classList.contains('hidden');
        if (isHidden) {
          content.classList.remove('hidden');
          content.style.maxHeight = content.scrollHeight + 'px';
          icon.style.transform = 'rotate(180deg)';
        } else {
          content.style.maxHeight = '0px';
          icon.style.transform = 'rotate(0deg)';
          setTimeout(function () {
            content.classList.add('hidden');
            content.style.maxHeight = '';
          }, 300);
        }
      });
    });
  }, 50);

  // ─── Copy Link ───
  document.addEventListener('DOMContentLoaded', function () {
    var copyLinkBtn = document.getElementById('copy-link-btn');
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(window.location.href).then(function () {
            copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(function () {
              copyLinkBtn.innerHTML = '<i class="fas fa-link"></i> Copy Link';
            }, 2000);
          });
        } else {
          var tempInput = document.createElement('input');
          tempInput.value = window.location.href;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
          copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
          setTimeout(function () {
            copyLinkBtn.innerHTML = '<i class="fas fa-link"></i> Copy Link';
          }, 2000);
        }
      });
    }
  });

})();
