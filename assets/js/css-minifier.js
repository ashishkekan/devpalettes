// css-minifier.js

(function () {
  'use strict';

  // ─── DOM Elements ───
  var inputEl = document.getElementById('css-input');
  var inputCount = document.getElementById('css-input-count');
  var previewContent = document.getElementById('css-preview-content');
  var rawContent = document.getElementById('css-raw-content');
  var generatedCode = document.getElementById('generated-code');
  var outputInfo = document.getElementById('css-output-info');

  var statOriginal = document.getElementById('stat-original');
  var statMinified = document.getElementById('stat-minified');
  var statReduction = document.getElementById('stat-reduction');
  var statStatus = document.getElementById('stat-status');

  var validationList = document.getElementById('validation-list');

  var optWhitespace = document.getElementById('opt-whitespace');
  var optComments = document.getElementById('opt-comments');
  var optSemicolons = document.getElementById('opt-semicolons');
  var optEmptyRules = document.getElementById('opt-empty-rules');
  var optUnits = document.getElementById('opt-units');
  var clearBtn = document.getElementById('css-clear-btn');
  var copyBtn = document.getElementById('copy-tags-btn');
  var copyInlineBtn = document.getElementById('copy-code-inline');
  var downloadBtn = document.getElementById('download-file-btn');

  // ─── State ───
  var currentOutput = '';
  var hasError = false;

  // ─── Presets ───
  var presets = {
    basic: '/* Base Styles */\nbody {\n  font-family: Arial, sans-serif;\n  font-size: 16px;\n  line-height: 1.6;\n  color: #333333;\n  background-color: #ffffff;\n  margin: 0;\n  padding: 20px;\n}\n\n/* Typography */\nh1, h2, h3, h4, h5, h6 {\n  font-weight: 600;\n  margin-bottom: 16px;\n  line-height: 1.3;\n}\n\nh1 {\n  font-size: 36px;\n  color: #1a1a1a;\n}\n\nh2 {\n  font-size: 28px;\n  color: #2d2d2d;\n}\n\np {\n  margin-bottom: 16px;\n  color: #555555;\n}\n\n/* Links */\na {\n  color: #0066cc;\n  text-decoration: none;\n  transition: color 0.2s ease;\n}\n\na:hover {\n  color: #004499;\n  text-decoration: underline;\n}\n\n/* Container */\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 0 20px;\n}',
    comments: '/* ========================================\n   Navigation Styles\n   Version: 2.1\n   Author: John Smith\n   Last Updated: 2024-01-15\n   ======================================== */\n\n/* Primary Navigation */\n.nav-primary {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 16px 24px;\n  background-color: #1a1a2e;\n  border-radius: 8px;\n  margin-bottom: 24px;\n}\n\n/* Logo styles */\n.nav-logo {\n  font-size: 24px;\n  font-weight: 700;\n  color: #ffffff;\n  text-decoration: none;\n}\n\n/* Navigation Links */\n.nav-links {\n  display: flex;\n  list-style: none;\n  gap: 8px;\n  margin: 0;\n  padding: 0;\n}\n\n.nav-links a {\n  color: #cccccc;\n  text-decoration: none;\n  padding: 8px 16px;\n  border-radius: 4px;\n  transition: all 0.2s ease;\n}\n\n.nav-links a:hover {\n  color: #ffffff;\n  background-color: rgba(255, 255, 255, 0.1);\n}\n\n/* Active state */\n.nav-links a.active {\n  color: #ffffff;\n  background-color: #4f46e5;\n}\n\n/* CTA Button */\n.nav-cta {\n  background-color: #4f46e5;\n  color: #ffffff;\n  padding: 10px 20px;\n  border-radius: 6px;\n  font-weight: 600;\n  text-decoration: none;\n  transition: background-color 0.2s ease;\n}\n\n.nav-cta:hover {\n  background-color: #4338ca;\n}',
    flexbox: '/* Flexbox Container */\n.flex-container {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 24px;\n  padding: 24px;\n  background-color: #f8f9fa;\n  border-radius: 12px;\n  border: 1px solid #e9ecef;\n}\n\n/* Flex Item */\n.flex-item {\n  flex: 1;\n  min-width: 200px;\n  padding: 24px;\n  background-color: #ffffff;\n  border-radius: 8px;\n  border: 1px solid #dee2e6;\n  text-align: center;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);\n}\n\n/* Flex Item Title */\n.flex-item h3 {\n  margin-top: 0px;\n  margin-bottom: 12px;\n  font-size: 18px;\n  font-weight: 600;\n  color: #1a1a1a;\n}\n\n/* Flex Item Description */\n.flex-item p {\n  margin-bottom: 0px;\n  font-size: 14px;\n  color: #6b7280;\n  line-height: 1.6;\n}\n\n/* Equal Width Items */\n.flex-equal {\n  flex: 1;\n}',
    variables: ':root {\n  /* Primary Colors */\n  --color-primary: #4f46e5;\n  --color-primary-light: #6366f1;\n  --color-primary-dark: #4338ca;\n\n  /* Neutral Colors */\n  --color-bg: #ffffff;\n  --color-bg-secondary: #f8fafc;\n  --color-text: #1e293b;\n  --color-text-secondary: #64748b;\n  --color-border: #e2e8f0;\n\n  /* Typography */\n  --font-family: "Inter", sans-serif;\n  font-size: 16px;\n  line-height: 1.6;\n\n  /* Spacing */\n  --spacing-xs: 4px;\n  --spacing-sm: 8px;\n  --spacing-md: 16px;\n  --spacing-lg: 24px;\n  --spacing-xl: 32px;\n  --spacing-2xl: 48px;\n\n  /* Border Radius */\n  --radius-sm: 6px;\n  --radius-md: 8px;\n  --radius-lg: 12px;\n  --radius-xl: 16px;\n\n  /* Shadows */\n  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);\n  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);\n  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);\n}\n\nbody {\n  font-family: var(--font-family);\n  font-size: var(--font-size);\n  line-height: var(--line-height);\n  color: var(--color-text);\n  background-color: var(--color-bg);\n  margin: 0;\n  padding: 0;\n}'
  };

  // ─── Helpers ───
  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    var sizes = ['B', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(1024));
    var val = bytes / Math.pow(1024, i);
    return val.toFixed(i === 0 ? 0 : 1) + ' ' + sizes[i];
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
    ['has-input', 'has-rules', 'minified', 'size-reduced', 'no-errors', 'output-ready'].forEach(function (k) {
      setCheck(k, null);
    });
  }

  function hasCssRules(str) {
    return /[^{}]*\{[^{}]*\}/.test(str);
  }

  // ─── Minification Logic ───
  function minifyCss(css) {
    var output = css;

    // 1. Remove comments
    if (optComments.checked) {
      output = output.replace(/\/\*[\s\S]*?\*\//g, '');
    }

    // 2. Remove empty rules: selector { }
    if (optEmptyRules.checked) {
      output = output.replace(/[^{}]+\{\s*}\s*/g, function (match) {
        // Check if there are any declarations inside
        var inner = match.replace(/[^{}]*\{|\}/g, '');
        if (inner.trim().length === 0) return '';
        return match;
      });
      // Also catch malformed patterns left behind
      output = output.replace(/\s*\{\s*\}\s*/g, function (match) {
        if (match.replace(/\s/g, '').length <= 2) return '';
        return match;
      });
    }

    // 3. Remove trailing semicolons before closing brace
    if (optSemicolons.checked) {
      output = output.replace(/;(\s*\})/g, '$1');
    }

    // 4. Shorten zero units (0px -> 0, 0em -> 0, 0rem -> 0, 0% -> 0)
    if (optUnits.checked) {
      output = output.replace(/:\s*0+(?:px|em|rem|vh|vw|vh|vmin|vmax|%|pt|pc|cm|mm|in|ms|s|ex|ch|fr|deg|grad|rad|turn)\s*([;}])/gi, ':0$2');
    }

    // 5. Whitespace removal
    if (optWhitespace.checked) {
      // Protect strings in content properties and url() functions
      var stringBlocks = [];
      var stringPlaceholders = [];

      // Protect content: "..." and content: '...'
      output = output.replace(/content\s*:\s*([^;}{]*)/gi, function (match, val) {
        if (val.includes('"') || val.includes("'")) {
          var idx = stringBlocks.length;
          stringBlocks.push(match);
          stringPlaceholders.push('___CSSSTR_' + idx + '___');
          return '___CSSSTR_' + idx + '___';
        }
        return match;
      });

      // Protect url() values
      output = output.replace(/url\s*\(\s*([^)]*)\s*\)/gi, function (match, val) {
        var idx = stringBlocks.length;
        stringBlocks.push(match);
        stringPlaceholders.push('___CSSSTR_' + idx + '___');
        return '___CSSSTR_' + idx + '___';
      });

      // Replace newlines and tabs with spaces
      output = output.replace(/[\r\n\t]+/g, ' ');

      // Collapse multiple spaces into one
      output = output.replace(/  +/g, ' ');

      // Remove spaces around { } : ;
      output = output.replace(/\s*\{\s*/g, '{');
      output = output.replace(/\s*\}\s*/g, '}');
      output = output.replace(/\s*:\s*/g, ':');
      output = output.replace(/\s*;\s*/g, ';');

      // Remove space before } (from trailing semicolon removal)
      output = output.replace(/\s+}/g, '}');

      // Trim
      output = output.trim();

      // Restore protected blocks
      for (var i = stringPlaceholders.length - 1; i >= 0; i--) {
        output = output.replace(stringPlaceholders[i], stringBlocks[i]);
      }

      // Final cleanup: remove any double semicolons that may have appeared
      output = output.replace(/;+/g, ';');
      // Remove semicolons before }
      output = output.replace(/;+\s*}/g, '}');
      // Remove leading semicolons
      output = output.replace(/^;+/, '');
    }

    return output;
  }

  // ─── Process ───
  function process() {
    var input = inputEl.value;
    var inputLen = input.length;
    var inputBytes = new Blob([input]).size;
    currentOutput = '';
    hasError = false;

    // Input count
    inputCount.textContent = inputLen + ' char' + (inputLen !== 1 ? 's' : '');

    // Stats
    statOriginal.textContent = formatBytes(inputBytes);
    statOriginal.className = 'text-3xl font-bold ' + (inputLen > 0 ? 'text-emerald-500' : 'text-slate-400');

    // Reset checks
    resetChecks();

    // Empty input
    if (inputLen === 0) {
      previewContent.textContent = 'Paste CSS code and select options to see the minified result here';
      rawContent.textContent = 'Paste CSS code to see the raw minified output here';
      generatedCode.textContent = 'Paste CSS code to generate minified output';
      outputInfo.textContent = 'No output generated yet';

      statMinified.textContent = '0 B';
      statMinified.className = 'text-3xl font-bold text-slate-400';
      statReduction.textContent = '0%';
      statReduction.className = 'text-3xl font-bold text-slate-400';
      statStatus.textContent = 'Idle';
      statStatus.className = 'text-3xl font-bold text-slate-400';

      return;
    }

    setCheck('has-input', true);

    // Check for CSS rules
    var hasRules = hasCssRules(input);
    setCheck('has-rules', hasRules);

    // Minify
    var minified = '';
    try {
      minified = minifyCss(input);
    } catch (e) {
      minified = null;
    }

    if (minified !== null) {
      currentOutput = minified;
      var minBytes = new Blob([minified]).size;
      var reduction = inputBytes > 0 ? ((inputBytes - minBytes) / inputBytes) * 100 : 0;

      previewContent.textContent = minified;
      rawContent.textContent = minified;
      generatedCode.textContent = minified;
      outputInfo.textContent = formatBytes(inputBytes) + ' → ' + formatBytes(minBytes) + ' (' + reduction.toFixed(1) + '% smaller)';

      statMinified.textContent = formatBytes(minBytes);
      statMinified.className = 'text-3xl font-bold text-blue-500';

      if (reduction > 0) {
        statReduction.textContent = '-' + reduction.toFixed(1) + '%';
        statReduction.className = 'text-3xl font-bold text-emerald-500';
        setCheck('size-reduced', true);
      } else if (reduction === 0) {
        statReduction.textContent = '0%';
        statReduction.className = 'text-3xl font-bold text-slate-400';
        setCheck('size-reduced', null);
      } else {
        statReduction.textContent = '+' + Math.abs(reduction).toFixed(1) + '%';
        statReduction.className = 'text-3xl font-bold text-red-400';
        setCheck('size-reduced', false);
      }

      statStatus.textContent = 'Success';
      statStatus.className = 'text-3xl font-bold text-emerald-500';

      setCheck('minified', true);
      setCheck('no-errors', true);
      setCheck('output-ready', true);
    } else {
      hasError = true;
      previewContent.textContent = 'Error: Could not minify the CSS input.';
      rawContent.textContent = 'Error: Could not minify the CSS input.';
      generatedCode.textContent = 'Error: Could not minify the CSS input.';
      outputInfo.textContent = 'Minification failed';

      statMinified.textContent = '—';
      statMinified.className = 'text-3xl font-bold text-red-400';
      statReduction.textContent = '—';
      statReduction.className = 'text-3xl font-bold text-red-400';
      statStatus.textContent = 'Error';
      statStatus.className = 'text-3xl font-bold text-red-400';

      setCheck('minified', false);
      setCheck('no-errors', false);
      setCheck('output-ready', false);
      setCheck('size-reduced', false);
    }
  }

  // ─── Option Listeners ───
  [optWhitespace, optComments, optSemicolons, optEmptyRules, optUnits].forEach(function (el) {
    el.addEventListener('change', process);
  });

  // ─── Input Listener ───
  inputEl.addEventListener('input', process);

  // ─── Clear ───
  clearBtn.addEventListener('click', function () {
    inputEl.value = '';
    currentOutput = '';
    hasError = false;
    process();
    showToast('All fields cleared', 'info');
  });

  // ─── Copy Buttons ───
  copyBtn.addEventListener('click', function () {
    if (!currentOutput) {
      showToast('No output to copy', 'error');
      return;
    }
    copyToClipboard(currentOutput, 'Minified CSS copied to clipboard');
  });

  copyInlineBtn.addEventListener('click', function () {
    if (!currentOutput) {
      showToast('No output to copy', 'error');
      return;
    }
    copyToClipboard(currentOutput, 'Minified CSS copied to clipboard');
  });

  // ─── Download ───
  downloadBtn.addEventListener('click', function () {
    if (!currentOutput) {
      showToast('No output to download', 'error');
      return;
    }
    var blob = new Blob([currentOutput], { type: 'text/css' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'styles.min.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('styles.min.css downloaded', 'success');
  });

  // ─── Preview Tabs ───
  document.querySelectorAll('.preview-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var view = this.getAttribute('data-view');

      document.querySelectorAll('.preview-tab').forEach(function (t) {
        t.className = 'preview-tab px-3 py-1.5 rounded-lg text-xs font-medium border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 transition-all hover:border-emerald-500/50';
      });
      this.className = 'preview-tab active-tab px-3 py-1.5 rounded-lg text-xs font-medium border-2 border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-all';

      document.getElementById('view-result').classList.toggle('hidden', view !== 'result');
      document.getElementById('view-raw').classList.toggle('hidden', view !== 'raw');
    });
  });

  // ─── Presets ───
  document.querySelectorAll('.preset-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = this.getAttribute('data-preset');
      var text = presets[key];
      if (!text) return;

      inputEl.value = text;
      process();
      showToast('Example loaded: ' + key, 'success');
    });
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
  process();

  if (window.Devpalettes && window.Devpalettes.PageHelpers) {
    window.Devpalettes.PageHelpers.initFaqToggles();
    window.Devpalettes.PageHelpers.initCopyLinkButton({ notify: showToast });
  }
 

})();
