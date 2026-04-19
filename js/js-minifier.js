// js-minifier.js

(function () {
  'use strict';

  // ─── DOM Elements ───
  var inputEl = document.getElementById('js-input');
  var inputCount = document.getElementById('js-input-count');
  var previewContent = document.getElementById('js-preview-content');
  var rawContent = document.getElementById('js-params-raw-content');
  var generatedCode = document.getElementById('generated-code');
  var outputInfo = document.getElementById('js-output-info');

  var statOriginal = document.getElementById('stat-original');
  var statMinified = document.getElementById('stat-minified');
  var statReduction = document.getElementById('stat-reduction');
  var statStatus = document.getElementById('stat-status');

  var validationList = document.getElementById('validation-list');

  var optWhitespace = document.getElementById('opt-whitespace');
  var optComments = document.getElementById('opt-comments');
  var optSemicolons = document.getElementById('opt-semicolons');
  var optNewlines = document.getElementById('opt-newlines');
  var clearBtn = document.getElementById('js-clear-btn');
  var copyBtn = document.getElementById('copy-tags-btn');
  var copyInlineBtn = document.getElementById('copy-code-inline');
  var downloadBtn = document.getElementById('download-file-btn');

  // ─── State ───
  var currentOutput = '';
  var hasError = false;

  // ─── Presets ───
  var presets = {
    basic: '// A simple greeting function\nfunction greet(name) {\n  const message = "Hello, " + name + "!";\n  console.log(message);\n  return message;\n}\n// Call the function\ngreet("World");\n\n// Arrow function\nconst add = (a, b) => a + b;\nconsole.log(add(5, 3));\n\n// Object shorthand\nconst config = {\n  theme: "dark",\n  language: "en",\n  responsive: true\n};\nconsole.log(config.theme);',
    comments: '/* ===================================\n   Navigation Module\n   Created by: UI Team\n   Description: Handles main navigation\n   Dependencies: none\n   Last updated: 2024-01-15\n   =================================== */\n\nconst nav = document.querySelector('.main-nav');\n\n/* Toggle mobile menu */\nnav.addEventListener('click', function () {\n  nav.classList.toggle('active');\n});\n\n/* Hover effects */\n.nav-link:hover {\n  color: var(--color-primary);\n  background: var(--color-primary);\n  border-radius: var(--radius-md);\n}',
    functions: '// Function declaration\nfunction calculateTotal(items) {\n  let total = 0;\n  for (let i = 0; i < items.length; i++) {\n    total += items[i].price * items[i].quantity;\n  }\n  return total;\n}\n\n// Usage\nconst cart = [\n  { price: 29.99, quantity: 2 },\n  { price: 49.99, quantity: 1 },\n  { price: 14.99, quantity: 3 }\n];\nconst total = calculateTotal(cart);\nconsole.log(`Total: $${total.toFixed(2)}`);',
    es6: '// ES6 Destructuring\nconst { log, warn, error } = console;\n\n// Named export\nexport function processOrder(order) {\n  const { items, customer } = order;\n  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);\n  log(`Order total: $${total.toFixed(2)}`);\n\n// Arrow function with default parameter\nfunction createURL(base, path) {\n  const url = new URL(path, base);\n  return url.toString();\n}\n\n// Template literal\nconst page = `${'https://example.com'}/${
n  processOrder({\n    items: [...products],\n    customer: { name: "John" }\n  })\n}`;\nconsole.log(page);',
    es6full: '// Import statement\nimport { useState, useEffect, useCallback } from 'react';\n\n// Custom hook\nfunction useDebounce(callback, delay) {\n  const [timer, setTimer] = useState(null);\n  const debouncedFn = useCallback(() => {\n    if (timer) clearTimeout(timer);\n    setTimer(setTimeout(() => callback(), delay));\n  }, [callback, delay]);\n  return debouncedFn;\n}\n\n// Usage\nconst searchHandler = useDebounce((query) => {\n  fetch(`/api/search?q=${query}`);\n}, 300);\n\n// Spread operator\nconst defaultOptions = {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' }\n};\n\nfunction fetchJSON(url, options) {\n  return fetch(url, { ...defaultOptions, ...options });\n}',
    basic: '// Immediately Invoked Function Expression\n(function() {\n  console.log('Self-executing function');\n})();\n\n// Array methods\nconst numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(n => n * 2);\nconsole.log(doubled);\n\n// Object methods\nconst data = { name: "Tool", version: "1.0", tags: ["seo", "dev", "tool"] };\nconst keys = Object.keys(data);\nconsole.log(keys);',
    es6full: '// Async/Await\nasync function fetchData(url) {\n  try {\n    const response = await fetch(url);\n    if (!response.ok) {\n      throw new Error(`HTTP error! status: ${response.status}`);\n    }\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Fetch error:', error);\n  }\n}\n\n// Usage\nconst data = await fetchData('/api/posts');\nconsole.log(data);'
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
    ['has-input', 'has-code', 'minified', 'size-reduced', 'no-errors', 'output-ready'].forEach(function (k) {
      setCheck(k, null);
    });
  }

  function hasJsCode(str) {
    return /\b(function|const|let|var|class|export|import|return|if|for|while|do|switch|try|catch|throw)\b/.test(str);
  }

  // ─── String Protection ───
  function protectStrings(code) {
    var protectedBlocks = [];
    var placeholders = [];

    // Protect double-quoted strings
    code = code.replace(/"(?:[^"\\]|\\")*"/g, function (match) {
      var idx = protectedBlocks.length;
      protectedBlocks.push(match);
      placeholders.push('___JSSTR_' + idx + '___');
      return '___JSSTR_' + idx + '___';
    });

    // Protect single-quoted strings
    code = code.replace(/'(?:[^'\\]|\\')*'/g, function (match) {
      var idx = protectedBlocks.length;
      protectedBlocks.push(match);
      placeholders.push('___JSSTR_' + idx + '___');
      return '___JSSTR_' + idx + '___';
    });

    // Protect template literals
    code = code.replace(/`(?:[^`\\]|\\`)*`/g, function (match) {
      var idx = protectedBlocks.length;
      protectedBlocks.push(match);
      placeholders.push('___JSSTR_' + idx + '___');
      return '___JSSTR_' + idx + '___';
    });

    // Protect regex patterns
    code = code.replace(/\/[^/]*\//g, function (match) {
      var idx = protectedBlocks.length;
      protectedBlocks.push(match);
      placeholders.push('___JSSTR_' + idx + '___');
      return '___JSSTR_' + idx + '___';
    });

    return { code: code, blocks: protectedBlocks, placeholders: placeholders };
  }

  // ─── Minification Logic ───
  function minifyJs(css) {
    var result = protectStrings(css);
    var code = result.code;

    // 1. Remove comments
    if (optComments.checked) {
      // Remove single-line comments (// ...)
      code = code.replace(/\/\/.*$/gm, '');
      // Remove multi-line comments (/* ... */)
      code = code.replace(/\/\*[\s\S]*?\*\//g, '');
    }

    // 2. Remove whitespace (unless keep-newlines is on)
    if (optWhitespace.checked) {
      // Replace newlines and tabs with spaces
      code = code.replace(/[\r\n\t]+/g, ' ');
      // Collapse multiple spaces into one
      code = code.replace(/  +/g, ' ');
      // Remove spaces around { } : , ;
      code = code.replace(/\s*\{\s*/g, '{');
      code = code.replace(/\s*\}\s*/g, '}');
      code = code.replace(/\s*:\s*/g, ':');
      code = code.replace(/\s*;\s*/g, ';');
      code = code.replace(/\s*,\s*/g, ',');
      // Remove trailing semicolons before } or ]
      code = code.replace(/;\s*}/g, '}');
      code = code.replace(/,\s*]/g, ']');
      // Remove leading semicolons
      code = code.replace(/^;+/, '');
      // Remove empty lines
      code = code.replace(/^\s*\n/gm, '');
      code = code.replace(/\n\s*\n/g, '\n');
      // Trim
      code = code.trim();
    }

    // 3. Remove unnecessary semicolons (unless keep-newlines is on)
    if (optSemicolons.checked) {
      if (!optNewlines.checked) {
        // Remove semicolons before } and ]
        code = code.replace(/;\s*}/g, '}');
        code = code.replace(/;\s*]/g, ']');
        // Remove leading semicolons
        code = code.replace(/^;+/, '');
        // Clean up any double semicolons
        code = code.replace(/;+/g, ';');
      }
    }

    // Restore string blocks
    for (var i = result.placeholders.length - 1; i >= 0; i--) {
      code = code.replace(result.placeholders[i], result.blocks[i]);
    }

    return code;
  }

  // ─── Process ───
  function process() {
    var input = inputEl.value;
    var inputLen = input.length;
    var inputBytes = new Blob([input]).size;
    currentOutput = '';
    hasError = false;

    inputCount.textContent = inputLen + ' char' + (inputLen !== 1 ? 's' : '');

    statOriginal.textContent = formatBytes(inputBytes);
    statOriginal.className = 'text-3xl font-bold ' + (inputLen > 0 ? 'text-emerald-500' : 'text-slate-400');

    resetChecks();

    // Empty input
    if (inputLen === 0) {
      previewContent.textContent = 'Paste JavaScript code and select options to see the minified result here';
      rawContent.textContent = 'Paste JavaScript code to see the raw minified output here';
      generatedCode.textContent = 'Paste JavaScript code to generate minified output';
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

    // Check for JS code
    var hasCode = hasJsCode(input);
    setCheck('has-code', hasCode);

    // Minify
    var minified = '';
    try {
      minified = minifyJs(input);
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
      previewContent.textContent = 'Error: Could not minify the JavaScript input.';
      rawContent.textContent = 'Error: Could not minify the JavaScript input.';
      generatedCode.textContent = 'Error: Could not minify the JavaScript input.';
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
  [optWhitespace, optComments, optSemicolons, optNewlines].forEach(function (el) {
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
    copyToClipboard(currentOutput, 'Minified JavaScript copied to clipboard');
  });

  copyInlineBtn.addEventListener('click', function () {
    if (!currentOutput) {
      showToast('No output to copy', 'error');
      return;
    }
    copyToClipboard(currentOutput, 'Minified JavaScript copied to clipboard');
  });

  // ─── Download ───
  downloadBtn.addEventListener('click', function () {
    if (!currentOutput) {
      showToast('No output to download', 'error');
      return;
    }
    var blob = new Blob([currentOutput], { type: 'application/javascript' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'script.min.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('script.min.js downloaded', 'success');
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

})();
