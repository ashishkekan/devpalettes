// UUID Generator - ../js/uuid-generator.js
(function () {
  'use strict';

  // ── State ──
  const state = {
    uuids: [],
    version: 'v4',
    quantity: 1,
    format: 'standard',
    generatedAt: null
  };

  // ── DOM References ──
  const els = {
    versionSelect: document.getElementById('uuid-version'),
    quantitySlider: document.getElementById('uuid-quantity-slider'),
    quantityInput: document.getElementById('uuid-quantity-input'),
    generateBtn: document.getElementById('generate-btn'),
    clearBtn: document.getElementById('clear-btn'),
    listContent: document.getElementById('uuid-list-content'),
    rawContent: document.getElementById('uuid-raw-content'),
    generatedCode: document.getElementById('generated-code'),
    outputInfo: document.getElementById('uuid-output-info'),
    copyBtn: document.getElementById('copy-uuids-btn'),
    copyInline: document.getElementById('copy-code-inline'),
    downloadBtn: document.getElementById('download-file-btn'),
    statCount: document.getElementById('stat-count'),
    statVersion: document.getElementById('stat-version'),
    statStatus: document.getElementById('stat-status'),
    statTime: document.getElementById('stat-time'),
    validationList: document.getElementById('validation-list'),
    copyLinkBtn: document.getElementById('copy-link-btn')
  };

  // ── UUID v4 Generator (RFC 4122 compliant) ──
  function generateUUIDv4() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    // Set version to 4 (bits 12-15 of time_hi_and_version)
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    // Set variant to RFC 4122 (bits 6-7 of clock_seq_hi_and_reserved)
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  // ── Format UUID ──
  function formatUUID(uuid) {
    switch (state.format) {
      case 'uppercase':
        return uuid.toUpperCase();
      case 'no-dashes':
        return uuid.replace(/-/g, '');
      case 'braces':
        return `{${uuid}}`;
      default:
        return uuid;
    }
  }

  // ── RFC 4122 Validation ──
  function isValidUUIDv4(uuid) {
    const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return pattern.test(uuid);
  }

  // ── Check for duplicates ──
  function hasDuplicates(arr) {
    return new Set(arr).size !== arr.length;
  }

  // ── Update Stats ──
  function updateStats() {
    els.statCount.textContent = state.uuids.length;
    els.statCount.classList.remove('text-slate-400');
    els.statCount.classList.add('text-slate-900', 'dark:text-slate-100');

    els.statVersion.textContent = state.version;
    els.statVersion.classList.remove('text-slate-400');
    els.statVersion.classList.add('text-slate-900', 'dark:text-slate-100');

    if (state.generatedAt) {
      const now = state.generatedAt;
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      els.statTime.textContent = `${h}:${m}:${s}`;
      els.statTime.classList.remove('text-slate-400');
      els.statTime.classList.add('text-slate-900', 'dark:text-slate-100');
    }
  }

  function setStatus(text, color) {
    els.statStatus.textContent = text;
    els.statStatus.className = `text-3xl font-bold text-${color}`;
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

  // ── Render Output ──
  function renderOutput() {
    if (state.uuids.length === 0) return;

    // List view
    els.listContent.innerHTML = state.uuids.map((uuid, i) => {
      const idx = String(i + 1).padStart(String(state.uuids.length).length, ' ');
      return `<div class="flex items-start gap-2 group"><span class="text-slate-400 select-none text-xs w-6 shrink-0 text-right">${idx}.</span><button class="uuid-copy-single flex-1 text-left hover:text-emerald-500 transition-colors break-all" data-uuid="${uuid}" title="Click to copy">${uuid}</button></div>`;
    }).join('');

    // Attach single-copy handlers
    els.listContent.querySelectorAll('.uuid-copy-single').forEach(btn => {
      btn.addEventListener('click', function () {
        const uuid = this.getAttribute('data-uuid');
        navigator.clipboard.writeText(uuid).then(() => {
          showToast('UUID copied to clipboard', 'success');
          this.classList.add('text-emerald-500');
          setTimeout(() => this.classList.remove('text-emerald-500'), 1000);
        });
      });
    });

    // Raw view
    els.rawContent.textContent = state.uuids.join('\n');

    // Export preview
    const preview = state.uuids.slice(0, 5).join('\n');
    const suffix = state.uuids.length > 5 ? `\n... and ${state.uuids.length - 5} more` : '';
    els.generatedCode.textContent = preview + suffix;

    // Output info
    const totalChars = state.uuids.join('\n').length;
    els.outputInfo.textContent = `${state.uuids.length} UUID${state.uuids.length > 1 ? 's' : ''} generated · ${formatBytes(totalChars)} · ${state.format} format`;
  }

  // ── Format bytes ──
  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024).toFixed(1) + ' KB';
  }

  // ── Toast ──
  function showToast(message, type) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const colors = {
      success: 'bg-emerald-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    };
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

  // ── Generate ──
  function generate() {
    const qty = Math.max(1, Math.min(500, state.quantity));

    setStatus('Working...', 'amber-500');
    updateValidation({
      'version-selected': true,
      'quantity-set': true,
      'uuids-generated': false,
      'rfc-compliant': false,
      'no-duplicates': false,
      'output-ready': false
    });

    // Use setTimeout to allow UI update
    setTimeout(() => {
      const rawUUIDs = [];
      for (let i = 0; i < qty; i++) {
        rawUUIDs.push(generateUUIDv4());
      }

      state.uuids = rawUUIDs.map(formatUUID);
      state.generatedAt = new Date();

      // Validate
      const allValid = rawUUIDs.every(isValidUUIDv4);
      const noDups = !hasDuplicates(rawUUIDs);

      setStatus('Done', 'emerald-500');
      updateStats();
      renderOutput();
      updateValidation({
        'version-selected': true,
        'quantity-set': true,
        'uuids-generated': true,
        'rfc-compliant': allValid,
        'no-duplicates': noDups,
        'output-ready': true
      });
    }, 50);
  }

  // ── Reset ──
  function reset() {
    state.uuids = [];
    state.quantity = 1;
    state.format = 'standard';
    state.generatedAt = null;

    els.quantitySlider.value = 1;
    els.quantityInput.value = 1;
    document.querySelector('input[name="format"][value="standard"]').checked = true;

    els.listContent.innerHTML = '<span class="text-slate-400">Click "Generate UUIDs" to create random UUIDs</span>';
    els.rawContent.textContent = 'Click "Generate UUIDs" to see raw output here';
    els.generatedCode.textContent = 'No UUIDs generated yet';
    els.outputInfo.textContent = 'Generate UUIDs to see exportable output';

    els.statCount.textContent = '0';
    els.statCount.className = 'text-3xl font-bold text-slate-400';
    els.statVersion.textContent = 'v4';
    els.statVersion.className = 'text-3xl font-bold text-slate-400';
    els.statStatus.textContent = 'Idle';
    els.statStatus.className = 'text-3xl font-bold text-slate-400';
    els.statTime.textContent = '--:--';
    els.statTime.className = 'text-3xl font-bold text-slate-400';

    updateValidation({
      'version-selected': true,
      'quantity-set': false,
      'uuids-generated': false,
      'rfc-compliant': false,
      'no-duplicates': false,
      'output-ready': false
    });

    showToast('Generator reset', 'info');
  }

  // ── Copy All ──
  function copyAll() {
    if (state.uuids.length === 0) {
      showToast('No UUIDs to copy', 'error');
      return;
    }
    navigator.clipboard.writeText(state.uuids.join('\n')).then(() => {
      showToast(`${state.uuids.length} UUID${state.uuids.length > 1 ? 's' : ''} copied`, 'success');
    });
  }

  // ── Download ──
  function downloadFile() {
    if (state.uuids.length === 0) {
      showToast('No UUIDs to download', 'error');
      return;
    }
    const content = state.uuids.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('File downloaded', 'success');
  }

  // ── Event Listeners ──
  els.versionSelect.addEventListener('change', function () {
    state.version = this.value;
    els.statVersion.textContent = state.version;
  });

  els.quantitySlider.addEventListener('input', function () {
    state.quantity = parseInt(this.value, 10);
    els.quantityInput.value = state.quantity;
  });

  els.quantityInput.addEventListener('input', function () {
    let val = parseInt(this.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 500) val = 500;
    state.quantity = val;
    els.quantitySlider.value = Math.min(val, 100);
  });

  document.querySelectorAll('input[name="format"]').forEach(radio => {
    radio.addEventListener('change', function () {
      state.format = this.value;
      // Re-format existing UUIDs if any
      if (state.uuids.length > 0) {
        generate();
      }
    });
  });

  els.generateBtn.addEventListener('click', generate);
  els.clearBtn.addEventListener('click', reset);
  els.copyBtn.addEventListener('click', copyAll);
  els.copyInline.addEventListener('click', copyAll);
  els.downloadBtn.addEventListener('click', downloadFile);

  // ── Preview Tabs ──
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

  // ── Presets ──
  const presets = {
    single: { quantity: 1, format: 'standard' },
    batch10: { quantity: 10, format: 'standard' },
    batch50: { quantity: 50, format: 'standard' },
    uppercase: { quantity: 1, format: 'uppercase' }
  };

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const preset = presets[this.getAttribute('data-preset')];
      if (!preset) return;

      state.quantity = preset.quantity;
      state.format = preset.format;

      els.quantityInput.value = preset.quantity;
      els.quantitySlider.value = Math.min(preset.quantity, 100);

      document.querySelectorAll('input[name="format"]').forEach(r => {
        r.checked = r.value === preset.format;
      });

      generate();
    });
  });

  // ── Copy Link ──
  if (els.copyLinkBtn) {
    els.copyLinkBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('Page link copied', 'success');
      });
    });
  }

  // ── Keyboard Shortcut ──
  document.addEventListener('keydown', function (e) {
    // Ctrl/Cmd + Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      generate();
    }
  });

  // ── Init validation ──
  updateValidation({
    'version-selected': true,
    'quantity-set': true,
    'uuids-generated': false,
    'rfc-compliant': false,
    'no-duplicates': false,
    'output-ready': false
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
