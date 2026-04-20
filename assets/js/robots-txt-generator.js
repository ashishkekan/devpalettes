// robots-txt-generator.js
(function () {
  'use strict';

  // ─── DOM Elements ───
  const userAgentInput = document.getElementById('rt-user-agent');
  const allowInput = document.getElementById('rt-allow');
  const disallowInput = document.getElementById('rt-disallow');
  const sitemapInput = document.getElementById('rt-sitemap');
  const crawlDelayInput = document.getElementById('rt-crawl-delay');
  const extraSitemapWrap = document.getElementById('rt-extra-sitemap-wrap');
  const extraSitemapInput = document.getElementById('rt-extra-sitemap');
  const sitemapListEl = document.getElementById('rt-sitemap-list');

  const previewContent = document.getElementById('robots-preview-content');
  const rawContent = document.getElementById('robots-raw-content');
  const generatedCode = document.getElementById('generated-code');

  const statRules = document.getElementById('stat-rules');
  const statValid = document.getElementById('stat-valid');
  const statSitemap = document.getElementById('stat-sitemap');
  const statFields = document.getElementById('stat-fields');
  const ruleCountInfo = document.getElementById('rule-count-info');

  const validationList = document.getElementById('validation-list');

  // ─── State ───
  let extraSitemaps = [];

  // ─── Presets ───
  const presets = {
    wordpress: {
      userAgent: '*',
      allow: '/\n/wp-admin/admin-ajax.php',
      disallow: '/wp-admin/\n/wp-content/plugins/\n/wp-content/cache/\n/wp-includes/\n/trackback/\n/*/trackback/\n/*/feed/\n/*/comments/\n/?s=',
      sitemap: 'https://example.com/sitemap.xml',
      crawlDelay: ''
    },
    blog: {
      userAgent: '*',
      allow: '/',
      disallow: '/search/\n/tag/\n/page/\n/*/page/\n/wp-login.php\n/wp-register.php',
      sitemap: 'https://example.com/sitemap.xml',
      crawlDelay: ''
    },
    ecommerce: {
      userAgent: '*',
      allow: '/\n/products/\n/categories/\n/blog/',
      disallow: '/cart/\n/checkout/\n/my-account/\n/?add-to-cart=\n/?filter_\n/?orderby=\n/?min_price=\n/?max_price=',
      sitemap: 'https://example.com/sitemap.xml',
      crawlDelay: '1'
    },
    general: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/\n/private/\n/tmp/\n/*.json$',
      sitemap: 'https://example.com/sitemap.xml',
      crawlDelay: ''
    }
  };

  // ─── Generate robots.txt ───
  function generate() {
    const ua = userAgentInput.value.trim() || '*';
    const allowLines = allowInput.value.split('\n').map(function (l) { return l.trim(); }).filter(function (l) { return l.length > 0; });
    const disallowLines = disallowInput.value.split('\n').map(function (l) { return l.trim(); }).filter(function (l) { return l.length > 0; });
    const mainSitemap = sitemapInput.value.trim();
    const crawlDelay = crawlDelayInput.value.trim();
    const allSitemaps = [mainSitemap].concat(extraSitemaps).filter(function (s) { return s.length > 0; });

    var output = '';
    var ruleCount = 0;

    output += 'User-agent: ' + ua + '\n';
    ruleCount++;

    if (allowLines.length > 0) {
      allowLines.forEach(function (path) {
        output += 'Allow: ' + path + '\n';
        ruleCount++;
      });
    }

    if (disallowLines.length > 0) {
      disallowLines.forEach(function (path) {
        output += 'Disallow: ' + path + '\n';
        ruleCount++;
      });
    } else {
      output += 'Disallow:\n';
      ruleCount++;
    }

    if (crawlDelay !== '') {
      var delay = parseInt(crawlDelay, 10);
      if (!isNaN(delay) && delay >= 0) {
        output += 'Crawl-delay: ' + delay + '\n';
        ruleCount++;
      }
    }

    if (allSitemaps.length > 0) {
      output += '\n';
      allSitemaps.forEach(function (url) {
        output += 'Sitemap: ' + url + '\n';
        ruleCount++;
      });
    }

    var cleanOutput = output.trimEnd();

    previewContent.textContent = cleanOutput;
    rawContent.textContent = cleanOutput;
    generatedCode.textContent = cleanOutput;

    statRules.textContent = ruleCount;
    statRules.classList.remove('text-slate-400');
    statRules.classList.add('text-emerald-500');

    statSitemap.textContent = allSitemaps.length > 0 ? 'Yes' : 'No';
    statSitemap.className = 'text-3xl font-bold ' + (allSitemaps.length > 0 ? 'text-emerald-500' : 'text-slate-400');

    var filledCount = 0;
    if (ua) filledCount++;
    if (allowLines.length > 0) filledCount++;
    if (disallowInput.value.trim().length > 0) filledCount++;
    if (mainSitemap) filledCount++;
    if (crawlDelay) filledCount++;
    statFields.textContent = filledCount + '/5';
    statFields.className = 'text-3xl font-bold ' + (filledCount > 0 ? 'text-emerald-500' : 'text-slate-400');

    ruleCountInfo.textContent = ruleCount + ' rules generated';

    validate(ua, allowLines, disallowLines, allSitemaps, crawlDelay);
  }

  // ─── Validation ───
  function validate(ua, allowLines, disallowLines, allSitemaps, crawlDelay) {
    var checks = validationList.querySelectorAll('[data-check]');
    var allValid = true;

    checks.forEach(function (el) {
      var icon = el.querySelector('i');
      var text = el.querySelector('span');
      icon.className = 'fas fa-circle text-[8px] text-slate-300 dark:text-slate-600';
      text.className = 'text-slate-400';
    });

    function setCheck(key, passed) {
      var el = validationList.querySelector('[data-check="' + key + '"]');
      if (!el) return;
      var icon = el.querySelector('i');
      var text = el.querySelector('span');
      if (passed) {
        icon.className = 'fas fa-circle-check text-[10px] text-emerald-500';
        text.className = 'text-emerald-600 dark:text-emerald-400';
      } else {
        icon.className = 'fas fa-circle-xmark text-[10px] text-red-400';
        text.className = 'text-red-400';
        allValid = false;
      }
    }

    function setNeutral(key) {
      var el = validationList.querySelector('[data-check="' + key + '"]');
      if (!el) return;
      var icon = el.querySelector('i');
      var text = el.querySelector('span');
      icon.className = 'fas fa-circle text-[8px] text-slate-300 dark:text-slate-600';
      text.className = 'text-slate-400';
    }

    setCheck('user-agent', ua.length > 0);
    setCheck('has-rules', allowLines.length > 0 || disallowLines.length > 0);

    var allPaths = allowLines.concat(disallowLines);
    if (allPaths.length > 0) {
      var allStartWithSlash = allPaths.every(function (p) { return p.startsWith('/'); });
      setCheck('paths-valid', allStartWithSlash);
    } else {
      setNeutral('paths-valid');
    }

    if (allowLines.length > 0 && disallowLines.length > 0) {
      var allowSet = new Set(allowLines.map(function (p) { return p.toLowerCase(); }));
      var conflict = false;
      allowSet.forEach(function (p) {
        if (disallowLines.some(function (d) { return d.toLowerCase() === p; })) conflict = true;
      });
      setCheck('no-conflict', !conflict);
    } else {
      setNeutral('no-conflict');
    }

    if (allSitemaps.length > 0) {
      var sitemapValid = allSitemaps.every(function (url) {
        try { new URL(url); return true; } catch (e) { return false; }
      });
      setCheck('sitemap-valid', sitemapValid);
    } else {
      setNeutral('sitemap-valid');
    }

    if (crawlDelay !== '') {
      var delay = parseInt(crawlDelay, 10);
      var cdValid = !isNaN(delay) && delay >= 0;
      setCheck('crawl-delay-valid', cdValid);
    } else {
      setNeutral('crawl-delay-valid');
    }

    if (disallowLines.length === 0 && disallowInput.value.split('\n').some(function (l) { return l.trim().length === 0; })) {
      setNeutral('no-empty-disallow');
    } else if (disallowLines.length > 0) {
      setCheck('no-empty-disallow', true);
    } else {
      setNeutral('no-empty-disallow');
    }

    statValid.textContent = allValid ? 'Yes' : 'No';
    statValid.className = 'text-3xl font-bold ' + (allValid ? 'text-emerald-500' : 'text-red-400');
  }

  // ─── Sitemap List Rendering ───
  function renderSitemapList() {
    if (extraSitemaps.length === 0) {
      sitemapListEl.classList.add('hidden');
      sitemapListEl.innerHTML = '';
      return;
    }
    sitemapListEl.classList.remove('hidden');
    sitemapListEl.innerHTML = extraSitemaps.map(function (url, i) {
      return '<div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs">' +
        '<i class="fas fa-sitemap text-emerald-500 text-[10px]"></i>' +
        '<span class="flex-1 truncate text-slate-600 dark:text-slate-400">' + escapeHtml(url) + '</span>' +
        '<button class="remove-sitemap text-slate-400 hover:text-red-400 transition-colors" data-index="' + i + '">' +
        '<i class="fas fa-xmark"></i></button></div>';
    }).join('');

    sitemapListEl.querySelectorAll('.remove-sitemap').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-index'), 10);
        extraSitemaps.splice(idx, 1);
        renderSitemapList();
        generate();
      });
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ─── Preset Buttons ───
  document.querySelectorAll('.preset-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = this.getAttribute('data-preset');
      var preset = presets[key];
      if (!preset) return;

      userAgentInput.value = preset.userAgent;
      allowInput.value = preset.allow;
      disallowInput.value = preset.disallow;
      sitemapInput.value = preset.sitemap;
      crawlDelayInput.value = preset.crawlDelay;

      extraSitemaps = [];
      renderSitemapList();

      generate();
      showToast('Preset "' + key + '" applied', 'success');
    });
  });

  // ─── Reset Button ───
  document.getElementById('rt-reset-btn').addEventListener('click', function () {
    userAgentInput.value = '*';
    allowInput.value = '';
    disallowInput.value = '';
    sitemapInput.value = '';
    crawlDelayInput.value = '';
    extraSitemaps = [];
    renderSitemapList();
    extraSitemapWrap.classList.add('hidden');
    extraSitemapInput.value = '';
    generate();
    showToast('All fields reset', 'info');
  });

  // ─── Add Sitemap Buttons ───
  document.getElementById('rt-add-sitemap-btn').addEventListener('click', function () {
    extraSitemapWrap.classList.remove('hidden');
    extraSitemapInput.focus();
  });

  document.getElementById('rt-add-extra-sitemap-btn').addEventListener('click', function () {
    var url = extraSitemapInput.value.trim();
    if (!url) {
      showToast('Please enter a sitemap URL', 'error');
      return;
    }
    try {
      new URL(url);
    } catch (e) {
      showToast('Please enter a valid URL', 'error');
      return;
    }
    if (extraSitemaps.indexOf(url) !== -1 || url === sitemapInput.value.trim()) {
      showToast('This sitemap URL already exists', 'error');
      return;
    }
    extraSitemaps.push(url);
    extraSitemapInput.value = '';
    extraSitemapWrap.classList.add('hidden');
    renderSitemapList();
    generate();
    showToast('Sitemap added', 'success');
  });

  // ─── Copy Buttons ───
  document.getElementById('copy-tags-btn').addEventListener('click', function () {
    copyToClipboard(generatedCode.textContent, 'robots.txt copied to clipboard');
  });

  document.getElementById('copy-code-inline').addEventListener('click', function () {
    copyToClipboard(rawContent.textContent, 'robots.txt copied to clipboard');
  });

  // ─── Download Button ───
  document.getElementById('download-file-btn').addEventListener('click', function () {
    var text = generatedCode.textContent;
    var blob = new Blob([text], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('robots.txt downloaded', 'success');
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
    if (!container) return;
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

  // ─── Input Listeners ───
  [userAgentInput, allowInput, disallowInput, sitemapInput, crawlDelayInput].forEach(function (el) {
    el.addEventListener('input', generate);
    el.addEventListener('change', generate);
  });

  // ─── Initialize ───
  generate();

  if (window.Devpalettes && window.Devpalettes.PageHelpers) {
    window.Devpalettes.PageHelpers.initFaqToggles();
    window.Devpalettes.PageHelpers.initCopyLinkButton({ notify: showToast });
  }

})();
