// canonical-checker.js

(function () {
  'use strict';

  // ─── DOM Elements ───
  var urlInput = document.getElementById('cc-url');
  var htmlInput = document.getElementById('cc-html');
  var checkBtn = document.getElementById('cc-check-btn');
  var parseBtn = document.getElementById('cc-parse-btn');
  var resetBtn = document.getElementById('cc-reset-btn');
  var loadingEl = document.getElementById('cc-loading');

  var resultEmpty = document.getElementById('result-empty');
  var resultContent = document.getElementById('result-content');
  var resultBadge = document.getElementById('result-badge');
  var resultBadgeIcon = document.getElementById('result-badge-icon');
  var resultBadgeTitle = document.getElementById('result-badge-title');
  var resultBadgeDesc = document.getElementById('result-badge-desc');
  var resultEnteredUrl = document.getElementById('result-entered-url');
  var resultCanonicalUrl = document.getElementById('result-canonical-url');
  var resultComparison = document.getElementById('result-comparison');
  var resultCompareIcon = document.getElementById('result-compare-icon');
  var resultCompareText = document.getElementById('result-compare-text');
  var resultRawTag = document.getElementById('result-raw-tag');
  var copyCanonicalBtn = document.getElementById('cc-copy-canonical');
  var copyResultBtn = document.getElementById('cc-copy-result');
  var generatedCode = document.getElementById('generated-code');

  var statFound = document.getElementById('stat-found');
  var statStatus = document.getElementById('stat-status');
  var statChecked = document.getElementById('stat-checked');
  var statHealth = document.getElementById('stat-health');

  var validationList = document.getElementById('validation-list');

  // ─── State ───
  var lastResult = null;

  // ─── Sample HTML Presets ───
  var sampleHtml = {
    valid: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Valid Canonical Example</title>\n  <link rel="canonical" href="https://example.com/your-page">\n  <meta name="description" content="This page has a valid self-referencing canonical tag.">\n</head>\n<body>\n  <h1>Page with Valid Canonical</h1>\n  <p>This page correctly self-references its canonical URL.</p>\n</body>\n</html>',
    missing: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Missing Canonical Example</title>\n  <meta name="description" content="This page is missing a canonical tag.">\n</head>\n<body>\n  <h1>Page without Canonical</h1>\n  <p>This page does not have a canonical tag set in its head section.</p>\n</body>\n</html>',
    mismatch: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Mismatched Canonical Example</title>\n  <link rel="canonical" href="https://example.com/different-page">\n  <meta name="description" content="This page has a canonical pointing to a different URL.">\n</head>\n<body>\n  <h1>Page with Mismatched Canonical</h1>\n  <p>This page canonical points to a completely different URL.</p>\n</body>\n</html>'
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

  function normalizeUrl(str) {
    try {
      var url = new URL(str.trim());
      return url.origin + url.pathname + url.search + url.hash;
    } catch (e) {
      return str.trim();
    }
  }

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
    ['url-valid', 'canonical-exists', 'canonical-valid', 'self-referencing', 'https-match', 'single-canonical', 'in-head'].forEach(function (k) {
      setCheck(k, null);
    });
  }

  // ─── Parse HTML and Extract Canonical ───
  function parseHtml(htmlString, enteredUrl) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(htmlString, 'text/html');

    // Find all canonical tags
    var canonicalTags = doc.querySelectorAll('link[rel="canonical"]');

    // Check if any are in head
    var headCanonicals = doc.head.querySelectorAll('link[rel="canonical"]');
    var bodyCanonicals = doc.body.querySelectorAll('link[rel="canonical"]');

    var result = {
      enteredUrl: enteredUrl,
      canonicalUrl: null,
      rawTag: null,
      tagCount: canonicalTags.length,
      headCount: headCanonicals.length,
      bodyCount: bodyCanonicals.length,
      inHead: headCanonicals.length > 0,
      status: 'missing', // 'valid', 'mismatch', 'missing'
      comparison: ''
    };

    if (headCanonicals.length > 0) {
      var href = headCanonicals[0].getAttribute('href');
      result.canonicalUrl = href;
      result.rawTag = headCanonicals[0].outerHTML;

      // Validate the canonical URL
      var canonValid = isValidUrl(href) || (href && href.startsWith('/'));
      var canonIsHttps = href && href.startsWith('https://');

      // Normalize for comparison
      var normalizedEntered = normalizeUrl(enteredUrl);
      var normalizedCanonical = normalizeUrl(href);

      if (normalizedEntered === normalizedCanonical) {
        result.status = 'valid';
        result.comparison = 'The canonical URL perfectly matches the entered URL. This is the correct self-referencing setup.';
      } else {
        result.status = 'mismatch';
        result.comparison = 'The canonical URL differs from the entered URL. Search engines will treat "' + href + '" as the authoritative version instead of the current page URL.';
      }

      // Validation
      setCheck('canonical-exists', true);
      setCheck('canonical-valid', canonValid);
      setCheck('self-referencing', result.status === 'valid');
      setCheck('https-match', canonIsHttps);
      setCheck('single-canonical', result.tagCount === 1);
      setCheck('in-head', result.inHead);
    } else {
      setCheck('canonical-exists', false);
      setCheck('canonical-valid', null);
      setCheck('self-referencing', null);
      setCheck('https-match', null);
      setCheck('single-canonical', result.tagCount === 0);
      setCheck('in-head', false);
    }

    return result;
  }

  // ─── Display Result ───
  function displayResult(result) {
    lastResult = result;

    resultEmpty.classList.add('hidden');
    resultContent.classList.remove('hidden');

    // Badge
    if (result.status === 'valid') {
      resultBadge.className = 'flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5';
      resultBadgeIcon.className = 'fas fa-circle-check text-lg text-emerald-500';
      resultBadgeTitle.className = 'text-sm font-bold text-emerald-600 dark:text-emerald-400';
      resultBadgeTitle.textContent = 'Valid — Self-Referencing Canonical';
      resultBadgeDesc.textContent = 'The canonical tag correctly points to itself. No action needed.';
    } else if (result.status === 'mismatch') {
      resultBadge.className = 'flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/5';
      resultBadgeIcon.className = 'fas fa-triangle-exclamation text-lg text-amber-500';
      resultBadgeTitle.className = 'text-sm font-bold text-amber-600 dark:text-amber-400';
      resultBadgeTitle.textContent = 'Mismatch — Canonical Points to Different URL';
      resultBadgeDesc.textContent = 'The canonical URL does not match the entered URL. Verify this is intentional.';
    } else {
      resultBadge.className = 'flex items-center gap-3 px-4 py-3 rounded-xl border border-red-400/30 bg-red-500/5';
      resultBadgeIcon.className = 'fas fa-circle-xmark text-lg text-red-400';
      resultBadgeTitle.className = 'text-sm font-bold text-red-400';
      resultBadgeTitle.textContent = 'Missing — No Canonical Tag Found';
      resultBadgeDesc.textContent = 'No canonical tag was found in the page head. Add one to prevent duplicate content issues.';
    }

    // Entered URL
    resultEnteredUrl.textContent = result.enteredUrl || '—';

    // Canonical URL
    resultCanonicalUrl.textContent = result.canonicalUrl || 'Not found';

    // Comparison
    if (result.status !== 'missing' && result.comparison) {
      resultComparison.classList.remove('hidden');
      if (result.status === 'valid') {
        resultCompareIcon.className = 'fas fa-circle-check text-sm mt-0.5 text-emerald-500';
      } else {
        resultCompareIcon.className = 'fas fa-triangle-exclamation text-sm mt-0.5 text-amber-500';
      }
      resultCompareText.textContent = result.comparison;
    } else {
      resultComparison.classList.add('hidden');
    }

    // Raw tag
    resultRawTag.textContent = result.rawTag || 'No <link rel="canonical"> tag found';

    // Stats
    statFound.textContent = result.canonicalUrl ? 'Yes' : 'No';
    statFound.className = 'text-3xl font-bold ' + (result.canonicalUrl ? 'text-emerald-500' : 'text-red-400');

    if (result.status === 'valid') {
      statStatus.textContent = 'Valid';
      statStatus.className = 'text-3xl font-bold text-emerald-500';
    } else if (result.status === 'mismatch') {
      statStatus.textContent = 'Mismatch';
      statStatus.className = 'text-3xl font-bold text-amber-500';
    } else {
      statStatus.textContent = 'Missing';
      statStatus.className = 'text-3xl font-bold text-red-400';
    }

    statChecked.textContent = 'Yes';
    statChecked.className = 'text-3xl font-bold text-emerald-500';

    if (result.status === 'valid') {
      statHealth.textContent = 'Good';
      statHealth.className = 'text-3xl font-bold text-emerald-500';
    } else if (result.status === 'mismatch') {
      statHealth.textContent = 'Warning';
      statHealth.className = 'text-3xl font-bold text-amber-500';
    } else {
      statHealth.textContent = 'At Risk';
      statHealth.className = 'text-3xl font-bold text-red-400';
    }

    // Generate report text
    var report = 'Canonical URL Check Report\n';
    report += '==========================\n\n';
    report += 'Entered URL: ' + (result.enteredUrl || '—') + '\n';
    report += 'Canonical URL: ' + (result.canonicalUrl || 'Not found') + '\n';
    report += 'Status: ' + result.status.charAt(0).toUpperCase() + result.status.slice(1) + '\n';
    report += 'Tags Found: ' + result.tagCount + '\n';
    report += 'In Head: ' + (result.inHead ? 'Yes' : 'No') + '\n';
    if (result.rawTag) {
      report += 'Raw Tag: ' + result.rawTag + '\n';
    }
    if (result.comparison) {
      report += '\nComparison: ' + result.comparison + '\n';
    }

    generatedCode.textContent = report;
    copyResultBtn.disabled = false;
    copyResultBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  }

  // ─── Fetch URL ───
  function checkUrl() {
    var url = urlInput.value.trim();

    if (!url) {
      showToast('Please enter a URL to check', 'error');
      return;
    }

    if (!isValidUrl(url)) {
      showToast('Please enter a valid URL (include https://)', 'error');
      setCheck('url-valid', false);
      return;
    }

    setCheck('url-valid', true);
    loadingEl.classList.remove('hidden');
    checkBtn.disabled = true;
    checkBtn.classList.add('opacity-50');

    // Use allorigins CORS proxy
    var proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);

    fetch(proxyUrl)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }
        return response.text();
      })
      .then(function (html) {
        loadingEl.classList.add('hidden');
        checkBtn.disabled = false;
        checkBtn.classList.remove('opacity-50');
        var result = parseHtml(html, url);
        displayResult(result);
        showToast('Canonical tag analyzed successfully', 'success');
      })
      .catch(function (err) {
        loadingEl.classList.add('hidden');
        checkBtn.disabled = false;
        checkBtn.classList.remove('opacity-50');
        setCheck('url-valid', false);
        showToast('Could not fetch the URL. Try pasting the HTML source manually.', 'error');
        resultEmpty.classList.remove('hidden');
        resultContent.classList.add('hidden');
      });
  }

  // ─── Parse HTML Paste ───
  function parseHtmlSource() {
    var html = htmlInput.value.trim();
    var url = urlInput.value.trim();

    if (!html) {
      showToast('Please paste HTML source code', 'error');
      return;
    }

    if (!url) {
      url = 'https://example.com/pasted-html';
    }

    setCheck('url-valid', isValidUrl(url));
    var result = parseHtml(html, url);
    displayResult(result);
    showToast('HTML source parsed successfully', 'success');
  }

  // ─── Reset ───
  function resetAll() {
    urlInput.value = '';
    htmlInput.value = '';
    lastResult = null;

    resultEmpty.classList.remove('hidden');
    resultContent.classList.add('hidden');

    statFound.textContent = '—';
    statFound.className = 'text-3xl font-bold text-slate-400';
    statStatus.textContent = '—';
    statStatus.className = 'text-3xl font-bold text-slate-400';
    statChecked.textContent = 'No';
    statChecked.className = 'text-3xl font-bold text-slate-400';
    statHealth.textContent = '—';
    statHealth.className = 'text-3xl font-bold text-slate-400';

    generatedCode.textContent = 'Run a canonical check to generate a report';
    copyResultBtn.disabled = true;
    copyResultBtn.classList.add('opacity-50', 'cursor-not-allowed');

    resetChecks();
    showToast('All fields reset', 'info');
  }

  // ─── Copy Canonical URL ───
  copyCanonicalBtn.addEventListener('click', function () {
    if (!lastResult || !lastResult.canonicalUrl) {
      showToast('No canonical URL to copy', 'error');
      return;
    }
    copyToClipboard(lastResult.canonicalUrl, 'Canonical URL copied to clipboard');
  });

  // ─── Copy Report ───
  copyResultBtn.addEventListener('click', function () {
    var text = generatedCode.textContent;
    if (text === 'Run a canonical check to generate a report') {
      showToast('Run a check first', 'error');
      return;
    }
    copyToClipboard(text, 'Report copied to clipboard');
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
    }, 3000);
  }

  // ─── Event Listeners ───
  checkBtn.addEventListener('click', checkUrl);
  parseBtn.addEventListener('click', parseHtmlSource);
  resetBtn.addEventListener('click', resetAll);

  // Enter key on URL input
  urlInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      checkUrl();
    }
  });

  // ─── Presets ───
  document.querySelectorAll('.preset-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = this.getAttribute('data-preset');
      var sample = sampleHtml[key];
      if (!sample) return;

      var url = 'https://example.com/your-page';
      if (key === 'mismatch') {
        url = 'https://example.com/current-page';
      }
      urlInput.value = url;
      htmlInput.value = sample;

      setCheck('url-valid', true);
      var result = parseHtml(sample, url);
      displayResult(result);
      showToast('Test example loaded: ' + key, 'success');
    });
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
