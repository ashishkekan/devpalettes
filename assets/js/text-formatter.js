/**
 * Text Formatter - Devpalettes
 * Format, clean up, and transform text with case converters,
 * whitespace tools, line operations, find & replace
 */
(function() {
  'use strict';

  /* ========== STATE ========== */
  var history = [];
  var actionLog = [];
  var MAX_HISTORY = 50;

  /* ========== DOM CACHE ========== */
  var el = {
    input: document.getElementById('text-input'),
    output: document.getElementById('text-output'),
    outputEmpty: document.getElementById('output-empty'),
    outputWrapper: document.getElementById('output-wrapper'),
    inputCharCount: document.getElementById('input-char-count'),
    outputCharCount: document.getElementById('output-char-count'),
    clearBtn: document.getElementById('clear-btn'),
    pasteBtn: document.getElementById('paste-btn'),
    undoBtn: document.getElementById('undo-btn'),
    copyOutputBtn: document.getElementById('copy-output-btn'),
    copyAllBtn: document.getElementById('copy-all-btn'),
    downloadBtn: document.getElementById('download-txt-btn'),
    swapBtn: document.getElementById('swap-btn'),
    findInput: document.getElementById('find-input'),
    replaceInput: document.getElementById('replace-input'),
    caseSensitive: document.getElementById('case-sensitive'),
    replaceBtn: document.getElementById('replace-btn'),
    matchCount: document.getElementById('match-count'),
    historyList: document.getElementById('history-list'),
    clearHistoryBtn: document.getElementById('clear-history-btn'),
    statWords: document.getElementById('stat-words'),
    statChars: document.getElementById('stat-chars'),
    statSentences: document.getElementById('stat-sentences'),
    statLines: document.getElementById('stat-lines'),
    statParagraphs: document.getElementById('stat-paragraphs')
  };

  /* ========== HELPERS ========== */
  function escapeHtml(s) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

  function pushHistory(text) {
    if (history.length >= MAX_HISTORY) history.shift();
    history.push(text);
    el.undoBtn.disabled = false;
  }

  /* ========== TEXT STATS ========== */
  function getWords(text) {
    return text.replace(/[^\w\s\u00C0-\u024F\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g, ' ').split(/\s+/).filter(function(w) { return w.length > 0; });
  }

  function getSentences(text) {
    return text.split(/[.!?]+/).filter(function(s) { return s.trim().length > 0; });
  }

  function getParagraphs(text) {
    return text.split(/\n\s*\n/).filter(function(p) { return p.trim().length > 0; });
  }

  function updateStats(text) {
    var words = getWords(text);
    var sentences = getSentences(text);
    var lines = text.split('\n');
    var paragraphs = getParagraphs(text);
    el.statWords.textContent = words.length.toLocaleString();
    el.statChars.textContent = text.length.toLocaleString();
    el.statSentences.textContent = sentences.length.toLocaleString();
    el.statLines.textContent = lines.length.toLocaleString();
    el.statParagraphs.textContent = paragraphs.length.toLocaleString();
  }

  /* ========== CASE CONVERTERS ========== */
  function toUpperCase(text) { return text.toUpperCase(); }
  function toLowerCase(text) { return text.toLowerCase(); }

  function toTitleCase(text) {
    return text.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  function toSentenceCase(text) {
    var result = text.toLowerCase();
    return result.replace(/(^\s*\w|[.!?]\s+\w)/g, function(c) {
      return c.toUpperCase();
    });
  }

  function toCamelCase(text) {
    return text.toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, function(match, char) {
        return char.toUpperCase();
      });
  }

  function toSnakeCase(text) {
    return text.replace(/\s+/g, '_').replace(/[A-Z]/g, function(c) { return '_' + c.toLowerCase(); }).replace(/^_/, '').replace(/_+/g, '_').toLowerCase();
  }

  function toKebabCase(text) {
    return text.replace(/\s+/g, '-').replace(/[A-Z]/g, function(c) { return '-' + c.toLowerCase(); }).replace(/^-/, '').replace(/-+/g, '-').toLowerCase();
  }

  function toToggleCase(text) {
    return text.split('').map(function(c) {
      return c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase();
    }).join('');
  }

  /* ========== WHITESPACE TOOLS ========== */
  function trimLines(text) {
    return text.split('\n').map(function(l) { return l.trim(); }).join('\n');
  }

  function removeExtraSpaces(text) {
    return text.replace(/[^\S\n]+/g, ' ').replace(/^ +| +$/gm, '');
  }

  function removeBlankLines(text) {
    return text.split('\n').filter(function(l) { return l.trim().length > 0; }).join('\n');
  }

  function removeLineBreaks(text) {
    return text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /* ========== LINE OPERATIONS ========== */
  function sortAsc(text) {
    return text.split('\n').sort(function(a, b) { return a.localeCompare(b); }).join('\n');
  }

  function sortDesc(text) {
    return text.split('\n').sort(function(a, b) { return b.localeCompare(a); }).join('\n');
  }

  function reverseLines(text) {
    return text.split('\n').reverse().join('\n');
  }

  function shuffleLines(text) {
    var lines = text.split('\n');
    for (var i = lines.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = lines[i];
      lines[i] = lines[j];
      lines[j] = temp;
    }
    return lines.join('\n');
  }

  function deduplicateLines(text) {
    var seen = {};
    return text.split('\n').filter(function(line) {
      if (seen[line]) return false;
      seen[line] = true;
      return true;
    }).join('\n');
  }

  function addLineNumbers(text) {
    var lines = text.split('\n');
    var maxDigits = String(lines.length).length;
    return lines.map(function(line, i) {
      var num = String(i + 1);
      while (num.length < maxDigits) num = ' ' + num;
      return num + '  ' + line;
    }).join('\n');
  }

  /* ========== TEXT TRANSFORMS ========== */
  function reverseText(text) {
    return text.split('').reverse().join('');
  }

  function stripHtml(text) {
    return text.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, function(entity) {
      var map = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
      return map[entity] || entity;
    });
  }

  function addPrefix(text) {
    var prefix = prompt('Enter prefix to add to each line:');
    if (prefix === null) return text;
    return text.split('\n').map(function(line) { return prefix + line; }).join('\n');
  }

  function addSuffix(text) {
    var suffix = prompt('Enter suffix to add to each line:');
    if (suffix === null) return text;
    return text.split('\n').map(function(line) { return line + suffix; }).join('\n');
  }

  /* ========== FIND & REPLACE ========== */
  function countMatches(text, search, caseSensitive) {
    if (!search) return 0;
    var flags = caseSensitive ? 'g' : 'gi';
    var regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    var matches = text.match(regex);
    return matches ? matches.length : 0;
  }

  function replaceAll(text, search, replacement, caseSensitive) {
    if (!search) return text;
    var flags = caseSensitive ? 'g' : 'gi';
    var regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    return text.replace(regex, replacement);
  }

  /* ========== ACTION MAP ========== */
  var ACTION_LABELS = {
    'upper': 'UPPERCASE',
    'lower': 'lowercase',
    'title': 'Title Case',
    'sentence': 'Sentence Case',
    'camel': 'camelCase',
    'snake': 'snake_case',
    'kebab': 'kebab-case',
    'toggle': 'tOGGLE cASE',
    'trim-lines': 'Trim Lines',
    'remove-spaces': 'Remove Extra Spaces',
    'remove-blank-lines': 'Remove Blank Lines',
    'remove-linebreaks': 'Remove Line Breaks',
    'sort-asc': 'Sort A-Z',
    'sort-desc': 'Sort Z-A',
    'reverse-lines': 'Reverse Lines',
    'shuffle-lines': 'Shuffle Lines',
    'dedupe': 'Deduplicate Lines',
    'line-numbers': 'Add Line Numbers',
    'reverse-text': 'Reverse Text',
    'strip-html': 'Strip HTML',
    'add-prefix': 'Add Prefix',
    'add-suffix': 'Add Suffix',
    'find-replace': 'Find & Replace'
  };

  var ACTION_ICONS = {
    'upper': 'fa-arrow-up', 'lower': 'fa-arrow-down', 'title': 'fa-heading',
    'sentence': 'fa-align-left', 'camel': 'fa-code', 'snake': 'fa-underscore',
    'kebab': 'fa-minus', 'toggle': 'fa-exchange-alt', 'trim-lines': 'fa-indent',
    'remove-spaces': 'fa-compress-alt', 'remove-blank-lines': 'fa-minus',
    'remove-linebreaks': 'fa-level-down-alt', 'sort-asc': 'fa-sort-alpha-down',
    'sort-desc': 'fa-sort-alpha-up', 'reverse-lines': 'fa-exchange-alt',
    'shuffle-lines': 'fa-random', 'dedupe': 'fa-filter', 'line-numbers': 'fa-hashtag',
    'reverse-text': 'fa-exchange-alt', 'strip-html': 'fa-code',
    'add-prefix': 'fa-plus-circle', 'add-suffix': 'fa-plus-circle',
    'find-replace': 'fa-find-replace'
  };

  function applyAction(action, text) {
    switch (action) {
      case 'upper': return toUpperCase(text);
      case 'lower': return toLowerCase(text);
      case 'title': return toTitleCase(text);
      case 'sentence': return toSentenceCase(text);
      case 'camel': return toCamelCase(text);
      case 'snake': return toSnakeCase(text);
      case 'kebab': return toKebabCase(text);
      case 'toggle': return toToggleCase(text);
      case 'trim-lines': return trimLines(text);
      case 'remove-spaces': return removeExtraSpaces(text);
      case 'remove-blank-lines': return removeBlankLines(text);
      case 'remove-linebreaks': return removeLineBreaks(text);
      case 'sort-asc': return sortAsc(text);
      case 'sort-desc': return sortDesc(text);
      case 'reverse-lines': return reverseLines(text);
      case 'shuffle-lines': return shuffleLines(text);
      case 'dedupe': return deduplicateLines(text);
      case 'line-numbers': return addLineNumbers(text);
      case 'reverse-text': return reverseText(text);
      case 'strip-html': return stripHtml(text);
      case 'add-prefix': return addPrefix(text);
      case 'add-suffix': return addSuffix(text);
      default: return text;
    }
  }

  /* ========== UI UPDATES ========== */
  function setOutput(text) {
    if (!text || text.length === 0) {
      el.outputEmpty.classList.remove('hidden');
      el.outputWrapper.classList.add('hidden');
      return;
    }
    el.outputEmpty.classList.add('hidden');
    el.outputWrapper.classList.remove('hidden');
    el.output.textContent = text;
    el.outputCharCount.textContent = text.length.toLocaleString() + ' characters';
    updateStats(text);
  }

  function addToLog(action) {
    var label = ACTION_LABELS[action] || action;
    var icon = ACTION_ICONS[action] || 'fa-magic';
    var now = new Date();
    var time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') + ':' + now.getSeconds().toString().padStart(2, '0');
    actionLog.unshift({ label: label, icon: icon, time: time });
    if (actionLog.length > 20) actionLog.pop();
    renderHistory();
  }

  function renderHistory() {
    if (actionLog.length === 0) {
      el.historyList.innerHTML = '<p class="text-sm text-slate-400 text-center py-6">No actions performed yet</p>';
      return;
    }
    var html = '';
    for (var i = 0; i < actionLog.length; i++) {
      var item = actionLog[i];
      html += '<div class="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/30 text-sm">' +
        '<i class="fas ' + item.icon + ' text-emerald-500 text-xs w-4 text-center"></i>' +
        '<span class="flex-1 text-slate-600 dark:text-slate-400">' + escapeHtml(item.label) + '</span>' +
        '<span class="text-xs text-slate-400 font-mono">' + item.time + '</span></div>';
    }
    el.historyList.innerHTML = html;
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
    try {
      document.execCommand('copy');
      showToast('Copied to clipboard!', 'success');
    } catch (e) {
      showToast('Failed to copy', 'error');
    }
    document.body.removeChild(ta);
  }

  function downloadTxt(text) {
    if (!text) { showToast('Nothing to download', 'error'); return; }
    var blob = new Blob([text], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'formatted-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('File downloaded!', 'success');
  }

  /* ========== EVENT BINDING ========== */
  function bindEvents() {
    // Input changes
    el.input.addEventListener('input', function() {
      el.inputCharCount.textContent = el.input.value.length.toLocaleString() + ' characters';
      updateStats(el.input.value);
    });

    // Clear
    el.clearBtn.addEventListener('click', function() {
      if (el.input.value) pushHistory(el.input.value);
      el.input.value = '';
      el.inputCharCount.textContent = '0 characters';
      el.outputEmpty.classList.remove('hidden');
      el.outputWrapper.classList.add('hidden');
      updateStats('');
      showToast('Cleared', 'success');
    });

    // Paste
    el.pasteBtn.addEventListener('click', function() {
      if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then(function(text) {
          pushHistory(el.input.value);
          el.input.value = text;
          el.inputCharCount.textContent = text.length.toLocaleString() + ' characters';
          updateStats(text);
          showToast('Pasted from clipboard!', 'success');
        }).catch(function() {
          showToast('Cannot access clipboard. Please paste manually.', 'error');
        });
      } else {
        showToast('Clipboard API not supported. Please paste manually.', 'error');
      }
    });

    // Undo
    el.undoBtn.addEventListener('click', function() {
      if (history.length === 0) return;
      var prev = history.pop();
      el.input.value = prev;
      el.inputCharCount.textContent = prev.length.toLocaleString() + ' characters';
      updateStats(prev);
      if (history.length === 0) el.undoBtn.disabled = true;
      showToast('Undone', 'success');
    });

    // Ctrl+Z
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && document.activeElement !== el.input) {
        e.preventDefault();
        el.undoBtn.click();
      }
    });

    // Format buttons
    document.querySelectorAll('.fmt-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var text = el.input.value;
        if (!text.trim()) { showToast('Please enter some text first', 'error'); return; }
        var action = this.getAttribute('data-action');
        pushHistory(text);
        var result = applyAction(action, text);
        el.input.value = result;
        el.inputCharCount.textContent = result.length.toLocaleString() + ' characters';
        setOutput(result);
        addToLog(action);
        showToast(ACTION_LABELS[action] + ' applied', 'success');
      });
    });

    // Find & Replace — live match count
    function updateMatchCount() {
      var find = el.findInput.value;
      if (!find) {
        el.matchCount.textContent = '';
        return;
      }
      var count = countMatches(el.input.value, find, el.caseSensitive.checked);
      el.matchCount.textContent = count + ' match' + (count !== 1 ? 'es' : '');
    }

    el.findInput.addEventListener('input', updateMatchCount);
    el.caseSensitive.addEventListener('change', updateMatchCount);

    // Replace All
    el.replaceBtn.addEventListener('click', function() {
      var find = el.findInput.value;
      if (!find) { showToast('Enter text to find', 'error'); return; }
      var text = el.input.value;
      if (!text.trim()) { showToast('No text to search in', 'error'); return; }
      pushHistory(text);
      var result = replaceAll(text, find, el.replaceInput.value, el.caseSensitive.checked);
      el.input.value = result;
      el.inputCharCount.textContent = result.length.toLocaleString() + ' characters';
      setOutput(result);
      addToLog('find-replace');
      updateMatchCount();
      showToast('Replacements done', 'success');
    });

    // Copy output
    el.copyOutputBtn.addEventListener('click', function() {
      copyText(el.output.textContent);
    });

    // Copy all
    el.copyAllBtn.addEventListener('click', function() {
      copyText(el.input.value);
    });

    // Download
    el.downloadBtn.addEventListener('click', function() {
      downloadTxt(el.input.value);
    });

    // Swap
    el.swapBtn.addEventListener('click', function() {
      var outputText = el.output.textContent;
      if (!outputText) { showToast('No output to swap', 'error'); return; }
      pushHistory(el.input.value);
      el.input.value = outputText;
      el.inputCharCount.textContent = outputText.length.toLocaleString() + ' characters';
      updateStats(outputText);
      showToast('Swapped output to input', 'success');
    });

    // Clear history
    el.clearHistoryBtn.addEventListener('click', function() {
      actionLog = [];
      renderHistory();
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
  }

  /* ========== INIT ========== */
  function init() {
    bindEvents();
    updateStats('');
    renderHistory();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
