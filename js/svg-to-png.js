// SVG to PNG Converter - ../js/svg-to-png.js
(function () {
  'use strict';

  // ── State ──
  const state = {
    svgFile: null,
    svgDataUrl: null,
    svgWidth: 0,
    svgHeight: 0,
    sizeMode: 'scale',
    scale: 2,
    width: 512,
    customWidth: 512,
    customHeight: 512,
    background: 'transparent',
    bgColor: '#000000',
    pngBlob: null,
    pngDataUrl: null,
    outputWidth: 0,
    outputHeight: 0,
    hadError: false
  };

  // ── DOM References ──
  const els = {
    dropZone: document.getElementById('drop-zone'),
    dropZoneContent: document.getElementById('drop-zone-content'),
    dropZonePreview: document.getElementById('drop-zone-preview'),
    sourcePreview: document.getElementById('source-preview'),
    sourceName: document.getElementById('source-name'),
    sourceInfo: document.getElementById('source-info'),
    fileInput: document.getElementById('file-input'),
    convertBtn: document.getElementById('convert-btn'),
    clearBtn: document.getElementById('clear-btn'),
    scaleSlider: document.getElementById('scale-slider'),
    scaleInput: document.getElementById('scale-input'),
    widthInput: document.getElementById('width-input'),
    customWidth: document.getElementById('custom-width'),
    customHeight: document.getElementById('custom-height'),
    bgColor: document.getElementById('bg-color'),
    bgColorText: document.getElementById('bg-color-text'),
    customBgRow: document.getElementById('custom-bg-row'),
    pngPreviewContainer: document.getElementById('png-preview-container'),
    base64Content: document.getElementById('base64-content'),
    generatedCode: document.getElementById('generated-code'),
    pngOutputInfo: document.getElementById('png-output-info'),
    copyPngBtn: document.getElementById('copy-png-btn'),
    copyBase64Inline: document.getElementById('copy-base64-inline'),
    downloadBtn: document.getElementById('download-btn'),
    statSvgSize: document.getElementById('stat-svg-size'),
    statPngSize: document.getElementById('stat-png-size'),
    statDimensions: document.getElementById('stat-dimensions'),
    statStatus: document.getElementById('stat-status'),
    validationList: document.getElementById('validation-list'),
    copyLinkBtn: document.getElementById('copy-link-btn')
  };

  // ── Helpers ──
  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024).toFixed(1) + ' KB';
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function showToast(message, type) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const colors = { success: 'bg-emerald-500', error: 'bg-red-500', info: 'bg-blue-500' };
    toast.className = `${colors[type] || colors.info} text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transform translate-x-full transition-transform duration-300`;
    const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove('translate-x-full');
      toast.classList.add('translate-x-0');
    });
    setTimeout(() => {
      toast.classList.remove('translate-x-0');
      toast.classList.add('translate-x-full');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  function updateValidation(checks) {
    const items = els.validationList.querySelectorAll('[data-check]');
    items.forEach(item => {
      const key = item.getAttribute('data-check');
      const icon = item.querySelector('i');
      const text = item.querySelector('span');
      if (checks[key]) {
        icon.className = 'fas fa-circle-check text-[10px] text-emerald-500';
        text.className = 'text-slate-700 dark:text-slate-300';
      } else {
        icon.className = 'fas fa-circle text-[8px] text-slate-300 dark:text-slate-600';
        text.className = 'text-slate-400';
      }
    });
  }

  function setStat(el, value, active) {
    if (!el) return;
    el.textContent = value;
    el.className = `text-3xl font-bold ${active ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`;
  }

  // ── Calculate Output Dimensions ──
  function getOutputDimensions() {
    if (!state.svgWidth || !state.svgHeight) return { w: 0, h: 0 };
    let w, h;
    switch (state.sizeMode) {
      case 'scale':
        w = Math.round(state.svgWidth * state.scale);
        h = Math.round(state.svgHeight * state.scale);
        break;
      case 'width':
        w = state.width;
        h = Math.round((state.width / state.svgWidth) * state.svgHeight);
        break;
      case 'custom':
        w = state.customWidth;
        h = state.customHeight;
        break;
      default:
        w = state.svgWidth;
        h = state.svgHeight;
    }
    w = Math.max(1, Math.min(8192, w || 1));
    h = Math.max(1, Math.min(8192, h || 1));
    return { w, h };
  }

  // ── Load SVG ──
  function loadSVG(file) {
    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
      showToast('Please upload a valid .svg file', 'error');
      return;
    }

    state.svgFile = file;
    state.pngBlob = null;
    state.pngDataUrl = null;

    const reader = new FileReader();
    reader.onload = function (e) {
      state.svgDataUrl = e.target.result;

      const img = new Image();
      img.onload = function () {
        state.svgWidth = img.naturalWidth || 300;
        state.svgHeight = img.naturalHeight || 150;

        // If SVG has no intrinsic dimensions, try parsing viewBox
        if (img.naturalWidth === 0 || img.naturalHeight === 0) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(e.target.result, 'image/svg+xml');
          const svgEl = doc.querySelector('svg');
          if (svgEl) {
            const vb = svgEl.getAttribute('viewBox');
            if (vb) {
              const parts = vb.split(/[\s,]+/).map(Number);
              if (parts.length === 4) {
                state.svgWidth = parts[2] || 300;
                state.svgHeight = parts[3] || 150;
              }
            }
            const wAttr = svgEl.getAttribute('width');
            const hAttr = svgEl.getAttribute('height');
            if (wAttr && !wAttr.includes('%')) state.svgWidth = parseFloat(wAttr) || state.svgWidth;
            if (hAttr && !hAttr.includes('%')) state.svgHeight = parseFloat(hAttr) || state.svgHeight;
          }
        }

        // Show preview
        els.sourcePreview.src = state.svgDataUrl;
        els.sourceName.textContent = file.name;
        els.sourceInfo.textContent = `${state.svgWidth} × ${state.svgHeight} px · ${formatBytes(file.size)}`;
        els.dropZoneContent.classList.add('hidden');
        els.dropZonePreview.classList.remove('hidden');

        // Stats
        setStat(els.statSvgSize, formatBytes(file.size), true);
        const dim = getOutputDimensions();
        setStat(els.statDimensions, dim.w > 0 ? `${dim.w}×${dim.h}` : '—', dim.w > 0);
        setStat(els.statPngSize, '—', false);
        setStat(els.statStatus, 'Ready', false);
        els.statStatus.className = 'text-3xl font-bold text-amber-500';

        updateValidation({
          'has-svg': true,
          'valid-svg': true,
          'size-configured': true,
          'converted': false,
          'no-errors': false,
          'ready-download': false
        });
      };
      img.onerror = function () {
        showToast('Failed to load SVG. File may be corrupted or invalid.', 'error');
        setStat(els.statStatus, 'Error', false);
        els.statStatus.className = 'text-3xl font-bold text-red-500';
        updateValidation({
          'has-svg': true,
          'valid-svg': false,
          'size-configured': true,
          'converted': false,
          'no-errors': false,
          'ready-download': false
        });
      };
      img.src = state.svgDataUrl;
    };
    reader.onerror = function () {
      showToast('Failed to read file', 'error');
    };
    reader.readAsDataURL(file);
  }

  // ── Convert ──
  function convert() {
    if (!state.svgDataUrl) {
      showToast('Please upload an SVG file first', 'error');
      return;
    }

    const dim = getOutputDimensions();
    if (dim.w === 0 || dim.h === 0) {
      showToast('Invalid output dimensions', 'error');
      return;
    }

    setStat(els.statStatus, 'Working...', false);
    els.statStatus.className = 'text-3xl font-bold text-amber-500';

    // Use requestAnimationFrame for UI update before heavy work
    requestAnimationFrame(() => {
      setTimeout(() => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = dim.w;
          canvas.height = dim.h;
          const ctx = canvas.getContext('2d');

          // Background
          if (state.background === 'white') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, dim.w, dim.h);
          } else if (state.background === 'custom') {
            ctx.fillStyle = state.bgColor;
            ctx.fillRect(0, 0, dim.w, dim.h);
          }

          // Create a blob URL from the SVG data for reliable rendering
          const svgBlob = new Blob([state.svgFile], { type: 'image/svg+xml;charset=utf-8' });
          const svgUrl = URL.createObjectURL(svgBlob);

          const img = new Image();
          img.crossOrigin = 'anonymous';

          img.onload = function () {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, dim.w, dim.h);
            URL.revokeObjectURL(svgUrl);

            // Export PNG
            try {
              canvas.toBlob(function (blob) {
                if (!blob) {
                  handleConversionError('Failed to generate PNG blob. The SVG may contain unsupported features.');
                  return;
                }

                state.pngBlob = blob;
                state.pngDataUrl = canvas.toDataURL('image/png');
                state.outputWidth = dim.w;
                state.outputHeight = dim.h;
                state.hadError = false;

                // Stats
                setStat(els.statPngSize, formatBytes(blob.size), true);
                setStat(els.statDimensions, `${dim.w}×${dim.h}`, true);
                setStat(els.statStatus, 'Done', false);
                els.statStatus.className = 'text-3xl font-bold text-emerald-500';

                // Preview
                renderPreview();

                // Base64
                els.base64Content.textContent = state.pngDataUrl;
                const previewStr = state.pngDataUrl.substring(0, 180);
                els.generatedCode.textContent = previewStr + (state.pngDataUrl.length > 180 ? '...' : '');

                const bgLabel = state.background === 'transparent' ? 'Transparent' : state.background === 'white' ? 'White BG' : state.bgColor + ' BG';
                els.pngOutputInfo.textContent = `${dim.w}×${dim.h} px · ${formatBytes(blob.size)} · ${bgLabel}`;

                updateValidation({
                  'has-svg': true,
                  'valid-svg': true,
                  'size-configured': true,
                  'converted': true,
                  'no-errors': true,
                  'ready-download': true
                });

                showToast('SVG converted to PNG successfully', 'success');
              }, 'image/png');
            } catch (toBlobErr) {
              URL.revokeObjectURL(svgUrl);
              handleConversionError('Canvas toBlob error: ' + toBlobErr.message);
            }
          };

          img.onerror = function () {
            URL.revokeObjectURL(svgUrl);
            // Fallback: try with data URL instead of blob URL
            fallbackConvert(dim);
          };

          img.src = svgUrl;
        } catch (err) {
          handleConversionError('Conversion error: ' + err.message);
        }
      }, 30);
    });
  }

  // ── Fallback convert using data URL ──
  function fallbackConvert(dim) {
    const canvas = document.createElement('canvas');
    canvas.width = dim.w;
    canvas.height = dim.h;
    const ctx = canvas.getContext('2d');

    if (state.background === 'white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, dim.w, dim.h);
    } else if (state.background === 'custom') {
      ctx.fillStyle = state.bgColor;
      ctx.fillRect(0, 0, dim.w, dim.h);
    }

    const img = new Image();
    img.onload = function () {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, dim.w, dim.h);

      try {
        canvas.toBlob(function (blob) {
          if (!blob) {
            handleConversionError('Fallback also failed. SVG may have unsupported content.');
            return;
          }

          state.pngBlob = blob;
          state.pngDataUrl = canvas.toDataURL('image/png');
          state.outputWidth = dim.w;
          state.outputHeight = dim.h;
          state.hadError = false;

          setStat(els.statPngSize, formatBytes(blob.size), true);
          setStat(els.statDimensions, `${dim.w}×${dim.h}`, true);
          setStat(els.statStatus, 'Done', false);
          els.statStatus.className = 'text-3xl font-bold text-emerald-500';

          renderPreview();
          els.base64Content.textContent = state.pngDataUrl;
          const previewStr = state.pngDataUrl.substring(0, 180);
          els.generatedCode.textContent = previewStr + (state.pngDataUrl.length > 180 ? '...' : '');
          const bgLabel = state.background === 'transparent' ? 'Transparent' : state.background === 'white' ? 'White BG' : state.bgColor + ' BG';
          els.pngOutputInfo.textContent = `${dim.w}×${dim.h} px · ${formatBytes(blob.size)} · ${bgLabel}`;

          updateValidation({
            'has-svg': true,
            'valid-svg': true,
            'size-configured': true,
            'converted': true,
            'no-errors': true,
            'ready-download': true
          });

          showToast('SVG converted to PNG successfully', 'success');
        }, 'image/png');
      } catch (e2) {
        handleConversionError('Fallback error: ' + e2.message);
      }
    };
    img.onerror = function () {
      handleConversionError('Could not render SVG. It may contain external resources or invalid markup.');
    };
    img.src = state.svgDataUrl;
  }

  // ── Handle conversion error ──
  function handleConversionError(message) {
    setStat(els.statStatus, 'Error', false);
    els.statStatus.className = 'text-3xl font-bold text-red-500';
    showToast(message, 'error');
    state.hadError = true;
    updateValidation({
      'has-svg': true,
      'valid-svg': true,
      'size-configured': true,
      'converted': false,
      'no-errors': false,
      'ready-download': false
    });
  }

  // ── Render Preview ──
  function renderPreview() {
    if (!state.pngDataUrl) return;

    const maxPreview = 380;
    let displayW = state.outputWidth;
    let displayH = state.outputHeight;

    if (displayW > maxPreview || displayH > maxPreview) {
      const ratio = Math.min(maxPreview / displayW, maxPreview / displayH);
      displayW = Math.round(displayW * ratio);
      displayH = Math.round(displayH * ratio);
    }

    // Clamp minimum display size
    displayW = Math.max(16, displayW);
    displayH = Math.max(16, displayH);

    const isTransparent = state.background === 'transparent';
    const checkerStyle = isTransparent
      ? "background-image: url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='10' height='10' fill='%23f1f5f9'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23f1f5f9'/%3E%3Crect x='10' width='10' height='10' fill='%23e2e8f0'/%3E%3Crect y='10' width='10' height='10' fill='%23e2e8f0'/%3E%3C/svg%3E\"); background-size: 20px 20px;"
      : '';
    const solidBg = !isTransparent
      ? (state.background === 'white' ? 'background:#fff;' : `background:${state.bgColor};`)
      : '';

    const bgLabel = isTransparent
      ? 'Transparent background'
      : state.background === 'white'
        ? 'White background'
        : state.bgColor + ' background';

    els.pngPreviewContainer.innerHTML = `
      <div class="text-center">
        <div class="inline-block rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm" style="${checkerStyle}${solidBg}">
          <img src="${state.pngDataUrl}" width="${displayW}" height="${displayH}" alt="PNG preview" class="block" style="${displayW <= 64 ? 'image-rendering:pixelated;' : ''}">
        </div>
        <p class="text-xs text-slate-400 mt-3 font-mono">${state.outputWidth} × ${state.outputHeight} px · ${bgLabel}</p>
      </div>
    `;
  }

  // ── Download ──
  function downloadPNG() {
    if (!state.pngBlob) {
      showToast('Convert an SVG first', 'error');
      return;
    }
    const url = URL.createObjectURL(state.pngBlob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = state.svgFile
      ? state.svgFile.name.replace(/\.svg$/i, '')
      : 'converted';
    a.download = `${baseName}-${state.outputWidth}x${state.outputHeight}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('PNG downloaded', 'success');
  }

  // ── Copy Base64 ──
  function copyBase64() {
    if (!state.pngDataUrl) {
      showToast('Convert an SVG first', 'error');
      return;
    }
    navigator.clipboard.writeText(state.pngDataUrl).then(() => {
      showToast('Base64 copied to clipboard', 'success');
    }).catch(() => {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = state.pngDataUrl;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showToast('Base64 copied to clipboard', 'success');
      } catch (e) {
        showToast('Failed to copy. Try again.', 'error');
      }
      document.body.removeChild(ta);
    });
  }

  // ── Clear All ──
  function clearAll() {
    state.svgFile = null;
    state.svgDataUrl = null;
    state.svgWidth = 0;
    state.svgHeight = 0;
    state.pngBlob = null;
    state.pngDataUrl = null;
    state.outputWidth = 0;
    state.outputHeight = 0;
    state.hadError = false;

    els.dropZoneContent.classList.remove('hidden');
    els.dropZonePreview.classList.add('hidden');
    els.sourcePreview.src = '';
    els.sourceName.textContent = '';
    els.sourceInfo.textContent = '';
    els.fileInput.value = '';

    setStat(els.statSvgSize, '—', false);
    setStat(els.statPngSize, '—', false);
    setStat(els.statDimensions, '—', false);
    setStat(els.statStatus, 'Idle', false);
    els.statStatus.className = 'text-3xl font-bold text-slate-400';

    els.pngPreviewContainer.innerHTML = '<span class="text-slate-400 text-sm">Upload an SVG and convert to see the PNG preview here</span>';
    els.base64Content.textContent = 'Convert an SVG to see the base64 encoded PNG output here';
    els.generatedCode.textContent = 'Convert an SVG to see exportable output';
    els.pngOutputInfo.textContent = 'No PNG generated yet';

    updateValidation({
      'has-svg': false,
      'valid-svg': false,
      'size-configured': false,
      'converted': false,
      'no-errors': false,
      'ready-download': false
    });

    showToast('All cleared', 'info');
  }

  // ── Update dimensions display when settings change ──
  function refreshDimensionStat() {
    if (state.svgWidth && state.svgHeight) {
      const dim = getOutputDimensions();
      setStat(els.statDimensions, `${dim.w}×${dim.h}`, true);
    }
  }

  // ═══════════════════════════════════════
  //  EVENT LISTENERS
  // ═══════════════════════════════════════

  // ── Drop zone ──
  els.dropZone.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    els.fileInput.click();
  });

  els.fileInput.addEventListener('change', function () {
    if (this.files && this.files[0]) {
      loadSVG(this.files[0]);
    }
  });

  els.dropZone.addEventListener('dragover', function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.add('border-emerald-500', 'bg-emerald-500/5');
  });

  els.dropZone.addEventListener('dragleave', function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove('border-emerald-500', 'bg-emerald-500/5');
  });

  els.dropZone.addEventListener('drop', function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove('border-emerald-500', 'bg-emerald-500/5');
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      loadSVG(files[0]);
    }
  });

  // Prevent default drag behavior on window
  window.addEventListener('dragover', function (e) { e.preventDefault(); });
  window.addEventListener('drop', function (e) { e.preventDefault(); });

  // ── Size mode buttons ──
  document.querySelectorAll('.size-mode-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.size-mode-btn').forEach(b => {
        b.classList.remove('border-emerald-500', 'bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400');
        b.classList.add('border-slate-200', 'dark:border-slate-700', 'bg-white', 'dark:bg-slate-800/50', 'text-slate-600', 'dark:text-slate-400');
      });
      this.classList.add('border-emerald-500', 'bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400');
      this.classList.remove('border-slate-200', 'dark:border-slate-700', 'bg-white', 'dark:bg-slate-800/50', 'text-slate-600', 'dark:text-slate-400');

      state.sizeMode = this.getAttribute('data-mode');
      document.querySelectorAll('.size-mode-panel').forEach(p => p.classList.add('hidden'));
      const panel = document.getElementById(`mode-${state.sizeMode}`);
      if (panel) panel.classList.remove('hidden');

      refreshDimensionStat();
    });
  });

  // ── Scale controls ──
  els.scaleSlider.addEventListener('input', function () {
    state.scale = parseFloat(this.value) || 1;
    els.scaleInput.value = state.scale;
    refreshDimensionStat();
  });

  els.scaleInput.addEventListener('input', function () {
    let v = parseFloat(this.value);
    if (isNaN(v) || v < 0.5) v = 0.5;
    if (v > 10) v = 10;
    state.scale = v;
    els.scaleSlider.value = Math.min(v, 5);
    refreshDimensionStat();
  });

  els.scaleInput.addEventListener('blur', function () {
    let v = parseFloat(this.value);
    if (isNaN(v) || v < 0.5) v = 0.5;
    if (v > 10) v = 10;
    this.value = v;
    state.scale = v;
    refreshDimensionStat();
  });

  // ── Width input ──
  els.widthInput.addEventListener('input', function () {
    let v = parseInt(this.value, 10);
    if (isNaN(v) || v < 1) v = 1;
    if (v > 8192) v = 8192;
    state.width = v;
    refreshDimensionStat();
  });

  els.widthInput.addEventListener('blur', function () {
    let v = parseInt(this.value, 10);
    if (isNaN(v) || v < 1) v = 1;
    if (v > 8192) v = 8192;
    this.value = v;
    state.width = v;
    refreshDimensionStat();
  });

  // ── Custom width/height inputs ──
  els.customWidth.addEventListener('input', function () {
    let v = parseInt(this.value, 10);
    if (isNaN(v) || v < 1) v = 1;
    if (v > 8192) v = 8192;
    state.customWidth = v;
    refreshDimensionStat();
  });

  els.customWidth.addEventListener('blur', function () {
    let v = parseInt(this.value, 10);
    if (isNaN(v) || v < 1) v = 1;
    if (v > 8192) v = 8192;
    this.value = v;
    state.customWidth = v;
    refreshDimensionStat();
  });

  els.customHeight.addEventListener('input', function () {
    let v = parseInt(this.value, 10);
    if (isNaN(v) || v < 1) v = 1;
    if (v > 8192) v = 8192;
    state.customHeight = v;
    refreshDimensionStat();
  });

  els.customHeight.addEventListener('blur', function () {
    let v = parseInt(this.value, 10);
    if (isNaN(v) || v < 1) v = 1;
    if (v > 8192) v = 8192;
    this.value = v;
    state.customHeight = v;
    refreshDimensionStat();
  });

  // ── Background mode buttons ──
  document.querySelectorAll('.bg-mode-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.bg-mode-btn').forEach(b => {
        b.classList.remove('border-emerald-500', 'bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400');
        b.classList.add('border-slate-200', 'dark:border-slate-700', 'bg-white', 'dark:bg-slate-800/50', 'text-slate-600', 'dark:text-slate-400');
      });
      this.classList.add('border-emerald-500', 'bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400');
      this.classList.remove('border-slate-200', 'dark:border-slate-700', 'bg-white', 'dark:bg-slate-800/50', 'text-slate-600', 'dark:text-slate-400');

      state.background = this.getAttribute('data-bg');
      if (state.background === 'custom') {
        els.customBgRow.classList.remove('hidden');
      } else {
        els.customBgRow.classList.add('hidden');
      }

      // Re-render if already converted
      if (state.pngDataUrl) {
        convert();
      }
    });
  });

  // ── Background color picker ──
  els.bgColor.addEventListener('input', function () {
    state.bgColor = this.value;
    els.bgColorText.value = this.value;
    if (state.pngDataUrl && state.background === 'custom') {
      convert();
    }
  });

  els.bgColorText.addEventListener('input', function () {
    const val = this.value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      state.bgColor = val;
      els.bgColor.value = val;
      if (state.pngDataUrl && state.background === 'custom') {
        convert();
      }
    }
  });

  els.bgColorText.addEventListener('blur', function () {
    const val = this.value.trim();
    if (!/^#[0-9a-fA-F]{6}$/.test(val)) {
      this.value = state.bgColor;
    }
  });

  // ── Convert / Clear / Download / Copy buttons ──
  els.convertBtn.addEventListener('click', convert);
  els.clearBtn.addEventListener('click', clearAll);
  els.downloadBtn.addEventListener('click', downloadPNG);
  els.copyPngBtn.addEventListener('click', copyBase64);
  els.copyBase64Inline.addEventListener('click', copyBase64);

  // ── Preview tabs ──
  document.querySelectorAll('.preview-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.preview-tab').forEach(t => {
        t.classList.remove('active-tab', 'border-emerald-500', 'bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400');
        t.classList.add('border-slate-200', 'dark:border-slate-700', 'text-slate-600', 'dark:text-slate-400');
      });
      this.classList.add('active-tab', 'border-emerald-500', 'bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400');
      this.classList.remove('border-slate-200', 'dark:border-slate-700', 'text-slate-600', 'dark:text-slate-400');

      const view = this.getAttribute('data-view');
      document.querySelectorAll('.preview-panel').forEach(p => p.classList.add('hidden'));
      const panel = document.getElementById(`view-${view}`);
      if (panel) panel.classList.remove('hidden');
    });
  });

  // ── Presets ──
  const presets = {
    '1x': { mode: 'scale', scale: 1 },
    '2x': { mode: 'scale', scale: 2 },
    '3x': { mode: 'scale', scale: 3 },
    '512': { mode: 'width', width: 512 }
  };

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const preset = presets[this.getAttribute('data-preset')];
      if (!preset) return;

      // Switch size mode button
      document.querySelectorAll('.size-mode-btn').forEach(b => {
        b.classList.remove('border-emerald-500', 'bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400');
        b.classList.add('border-slate-200', 'dark:border-slate-700', 'bg-white', 'dark:bg-slate-800/50', 'text-slate-600', 'dark:text-slate-400');
      });
      const activeBtn = document.querySelector(`.size-mode-btn[data-mode="${preset.mode}"]`);
      if (activeBtn) {
        activeBtn.classList.add('border-emerald-500', 'bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400');
        activeBtn.classList.remove('border-slate-200', 'dark:border-slate-700', 'bg-white', 'dark:bg-slate-800/50', 'text-slate-600', 'dark:text-slate-400');
      }

      state.sizeMode = preset.mode;
      document.querySelectorAll('.size-mode-panel').forEach(p => p.classList.add('hidden'));
      const panel = document.getElementById(`mode-${preset.mode}`);
      if (panel) panel.classList.remove('hidden');

      if (preset.scale !== undefined) {
        state.scale = preset.scale;
        els.scaleSlider.value = Math.min(preset.scale, 5);
        els.scaleInput.value = preset.scale;
      }
      if (preset.width !== undefined) {
        state.width = preset.width;
        els.widthInput.value = preset.width;
      }

      refreshDimensionStat();

      // Auto-convert if SVG is loaded
      if (state.svgDataUrl) {
        convert();
      } else {
        showToast('Upload an SVG file first', 'info');
      }
    });
  });

  // ── Copy Link ──
  if (els.copyLinkBtn) {
    els.copyLinkBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('Page link copied', 'success');
      }).catch(() => {
        showToast('Failed to copy link', 'error');
      });
    });
  }

  // ── Keyboard shortcut: Ctrl/Cmd+Enter to convert ──
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      convert();
    }
  });

  // ── Initialize ──
  updateValidation({
    'has-svg': false,
    'valid-svg': false,
    'size-configured': false,
    'converted': false,
    'no-errors': false,
    'ready-download': false
  });

    // ─── FAQ Toggle (self-contained, works independently of enhancements.js) ───
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
