/**
 * Keyword Density Checker - Devpalettes
 * Analyzes keyword frequency, phrase density, and word statistics
 */
(function() {
  'use strict';

  /* ========== STOP WORDS LIST ========== */
  var STOP_WORDS = [
    'a','about','above','after','again','against','all','am','an','and','any','are',
    'aren\'t','as','at','be','because','been','before','being','below','between','both',
    'but','by','can','can\'t','cannot','could','couldn\'t','did','didn\'t','do','does',
    'doesn\'t','doing','don\'t','down','during','each','few','for','from','further','get',
    'got','had','hadn\'t','has','hasn\'t','have','haven\'t','having','he','he\'d','he\'ll',
    'he\'s','her','here','here\'s','hers','herself','him','himself','his','how','how\'s',
    'i','i\'d','i\'ll','i\'m','i\'ve','if','in','into','is','isn\'t','it','it\'s','its',
    'itself','let\'s','me','more','most','mustn\'t','my','myself','no','nor','not','of',
    'off','on','once','only','or','other','ought','our','ours','ourselves','out','over',
    'own','same','shan\'t','she','she\'d','she\'ll','she\'s','should','shouldn\'t','so',
    'some','such','than','that','that\'s','the','their','theirs','them','themselves','then',
    'there','there\'s','these','they','they\'d','they\'ll','they\'re','they\'ve','this',
    'those','through','to','too','under','until','up','very','was','wasn\'t','we','we\'d',
    'we\'ll','we\'re','we\'ve','were','weren\'t','what','what\'s','when','when\'s','where',
    'where\'s','which','while','who','who\'s','whom','why','why\'s','with','won\'t','would',
    'wouldn\'t','you','you\'d','you\'ll','you\'re','you\'ve','your','yours','yourself',
    'yourselves','also','just','like','well','back','even','still','way','take','come',
    'make','know','say','go','see','think','look','give','use','find','tell','ask','work',
    'seem','feel','try','leave','call','keep','let','begin','show','hear','play','run',
    'move','live','believe','hold','bring','happen','write','provide','sit','stand','lose',
    'pay','meet','include','continue','set','learn','change','lead','understand','watch',
    'follow','stop','create','speak','read','allow','add','spend','grow','open','walk',
    'win','offer','remember','love','consider','appear','buy','wait','serve','die','send',
    'expect','build','stay','fall','cut','reach','kill','remain','suggest','raise','pass',
    'sell','require','report','decide','pull','will','shall','may','might','need','dare',
    'ought','used','one','two','three','four','five','six','seven','eight','nine','ten',
    'many','much','every','each','another','other','some','any','no','not','yes','oh',
    'please','thank','thanks','hey','hi','hello','ok','okay','yeah','yep','nope','now',
    'then','already','always','never','sometimes','often','usually','really','very','quite',
    'rather','almost','enough','too','also','either','neither','however','therefore','thus',
    'hence','moreover','furthermore','anyway','besides','meanwhile','otherwise','instead',
    'perhaps','maybe','probably','certainly','definitely','actually','basically','simply'
  ];

  /* ========== DOM CACHE ========== */
  var el = {
    input: document.getElementById('content-input'),
    analyzeBtn: document.getElementById('analyze-btn'),
    clearBtn: document.getElementById('clear-btn'),
    inputCharCount: document.getElementById('input-char-count'),
    emptyState: document.getElementById('empty-state'),
    resultsContainer: document.getElementById('results-container'),
    keywordsTbody: document.getElementById('keywords-tbody'),
    densityWarning: document.getElementById('density-warning'),
    warningText: document.getElementById('warning-text'),
    optStopwords: document.getElementById('opt-stopwords'),
    optCase: document.getElementById('opt-case'),
    optMinLength: document.getElementById('opt-min-length'),
    minLengthVal: document.getElementById('min-length-val'),
    optTopCount: document.getElementById('opt-top-count'),
    topCountVal: document.getElementById('top-count-val'),
    copyReportBtn: document.getElementById('copy-report-btn'),
    exportTxtBtn: document.getElementById('export-txt-btn'),
    exportCsvBtn: document.getElementById('export-csv-btn'),
    statWords: document.getElementById('stat-words'),
    statChars: document.getElementById('stat-chars'),
    statSentences: document.getElementById('stat-sentences'),
    statUnique: document.getElementById('stat-unique')
  };

  /* ========== STATE ========== */
  var currentPhraseSize = 1;
  var analysisResult = null;

  /* ========== HELPERS ========== */
  function escapeHtml(s) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

  /* ========== TEXT PROCESSING ========== */
  function stripHtml(text) {
    return text.replace(/<[^>]*>/g, ' ');
  }

  function getWords(text) {
    return text.replace(/[^\w\s\u00C0-\u024F\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g, ' ')
              .replace(/[_]+/g, ' ')
              .split(/\s+/)
              .filter(function(w) { return w.length > 0; });
  }

  function getSentences(text) {
    return text.split(/[.!?]+/).filter(function(s) { return s.trim().length > 0; });
  }

  function getNgrams(words, n) {
    var grams = [];
    for (var i = 0; i <= words.length - n; i++) {
      var phrase = words.slice(i, i + n).join(' ');
      grams.push(phrase);
    }
    return grams;
  }

  function countFrequency(items, caseSensitive, stopWords, minLen) {
    var freq = {};
    var stopSet = stopWords ? STOP_WORDS : [];

    for (var i = 0; i < items.length; i++) {
      var item = caseSensitive ? items[i] : items[i].toLowerCase();

      // For single words, apply min length and stop word filter
      if (item.indexOf(' ') === -1) {
        if (item.length < minLen) continue;
        if (stopSet.indexOf(item) !== -1) continue;
      }

      if (freq[item]) {
        freq[item]++;
      } else {
        freq[item] = 1;
      }
    }
    return freq;
  }

  /* ========== MAIN ANALYSIS ========== */
  function analyze(text) {
    var filterStopWords = el.optStopwords.checked;
    var caseSensitive = el.optCase.checked;
    var minLen = parseInt(el.optMinLength.value, 10);
    var topCount = parseInt(el.optTopCount.value, 10);

    var cleanText = stripHtml(text);
    var words = getWords(cleanText);
    var sentences = getSentences(cleanText);
    var totalWords = words.length;
    var totalChars = text.length;
    var totalSentences = sentences.length;

    // Unique words (case-insensitive, no stop word filter for uniqueness count)
    var uniqueMap = {};
    words.forEach(function(w) {
      var key = caseSensitive ? w : w.toLowerCase();
      uniqueMap[key] = true;
    });
    var uniqueWords = Object.keys(uniqueMap).length;

    // 1-word frequency
    var singleFreq = countFrequency(words, caseSensitive, filterStopWords, minLen);

    // 2-word, 3-word, 4-word phrases
    var wordsLower = caseSensitive ? words.slice() : words.map(function(w) { return w.toLowerCase(); });

    var bigramFreq = countFrequency(getNgrams(wordsLower, 2), true, false, 1);
    var trigramFreq = countFrequency(getNgrams(wordsLower, 3), true, false, 1);
    var fourgramFreq = countFrequency(getNgrams(wordsLower, 4), true, false, 1);

    // Sort each by count descending
    function sortFreq(freq) {
      var arr = [];
      for (var key in freq) {
        if (freq.hasOwnProperty(key)) {
          arr.push({ word: key, count: freq[key], density: (freq[key] / totalWords * 100) });
        }
      }
      arr.sort(function(a, b) { return b.count - a.count; });
      return arr.slice(0, topCount);
    }

    return {
      totalWords: totalWords,
      totalChars: totalChars,
      totalSentences: totalSentences,
      uniqueWords: uniqueWords,
      phrases: {
        1: sortFreq(singleFreq),
        2: sortFreq(bigramFreq),
        3: sortFreq(trigramFreq),
        4: sortFreq(fourgramFreq)
      }
    };
  }

  /* ========== UI RENDERING ========== */
  function updateStats(result) {
    el.statWords.textContent = result.totalWords.toLocaleString();
    el.statChars.textContent = result.totalChars.toLocaleString();
    el.statSentences.textContent = result.totalSentences.toLocaleString();
    el.statUnique.textContent = result.uniqueWords.toLocaleString();
  }

  function getBarColor(density) {
    if (density <= 1) return 'bg-emerald-500';
    if (density <= 2) return 'bg-blue-500';
    if (density <= 3) return 'bg-amber-500';
    return 'bg-red-500';
  }

  function getDensityColor(density) {
    if (density <= 1) return 'text-emerald-600 dark:text-emerald-400';
    if (density <= 2) return 'text-blue-600 dark:text-blue-400';
    if (density <= 3) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  }

  function renderTable(result) {
    var data = result.phrases[currentPhraseSize];
    if (!data || data.length === 0) {
      el.keywordsTbody.innerHTML = '<tr><td colspan="5" class="text-center py-10 text-slate-400 text-sm">No keywords found for this phrase length</td></tr>';
      el.densityWarning.classList.add('hidden');
      return;
    }

    var maxCount = data[0].count;
    var html = '';
    var stuffedWords = [];

    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      var barWidth = Math.max(4, (item.count / maxCount) * 100);
      var densityStr = item.density.toFixed(2) + '%';
      var barColor = getBarColor(item.density);
      var densityColor = getDensityColor(item.density);

      if (item.density > 3) {
        stuffedWords.push(item.word);
      }

      html += '<tr class="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">' +
        '<td class="py-3 px-2 text-slate-400 font-mono text-xs">' + (i + 1) + '</td>' +
        '<td class="py-3 px-2 font-medium text-sm">' + escapeHtml(item.word) + '</td>' +
        '<td class="py-3 px-2 text-right font-mono text-sm">' + item.count + '</td>' +
        '<td class="py-3 px-2 text-right font-mono text-sm font-semibold ' + densityColor + '">' + densityStr + '</td>' +
        '<td class="py-3 px-2"><div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2"><div class="' + barColor + ' h-2 rounded-full transition-all duration-500" style="width:' + barWidth + '%"></div></div></td>' +
        '</tr>';
    }

    el.keywordsTbody.innerHTML = html;

    // Warning
    if (stuffedWords.length > 0) {
      el.densityWarning.classList.remove('hidden');
      var displayWords = stuffedWords.slice(0, 3).map(function(w) { return '"' + w + '"'; }).join(', ');
      var extra = stuffedWords.length > 3 ? ' and ' + (stuffedWords.length - 3) + ' more' : '';
      el.warningText.textContent = displayWords + extra + ' exceed 3% density. Consider reducing occurrences or using synonyms.';
    } else {
      el.densityWarning.classList.add('hidden');
    }
  }

  function renderResults(result) {
    analysisResult = result;
    el.emptyState.classList.add('hidden');
    el.resultsContainer.classList.remove('hidden');
    updateStats(result);
    renderTable(result);
  }

  function showEmpty() {
    el.emptyState.classList.remove('hidden');
    el.resultsContainer.classList.add('hidden');
    el.statWords.textContent = '0';
    el.statChars.textContent = '0';
    el.statSentences.textContent = '0';
    el.statUnique.textContent = '0';
  }

  /* ========== EXPORT FUNCTIONS ========== */
  function getReportText() {
    if (!analysisResult) return '';
    var r = analysisResult;
    var lines = [];
    lines.push('=== KEYWORD DENSITY REPORT ===');
    lines.push('');
    lines.push('Total Words: ' + r.totalWords);
    lines.push('Total Characters: ' + r.totalChars);
    lines.push('Sentences: ' + r.totalSentences);
    lines.push('Unique Words: ' + r.uniqueWords);
    lines.push('');

    var labels = { 1: 'Single Words', 2: 'Two-Word Phrases', 3: 'Three-Word Phrases', 4: 'Four-Word Phrases' };
    for (var n = 1; n <= 4; n++) {
      lines.push('--- ' + labels[n] + ' ---');
      var data = r.phrases[n];
      for (var i = 0; i < data.length; i++) {
        lines.push((i + 1) + '. ' + data[i].word + ' | Count: ' + data[i].count + ' | Density: ' + data[i].density.toFixed(2) + '%');
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  function getCsvText() {
    if (!analysisResult) return '';
    var r = analysisResult;
    var rows = [['Phrase Size', 'Keyword', 'Count', 'Density (%)']];

    for (var n = 1; n <= 4; n++) {
      var data = r.phrases[n];
      for (var i = 0; i < data.length; i++) {
        rows.push([n + '-Word', '"' + data[i].word.replace(/"/g, '""') + '"', data[i].count, data[i].density.toFixed(2)]);
      }
    }

    return rows.map(function(row) { return row.join(','); }).join('\n');
  }

  function copyReport() {
    var text = getReportText();
    if (!text) { showToast('No data to copy', 'error'); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showToast('Report copied to clipboard!', 'success');
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
      showToast('Report copied to clipboard!', 'success');
    } catch (e) {
      showToast('Failed to copy', 'error');
    }
    document.body.removeChild(ta);
  }

  function downloadFile(content, filename, type) {
    var blob = new Blob([content], { type: type });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ========== DEBOUNCE ========== */
  function debounce(fn, delay) {
    var timer;
    return function() {
      var ctx = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function() { fn.apply(ctx, args); }, delay);
    };
  }

  /* ========== EVENT BINDING ========== */
  function bindEvents() {
    // Input character count
    el.input.addEventListener('input', function() {
      var len = el.input.value.length;
      el.inputCharCount.textContent = len.toLocaleString() + ' characters';
      el.analyzeBtn.disabled = len < 10;
    });

    // Clear
    el.clearBtn.addEventListener('click', function() {
      el.input.value = '';
      el.inputCharCount.textContent = '0 characters';
      el.analyzeBtn.disabled = true;
      showEmpty();
      analysisResult = null;
    });

    // Analyze
    el.analyzeBtn.addEventListener('click', function() {
      var text = el.input.value.trim();
      if (text.length < 10) { showToast('Please enter at least 10 characters', 'error'); return; }
      var result = analyze(text);
      renderResults(result);
      showToast('Analysis complete!', 'success');
    });

    // Range sliders
    el.optMinLength.addEventListener('input', function() {
      el.minLengthVal.textContent = this.value;
    });
    el.optTopCount.addEventListener('input', function() {
      el.topCountVal.textContent = this.value;
    });

    // Phrase tabs
    document.querySelectorAll('.phrase-tab').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.phrase-tab').forEach(function(b) {
          b.classList.remove('active', 'border-emerald-500', 'bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400');
          b.classList.add('border-slate-200', 'dark:border-slate-700', 'text-slate-600', 'dark:text-slate-400');
        });
        this.classList.add('active', 'border-emerald-500', 'bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400');
        this.classList.remove('border-slate-200', 'dark:border-slate-700', 'text-slate-600', 'dark:text-slate-400');
        currentPhraseSize = parseInt(this.getAttribute('data-phrase'), 10);
        if (analysisResult) renderTable(analysisResult);
      });
    });

    // Export buttons
    el.copyReportBtn.addEventListener('click', copyReport);

    el.exportTxtBtn.addEventListener('click', function() {
      var text = getReportText();
      if (!text) { showToast('No data to export', 'error'); return; }
      downloadFile(text, 'keyword-density-report.txt', 'text/plain');
      showToast('TXT file downloaded!', 'success');
    });

    el.exportCsvBtn.addEventListener('click', function() {
      var csv = getCsvText();
      if (!csv) { showToast('No data to export', 'error'); return; }
      downloadFile(csv, 'keyword-density-report.csv', 'text/csv');
      showToast('CSV file downloaded!', 'success');
    });

    // Options change — re-analyze if data exists
    var debouncedReanalyze = debounce(function() {
      if (analysisResult && el.input.value.trim().length >= 10) {
        var result = analyze(el.input.value.trim());
        renderResults(result);
      }
    }, 300);

    el.optStopwords.addEventListener('change', debouncedReanalyze);
    el.optCase.addEventListener('change', debouncedReanalyze);
    el.optMinLength.addEventListener('change', debouncedReanalyze);
    el.optTopCount.addEventListener('change', debouncedReanalyze);

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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
