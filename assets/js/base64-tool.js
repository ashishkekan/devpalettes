// base64-tool.js

(function () {
  'use strict';

  // ─── DOM Elements ───
  var inputEl = document.getElementById('b64-input');
  var inputHint = document.getElementById('b64-input-hint');
  var inputCount = document.getElementById('b64-input-count');
  var previewContent = document.getElementById('b64-preview-content');
  var rawContent = document.getElementById('b64-raw-content');
  var generatedCode = document.getElementById('generated-code');
  var outputInfo = document.getElementById('b64-output-info');

  var statInputLen = document.getElementById('stat-input-len');
  var statOutputLen = document.getElementById('stat-output-len');
  var statMode = document.getElementById('stat-mode');
  var statStatus = document.getElementById('stat-status');

  var validationList = document.getElementById('validation-list');

  var modeEncodeBtn = document.getElementById('mode-encode');
  var modeDecodeBtn = document.getElementById('mode-decode');
  var clearBtn = document.getElementById('b64-clear-btn');
  var copyBtn = document.getElementById('copy-tags-btn');
  var copyInlineBtn = document.getElementById('copy-code-inline');

  // ─── State ───
  var currentMode = 'encode';
  var currentOutput = '';
  var hasError = false;

  // ─── Presets ───
  var presets = {
    hello: 'Hello, World!',
    json: '{"name": "Devpalettes", "version": "2.0", "description": "Free developer tools"}',
    emoji: 'Base64 encoding works with emoji too! 🚀 🎉 ✨ 🎨',
    special: 'Special chars: <html>&"\'/\\ áéíóú ñ 中文 日本語'
  };

  // ─── UTF-8 Safe Base64 ───
  function utf8ToBase64(str) {
    try {
      var encoder = new TextEncoder();
      var uint8Array = encoder.encode(str);
      var binaryString = '';
      uint8Array.forEach(function (byte) {
        binaryString += String.fromCharCode(byte);
      });
      return btoa(binaryString);
    } catch (e) {
      return null;
    }
  }

  function base64ToUtf8(base64) {
    try {
      var binaryString = atob(base64);
      var uint8Array = new Uint8Array(binaryString.length);
      for (var i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      var decoder = new TextDecoder('utf-8');
      return decoder.decode(uint8Array);
    } catch (e) {
      return null;
    }
  }

  // ─── Validate Base64 String ───
  function isValidBase64(str) {
    if (!str || str.length === 0) return false;
    var cleaned = str.replace(/\s/g, '');
    var regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!regex.test(cleaned)) return false;
    if (cleaned.length % 4 !== 0) return false;
    var padIndex = cleaned.indexOf('=');
    if (padIndex !== -1 && padIndex < cleaned.length - 2) return false;
    if (cleaned.endsWith('==') && cleaned.length < 4) return false;
    if (cleaned.endsWith('=') && cleaned.length < 4) return false;
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
    ['has-input', 'valid-encode', 'valid-decode', 'valid-base64', 'no-errors', 'output-ready'].forEach(function (k) {
      setCheck(k, null);
    });
  }

  // ─── Process ───
  function process() {
    var input = inputEl.value;
    var inputLen = input.length;
    currentOutput = '';
    hasError = false;

    inputCount.textContent = inputLen + ' char' + (inputLen !== 1 ? 's' : '');

    statInputLen.textContent = inputLen;
    statInputLen.className = 'text-3xl font-bold ' + (inputLen > 0 ? 'text-emerald-500' : 'text-slate-400');

    resetChecks();

    if (inputLen === 0) {
      previewContent.textContent = 'Enter text and select a mode to see the result here';
      rawContent.textContent = 'Enter text and select a mode to see the raw output here';
      generatedCode.textContent = 'Enter text and select a mode to generate output';
      outputInfo.textContent = 'No output generated yet';

      statOutputLen.textContent = '0';
      statOutputLen.className = 'text-3xl font-bold text-slate-400';
      statStatus.textContent = 'Idle';
      statStatus.className = 'text-3xl font-bold text-slate-400';

      return;
    }

    setCheck('has-input', true);

    if (currentMode === 'encode') {
      var encoded = utf8ToBase64(input);

      if (encoded !== null) {
        currentOutput = encoded;
        previewContent.textContent = encoded;
        rawContent.textContent = encoded;
        generatedCode.textContent = encoded;
        outputInfo.textContent = 'Encoded ' + inputLen + ' chars → ' + encoded.length + ' chars Base64';

        statOutputLen.textContent = encoded.length;
        statOutputLen.className = 'text-3xl font-bold text-blue-500';
        statStatus.textContent = 'Success';
        statStatus.className = 'text-3xl font-bold text-emerald-500';

        setCheck('valid-encode', true);
        setCheck('no-errors', true);
        setCheck('output-ready', true);
        setCheck('valid-decode', null);
        setCheck('valid-base64', null);
      } else {
        hasError = true;
        previewContent.textContent = 'Error: Could not encode the input text.';
        rawContent.textContent = 'Error: Could not encode the input text.';
        generatedCode.textContent = 'Error: Could not encode the input text.';
        outputInfo.textContent = 'Encoding failed';

        statOutputLen.textContent = '—';
        statOutputLen.className = 'text-3xl font-bold text-red-400';
        statStatus.textContent = 'Error';
        statStatus.className = 'text-3xl font-bold text-red-400';

        setCheck('valid-encode', false);
        setCheck('no-errors', false);
        setCheck('output-ready', false);
        setCheck('valid-decode', null);
        setCheck('valid-base64', null);
      }

    } else {
      var cleanedInput = input.replace(/\s/g, '');
      var validB64 = isValidBase64(cleanedInput);

      setCheck('valid-base64', validB64);

      if (!validB64) {
        hasError = true;
        previewContent.textContent = 'Error: Input is not valid Base64.\n\nBase64 strings must only contain A-Z, a-z, 0-9, +, /, and = padding. The length must be a multiple of 4.';
        rawContent.textContent = 'Error: Invalid Base64 input';
        generatedCode.textContent = 'Error: Invalid Base64 input';
        outputInfo.textContent = 'Invalid Base64 format';

        statOutputLen.textContent = '—';
        statOutputLen.className = 'text-3xl font-bold text-red-400';
        statStatus.textContent = 'Invalid';
        statStatus.className = 'text-3xl font-bold text-red-400';

        setCheck('valid-decode', false);
        setCheck('no-errors', false);
        setCheck('output-ready', false);
        setCheck('valid-encode', null);
        return;
      }

      var decoded = base64ToUtf8(cleanedInput);

      if (decoded !== null) {
        currentOutput = decoded;
        previewContent.textContent = decoded;
        rawContent.textContent = decoded;
        generatedCode.textContent = decoded;
        outputInfo.textContent = 'Decoded ' + inputLen + ' chars Base64 → ' + decoded.length + ' chars text';

        statOutputLen.textContent = decoded.length;
        statOutputLen.className = 'text-3xl font-bold text-blue-500';
        statStatus.textContent = 'Success';
        statStatus.className = 'text-3xl font-bold text-emerald-500';

        setCheck('valid-decode', true);
        setCheck('no-errors', true);
        setCheck('output-ready', true);
        setCheck('valid-encode', null);
      } else {
        hasError = true;
        previewContent.textContent = 'Error: Could not decode the Base64 string.\n\nThe string appears to be valid Base64 but the decoded bytes could not be interpreted as valid UTF-8 text.';
        rawContent.textContent = 'Error: Could not decode Base64 string';
        generatedCode.textContent = 'Error: Could not decode Base64 string';
        outputInfo.textContent = 'Decoding failed (invalid UTF-8)';

        statOutputLen.textContent = '—';
        statOutputLen.className = 'text-3xl font-bold text-red-400';
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
      inputHint.textContent = 'Enter plain text to encode to Base64';
      statMode.textContent = 'Encode';
      statMode.className = 'text-3xl font-bold text-emerald-500';
    } else {
      modeDecodeBtn.className = 'mode-btn px-4 py-3 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 text-sm font-medium transition-all text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2';
      modeEncodeBtn.className = 'mode-btn px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-sm font-medium transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2';
      inputHint.textContent = 'Paste a Base64 string to decode to plain text';
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

  // ─── Initialize ───
  process();

  if (window.Devpalettes && window.Devpalettes.PageHelpers) {
    window.Devpalettes.PageHelpers.initFaqToggles();
    window.Devpalettes.PageHelpers.initCopyLinkButton({ notify: showToast });
  }

})();
