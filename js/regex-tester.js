// Regex Tester - ../js/regex-tester.js
(function () {
  'use strict';

  // ── State ──
  const state = {
    pattern: '',
    flags: '',
    testString: '',
    matches: [],
    isValid: false,
    error: ''
  };

  // ── DOM References ──
  const els = {
    patternInput: document.getElementById('regex-pattern'),
    flagG: document.getElementById('flag-g'),
    flagI: document.getElementById('flag-i'),
    flagM: document.getElementById('flag-m'),
    flagS: document.getElementById('flag-s'),
    testString: document.getElementById('test-string'),
    testStringCount: document.getElementById('test-string-count'),
    patternError: document.getElementById('pattern-error'),
    clearBtn: document.getElementById('clear-btn'),
    highlightContent: document.getElementById('highlight-content'),
    matchDetails: document.getElementById('match-details'),
    generatedCode: document.getElementById('generated-code'),
    outputInfo: document.getElementById('regex-output-info'),
    copyBtn: document.getElementById('copy-regex-btn'),
    statMatches: document.getElementById('stat-matches'),
    statValid: document.getElementById('stat-valid'),
    statFlags: document.getElementById('stat-flags'),
    statStatus: document.getElementById('stat-status'),
    validationList: document.getElementById('validation-list'),
    copyLinkBtn: document.getElementById('copy-link-btn')
  };

  let debounceTimer = null;

  // ── Build Flags String ──
  function buildFlags() {
    let f = '';
    if (els.flagG.checked) f += 'g';
    if (els.flagI.checked) f += 'i';
    if (els.flagM.checked) f += 'm';
    if (els.flagS.checked) f += 's';
    return f;
  }

  // ── Escape HTML ──
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Run Regex ──
  function runRegex() {
    const pattern = els.patternInput.value;
    const flags = buildFlags();
    const testStr = els.testString.value;

    state.pattern = pattern;
    state.flags = flags;
    state.testString = testStr;

    // Update char/line count
    const lines = testStr ? testStr.split('\n').length : 0;
    els.testStringCount.textContent = `${testStr.length} chars · ${lines} line${lines !== 1 ? 's' : ''}`;

    // Update flags stat
    els.statFlags.textContent = flags || 'None';
    els.statFlags.className = flags
      ? 'text-3xl font-bold text-slate-900 dark:text-slate-100'
      : 'text-3xl font-bold text-slate-400';

    // Empty pattern — reset
    if (!pattern) {
      resetOutput();
      updateValidation({
        'has-pattern': false,
        'pattern-valid': false,
        'has-test-string': !!testStr,
        'matches-found': false,
        'flags-configured': !!flags,
        'ready-to-use': false
      });
      return;
    }

    // Try to compile regex
    let regex;
    try {
      regex = new RegExp(pattern, flags);
      state.isValid = true;
      state.error = '';
      els.patternError.classList.add('hidden');
      els.statValid.textContent = 'Yes';
      els.statValid.className = 'text-3xl font-bold text-emerald-500';
    } catch (e) {
      state.isValid = false;
      state.error = e.message;
      state.matches = [];
      els.patternError.textContent = e.message;
      els.patternError.classList.remove('hidden');
      els.statValid.textContent = 'No';
      els.statValid.className = 'text-3xl font-bold text-red-500';
      els.statMatches.textContent = '0';
      els.statMatches.className = 'text-3xl font-bold text-slate-400';
      els.statStatus.textContent = 'Error';
      els.statStatus.className = 'text-3xl font-bold text-red-500';
      els.highlightContent.innerHTML = `<span class="text-red-400"><i class="fas fa-triangle-exclamation mr-2"></i>Invalid regex: ${escapeHTML(e.message)}</span>`;
      els.matchDetails.textContent = 'Fix the regex pattern to see match details';
      els.generatedCode.textContent = `// Invalid regex pattern`;
      els.outputInfo.textContent = 'Pattern contains syntax errors';
      updateValidation({
        'has-pattern': true,
        'pattern-valid': false,
        'has-test-string': !!testStr,
        'matches-found': false,
        'flags-configured': !!flags,
        'ready-to-use': false
      });
      return;
    }

    // No test string
    if (!testStr) {
      state.matches = [];
      els.statMatches.textContent = '0';
      els.statMatches.className = 'text-3xl font-bold text-slate-400';
      els.statStatus.textContent = 'Ready';
      els.statStatus.className = 'text-3xl font-bold text-amber-500';
      els.highlightContent.innerHTML = '<span class="text-slate-400">Enter a test string to see highlighted matches</span>';
      els.matchDetails.textContent = 'Enter a test string to see match details';
      updateCodeSnippet();
      els.outputInfo.textContent = 'Valid pattern — enter a test string';
      updateValidation({
        'has-pattern': true,
        'pattern-valid': true,
        'has-test-string': false,
        'matches-found': false,
        'flags-configured': !!flags,
        'ready-to-use': false
      });
      return;
    }

    // Execute regex
    const matches = [];
    if (flags.includes('g')) {
      let match;
      // Prevent infinite loops on zero-length matches
      let lastIndex = -1;
      while ((match = regex.exec(testStr)) !== null) {
        if (match.index === lastIndex && match[0].length === 0) {
          regex.lastIndex++;
          continue;
        }
        lastIndex = match.index;
        matches.push({
          value: match[0],
          index: match.index,
          endIndex: match.index + match[0].length,
          groups: match.slice(1),
          namedGroups: match.groups || null
        });
        if (matches.length > 5000) break;
      }
    } else {
      const match = regex.exec(testStr);
      if (match) {
        matches.push({
          value: match[0],
          index: match.index,
          endIndex: match.index + match[0].length,
          groups: match.slice(1),
          namedGroups: match.groups || null
        });
      }
    }

    state.matches = matches;

    // Update stats
    const count = matches.length;
    els.statMatches.textContent = count;
    els.statMatches.className = count > 0
      ? 'text-3xl font-bold text-emerald-500'
      : 'text-3xl font-bold text-slate-400';

    if (count > 0) {
      els.statStatus.textContent = 'Matched';
      els.statStatus.className = 'text-3xl font-bold text-emerald-500';
    } else {
      els.statStatus.textContent = 'No Match';
      els.statStatus.className = 'text-3xl font-bold text-amber-500';
    }

    // Highlight
    renderHighlight(testStr, matches);

    // Details
    renderDetails(matches);

    // Code snippet
    updateCodeSnippet();

    // Output info
    if (count > 0) {
      const totalLen = matches.reduce((s, m) => s + m.value.length, 0);
      els.outputInfo.textContent = `${count} match${count > 1 ? 'es' : ''} found · ${totalLen} characters matched`;
    } else {
      els.outputInfo.textContent = 'Pattern is valid but no matches found';
    }

    // Validation
    updateValidation({
      'has-pattern': true,
      'pattern-valid': true,
      'has-test-string': true,
      'matches-found': count > 0,
      'flags-configured': !!flags,
      'ready-to-use': true
    });
  }

  // ── Render Highlight ──
  function renderHighlight(text, matches) {
    if (matches.length === 0) {
      els.highlightContent.innerHTML = escapeHTML(text) || '<span class="text-slate-400">No matches found in the test string</span>';
      return;
    }

    let html = '';
    let lastIndex = 0;

    matches.forEach((match, i) => {
      // Text before match
      if (match.index > lastIndex) {
        html += escapeHTML(text.slice(lastIndex, match.index));
      }
      // Highlighted match
      html += `<span class="regex-highlight bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 rounded px-0.5 border-b-2 border-emerald-500" title="Match ${i + 1}: index ${match.index}–${match.endIndex}">${escapeHTML(match.value)}</span>`;
      lastIndex = match.endIndex;
    });

    // Remaining text
    if (lastIndex < text.length) {
      html += escapeHTML(text.slice(lastIndex));
    }

    els.highlightContent.innerHTML = html;
  }

  // ── Render Match Details ──
  function renderDetails(matches) {
    if (matches.length === 0) {
      els.matchDetails.textContent = 'No matches found';
      return;
    }

    const displayMatches = matches.slice(0, 100);
    let html = '';

    displayMatches.forEach((match, i) => {
      html += `<div class="mb-4 pb-4 ${i < displayMatches.length - 1 ? 'border-b border-slate-200 dark:border-slate-700' : ''}">`;
      html += `<div class="flex items-center gap-2 mb-2"><span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">${i + 1}</span><span class="font-semibold text-slate-800 dark:text-slate-200">"${escapeHTML(match.value)}"</span><span class="text-xs text-slate-400 ml-auto">index ${match.index}–${match.endIndex}</span></div>`;

      if (match.groups.length > 0) {
        html += `<div class="ml-8 space-y-1">`;
        match.groups.forEach((group, gi) => {
          if (group !== undefined) {
            html += `<div class="flex items-center gap-2 text-xs"><span class="text-purple-500 font-mono">Group ${gi + 1}:</span><span class="bg-purple-500/10 px-2 py-0.5 rounded font-mono text-purple-700 dark:text-purple-300">"${escapeHTML(group)}"</span></div>`;
          } else {
            html += `<div class="flex items-center gap-2 text-xs"><span class="text-slate-400 font-mono">Group ${gi + 1}:</span><span class="text-slate-400">undefined</span></div>`;
          }
        });
        if (match.namedGroups) {
          Object.entries(match.namedGroups).forEach(([name, val]) => {
            html += `<div class="flex items-center gap-2 text-xs"><span class="text-blue-500 font-mono">&lt;${escapeHTML(name)}&gt;:</span><span class="bg-blue-500/10 px-2 py-0.5 rounded font-mono text-blue-700 dark:text-blue-300">"${escapeHTML(val)}"</span></div>`;
          });
        }
        html += `</div>`;
      }

      html += `</div>`;
    });

    if (matches.length > 100) {
      html += `<div class="text-xs text-slate-400 text-center pt-2">Showing first 100 of ${matches.length} matches</div>`;
    }

    els.matchDetails.innerHTML = html;
  }

  // ── Code Snippet ──
  function updateCodeSnippet() {
    if (!state.pattern) {
      els.generatedCode.textContent = 'Enter a regex pattern to generate code snippets';
      return;
    }
    if (!state.isValid) {
      els.generatedCode.textContent = '// Invalid regex pattern';
      return;
    }
    const flags = state.flags || '';
    const escaped = state.pattern.replace(/\\/g, '\\\\').replace(/`/g, '\\`');
    els.generatedCode.textContent = `const regex = new RegExp('${escaped}', '${flags}');`;
  }

  // ── Reset Output ──
  function resetOutput() {
    state.matches = [];
    state.isValid = false;
    state.error = '';

    els.statMatches.textContent = '0';
    els.statMatches.className = 'text-3xl font-bold text-slate-400';
    els.statValid.textContent = '—';
    els.statValid.className = 'text-3xl font-bold text-slate-400';
    els.statFlags.textContent = 'None';
    els.statFlags.className = 'text-3xl font-bold text-slate-400';
    els.statStatus.textContent = 'Idle';
    els.statStatus.className = 'text-3xl font-bold text-slate-400';

    els.patternError.classList.add('hidden');
    els.highlightContent.innerHTML = '<span class="text-slate-400">Enter a regex pattern and test string to see highlighted matches here</span>';
    els.matchDetails.textContent = 'No match details yet';
    els.generatedCode.textContent = 'Enter a regex pattern to generate code snippets';
    els.outputInfo.textContent = 'No regex pattern provided yet';
  }

  // ── Validation Checklist ──
  function updateValidation(checks) {
    const items = els.validationList.querySelectorAll('[data-check]');
    items.forEach(item => {
      const key = item.getAttribute('data-check');
      const icon = item.querySelector('i');
      const text = item.querySelector('span');
      if (checks[key]) {
        icon.className = 'fas fa-circle-check text-[10px] text-emerald-500';
        text.className = 'text-slate-700 dark:text-slate-300';
      } else {
        icon.className = 'fas fa-circle text-[8px] text-slate-300 dark:text-slate-600';
        text.className = 'text-slate-400';
      }
    });
  }

  // ── Toast ──
  function showToast(message, type) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const colors = { success: 'bg-emerald-500', error: 'bg-red-500', info: 'bg-blue-500' };
    toast.className = `${colors[type] || colors.info} text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transform translate-x-full transition-transform duration-300`;
    const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove('translate-x-full');
      toast.classList.add('translate-x-0');
    });
    setTimeout(() => {
      toast.classList.remove('translate-x-0');
      toast.classList.add('translate-x-full');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // ── Clear ──
  function clearAll() {
    els.patternInput.value = '';
    els.testString.value = '';
    els.flagG.checked = false;
    els.flagI.checked = false;
    els.flagM.checked = false;
    els.flagS.checked = false;
    els.testStringCount.textContent = '0 chars · 0 lines';
    resetOutput();
    updateValidation({
      'has-pattern': false,
      'pattern-valid': false,
      'has-test-string': false,
      'matches-found': false,
      'flags-configured': false,
      'ready-to-use': false
    });
    showToast('All fields cleared', 'info');
  }

  // ── Copy ──
  function copyRegex() {
    if (!state.pattern || !state.isValid) {
      showToast('Enter a valid regex pattern first', 'error');
      return;
    }
    const code = els.generatedCode.textContent;
    navigator.clipboard.writeText(code).then(() => {
      showToast('Regex code copied to clipboard', 'success');
    });
  }

  // ── Presets ──
  const presets = {
    email: {
      pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
      flags: 'gi',
      test: 'Contact us at hello@example.com or support@company.co.uk.\nInvalid emails: user@, @domain.com, test@.com\nValid: john.doe+tag@sub.domain.org'
    },
    phone: {
      pattern: '(?:\\+?1[-.\\s]?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}',
      flags: 'g',
      test: 'Call us at (555) 123-4567 or +1-555-987-6543.\nOther formats: 555.234.5678, 555 345 6789\nNot a phone: 12345 or abc-def-ghij'
    },
    url: {
      pattern: 'https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+[\\/\\w\\-._~:?#@!$&\'()*+,;=%]*',
      flags: 'gi',
      test: 'Visit https://www.example.com/path?query=value#hash\nOr check http://api.service.io/v2/users?page=1\nNot URLs: www.example.com or just text'
    },
    ip: {
      pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
      flags: 'g',
      test: 'Server IPs: 192.168.1.1, 10.0.0.255, 172.16.254.1\nInvalid: 999.999.999.999, 1.2.3, 1.2.3.4.5\nEdge: 0.0.0.0, 255.255.255.255'
    },
    date: {
      pattern: '\\d{4}[-/]\\d{2}[-/]\\d{2}',
      flags: 'g',
      test: 'Dates: 2024-01-15, 2023/12/31, 1999-06-15\nMixed: 2024-01/15 (partial match on 2024-01)\nNot dates: 01-15-2024, 15-01-2024'
    },
    hex: {
      pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b',
      flags: 'gi',
      test: 'Colors: #fff, #000, #FF5733, #28a745, #6c757d\nNot hex: #ggg, #1234, #abcdef1\nIn context: color: #3498db; background: #2c3e50;'
    }
  };

  function applyPreset(name) {
    const preset = presets[name];
    if (!preset) return;

    els.patternInput.value = preset.pattern;
    els.testString.value = preset.test;

    // Set flags
    els.flagG.checked = preset.flags.includes('g');
    els.flagI.checked = preset.flags.includes('i');
    els.flagM.checked = preset.flags.includes('m');
    els.flagS.checked = preset.flags.includes('s');

    runRegex();
  }

  // ── Preview Tabs ──
  document.querySelectorAll('.preview-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.preview-tab').forEach(t => {
        t.classList.remove('active-tab', 'border-emerald-500', 'bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400');
        t.classList.add('border-slate-200', 'dark:border-slate-700', 'text-slate-600', 'dark:text-slate-400');
      });
      this.classList.add('active-tab', 'border-emerald-500', 'bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400');
      this.classList.remove('border-slate-200', 'dark:border-slate-700', 'text-slate-600', 'dark:text-slate-400');

      const view = this.getAttribute('data-view');
      document.querySelectorAll('.preview-panel').forEach(p => p.classList.add('hidden'));
      document.getElementById(`view-${view}`).classList.remove('hidden');
    });
  });

  // ── Debounced Run ──
  function debouncedRun() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runRegex, 150);
  }

  // ── Event Listeners ──
  els.patternInput.addEventListener('input', debouncedRun);
  els.testString.addEventListener('input', debouncedRun);
  els.flagG.addEventListener('change', runRegex);
  els.flagI.addEventListener('change', runRegex);
  els.flagM.addEventListener('change', runRegex);
  els.flagS.addEventListener('change', runRegex);

  els.clearBtn.addEventListener('click', clearAll);
  els.copyBtn.addEventListener('click', copyRegex);

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      applyPreset(this.getAttribute('data-preset'));
    });
  });

  // ── Copy Link ──
  if (els.copyLinkBtn) {
    els.copyLinkBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('Page link copied', 'success');
      });
    });
  }

  // ── Init ──
  updateValidation({
    'has-pattern': false,
    'pattern-valid': false,
    'has-test-string': false,
    'matches-found': false,
    'flags-configured': false,
    'ready-to-use': false
  });

})();
