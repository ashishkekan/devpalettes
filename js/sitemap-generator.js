// sitemap-generator.js

(function () {
  'use strict';

  // ─── DOM Elements ───
  var baseUrlInput = document.getElementById('sm-base-url');
  var urlListEl = document.getElementById('sm-url-list');
  var addUrlBtn = document.getElementById('sm-add-url-btn');
  var freqSelect = document.getElementById('sm-freq');
  var prioritySlider = document.getElementById('sm-priority');
  var priorityValue = document.getElementById('sm-priority-value');
  var priorityBar = document.getElementById('sm-priority-bar');
  var lastmodInput = document.getElementById('sm-lastmod');
  var autoDateBtn = document.getElementById('sm-auto-date-btn');
  var resetBtn = document.getElementById('sm-reset-btn');

  var previewContent = document.getElementById('sitemap-preview-content');
  var rawContent = document.getElementById('sitemap-raw-content');
  var generatedCode = document.getElementById('generated-code');

  var statUrls = document.getElementById('stat-urls');
  var statValid = document.getElementById('stat-valid');
  var statStatus = document.getElementById('stat-status');
  var statUpdated = document.getElementById('stat-updated');
  var urlCountInfo = document.getElementById('url-count-info');

  var validationList = document.getElementById('validation-list');

  // ─── State ───
  var urlEntries = [];
  var entryIdCounter = 0;

  // ─── Frequency Options ───
  var freqOptions = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];

  // ─── Presets ───
  var presets = {
    blog: {
      baseUrl: 'https://example.com',
      freq: 'weekly',
      priority: 5,
      urls: [
        { url: 'https://example.com/', freq: 'daily', priority: 10 },
        { url: 'https://example.com/blog/', freq: 'daily', priority: 8 },
        { url: 'https://example.com/blog/my-first-post/', freq: 'monthly', priority: 6 },
        { url: 'https://example.com/blog/another-post/', freq: 'monthly', priority: 6 },
        { url: 'https://example.com/about/', freq: 'yearly', priority: 4 },
        { url: 'https://example.com/contact/', freq: 'yearly', priority: 3 }
      ]
    },
    ecommerce: {
      baseUrl: 'https://example.com',
      freq: 'weekly',
      priority: 5,
      urls: [
        { url: 'https://example.com/', freq: 'daily', priority: 10 },
        { url: 'https://example.com/shop/', freq: 'daily', priority: 9 },
        { url: 'https://example.com/shop/category/electronics/', freq: 'weekly', priority: 7 },
        { url: 'https://example.com/products/wireless-headphones/', freq: 'weekly', priority: 6 },
        { url: 'https://example.com/products/mechanical-keyboard/', freq: 'weekly', priority: 6 },
        { url: 'https://example.com/cart/', freq: 'never', priority: 1 },
        { url: 'https://example.com/checkout/', freq: 'never', priority: 1 },
        { url: 'https://example.com/about/', freq: 'yearly', priority: 3 }
      ]
    },
    portfolio: {
      baseUrl: 'https://example.com',
      freq: 'monthly',
      priority: 5,
      urls: [
        { url: 'https://example.com/', freq: 'weekly', priority: 10 },
        { url: 'https://example.com/portfolio/', freq: 'weekly', priority: 8 },
        { url: 'https://example.com/portfolio/brand-identity-project/', freq: 'monthly', priority: 6 },
        { url: 'https://example.com/portfolio/web-design-project/', freq: 'monthly', priority: 6 },
        { url: 'https://example.com/about/', freq: 'yearly', priority: 5 },
        { url: 'https://example.com/contact/', freq: 'yearly', priority: 4 }
      ]
    },
    saas: {
      baseUrl: 'https://example.com',
      freq: 'weekly',
      priority: 5,
      urls: [
        { url: 'https://example.com/', freq: 'daily', priority: 10 },
        { url: 'https://example.com/features/', freq: 'monthly', priority: 8 },
        { url: 'https://example.com/pricing/', freq: 'weekly', priority: 9 },
        { url: 'https://example.com/docs/', freq: 'weekly', priority: 7 },
        { url: 'https://example.com/blog/', freq: 'daily', priority: 7 },
        { url: 'https://example.com/about/', freq: 'yearly', priority: 4 },
        { url: 'https://example.com/contact/', freq: 'yearly', priority: 3 },
        { url: 'https://example.com/signup/', freq: 'monthly', priority: 8 }
      ]
    }
  };

  // ─── Escape XML ───
  function escapeXml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // ─── Validate URL ───
  function isValidUrl(str) {
    if (!str || str.trim().length === 0) return false;
    try {
      var url = new URL(str.trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) {
      return false;
    }
  }

  // ─── Create URL Entry Row ───
  function createEntryRow(data) {
    var id = entryIdCounter++;
    var entry = {
      id: id,
      url: data ? data.url : '',
      freq: data ? data.freq : freqSelect.value,
      priority: data ? data.priority : parseInt(prioritySlider.value, 10)
    };
    urlEntries.push(entry);

    var row = document.createElement('div');
    row.setAttribute('data-entry-id', id);
    row.className = 'url-entry flex gap-2 items-start';

    var freqOptionsHtml = freqOptions.map(function (f) {
      return '<option value="' + f + '"' + (f === entry.freq ? ' selected' : '') + '>' + f + '</option>';
    }).join('');

    var priVal = (entry.priority / 10).toFixed(1);

    row.innerHTML =
      '<div class="flex-1 space-y-2">' +
        '<input type="url" class="entry-url w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm" placeholder="https://example.com/page/" value="' + escapeXml(entry.url) + '">' +
        '<div class="flex gap-2">' +
          '<select class="entry-freq flex-1 px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-xs appearance-none cursor-pointer">' +
            freqOptionsHtml +
          '</select>' +
          '<div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">' +
            '<span class="text-[10px] text-slate-400 font-medium">PRI</span>' +
            '<input type="range" class="entry-priority w-16 h-1.5 rounded-full appearance-none cursor-pointer accent-emerald-500 bg-slate-200 dark:bg-slate-700" min="0" max="10" value="' + entry.priority + '">' +
            '<span class="entry-pri-label text-xs font-bold text-emerald-600 dark:text-emerald-400 w-6 text-right">' + priVal + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<button class="remove-entry p-2.5 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-sm transition-all hover:border-red-400/50 hover:bg-red-500/5 hover:text-red-400 text-slate-400 flex-shrink-0 mt-0.5" title="Remove URL">' +
        '<i class="fas fa-trash-can text-xs"></i>' +
      '</button>';

    urlListEl.appendChild(row);

    // Bind events
    var urlInput = row.querySelector('.entry-url');
    var freqSel = row.querySelector('.entry-freq');
    var priSlider = row.querySelector('.entry-priority');
    var priLabel = row.querySelector('.entry-pri-label');
    var removeBtn = row.querySelector('.remove-entry');

    urlInput.addEventListener('input', function () {
      entry.url = this.value;
      generate();
    });

    freqSel.addEventListener('change', function () {
      entry.freq = this.value;
      generate();
    });

    priSlider.addEventListener('input', function () {
      entry.priority = parseInt(this.value, 10);
      priLabel.textContent = (entry.priority / 10).toFixed(1);
      generate();
    });

    removeBtn.addEventListener('click', function () {
      urlEntries = urlEntries.filter(function (e) { return e.id !== id; });
      row.remove();
      generate();
    });

    return entry;
  }

  // ─── Generate XML ───
  function generate() {
    var defaultFreq = freqSelect.value;
    var defaultPriority = parseInt(prioritySlider.value, 10) / 10;
    var lastmod = lastmodInput.value;

    // Collect URLs with defaults
    var items = urlEntries.map(function (entry) {
      return {
        url: entry.url.trim(),
        freq: entry.freq || defaultFreq,
        priority: (entry.priority / 10).toFixed(1),
        lastmod: lastmod
      };
    }).filter(function (item) { return item.url.length > 0; });

    // Build XML
    var xmlLines = [];
    xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
    xmlLines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

    if (items.length === 0) {
      xmlLines.push('  <!-- Add URLs to generate sitemap -->');
    } else {
      items.forEach(function (item) {
        xmlLines.push('  <url>');
        xmlLines.push('    <loc>' + escapeXml(item.url) + '</loc>');
        if (item.lastmod) {
          xmlLines.push('    <lastmod>' + escapeXml(item.lastmod) + '</lastmod>');
        }
        xmlLines.push('    <changefreq>' + escapeXml(item.freq) + '</changefreq>');
        xmlLines.push('    <priority>' + escapeXml(item.priority) + '</priority>');
        xmlLines.push('  </url>');
      });
    }

    xmlLines.push('</urlset>');

    var xmlString = xmlLines.join('\n');

    // Update all views
    previewContent.textContent = xmlString;
    rawContent.textContent = xmlString;
    generatedCode.textContent = xmlString;

    // Stats
    var totalUrls = items.length;
    var validUrls = items.filter(function (item) { return isValidUrl(item.url); }).length;

    statUrls.textContent = totalUrls;
    statUrls.className = 'text-3xl font-bold ' + (totalUrls > 0 ? 'text-emerald-500' : 'text-slate-400');

    statValid.textContent = validUrls;
    statValid.className = 'text-3xl font-bold ' + (validUrls === totalUrls && totalUrls > 0 ? 'text-emerald-500' : validUrls > 0 ? 'text-amber-500' : 'text-slate-400');

    if (totalUrls > 0 && validUrls === totalUrls) {
      statStatus.textContent = 'Valid';
      statStatus.className = 'text-3xl font-bold text-emerald-500';
    } else if (totalUrls > 0) {
      statStatus.textContent = 'Issues';
      statStatus.className = 'text-3xl font-bold text-amber-500';
    } else {
      statStatus.textContent = 'Empty';
      statStatus.className = 'text-3xl font-bold text-slate-400';
    }

    if (lastmod) {
      statUpdated.textContent = lastmod;
      statUpdated.className = 'text-lg font-bold text-blue-500';
    } else {
      statUpdated.textContent = '—';
      statUpdated.className = 'text-3xl font-bold text-slate-400';
    }

    urlCountInfo.textContent = totalUrls + ' URL' + (totalUrls !== 1 ? 's' : '') + ' in sitemap';

    // Validation
    validate(items, validUrls);
  }

  // ─── Validation ───
  function validate(items, validUrls) {
    var baseUrl = baseUrlInput.value.trim();
    var totalUrls = items.length;
    var allValid = true;

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
        allValid = false;
      } else {
        icon.className = 'fas fa-circle text-[8px] text-slate-300 dark:text-slate-600';
        text.className = 'text-slate-400';
      }
    }

    function setNeutral(key) {
      setCheck(key, null);
    }

    // 1. Base URL valid
    setCheck('base-url', isValidUrl(baseUrl));

    // 2. Has URLs
    setCheck('has-urls', totalUrls > 0);

    // 3. All URLs valid
    if (totalUrls > 0) {
      setCheck('all-valid', validUrls === totalUrls);
    } else {
      setNeutral('all-valid');
    }

    // 4. No duplicates
    if (totalUrls > 1) {
      var urls = items.map(function (i) { return i.url.toLowerCase(); });
      var unique = new Set(urls);
      setCheck('no-duplicates', unique.size === urls.length);
    } else {
      setNeutral('no-duplicates');
    }

    // 5. Frequency set
    setCheck('freq-valid', freqSelect.value.length > 0);

    // 6. Priority valid (always true since slider is 0-10, mapped to 0.0-1.0)
    setCheck('priority-valid', true);

    // 7. XML well-formed (always true since we generate it)
    if (totalUrls > 0) {
      setCheck('xml-valid', validUrls === totalUrls);
    } else {
      setNeutral('xml-valid');
    }

    // Fix priority check - always show green since slider enforces range
    var priCheck = validationList.querySelector('[data-check="priority-valid"]');
    if (priCheck) {
      var icon = priCheck.querySelector('i');
      var text = priCheck.querySelector('span');
      icon.className = 'fas fa-circle-check text-[10px] text-emerald-500';
      text.className = 'text-emerald-600 dark:text-emerald-400';
    }
  }

  // ─── Add URL Button ───
  addUrlBtn.addEventListener('click', function () {
    createEntryRow(null);
    // Scroll to new entry
    var lastEntry = urlListEl.lastElementChild;
    if (lastEntry) {
      lastEntry.querySelector('.entry-url').focus();
    }
    generate();
  });

  // ─── Priority Slider ───
  prioritySlider.addEventListener('input', function () {
    var val = parseInt(this.value, 10);
    priorityValue.textContent = (val / 10).toFixed(1);
    priorityBar.style.width = (val * 10) + '%';
    generate();
  });

  // ─── Frequency Change ───
  freqSelect.addEventListener('change', generate);

  // ─── Lastmod ───
  lastmodInput.addEventListener('input', generate);
  lastmodInput.addEventListener('change', generate);

  autoDateBtn.addEventListener('click', function () {
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var dd = String(today.getDate()).padStart(2, '0');
    lastmodInput.value = yyyy + '-' + mm + '-' + dd;
    generate();
    showToast('Date set to today', 'success');
  });

  // ─── Base URL ───
  baseUrlInput.addEventListener('input', generate);
  baseUrlInput.addEventListener('change', generate);

  // ─── Reset ───
  resetBtn.addEventListener('click', function () {
    baseUrlInput.value = '';
    freqSelect.value = 'weekly';
    prioritySlider.value = 5;
    priorityValue.textContent = '0.5';
    priorityBar.style.width = '50%';
    lastmodInput.value = '';
    urlEntries = [];
    urlListEl.innerHTML = '';
    createEntryRow(null);
    generate();
    showToast('All fields reset', 'info');
  });

  // ─── Presets ───
  document.querySelectorAll('.preset-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = this.getAttribute('data-preset');
      var preset = presets[key];
      if (!preset) return;

      baseUrlInput.value = preset.baseUrl;
      freqSelect.value = preset.freq;
      prioritySlider.value = preset.priority;
      priorityValue.textContent = (preset.priority / 10).toFixed(1);
      priorityBar.style.width = (preset.priority * 10) + '%';

      // Set today's date
      var today = new Date();
      var yyyy = today.getFullYear();
      var mm = String(today.getMonth() + 1).padStart(2, '0');
      var dd = String(today.getDate()).padStart(2, '0');
      lastmodInput.value = yyyy + '-' + mm + '-' + dd;

      // Clear and rebuild entries
      urlEntries = [];
      urlListEl.innerHTML = '';
      preset.urls.forEach(function (urlData) {
        createEntryRow(urlData);
      });

      generate();
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

      document.getElementById('view-preview').classList.toggle('hidden', view !== 'preview');
      document.getElementById('view-raw').classList.toggle('hidden', view !== 'raw');
    });
  });

  // ─── Copy Buttons ───
  document.getElementById('copy-tags-btn').addEventListener('click', function () {
    copyToClipboard(generatedCode.textContent, 'Sitemap XML copied to clipboard');
  });

  document.getElementById('copy-code-inline').addEventListener('click', function () {
    copyToClipboard(rawContent.textContent, 'Sitemap XML copied to clipboard');
  });

  // ─── Download ───
  document.getElementById('download-file-btn').addEventListener('click', function () {
    var text = generatedCode.textContent;
    var blob = new Blob([text], { type: 'application/xml' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('sitemap.xml downloaded', 'success');
  });

  // ─── Copy Helper ───
  function copyToClipboard(text, message) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast(message, 'success');
      }).catch(function () {
        fallbackCopy(text, message);
      });
    } else {
      fallbackCopy(text, message);
    }
  }

  function fallbackCopy(text, message) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast(message, 'success');
    } catch (e) {
      showToast('Failed to copy', 'error');
    }
    document.body.removeChild(textarea);
  }

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

  // ─── Initialize ───
  createEntryRow(null);
  generate();

})();
