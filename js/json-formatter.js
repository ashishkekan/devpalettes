/**
 * JSON Formatter - Devpalettes
 * Format, beautify, minify, validate, sort, and tree-view JSON
 */
(function() {
  'use strict';

  /* ========== SAMPLES ========== */
  var SAMPLES = {
    simple: '{\n  "name": "Devpalettes",\n  "version": "2.0",\n  "description": "Free online developer tools",\n  "active": true,\n  "tools": ["color-picker", "meta-generator", "json-formatter"],\n  "author": {\n    "name": "Devpalettes Team",\n    "url": "https://devpalettes.com"\n  }\n}',
    nested: '{\n  "company": "Acme Corp",\n  "founded": 2015,\n  "departments": {\n    "engineering": {\n      "headcount": 42,\n      "teams": {\n        "frontend": { "members": 15, "lead": "Alice Chen" },\n        "backend": { "members": 18, "lead": "Bob Smith" },\n        "devops": { "members": 9, "lead": "Carol Wu" }\n      }\n    },\n    "design": {\n      "headcount": 12,\n      "teams": {\n        "ui": { "members": 7, "lead": "Dana Lee" },\n        "ux": { "members": 5, "lead": "Eve Park" }\n      }\n    },\n    "marketing": {\n      "headcount": 8,\n      "budget": 250000\n    }\n  },\n  "locations": [\n    { "city": "San Francisco", "country": "US", "type": "hq" },\n    { "city": "London", "country": "UK", "type": "office" },\n    { "city": "Tokyo", "country": "JP", "type": "office" }\n  ],\n  "active": true,\n  "public": false\n}',
    api: '{\n  "status": 200,\n  "success": true,\n  "message": "OK",\n  "data": {\n    "users": [\n      {\n        "id": 1,\n        "name": "John Doe",\n        "email": "john@example.com",\n        "role": "admin",\n        "avatar": "https://example.com/avatars/john.jpg",\n        "settings": {\n          "theme": "dark",\n          "notifications": true,\n          "language": "en"\n        },\n        "created_at": "2026-01-15T08:30:00Z",\n        "last_login": "2026-06-20T14:22:33Z"\n      },\n      {\n        "id": 2,\n        "name": "Jane Smith",\n        "email": "jane@example.com",\n        "role": "editor",\n        "avatar": "https://example.com/avatars/jane.jpg",\n        "settings": {\n          "theme": "light",\n          "notifications": false,\n          "language": "en"\n        },\n        "created_at": "2026-02-20T10:15:00Z",\n        "last_login": "2026-06-19T09:10:45Z"\n      }\n    ],\n    "pagination": {\n      "page": 1,\n      "per_page": 20,\n      "total": 156,\n      "total_pages": 8\n    }\n  },\n  "meta": {\n    "request_id": "req_abc123def456",\n    "processing_time_ms": 42\n  }\n}'
  };

  /* ========== STATE ========== */
  var indentSize = 2;
  var currentView = 'code';
  var lastParsed = null;
  var lastFormatted = '';

  /* ========== DOM ========== */
  var el = {
    input: document.getElementById('json-input'),
    output: document.getElementById('json-output'),
    outputEmpty: document.getElementById('output-empty'),
    treeOutput: document.getElementById('tree-output'),
    treeEmpty: document.getElementById('tree-empty'),
    codeView: document.getElementById('code-view'),
    treeView: document.getElementById('tree-view'),
    errorContainer: document.getElementById('error-container'),
    successContainer: document.getElementById('success-container'),
    errorMessage: document.getElementById('error-message'),
    errorPosition: document.getElementById('error-position'),
    successDetail: document.getElementById('success-detail'),
    inputCharCount: document.getElementById('input-char-count'),
    inputLinesCount: document.getElementById('input-lines-count'),
    statStatus: document.getElementById('stat-status'),
    statKeys: document.getElementById('stat-keys'),
    statDepth: document.getElementById('stat-depth'),
    statSize: document.getElementById('stat-size'),
    statMinified: document.getElementById('stat-minified'),
    clearBtn: document.getElementById('clear-btn'),
    pasteBtn: document.getElementById('paste-btn'),
    copyOutputBtn: document.getElementById('copy-output-btn'),
    copyAllBtn: document.getElementById('copy-all-btn'),
    downloadBtn: document.getElementById('download-btn'),
    swapBtn: document.getElementById('swap-btn'),
    formatBtn: document.getElementById('format-btn'),
    minifyBtn: document.getElementById('minify-btn'),
    validateBtn: document.getElementById('validate-btn'),
    sortBtn: document.getElementById('sort-btn'),
    viewCodeBtn: document.getElementById('view-code-btn'),
    viewTreeBtn: document.getElementById('view-tree-btn'),
    indentVal: document.getElementById('indent-val')
  };

  /* ========== HELPERS ========== */
  function escapeHtml(s) {
    if (!s) return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function showToast(msg, type) {
    var c = document.getElementById('toast-container');
    if (!c) return;
    var bg = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-slate-700';
    var icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    var t = document.createElement('div');
    t.className = bg + ' text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium transform translate-x-full transition-transform duration-300 flex items-center gap-2';
    t.innerHTML = '<i class="fas ' + icon + '"></i>' + escapeHtml(msg);
    c.appendChild(t);
    requestAnimationFrame(function() { t.style.transform = 'translateX(0)'; });
    setTimeout(function() {
      t.style.transform = 'translateX(120%)';
      setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 300);
    }, 2500);
  }

  function getIndentStr() {
    if (indentSize === 0) return '\t';
    var s = '';
    for (var i = 0; i < indentSize; i++) s += ' ';
    return s;
  }

  /* ========== JSON ANALYSIS ========== */
  function countKeys(obj) {
    var count = 0;
    if (obj && typeof obj === 'object') {
      if (Array.isArray(obj)) {
        obj.forEach(function(item) { count += countKeys(item); });
      } else {
        var keys = Object.keys(obj);
        count += keys.length;
        keys.forEach(function(k) { count += countKeys(obj[k]); });
      }
    }
    return count;
  }

  function getDepth(obj) {
    if (obj && typeof obj === 'object') {
      if (Array.isArray(obj)) {
        var maxD = 0;
        obj.forEach(function(item) { var d = getDepth(item); if (d > maxD) maxD = d; });
        return maxD + 1;
      } else {
        var keys = Object.keys(obj);
        if (keys.length === 0) return 1;
        var maxD2 = 0;
        keys.forEach(function(k) { var d = getDepth(obj[k]); if (d > maxD2) maxD2 = d; });
        return maxD2 + 1;
      }
    }
    return 0;
  }

  function sortKeysDeep(obj) {
    if (obj && typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return obj.map(sortKeysDeep);
      } else {
        var sorted = {};
        Object.keys(obj).sort().forEach(function(k) {
          sorted[k] = sortKeysDeep(obj[k]);
        });
        return sorted;
      }
    }
    return obj;
  }

  /* ========== SYNTAX HIGHLIGHTING ========== */
  function highlightJson(jsonStr) {
    var result = '';
    var i = 0;
    var len = jsonStr.length;

    while (i < len) {
      var ch = jsonStr[i];

      // Whitespace
      if (ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t') {
        result += ch;
        i++;
        continue;
      }

      // Brackets
      if (ch === '{' || ch === '}' || ch === '[' || ch === ']') {
        result += '<span class="json-bracket">' + ch + '</span>';
        i++;
        continue;
      }

      // Comma
      if (ch === ',') {
        result += '<span class="json-comma">,</span>';
        i++;
        continue;
      }

      // Colon
      if (ch === ':') {
        result += '<span class="json-comma">:</span>';
        i++;
        continue;
      }

      // String (key or value)
      if (ch === '"') {
        var str = '"';
        i++;
        while (i < len && jsonStr[i] !== '"') {
          if (jsonStr[i] === '\\') {
            str += jsonStr[i] + (jsonStr[i + 1] || '');
            i += 2;
          } else {
            str += jsonStr[i];
            i++;
          }
        }
        if (i < len) { str += '"'; i++; }

        // Check if this is a key (followed by colon, possibly with whitespace)
        var j = i;
        while (j < len && (jsonStr[j] === ' ' || jsonStr[j] === '\t')) j++;
        if (j < len && jsonStr[j] === ':') {
          result += '<span class="json-key">' + escapeHtml(str) + '</span>';
        } else {
          result += '<span class="json-string">' + escapeHtml(str) + '</span>';
        }
        continue;
      }

      // Number
      if (ch === '-' || (ch >= '0' && ch <= '9')) {
        var num = '';
        while (i < len && /[0-9eE.+\-]/.test(jsonStr[i])) {
          num += jsonStr[i];
          i++;
        }
        result += '<span class="json-number">' + num + '</span>';
        continue;
      }

      // Boolean or null
      if (jsonStr.substr(i, 4) === 'true') {
        result += '<span class="json-boolean">true</span>'; i += 4; continue;
      }
      if (jsonStr.substr(i, 5) === 'false') {
        result += '<span class="json-boolean">false</span>'; i += 5; continue;
      }
      if (jsonStr.substr(i, 4) === 'null') {
        result += '<span class="json-null">null</span>'; i += 4; continue;
      }

      result += ch;
      i++;
    }

    return result;
  }

  /* ========== TREE VIEW ========== */
  function buildTree(data, key, isLast, depth) {
    var html = '';
    var indent = '';
    for (var s = 0; s < depth; s++) indent += '  ';

    var comma = isLast ? '' : '<span class="json-comma">,</span>';

    if (data === null) {
      html += indent + (key !== null ? '<span class="json-key">"' + escapeHtml(key) + '"</span><span class="json-comma">: </span>' : '') + '<span class="json-null">null</span>' + comma + '\n';
    } else if (typeof data === 'boolean') {
      html += indent + (key !== null ? '<span class="json-key">"' + escapeHtml(key) + '"</span><span class="json-comma">: </span>' : '') + '<span class="json-boolean">' + data + '</span>' + comma + '\n';
    } else if (typeof data === 'number') {
      html += indent + (key !== null ? '<span class="json-key">"' + escapeHtml(key) + '"</span><span class="json-comma">: </span>' : '') + '<span class="json-number">' + data + '</span>' + comma + '\n';
    } else if (typeof data === 'string') {
      html += indent + (key !== null ? '<span class="json-key">"' + escapeHtml(key) + '"</span><span class="json-comma">: </span>' : '') + '<span class="json-string">"' + escapeHtml(data) + '"</span>' + comma + '\n';
    } else if (Array.isArray(data)) {
      var uid = 'tree_' + Math.random().toString(36).substr(2, 8);
      var bracket = data.length === 0 ? '<span class="json-bracket">[]</span>' + comma + '\n' :
        '<span class="tree-toggle json-bracket" data-target="' + uid + '">[</span>' + comma + '\n';
      html += indent + (key !== null ? '<span class="json-key">"' + escapeHtml(key) + '"</span><span class="json-comma">: </span>' : '') + bracket;

      if (data.length > 0) {
        html += '<div class="tree-children" id="' + uid + '">';
        data.forEach(function(item, idx) {
          html += buildTree(item, null, idx === data.length - 1, depth + 1);
        });
        html += '</div>';
      }
      if (data.length > 0) {
        html += indent + '<span class="json-bracket">]</span>' + comma + '\n';
      }
    } else if (typeof data === 'object') {
      var keys = Object.keys(data);
      var uid2 = 'tree_' + Math.random().toString(36).substr(2, 8);
      var bracket2 = keys.length === 0 ? '<span class="json-bracket">{}</span>' + comma + '\n' :
        '<span class="tree-toggle json-bracket" data-target="' + uid2 + '">{</span>' + comma + '\n';
      html += indent + (key !== null ? '<span class="json-key">"' + escapeHtml(key) + '"</span><span class="json-comma">: </span>' : '') + bracket2;

      if (keys.length > 0) {
        html += '<div class="tree-children" id="' + uid2 + '">';
        keys.forEach(function(k, idx) {
          html += buildTree(data[k], k, idx === keys.length - 1, depth + 1);
        });
        html += '</div>';
      }
      if (keys.length > 0) {
        html += indent + '<span class="json-bracket">}</span>' + comma + '\n';
      }
    }

    return html;
  }

  /* ========== UI UPDATES ========== */
  function showError(msg, pos) {
    el.errorContainer.classList.remove('hidden');
    el.successContainer.classList.add('hidden');
    el.errorMessage.textContent = msg;
    el.errorPosition.textContent = pos || '';
    el.statStatus.textContent = 'Invalid';
    el.statStatus.className = 'text-lg font-bold text-red-500';
  }

  function showSuccess(detail) {
    el.errorContainer.classList.add('hidden');
    el.successContainer.classList.remove('hidden');
    el.successDetail.textContent = detail || '';
    el.statStatus.textContent = 'Valid';
    el.statStatus.className = 'text-lg font-bold text-emerald-500';
  }

  function hideStatus() {
    el.errorContainer.classList.add('hidden');
    el.successContainer.classList.add('hidden');
    el.statStatus.textContent = '—';
    el.statStatus.className = 'text-lg font-bold text-slate-400';
  }

  function updateStats(parsed, inputLen) {
    var keys = countKeys(parsed);
    var depth = getDepth(parsed);
    var minified = JSON.stringify(parsed);
    el.statKeys.textContent = keys.toLocaleString();
    el.statKeys.className = 'text-2xl font-bold text-slate-700 dark:text-slate-300';
    el.statDepth.textContent = depth;
    el.statDepth.className = 'text-2xl font-bold text-slate-700 dark:text-slate-300';
    el.statSize.textContent = formatBytes(inputLen);
    el.statSize.className = 'text-2xl font-bold text-slate-700 dark:text-slate-300';
    el.statMinified.textContent = formatBytes(minified.length);
    el.statMinified.className = 'text-2xl font-bold text-slate-700 dark:text-slate-300';
  }

  function resetStats() {
    el.statKeys.textContent = '0'; el.statKeys.className = 'text-2xl font-bold text-slate-400';
    el.statDepth.textContent = '0'; el.statDepth.className = 'text-2xl font-bold text-slate-400';
    el.statSize.textContent = '0 B'; el.statSize.className = 'text-2xl font-bold text-slate-400';
    el.statMinified.textContent = '0 B'; el.statMinified.className = 'text-2xl font-bold text-slate-400';
  }

  function showOutput(html) {
    el.outputEmpty.classList.add('hidden');
    el.output.classList.remove('hidden');
    el.output.innerHTML = html;
  }

  function showTree(html) {
    el.treeEmpty.classList.add('hidden');
    el.treeOutput.classList.remove('hidden');
    el.treeOutput.innerHTML = html;
    bindTreeToggles();
  }

  function showEmptyOutput() {
    el.outputEmpty.classList.remove('hidden');
    el.output.classList.add('hidden');
    el.treeEmpty.classList.remove('hidden');
    el.treeOutput.classList.add('hidden');
  }

  function bindTreeToggles() {
    el.treeOutput.querySelectorAll('.tree-toggle').forEach(function(toggle) {
      toggle.addEventListener('click', function() {
        var targetId = this.getAttribute('data-target');
        var target = document.getElementById(targetId);
        if (!target) return;
        var isCollapsed = target.classList.contains('collapsed');
        if (isCollapsed) {
          target.classList.remove('collapsed');
          this.textContent = this.textContent.replace('...', '').replace('{', '{').replace('[', '[');
        } else {
          target.classList.add('collapsed');
          var isOpenBracket = this.textContent.indexOf('{') !== -1;
          this.textContent = isOpenBracket ? '{ ...' : '[ ...';
        }
      });
    });
  }

  /* ========== CORE ACTIONS ========== */
  function parseInput(input) {
    try {
      var parsed = JSON.parse(input);
      return { ok: true, data: parsed };
    } catch (e) {
      var msg = e.message;
      var posStr = '';
      var match = msg.match(/position\s+(\d+)/i);
      if (match) {
        var pos = parseInt(match[1], 10);
        var before = input.substring(0, pos);
        var line = (before.match(/\n/g) || []).length + 1;
        var lastNewline = before.lastIndexOf('\n');
        var col = pos - lastNewline;
        posStr = 'Line ' + line + ', Column ' + col + ' (Position ' + pos + ')';
      }
      return { ok: false, error: msg.replace(/JSON\.parse:\s*/i, ''), position: posStr };
    }
  }

  function doFormat() {
    var input = el.input.value.trim();
    if (!input) { showToast('Please paste JSON data first', 'error'); return; }

    var result = parseInput(input);
    if (!result.ok) { showError(result.error, result.position); resetStats(); showEmptyOutput(); return; }

    lastParsed = result.data;
    var ind = indentSize === 0 ? '\t' : indentSize;
    var formatted = JSON.stringify(result.data, null, ind);
    lastFormatted = formatted;

    showOutput(highlightJson(formatted));
    showTree(buildTree(result.data, null, true, 0));
    showSuccess(formatted.split('\n').length + ' lines, ' + countKeys(result.data) + ' keys');
    updateStats(result.data, input.length);
    showToast('JSON formatted successfully!', 'success');
  }

  function doMinify() {
    var input = el.input.value.trim();
    if (!input) { showToast('Please paste JSON data first', 'error'); return; }

    var result = parseInput(input);
    if (!result.ok) { showError(result.error, result.position); resetStats(); showEmptyOutput(); return; }

    lastParsed = result.data;
    var minified = JSON.stringify(result.data);
    lastFormatted = minified;

    showOutput(highlightJson(minified));
    showTree(buildTree(result.data, null, true, 0));
    showSuccess('Minified to ' + formatBytes(minified.length) + ' (saved ' + formatBytes(input.length - minified.length) + ')');
    updateStats(result.data, input.length);
    showToast('JSON minified!', 'success');
  }

  function doValidate() {
    var input = el.input.value.trim();
    if (!input) { showToast('Please paste JSON data first', 'error'); return; }

    var result = parseInput(input);
    if (!result.ok) { showError(result.error, result.position); resetStats(); return; }

    lastParsed = result.data;
    showSuccess('Valid JSON — ' + countKeys(result.data) + ' keys, depth ' + getDepth(result.data));
    updateStats(result.data, input.length);
    showToast('JSON is valid!', 'success');
  }

  function doSort() {
    var input = el.input.value.trim();
    if (!input) { showToast('Please paste JSON data first', 'error'); return; }

    var result = parseInput(input);
    if (!result.ok) { showError(result.error, result.position); resetStats(); showEmptyOutput(); return; }

    var sorted = sortKeysDeep(result.data);
    lastParsed = sorted;
    var ind = indentSize === 0 ? '\t' : indentSize;
    var formatted = JSON.stringify(sorted, null, ind);
    lastFormatted = formatted;

    showOutput(highlightJson(formatted));
    showTree(buildTree(sorted, null, true, 0));
    showSuccess('Keys sorted alphabetically');
    updateStats(sorted, input.length);
    showToast('Keys sorted!', 'success');
  }

  /* ========== COPY / DOWNLOAD ========== */
  function copyText(text) {
    if (!text) { showToast('Nothing to copy', 'error'); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showToast('Copied to clipboard!', 'success');
      }).catch(function() { fallbackCopy(text); });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast('Copied to clipboard!', 'success'); }
    catch (e) { showToast('Failed to copy', 'error'); }
    document.body.removeChild(ta);
  }

  function downloadJson() {
    var text = lastFormatted || el.input.value.trim();
    if (!text) { showToast('Nothing to download', 'error'); return; }
    // Try to parse and re-stringify for clean output
    try { text = JSON.stringify(JSON.parse(text), null, indentSize === 0 ? '\t' : indentSize); } catch(e) {}
    var blob = new Blob([text], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('JSON file downloaded!', 'success');
  }

  /* ========== EVENTS ========== */
  function bindEvents() {
    el.input.addEventListener('input', function() {
      el.inputCharCount.textContent = el.input.value.length.toLocaleString() + ' characters';
      el.inputLinesCount.textContent = el.input.value.split('\n').length + ' lines';
    });

    el.clearBtn.addEventListener('click', function() {
      el.input.value = '';
      el.inputCharCount.textContent = '0 characters';
      el.inputLinesCount.textContent = '0 lines';
      showEmptyOutput();
      hideStatus();
      resetStats();
      lastParsed = null;
      lastFormatted = '';
    });

    el.pasteBtn.addEventListener('click', function() {
      if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then(function(text) {
          el.input.value = text;
          el.inputCharCount.textContent = text.length.toLocaleString() + ' characters';
          el.inputLinesCount.textContent = text.split('\n').length + ' lines';
          showToast('Pasted from clipboard!', 'success');
        }).catch(function() {
          showToast('Cannot access clipboard. Please paste manually.', 'error');
        });
      } else {
        showToast('Clipboard API not supported. Please paste manually.', 'error');
      }
    });

    el.formatBtn.addEventListener('click', doFormat);
    el.minifyBtn.addEventListener('click', doMinify);
    el.validateBtn.addEventListener('click', doValidate);
    el.sortBtn.addEventListener('click', doSort);

    // Indent options
    document.querySelectorAll('.indent-opt').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.indent-opt').forEach(function(b) {
          b.classList.remove('active','border-emerald-500','bg-emerald-500/10','text-emerald-600','dark:text-emerald-400');
          b.classList.add('border-slate-200','dark:border-slate-700','text-slate-600','dark:text-slate-400');
        });
        this.classList.add('active','border-emerald-500','bg-emerald-500/10','text-emerald-600','dark:text-emerald-400');
        this.classList.remove('border-slate-200','dark:border-slate-700','text-slate-600','dark:text-slate-400');
        var val = this.getAttribute('data-indent');
        if (val === 'tab') {
          indentSize = 0;
          el.indentVal.textContent = 'Tab';
        } else {
          indentSize = parseInt(val, 10);
          el.indentVal.textContent = val + ' spaces';
        }
        // Re-format if data exists
        if (lastParsed) doFormat();
      });
    });

    // View toggles
    el.viewCodeBtn.addEventListener('click', function() {
      currentView = 'code';
      el.codeView.classList.remove('hidden');
      el.treeView.classList.add('hidden');
      this.classList.add('active','border-emerald-500','bg-emerald-500/10','text-emerald-600','dark:text-emerald-400');
      this.classList.remove('border-slate-200','dark:border-slate-700','text-slate-600','dark:text-slate-400');
      el.viewTreeBtn.classList.remove('active','border-emerald-500','bg-emerald-500/10','text-emerald-600','dark:text-emerald-400');
      el.viewTreeBtn.classList.add('border-slate-200','dark:border-slate-700','text-slate-600','dark:text-slate-400');
    });

    el.viewTreeBtn.addEventListener('click', function() {
      if (!lastParsed) { showToast('Format JSON first to use tree view', 'error'); return; }
      currentView = 'tree';
      el.treeView.classList.remove('hidden');
      el.codeView.classList.add('hidden');
      this.classList.add('active','border-emerald-500','bg-emerald-500/10','text-emerald-600','dark:text-emerald-400');
      this.classList.remove('border-slate-200','dark:border-slate-700','text-slate-600','dark:text-slate-400');
      el.viewCodeBtn.classList.remove('active','border-emerald-500','bg-emerald-500/10','text-emerald-600','dark:text-emerald-400');
      el.viewCodeBtn.classList.add('border-slate-200','dark:border-slate-700','text-slate-600','dark:text-slate-400');
    });

    // Copy
    el.copyOutputBtn.addEventListener('click', function() {
      copyText(lastFormatted);
    });
    el.copyAllBtn.addEventListener('click', function() {
      copyText(lastFormatted);
    });

    // Download
    el.downloadBtn.addEventListener('click', downloadJson);

    // Swap
    el.swapBtn.addEventListener('click', function() {
      if (!lastFormatted) { showToast('No output to swap', 'error'); return; }
      el.input.value = lastFormatted;
      el.inputCharCount.textContent = lastFormatted.length.toLocaleString() + ' characters';
      el.inputLinesCount.textContent = lastFormatted.split('\n').length + ' lines';
      showToast('Swapped output to input', 'success');
    });

    // Samples
    document.querySelectorAll('.sample-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var key = this.getAttribute('data-sample');
        var json = SAMPLES[key];
        if (json) {
          el.input.value = json;
          el.inputCharCount.textContent = json.length.toLocaleString() + ' characters';
          el.inputLinesCount.textContent = json.split('\n').length + ' lines';
          showToast('Sample loaded — click Format', 'success');
        }
      });
    });

    // FAQ toggles
    document.querySelectorAll('.faq-toggle').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var content = this.nextElementSibling;
        var icon = this.querySelector('i');
        var isOpen = !content.classList.contains('hidden');
        document.querySelectorAll('.faq-toggle').forEach(function(b) {
          b.nextElementSibling.classList.add('hidden');
          b.querySelector('i').style.transform = 'rotate(0deg)';
        });
        if (!isOpen) {
          content.classList.remove('hidden');
          icon.style.transform = 'rotate(180deg)';
        }
      });
    });

    // Ctrl+Enter to format
    el.input.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        doFormat();
      }
    });
  }

  /* ========== INIT ========== */
  function init() {
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
