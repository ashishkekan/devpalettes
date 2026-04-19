// Favicon Generator - ../js/favicon-generator.js
(function () {
  'use strict';

  // ── State ──
  const state = {
    sourceImage: null,
    sourceFile: null,
    sourceWidth: 0,
    sourceHeight: 0,
    selectedSizes: [16, 32, 48, 64, 180],
    generateICO: true,
    generatedIcons: [],
    icoBlob: null
  };

  // ── DOM References ──
  const els = {
    dropZone: document.getElementById('drop-zone'),
    dropZoneContent: document.getElementById('drop-zone-content'),
    dropZonePreview: document.getElementById('drop-zone-preview'),
    sourcePreview: document.getElementById('source-preview'),
    sourceName: document.getElementById('source-name'),
    sourceDimensions: document.getElementById('source-dimensions'),
    fileInput: document.getElementById('file-input'),
    generateBtn: document.getElementById('generate-btn'),
    clearBtn: document.getElementById('clear-btn'),
    optIco: document.getElementById('opt-ico'),
    gridContent: document.getElementById('grid-content'),
    tabsContent: document.getElementById('tabs-content'),
    htmlCodeOutput: document.getElementById('html-code-output'),
    copyHtmlBtn: document.getElementById('copy-html-btn'),
    exportList: document.getElementById('export-list'),
    exportInfo: document.getElementById('export-info'),
    downloadZipBtn: document.getElementById('download-zip-btn'),
    statSource: document.getElementById('stat-source'),
    statIcons: document.getElementById('stat-icons'),
    statFormats: document.getElementById('stat-formats'),
    statStatus: document.getElementById('stat-status'),
    validationList: document.getElementById('validation-list'),
    copyLinkBtn: document.getElementById('copy-link-btn')
  };

  const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
  const sizeLabels = {
    16: '16×16 — Tab',
    32: '32×32 — Taskbar',
    48: '48×48 — Windows',
    64: '64×64 — HiDPI',
    180: '180×180 — Apple'
  };

  // ── Toast ──
  function showToast(message, type) {
    const container = document.getElementById('toast-container');
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

  // ── Format Bytes ──
  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024).toFixed(1) + ' KB';
  }

  // ── Escape HTML ──
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Validation Checklist ──
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

  // ── Set Stat ──
  function setStat(el, value, active) {
    el.textContent = value;
    if (active) {
      el.className = 'text-3xl font-bold text-slate-900 dark:text-slate-100';
    } else {
      el.className = 'text-3xl font-bold text-slate-400';
    }
  }

  // ── Load Image from File ──
  function loadImage(file) {
    if (!validTypes.includes(file.type)) {
      showToast('Invalid format. Use PNG, JPG, SVG, or WebP.', 'error');
      return;
    }

    state.sourceFile = file;

    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        state.sourceImage = img;
        state.sourceWidth = img.naturalWidth;
        state.sourceHeight = img.naturalHeight;

        // Show preview
        els.sourcePreview.src = e.target.result;
        els.sourceName.textContent = file.name;
        els.sourceDimensions.textContent = `${img.naturalWidth} × ${img.naturalHeight} px · ${formatBytes(file.size)}`;
        els.dropZoneContent.classList.add('hidden');
        els.dropZonePreview.classList.remove('hidden');

        // Update stats
        setStat(els.statSource, formatBytes(file.size), true);

        updateValidation({
          'has-image': true,
          'valid-format': true,
          'sizes-selected': state.selectedSizes.length > 0,
          'icons-generated': false,
          'ico-created': false,
          'ready-download': false
        });
      };
      img.onerror = function () {
        showToast('Failed to load image. File may be corrupted.', 'error');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ── Resize to Canvas ──
  function resizeToCanvas(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Clear with transparent
    ctx.clearRect(0, 0, size, size);

    // Calculate draw dimensions maintaining aspect ratio
    const srcW = state.sourceImage.naturalWidth;
    const srcH = state.sourceImage.naturalHeight;
    const aspect = srcW / srcH;

    let drawW, drawH, drawX, drawY;
    if (aspect > 1) {
      drawH = size;
      drawW = size * aspect;
      drawX = (size - drawW) / 2;
      drawY = 0;
    } else {
      drawW = size;
      drawH = size / aspect;
      drawX = 0;
      drawY = (size - drawH) / 2;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(state.sourceImage, drawX, drawY, drawW, drawH);

    return canvas;
  }

  // ── Canvas to Blob Promise ──
  function canvasToBlob(canvas, type) {
    return new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob), type, 1.0);
    });
  }

  // ── Create ICO File ──
  function createICO(pngBlobs, sizes) {
    return new Promise(resolve => {
      const count = pngBlobs.length;
      const headerSize = 6;
      const dirEntrySize = 16;
      const dirSize = dirEntrySize * count;
      let dataOffset = headerSize + dirSize;

      // Calculate total size
      let totalPNGSize = 0;
      const pngArrays = [];
      let loadCount = 0;

      pngBlobs.forEach((blob, i) => {
        blob.arrayBuffer().then(buf => {
          pngArrays[i] = new Uint8Array(buf);
          totalPNGSize += buf.byteLength;
          loadCount++;
          if (loadCount === count) {
            buildICO();
          }
        });
      });

      function buildICO() {
        const totalSize = headerSize + dirSize + totalPNGSize;
        const buffer = new ArrayBuffer(totalSize);
        const view = new DataView(buffer);
        const uint8 = new Uint8Array(buffer);

        // Header
        view.setUint16(0, 0, true);       // Reserved
        view.setUint16(2, 1, true);       // Type: ICO
        view.setUint16(4, count, true);   // Count

        let offset = dataOffset;
        for (let i = 0; i < count; i++) {
          const s = sizes[i];
          const pngSize = pngArrays[i].byteLength;
          const dirOffset = headerSize + (i * dirEntrySize);

          uint8[dirOffset] = s >= 256 ? 0 : s;     // Width
          uint8[dirOffset + 1] = s >= 256 ? 0 : s; // Height
          uint8[dirOffset + 2] = 0;                 // Color palette
          uint8[dirOffset + 3] = 0;                 // Reserved
          view.setUint16(dirOffset + 4, 1, true);   // Color planes
          view.setUint16(dirOffset + 6, 32, true);  // Bits per pixel
          view.setUint32(dirOffset + 8, pngSize, true); // Image size
          view.setUint32(dirOffset + 12, offset, true); // Offset

          offset += pngSize;
        }

        // Write PNG data
        let writeOffset = dataOffset;
        for (let i = 0; i < count; i++) {
          uint8.set(pngArrays[i], writeOffset);
          writeOffset += pngArrays[i].byteLength;
        }

        resolve(new Blob([buffer], { type: 'image/x-icon' }));
      }
    });
  }

  // ── Generate Favicons ──
  async function generate() {
    if (!state.sourceImage) {
      showToast('Please upload an image first', 'error');
      return;
    }

    const sizes = getSelectedSizes();
    if (sizes.length === 0) {
      showToast('Select at least one favicon size', 'error');
      return;
    }

    state.generateICO = els.optIco.checked;
    setStat(els.statStatus, 'Working...', false);
    els.statStatus.className = 'text-3xl font-bold text-amber-500';

    // Small delay for UI update
    await new Promise(r => setTimeout(r, 50));

    try {
      state.generatedIcons = [];

      for (const size of sizes) {
        const canvas = resizeToCanvas(size);
        const blob = await canvasToBlob(canvas, 'image/png');
        const dataUrl = canvas.toDataURL('image/png');
        state.generatedIcons.push({ size, blob, dataUrl });
      }

      // Generate ICO
      state.icoBlob = null;
      if (state.generateICO) {
        const icoSizes = sizes.filter(s => s <= 256);
        if (icoSizes.length > 0) {
          const icoBlobs = icoSizes.map(s => state.generatedIcons.find(i => i.size === s).blob);
          state.icoBlob = await createICO(icoBlobs, icoSizes);
        }
      }

      // Update stats
      const iconCount = state.generatedIcons.length;
      const formatCount = iconCount + (state.icoBlob ? 1 : 0);
      setStat(els.statIcons, iconCount, true);
      setStat(els.statFormats, formatCount, true);
      setStat(els.statStatus, 'Done', false);
      els.statStatus.className = 'text-3xl font-bold text-emerald-500';

      // Render previews
      renderGridPreview();
      renderTabsPreview();
      renderExportList();
      renderHTMLCode();

      // Validation
      updateValidation({
        'has-image': true,
        'valid-format': true,
        'sizes-selected': true,
        'icons-generated': true,
        'ico-created': !!state.icoBlob,
        'ready-download': true
      });

      showToast(`${iconCount} favicon${iconCount > 1 ? 's' : ''} generated`, 'success');
    } catch (err) {
      setStat(els.statStatus, 'Error', false);
      els.statStatus.className = 'text-3xl font-bold text-red-500';
      showToast('Error generating favicons: ' + err.message, 'error');
    }
  }

  // ── Get Selected Sizes ──
  function getSelectedSizes() {
    const checks = document.querySelectorAll('.size-check');
    const sizes = [];
    checks.forEach(ch => {
      if (ch.checked) sizes.push(parseInt(ch.getAttribute('data-size'), 10));
    });
    return sizes;
  }

  // ── Render Grid Preview ──
  function renderGridPreview() {
    let html = '';
    state.generatedIcons.forEach(icon => {
      const displaySize = Math.max(icon.size, 32);
      html += `
        <div class="flex flex-col items-center gap-2">
          <div class="flex items-center justify-center" style="width:${displaySize + 24}px;height:${displaySize + 24}px;">
            <img src="${icon.dataUrl}" width="${icon.size}" height="${icon.size}" alt="${icon.size}x${icon.size} favicon" class="border border-slate-200 dark:border-slate-700 rounded" style="image-rendering: ${icon.size <= 32 ? 'pixelated' : 'auto'};">
          </div>
          <span class="text-xs text-slate-500 font-mono text-center">${sizeLabels[icon.size] || icon.size + '×' + icon.size}</span>
          <span class="text-[10px] text-slate-400">${formatBytes(icon.blob.size)}</span>
        </div>
      `;
    });
    if (state.icoBlob) {
      html += `
        <div class="flex flex-col items-center gap-2">
          <div class="flex items-center justify-center" style="width:56px;height:56px;">
            <div class="w-8 h-8 rounded border-2 border-dashed border-purple-400 dark:border-purple-500 flex items-center justify-center bg-purple-500/10">
              <i class="fas fa-file text-purple-500 text-xs"></i>
            </div>
          </div>
          <span class="text-xs text-slate-500 font-mono text-center">favicon.ico</span>
          <span class="text-[10px] text-slate-400">${formatBytes(state.icoBlob.size)}</span>
        </div>
      `;
    }
    els.gridContent.innerHTML = html;
  }

  // ── Render Tabs Preview ──
  function renderTabsPreview() {
    const tabIcons = state.generatedIcons.filter(i => i.size === 16 || i.size === 32);
    const iconSrc = tabIcons.length > 0 ? tabIcons[0].dataUrl : '';

    const tabs = [
      { title: 'My Website', icon: iconSrc },
      { title: 'Dashboard', icon: iconSrc },
      { title: 'Documentation', icon: '' },
      { title: 'Another Page', icon: iconSrc }
    ];

    let tabsHtml = '<div class="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 overflow-x-auto">';
    tabs.forEach((tab, i) => {
      const active = i === 0;
      tabsHtml += `
        <div class="flex items-center gap-2 px-4 py-2.5 text-xs whitespace-nowrap border-r border-slate-200 dark:border-slate-700 ${active ? 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'}" style="min-width:140px;">
          ${tab.icon ? `<img src="${tab.icon}" width="16" height="16" alt="" class="flex-shrink-0" style="image-rendering:pixelated;">` : '<span class="w-4 h-4 flex-shrink-0"></span>'}
          <span class="truncate">${tab.title}</span>
          ${active ? '<span class="ml-auto text-slate-400 hover:text-slate-600"><i class="fas fa-xmark text-[10px]"></i></span>' : ''}
        </div>
      `;
    });
    tabsHtml += '</div>';
    tabsHtml += '<div class="p-6 text-center text-slate-400 text-sm">Browser tab favicon preview</div>';

    els.tabsContent.innerHTML = tabsHtml;
  }

  // ── Render Export List ──
  function renderExportList() {
    let html = '';
    state.generatedIcons.forEach(icon => {
      const filename = icon.size === 180 ? 'apple-touch-icon.png' : `favicon-${icon.size}x${icon.size}.png`;
      html += `
        <div class="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-3">
            <img src="${icon.dataUrl}" width="16" height="16" alt="" style="image-rendering:${icon.size <= 32 ? 'pixelated' : 'auto'};" class="rounded">
            <span class="text-xs font-mono text-slate-600 dark:text-slate-400">${filename}</span>
            <span class="text-[10px] text-slate-400">${formatBytes(icon.blob.size)}</span>
          </div>
          <button class="download-single p-1.5 rounded-lg hover:bg-emerald-500 hover:text-white transition-all text-slate-400 text-xs" data-size="${icon.size}" title="Download">
            <i class="fas fa-download"></i>
          </button>
        </div>
      `;
    });

    if (state.icoBlob) {
      html += `
        <div class="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-3">
            <i class="fas fa-file text-purple-500 text-xs"></i>
            <span class="text-xs font-mono text-slate-600 dark:text-slate-400">favicon.ico</span>
            <span class="text-[10px] text-slate-400">${formatBytes(state.icoBlob.size)}</span>
          </div>
          <button class="download-ico p-1.5 rounded-lg hover:bg-emerald-500 hover:text-white transition-all text-slate-400 text-xs" title="Download">
            <i class="fas fa-download"></i>
          </button>
        </div>
      `;
    }

    els.exportList.innerHTML = html;
    els.exportInfo.textContent = `${state.generatedIcons.length} PNG${state.icoBlob ? ' + 1 ICO' : ''} · Ready to download individually or as ZIP`;

    // Attach single download handlers
    els.exportList.querySelectorAll('.download-single').forEach(btn => {
      btn.addEventListener('click', function () {
        const size = parseInt(this.getAttribute('data-size'), 10);
        const icon = state.generatedIcons.find(i => i.size === size);
        if (!icon) return;
        const filename = size === 180 ? 'apple-touch-icon.png' : `favicon-${size}x${size}.png`;
        downloadBlob(icon.blob, filename);
      });
    });

    const icoBtn = els.exportList.querySelector('.download-ico');
    if (icoBtn) {
      icoBtn.addEventListener('click', () => {
        if (state.icoBlob) downloadBlob(state.icoBlob, 'favicon.ico');
      });
    }
  }

  // ── Render HTML Code ──
  function renderHTMLCode() {
    let code = '';
    state.generatedIcons.forEach(icon => {
      if (icon.size === 180) {
        code += `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">\n`;
      } else {
        code += `<link rel="icon" type="image/png" sizes="${icon.size}x${icon.size}" href="/favicon-${icon.size}x${icon.size}.png">\n`;
      }
    });
    if (state.icoBlob) {
      code += `<link rel="icon" href="/favicon.ico" sizes="any">\n`;
    }
    els.htmlCodeOutput.textContent = code.trimEnd();
  }

  // ── Download Blob ──
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`, 'success');
  }

  // ── Download ZIP ──
  async function downloadZip() {
    if (state.generatedIcons.length === 0) {
      showToast('Generate favicons first', 'error');
      return;
    }

    try {
      if (typeof JSZip === 'undefined') {
        showToast('JSZip library not loaded', 'error');
        return;
      }

      const zip = new JSZip();

      state.generatedIcons.forEach(icon => {
        const filename = icon.size === 180 ? 'apple-touch-icon.png' : `favicon-${icon.size}x${icon.size}.png`;
        zip.file(filename, icon.blob);
      });

      if (state.icoBlob) {
        zip.file('favicon.ico', state.icoBlob);
      }

      // Add HTML code file
      const htmlCode = els.htmlCodeOutput.textContent;
      zip.file('favicon-code.html', `<!-- Place these tags in your <head> section -->\n${htmlCode}\n`);

      const content = await zip.generateAsync({ type: 'blob' });
      downloadBlob(content, 'favicons.zip');
    } catch (err) {
      showToast('Error creating ZIP: ' + err.message, 'error');
    }
  }

  // ── Clear All ──
  function clearAll() {
    state.sourceImage = null;
    state.sourceFile = null;
    state.sourceWidth = 0;
    state.sourceHeight = 0;
    state.generatedIcons = [];
    state.icoBlob = null;

    els.dropZoneContent.classList.remove('hidden');
    els.dropZonePreview.classList.add('hidden');
    els.sourcePreview.src = '';
    els.sourceName.textContent = '';
    els.sourceDimensions.textContent = '';
    els.fileInput.value = '';

    setStat(els.statSource, '—', false);
    setStat(els.statIcons, '0', false);
    setStat(els.statFormats, '0', false);
    setStat(els.statStatus, 'Idle', false);
    els.statStatus.className = 'text-3xl font-bold text-slate-400';

    els.gridContent.innerHTML = '<span class="text-slate-400 text-sm">Upload an image and generate favicons to see previews here</span>';
    els.tabsContent.innerHTML = '<div class="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 overflow-x-auto"><span class="text-xs text-slate-400 px-4 py-3 whitespace-nowrap">Generate favicons to see tab previews</span></div><div class="p-6 text-center text-slate-400 text-sm">Browser tab simulation will appear here</div>';
    els.exportList.innerHTML = '<p class="text-sm text-slate-400">No favicons generated yet</p>';
    els.exportInfo.textContent = 'Generate favicons to download individual files or a ZIP package';
    els.htmlCodeOutput.textContent = '<!-- Generate favicons to get the HTML code -->';

    updateValidation({
      'has-image': false,
      'valid-format': false,
      'sizes-selected': false,
      'icons-generated': false,
      'ico-created': false,
      'ready-download': false
    });

    showToast('All cleared', 'info');
  }

  // ── Event Listeners ──

  // Drop zone click
  els.dropZone.addEventListener('click', () => els.fileInput.click());

  // File input change
  els.fileInput.addEventListener('change', function () {
    if (this.files && this.files[0]) {
      loadImage(this.files[0]);
    }
  });

  // Drag and drop
  els.dropZone.addEventListener('dragover', function (e) {
    e.preventDefault();
    this.classList.add('border-emerald-500', 'bg-emerald-500/5');
  });

  els.dropZone.addEventListener('dragleave', function (e) {
    e.preventDefault();
    this.classList.remove('border-emerald-500', 'bg-emerald-500/5');
  });

  els.dropZone.addEventListener('drop', function (e) {
    e.preventDefault();
    this.classList.remove('border-emerald-500', 'bg-emerald-500/5');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      loadImage(e.dataTransfer.files[0]);
    }
  });

  // Generate
  els.generateBtn.addEventListener('click', generate);

  // Clear
  els.clearBtn.addEventListener('click', clearAll);

  // Copy HTML
  els.copyHtmlBtn.addEventListener('click', () => {
    const code = els.htmlCodeOutput.textContent;
    if (code.startsWith('<!-- Generate')) {
      showToast('Generate favicons first', 'error');
      return;
    }
    navigator.clipboard.writeText(code).then(() => {
      showToast('HTML code copied to clipboard', 'success');
    });
  });

  // Download ZIP
  els.downloadZipBtn.addEventListener('click', downloadZip);

  // Preview Tabs
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
      document.getElementById(`view-${view}`).classList.remove('hidden');
    });
  });

  // Size checkboxes sync
  document.querySelectorAll('.size-check').forEach(ch => {
    ch.addEventListener('change', () => {
      state.selectedSizes = getSelectedSizes();
      if (state.sourceImage) {
        updateValidation({
          'has-image': true,
          'valid-format': true,
          'sizes-selected': state.selectedSizes.length > 0,
          'icons-generated': false,
          'ico-created': false,
          'ready-download': false
        });
      }
    });
  });

  // Copy Link
  if (els.copyLinkBtn) {
    els.copyLinkBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('Page link copied', 'success');
      });
    });
  }

  // ── Init ──
  updateValidation({
    'has-image': false,
    'valid-format': false,
    'sizes-selected': true,
    'icons-generated': false,
    'ico-created': false,
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
