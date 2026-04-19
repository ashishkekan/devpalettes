// utm-builder.js

(function () {
  'use strict';

  // ─── DOM Elements ───
  var urlInput = document.getElementById('utm-url');
  var sourceInput = document.getElementById('utm-source');
  var mediumInput = document.getElementById('utm-medium');
  var campaignInput = document.getElementById('utm-campaign');
  var termInput = document.getElementById('utm-term');
  var contentInput = document.getElementById('utm-content');

  var previewContent = document.getElementById('url-preview-content');
  var paramsRawContent = document.getElementById('params-raw-content');
  var generatedCode = document.getElementById('generated-code');

  var statParams = document.getElementById('stat-params');
  var statValid = document.getElementById('stat-valid');
  var statReady = document.getElementById('stat-ready');
  var statFields = document.getElementById('stat-fields');
  var paramCountInfo = document.getElementById('param-count-info');

  var validationList = document.getElementById('validation-list');

  // ─── Presets ───
  var presets = {
    facebook: { source: 'facebook', medium: 'cpc' },
    google: { source: 'google', medium: 'cpc' },
    email: { source: 'newsletter', medium: 'email' },
    instagram: { source: 'instagram', medium: 'social' },
    linkedin: { source: 'linkedin', medium: 'social' },
    twitter: { source: 'x', medium: 'social' }
  };

  // ─── Helpers ───
  function isValidUrl(str) {
    if (!str || str.trim().length === 0) return false;
    try {
      var url = new URL(str.trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) {
      return false;
    }
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ─── Generate UTM URL ───
  function generate() {
    var baseUrl = urlInput.value.trim();
    var source = sourceInput.value.trim();
    var medium = mediumInput.value.trim();
    var campaign = campaignInput.value.trim();
    var term = termInput.value.trim();
    var content = contentInput.value.trim();

    // Build params array
    var params = [];
    if (source) params.push({ key: 'utm_source', value: source });
    if (medium) params.push({ key: 'utm_medium', value: medium });
    if (campaign) params.push({ key: 'utm_campaign', value: campaign });
    if (term) params.push({ key: 'utm_term', value: term });
    if (content) params.push({ key: 'utm_content', value: content });

    // Build query string
    var queryString = params.map(function (p) {
      return encodeURIComponent(p.key) + '=' + encodeURIComponent(p.value);
    }).join('&');

    // Build full URL
    var fullUrl = '';
    if (baseUrl && queryString) {
      var separator = baseUrl.indexOf('?') !== -1 ? '&' : '?';
      fullUrl = baseUrl + separator + queryString;
    } else if (baseUrl) {
      fullUrl = baseUrl;
    } else {
      fullUrl = '';
    }

    // Update preview views
    if (fullUrl) {
      previewContent.textContent = fullUrl;
      generatedCode.textContent = fullUrl;
    } else {
      previewContent.textContent = 'Enter your URL and campaign parameters to generate a tracked link';
      generatedCode.textContent = 'Enter your URL and campaign parameters to generate a tracked link';
    }

    // Update params-only view
    if (queryString) {
      paramsRawContent.textContent = '?' + queryString;
    } else {
      paramsRawContent.textContent = 'No parameters generated yet';
    }

    // Stats
    var paramCount = params.length;
    statParams.textContent = paramCount + '/5';
    statParams.className = 'text-3xl font-bold ' + (paramCount > 0 ? 'text-emerald-500' : 'text-slate-400');

    var urlValid = isValidUrl(baseUrl);
    statValid.textContent = urlValid ? 'Yes' : 'No';
    statValid.className = 'text-3xl font-bold ' + (urlValid ? 'text-emerald-500' : 'text-slate-400');

    var ready = urlValid && source && medium && campaign;
    statReady.textContent = ready ? 'Yes' : 'No';
    statReady.className = 'text-3xl font-bold ' + (ready ? 'text-emerald-500' : 'text-slate-400');

    var filledCount = 0;
    if (baseUrl) filledCount++;
    if (source) filledCount++;
    if (medium) filledCount++;
    if (campaign) filledCount++;
    if (term) filledCount++;
    if (content) filledCount++;
    statFields.textContent = filledCount + '/6';
    statFields.className = 'text-3xl font-bold ' + (filledCount > 0 ? 'text-emerald-500' : 'text-slate-400');

    paramCountInfo.textContent = paramCount + ' UTM parameter' + (paramCount !== 1 ? 's' : '') + ' attached';

    // Validation
    validate(baseUrl, source, medium, campaign, term, content);
  }

  // ─── Validation ───
  function validate(baseUrl, source, medium, campaign, term, content) {
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

    // 1. URL valid
    setCheck('url-valid', isValidUrl(baseUrl));

    // 2. Source filled
    setCheck('source-filled', source.length > 0);

    // 3. Medium filled
    setCheck('medium-filled', medium.length > 0);

    // 4. Campaign filled
    setCheck('campaign-filled', campaign.length > 0);

    // 5. No spaces in values
    var allValues = [source, medium, campaign, term, content].filter(function (v) { return v.length > 0; });
    if (allValues.length > 0) {
      var hasSpaces = allValues.some(function (v) { return /\s/.test(v); });
      setCheck('no-spaces', !hasSpaces);
    } else {
      setNeutral('no-spaces');
    }

    // 6. Lowercase recommended
    if (allValues.length > 0) {
      var hasUppercase = allValues.some(function (v) { return v !== v.toLowerCase(); });
      if (hasUppercase) {
        setCheck('lowercase', false);
      } else {
        setCheck('lowercase', true);
      }
    } else {
      setNeutral('lowercase');
    }

    // 7. No special characters (warn on &, #, @, %, +)
    if (allValues.length > 0) {
      var hasSpecial = allValues.some(function (v) { return /[&#@%+]/.test(v); });
      setCheck('no-special', !hasSpecial);
    } else {
      setNeutral('no-special');
    }
  }

  // ─── Input Listeners ───
  [urlInput, sourceInput, mediumInput, campaignInput, termInput, contentInput].forEach(function (el) {
    el.addEventListener('input', generate);
    el.addEventListener('change', generate);
  });

  // ─── Preset Buttons ───
  document.querySelectorAll('.preset-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = this.getAttribute('data-preset');
      var preset = presets[key];
      if (!preset) return;

      sourceInput.value = preset.source;
      mediumInput.value = preset.medium;
      generate();
      showToast('Preset "' + key + '" applied — fill in campaign name and URL', 'success');
    });
  });

  // ─── Reset Button ───
  document.getElementById('utm-reset-btn').addEventListener('click', function () {
    urlInput.value = '';
    sourceInput.value = '';
    mediumInput.value = '';
    campaignInput.value = '';
    termInput.value = '';
    contentInput.value = '';
    generate();
    showToast('All fields reset', 'info');
  });

  // ─── Preview Tabs ───
  document.querySelectorAll('.preview-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var view = this.getAttribute('data-view');

      document.querySelectorAll('.preview-tab').forEach(function (t) {
        t.className = 'preview-tab px-3 py-1.5 rounded-lg text-xs font-medium border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 transition-all hover:border-emerald-500/50';
      });
      this.className = 'preview-tab active-tab px-3 py-1.5 rounded-lg text-xs font-medium border-2 border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-all';

      document.getElementById('view-full').classList.toggle('hidden', view !== 'full');
      document.getElementById('view-params').classList.toggle('hidden', view !== 'params');
    });
  });

  // ─── Copy Buttons ───
  document.getElementById('copy-tags-btn').addEventListener('click', function () {
    var text = generatedCode.textContent;
    var placeholder = 'Enter your URL and campaign parameters to generate a tracked link';
    if (text === placeholder) {
      showToast('Generate a URL first', 'error');
      return;
    }
    copyToClipboard(text, 'UTM URL copied to clipboard');
  });

  document.getElementById('copy-params-inline').addEventListener('click', function () {
    var text = paramsRawContent.textContent;
    var placeholder = 'No parameters generated yet';
    if (text === placeholder) {
      showToast('No parameters to copy', 'error');
      return;
    }
    copyToClipboard(text, 'UTM parameters copied to clipboard');
  });

  // ─── Shorten Button (placeholder) ───
  document.getElementById('shorten-btn').addEventListener('click', function () {
    showToast('URL shortening requires an API key — coming soon', 'info');
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
  generate();

})();
