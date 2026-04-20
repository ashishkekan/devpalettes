// url-encoder.js

(function () {
  'use strict';

  // ─── DOM Elements ───
  var inputEl = document.getElementById('url-input');
  var inputHint = document.getElementById('url-input-hint');
  var inputCount = document.getElementById('url-input-count');
  var previewContent = document.getElementById('url-preview-content');
  var rawContent = document.getElementById('url-raw-content');
  var generatedCode = document.getElementById('generated-code');
  var outputInfo = document.getElementById('url-output-info');

  var statChars = document.getElementById('stat-chars');
  var statEncodedLen = document.getElementById('stat-encoded-len');
  var statMode = document.getElementById('stat-mode');
  var statStatus = document.getElementById('stat-status');

  var validationList = document.getElementById('validation-list');

  var modeEncodeBtn = document.getElementById('mode-encode');
  var modeDecodeBtn = document.getElementById('mode-decode');
  var clearBtn = document.getElementById('url-clear-btn');
  var copyBtn = document.getElementById('copy-tags-btn');
  var copyInlineBtn = document.getElementById('copy-code-inline');

  // ─── State ───
  var currentMode = 'encode';
  var currentOutput = '';
  var hasError = false;

  // ─── Presets ───
  var presets = {
    query: 'https://example.com/search?q=hello world&category=food & drinks&sort=price&page=1',
    spaces: 'Hello World! @#$%^&*()_+-=[]{}|;:\'",.<>?/`~',
    unicode: 'Café München 東京 स्वागत है مرحبا 🚀🎉✨',
    fullurl: 'https://example.com/path/to/page?name=John Doe&city=New York&filter=price<100&redirect=/home#section'
  };

  // ─── Validate Percent Encoding ───
  function isValidPercentEncoded(str) {
    if (!str || str.length === 0) return false;
    // Check for any %XX sequences and validate them
    var percentRegex = /%[0-9A-Fa-f]{2}/g;
    var hasPercent = percentRegex.test(str);
    if (!hasPercent) return false;
    // Validate all % sequences are properly formed
    var invalidPercent = /%[^0-9A-Fa-f]|%[0-9A-Fa-f][^0-9A-Fa-f]|%$/;
    if (invalidPercent.test(str)) return false;
    // Check for stray % at end
    if (str.endsWith('%')) return false;
    return true;
  }

  // ─── Validation Check Helper ───
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
    ['has-input', 'valid-encode', 'valid-decode', 'valid-percent', 'no-errors', 'output-ready'].forEach(function (k) {
      setCheck(k, null);
    });
  }

  // ─── Highlight Encoded Chars ───
  function highlightEncoded(original, encoded) {
    // Build a side-by-side visual showing which chars were encoded
    var lines = [];
    lines.push('Original: ' + original);
    lines.push('Encoded:  ' + encoded);
    lines.push('');

    // Count encoded chars
    var encodedCount = 0;
    var i = 0;
    while (i < encoded.length) {
      if (encoded[i] === '%' && i + 2 < encoded.length) {
        encodedCount++;
        i += 3;
      } else {
        i++;
      }
    }

    if (encodedCount > 0) {
      lines.push(encodedCount + ' character' + (encodedCount !== 1 ? 's' : '') + ' encoded → ' + encoded.length + ' total characters');
    } else {
      lines.push('No characters needed encoding (all ASCII-safe)');
    }

    return lines.join('\n');
  }

  // ─── Process ───
  function process() {
    var input = inputEl.value;
    var inputLen = input.length;
    currentOutput = '';
    hasError = false;

    // Input count
    inputCount.textContent = inputLen + ' char' + (inputLen !== 1 ? 's' : '');

    // Stats
    statChars.textContent = inputLen;
    statChars.className = 'text-3xl font-bold ' + (inputLen > 0 ? 'text-emerald-500' : 'text-slate-400');

    // Reset checks
    resetChecks();

    // Empty input
    if (inputLen === 0) {
      previewContent.textContent = 'Enter text and select a mode to see the result here';
      rawContent.textContent = 'Enter text and select a mode to see the raw output here';
      generatedCode.textContent = 'Enter text and select a mode to generate output';
      outputInfo.textContent = 'No output generated yet';

      statEncodedLen.textContent = '0';
      statEncodedLen.className = 'text-3xl font-bold text-slate-400';
      statStatus.textContent = 'Idle';
      statStatus.className = 'text-3xl font-bold text-slate-400';

      return;
    }

    setCheck('has-input', true);

    if (currentMode === 'encode') {
      // Encode mode
      var encoded = '';
      try {
        encoded = encodeURIComponent(input);
      } catch (e) {
        encoded = null;
      }

      if (encoded !== null) {
        currentOutput = encoded;
        var highlighted = highlightEncoded(input, encoded);
        previewContent.textContent = highlighted;
        rawContent.textContent = encoded;
        generatedCode.textContent = encoded;
        outputInfo.textContent = 'Encoded ' + inputLen + ' chars → ' + encoded.length + ' chars';

        statEncodedLen.textContent = encoded.length;
        statEncodedLen.className = 'text-3xl font-bold text-blue-500';
        statStatus.textContent = 'Success';
        statStatus.className = 'text-3xl font-bold text-emerald-500';

        setCheck('valid-encode', true);
        setCheck('no-errors', true);
        setCheck('output-ready', true);
        setCheck('valid-decode', null);
        setCheck('valid-percent', null);
      } else {
        hasError = true;
        previewContent.textContent = 'Error: Could not encode the input text.';
        rawContent.textContent = 'Error: Could not encode the input text.';
        generatedCode.textContent = 'Error: Could not encode the input text.';
        outputInfo.textContent = 'Encoding failed';

        statEncodedLen.textContent = '—';
        statEncodedLen.className = 'text-3xl font-bold text-red-400';
        statStatus.textContent = 'Error';
        statStatus.className = 'text-3xl font-bold text-red-400';

        setCheck('valid-encode', false);
        setCheck('no-errors', false);
        setCheck('output-ready', false);
        setCheck('valid-decode', null);
        setCheck('valid-percent', null);
      }

    } else {
      // Decode mode
      var validPercent = isValidPercentEncoded(input);
      setCheck('valid-percent', validPercent);

      if (!validPercent) {
        hasError = true;
        previewContent.textContent = 'Error: Input does not appear to be a valid percent-encoded string.\n\nValid percent-encoded strings use the format %XX where XX are hexadecimal digits (0-9, A-F).\n\nExample: Hello%20World%21';
        rawContent.textContent = 'Error: Invalid percent-encoded input';
        generatedCode.textContent = 'Error: Invalid percent-encoded input';
        outputInfo.textContent = 'Invalid percent-encoding format';

        statEncodedLen.textContent = '—';
        statEncodedLen.className = 'text-3xl font-bold text-red-400';
        statStatus.textContent = 'Invalid';
        statStatus.className = 'text-3xl font-bold text-red-400';

        setCheck('valid-decode', false);
        setCheck('no-errors', false);
        setCheck('output-ready', false);
        setCheck('valid-encode', null);
        return;
      }

      var decoded = '';
      try {
        decoded = decodeURIComponent(input);
      } catch (e) {
        decoded = null;
      }

      if (decoded !== null) {
        currentOutput = decoded;

        var lines = [];
        lines.push('Decoded: ' + decoded);
        lines.push('');
        lines.push('Original encoded length: ' + inputLen + ' chars');
        lines.push('Decoded length: ' + decoded.length + ' chars');
        var reduction = inputLen - decoded.length;
        if (reduction > 0) {
          lines.push('Size reduction: ' + reduction + ' chars (' + Math.round((reduction / inputLen) * 100) + '% smaller)');
        }
        previewContent.textContent = lines.join('\n');

        rawContent.textContent = decoded;
        generatedCode.textContent = decoded;
        outputInfo.textContent = 'Decoded ' + inputLen + ' chars → ' + decoded.length + ' chars';

        statEncodedLen.textContent = decoded.length;
        statEncodedLen.className = 'text-3xl font-bold text-blue-500';
        statStatus.textContent = 'Success';
        statStatus.className = 'text-3xl font-bold text-emerald-500';

        setCheck('valid-decode', true);
        setCheck('no-errors', true);
        setCheck('output-ready', true);
        setCheck('valid-encode', null);
      } else {
        hasError = true;
        previewContent.textContent = 'Error: Could not decode the percent-encoded string.\n\nThe percent sequences may form invalid UTF-8 byte sequences.\n\nEnsure each %XX pair represents valid UTF-8 bytes.';
        rawContent.textContent = 'Error: Could not decode percent-encoded string';
        generatedCode.textContent = 'Error: Could not decode percent-encoded string';
        outputInfo.textContent = 'Decoding failed (invalid UTF-8)';

        statEncodedLen.textContent = '—';
        statEncodedLen.className = 'text-3xl font-bold text-red-400';
        statStatus.textContent = 'Error';
        statStatus.className = 'text-3xl font-bold text-red-400';

        setCheck('valid-decode', false);
        setCheck('no-errors', false);
        setCheck('output-ready', false);
        setCheck('valid-encode', null);
      }
    }
  }

  // ─── Mode Toggle ───
  function setMode(mode) {
    currentMode = mode;

    if (mode === 'encode') {
      modeEncodeBtn.className = 'mode-btn px-4 py-3 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 text-sm font-medium transition-all text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2';
      modeDecodeBtn.className = 'mode-btn px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-sm font-medium transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2';
      inputHint.textContent = 'Enter text or URL to percent-encode';
      statMode.textContent = 'Encode';
      statMode.className = 'text-3xl font-bold text-emerald-500';
    } else {
      modeDecodeBtn.className = 'mode-btn px-4 py-3 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 text-sm font-medium transition-all text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2';
      modeEncodeBtn.className = 'mode-btn px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-sm font-medium transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2';
      inputHint.textContent = 'Paste a percent-encoded string to decode';
      statMode.textContent = 'Decode';
      statMode.className = 'text-3xl font-bold text-blue-500';
    }

    process();
  }

  modeEncodeBtn.addEventListener('click', function () { setMode('encode'); });
  modeDecodeBtn.addEventListener('click', function () { setMode('decode'); });

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
    copyToClipboard(currentOutput, 'Output copied to clipboard');
  });

  copyInlineBtn.addEventListener('click', function () {
    if (!currentOutput) {
      showToast('No output to copy', 'error');
      return;
    }
    copyToClipboard(currentOutput, 'Output copied to clipboard');
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
      setMode('encode');
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
