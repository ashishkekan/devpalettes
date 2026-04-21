/**
 * ATS Resume Checker - DevPalettes
 * Client-side resume analysis using PDF.js
 */

(function() {
  'use strict';

  // ✅ FIX: Expanded stop words to reduce noise in keyword extraction
  var STOP_WORDS = new Set([
    "a","an","the","and","or","but","if","because","as","what","which","this","that","these","those",
    "am","is","are","was","were","be","been","being","have","has","had","do","does","did","will","would",
    "should","can","could","may","might","must","shall","to","of","in","for","on","with","at","by","from",
    "up","about","into","over","after","job","description","role","responsibilities","requirements","qualifications",
    "we","you","your","our","us","looking","seeking","also","well","able","work","working","including",
    "etc","e.g","i.e","per","within","across","among","between","through","during","before","while",
    "new","like","using","used","based","such","other","than","more","most","own","same","so","no",
    "not","only","any","each","every","both","few","many","much","some","all","its","their","them",
    "they","his","her","my","me","who","whom","how","when","where","why","what","which",
    "will","get","make","go","come","take","see","know","think","give","say","tell","find",
    "year","years","experience","time","way","day","days","team","teams","company","companies",
    "candidate","candidates","position","opportunity","join","working","ensure","strong","excellent",
    "plus","preferred","minimum","required","relevant","ideal","able","ability","understanding",
    "knowledge","familiarity","environment","benefits","offer","salary","location","remote","hybrid"
  ]);

  // ✅ FIX: Abbreviation → canonical mapping for synonym normalization
  var ABBR_TO_CANONICAL = {
    'js': 'javascript', 'ts': 'typescript', 'py': 'python', 'rb': 'ruby',
    'node': 'node.js', 'nodejs': 'node.js',
    'reactjs': 'react', 'react.js': 'react',
    'vuejs': 'vue', 'vue.js': 'vue',
    'angularjs': 'angular', 'angular.js': 'angular',
    'postgres': 'postgresql', 'mongo': 'mongodb',
    'k8s': 'kubernetes', 'tf': 'terraform',
    'css3': 'css', 'html5': 'html',
    'ai': 'artificial intelligence', 'ml': 'machine learning',
    'nlp': 'natural language processing',
    'ci/cd': 'continuous integration',
    'aws': 'amazon web services', 'gcp': 'google cloud platform',
    'sq': 'sql', 'jq': 'jquery',
    'sass': 'scss', 'lesscss': 'less',
    'win': 'windows', 'macos': 'mac', 'osx': 'mac',
    'linux': 'linux', 'ubuntu': 'linux',
    'pg': 'postgresql', 'mysql': 'mysql',
    'tsql': 'sql', 'pl/sql': 'sql',
    'rest': 'rest api', 'graphql': 'graphql',
    'oop': 'object oriented programming',
    'tdd': 'test driven development',
    'bdd': 'behavior driven development',
    'agile': 'agile', 'scrum': 'scrum',
    'devops': 'devops', 'sre': 'site reliability engineering',
    'ui': 'user interface', 'ux': 'user experience',
    'crm': 'customer relationship management',
    'erp': 'enterprise resource planning',
    'kpi': 'key performance indicator',
    'roi': 'return on investment',
    'seo': 'search engine optimization',
    'cta': 'call to action',
    'saas': 'software as a service',
    'paas': 'platform as a service',
    'iaas': 'infrastructure as a service',
    'api': 'api', 'sdk': 'software development kit',
    'ide': 'integrated development environment',
    'git': 'git', 'svn': 'svn',
    'docker': 'docker', 'containers': 'docker'
  };

  // ✅ FIX: Build reverse map (canonical → all variants) for matching
  function buildVariantMap() {
    var map = {};
    var keys = Object.keys(ABBR_TO_CANONICAL);
    for (var i = 0; i < keys.length; i++) {
      var abbr = keys[i];
      var canonical = ABBR_TO_CANONICAL[abbr];
      if (!map[canonical]) map[canonical] = [];
      if (map[canonical].indexOf(abbr) === -1) map[canonical].push(abbr);
    }
    // Ensure canonical form itself is in the list
    var canonicals = Object.keys(map);
    for (var j = 0; j < canonicals.length; j++) {
      var c = canonicals[j];
      if (map[c].indexOf(c) === -1) map[c].push(c);
    }
    return map;
  }

  var CANONICAL_VARIANTS = buildVariantMap();

  // --- State ---
  var resumeText = '';
  var pdfJsReady = false;
  var activeToasts = {};  // ✅ FIX: Object for toast deduplication (Set not available in all contexts)

  // --- DOM Elements ---
  var el = {
    dropZone: document.getElementById('drop-zone'),
    resumeInput: document.getElementById('resume-input'),
    fileInfo: document.getElementById('file-info'),
    previewContainer: document.getElementById('extracted-preview-container'),
    previewToggle: document.getElementById('toggle-preview'),
    resumeTextPreview: document.getElementById('resume-text-preview'),
    jdInput: document.getElementById('jd-input'),
    jdCharCount: document.getElementById('jd-char-count'),
    analyzeBtn: document.getElementById('analyze-btn'),
    resultsEmpty: document.getElementById('results-empty'),
    resultsContent: document.getElementById('results-content'),
    scoreCircle: document.getElementById('score-circle'),
    scoreValue: document.getElementById('score-value'),
    scoreMessage: document.getElementById('score-message'),
    statMatch: document.getElementById('stat-match'),
    statFormat: document.getElementById('stat-format'),
    matchedKeywords: document.getElementById('matched-keywords'),
    missingKeywords: document.getElementById('missing-keywords'),
    suggestionsList: document.getElementById('suggestions-list'),
    copyBtn: document.getElementById('copy-report-btn'),
    downloadBtn: document.getElementById('download-report-btn')
  };

  // --- Init ---
  function init() {
    setupDragDrop();
    el.dropZone.addEventListener('click', function() { el.resumeInput.click(); });
    // ✅ FIX: Keyboard accessibility for drop zone
    el.dropZone.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.resumeInput.click(); }
    });
    el.resumeInput.addEventListener('change', handleFiles);
    el.jdInput.addEventListener('input', function() {
      el.jdCharCount.textContent = el.jdInput.value.length + ' characters';
    });
    el.previewToggle.addEventListener('click', function() {
      el.resumeTextPreview.classList.toggle('hidden');
    });
    el.analyzeBtn.addEventListener('click', runAnalysis);
    el.copyBtn.addEventListener('click', copyReport);
    el.downloadBtn.addEventListener('click', downloadReport);
  }

  // ✅ FIX: Consolidated drag-drop setup into one function
  function setupDragDrop() {
    var zone = el.dropZone;
    var dragEvents = ['dragenter', 'dragover', 'dragleave', 'drop'];
    for (var i = 0; i < dragEvents.length; i++) {
      zone.addEventListener(dragEvents[i], function(e) { e.preventDefault(); e.stopPropagation(); }, false);
    }
    zone.addEventListener('dragenter', function() { zone.classList.add('drag-active'); }, false);
    zone.addEventListener('dragover', function() { zone.classList.add('drag-active'); }, false);
    zone.addEventListener('dragleave', function() { zone.classList.remove('drag-active'); }, false);
    zone.addEventListener('drop', function(e) {
      zone.classList.remove('drag-active');
      handleFiles({ target: { files: e.dataTransfer.files } });
    }, false);
  }

  // --- ✅ FIX: Lazy-load PDF.js only when user uploads a file ---
  function loadPdfJs() {
    if (pdfJsReady) return Promise.resolve();
    return new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      s.onload = function() {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        pdfJsReady = true;
        resolve();
      };
      s.onerror = function() { reject(new Error('Failed to load PDF.js')); };
      document.head.appendChild(s);
    });
  }

  // --- File Handling ---
  function handleFiles(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      showToast('Please upload a PDF file', 'error');
      return;
    }
    // ✅ FIX: Large file validation
    if (file.size > 10 * 1024 * 1024) {
      showToast('File is too large (max 10 MB)', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Large file — processing may take a moment', 'info');
    }

    el.fileInfo.textContent = file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
    el.fileInfo.classList.remove('hidden');

    loadPdfJs().then(function() {
      return extractTextFromPDF(file);
    }).catch(function(err) {
      console.error(err);
      showToast('Failed to load PDF reader', 'error');
    });
  }

  function extractTextFromPDF(file) {
    showToast('Reading PDF...', 'info');
    file.arrayBuffer().then(function(buf) {
      return pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function(pdf) {
      var pagePromises = [];
      for (var i = 1; i <= pdf.numPages; i++) {
        pagePromises.push(
          pdf.getPage(i).then(function(page) {
            return page.getTextContent().then(function(content) {
              return content.items.map(function(item) { return item.str; }).join(' ');
            });
          })
        );
      }
      return Promise.all(pagePromises);
    }).then(function(pages) {
      resumeText = pages.join(' ').trim();
      // ✅ FIX: Detect empty/image-based PDFs
      if (!resumeText) {
        showToast('PDF appears empty or is image-based (not selectable text)', 'error');
        return;
      }
      el.resumeTextPreview.value = resumeText;
      el.previewContainer.classList.remove('hidden');
      showToast('PDF text extracted successfully', 'success');
    }).catch(function(err) {
      console.error(err);
      showToast('Error parsing PDF. Ensure it contains selectable text.', 'error');
    });
  }

  // --- ✅ FIX: Improved keyword extraction with bigrams + frequency weighting + synonym normalization ---
  function extractKeywords(jdText) {
    var clean = jdText.toLowerCase().replace(/[^\w\s+#.-]/g, ' ');
    var tokens = clean.split(/\s+/);
    var filtered = [];
    for (var i = 0; i < tokens.length; i++) {
      var w = tokens[i];
      if (w.length > 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w)) {
        filtered.push(w);
      }
    }

    // Count single-word frequencies (normalized to canonical form)
    var wordFreq = {};
    for (var j = 0; j < filtered.length; j++) {
      var canonical = ABBR_TO_CANONICAL[filtered[j]] || filtered[j];
      wordFreq[canonical] = (wordFreq[canonical] || 0) + 1;
    }

    // Extract bigrams (2-word phrases) appearing 2+ times
    var bigramFreq = {};
    for (var k = 0; k < filtered.length - 1; k++) {
      var bg = filtered[k] + ' ' + filtered[k + 1];
      bigramFreq[bg] = (bigramFreq[bg] || 0) + 1;
    }

    var keywords = [];

    // Add frequent bigrams with boosted weight
    var bgKeys = Object.keys(bigramFreq);
    for (var b = 0; b < bgKeys.length; b++) {
      if (bigramFreq[bgKeys[b]] >= 2) {
        keywords.push({ term: bgKeys[b], weight: bigramFreq[bgKeys[b]] * 1.5 });
      }
    }

    // Add single words (already normalized to canonical)
    var wKeys = Object.keys(wordFreq);
    for (var w = 0; w < wKeys.length; w++) {
      keywords.push({ term: wKeys[w], weight: wordFreq[wKeys[w]] });
    }

    // Sort by weight descending, cap at 50
    keywords.sort(function(a, b) { return b.weight - a.weight; });
    return keywords.slice(0, 50);
  }

  // --- ✅ FIX: Word boundary matching instead of simple includes() — prevents "man" matching inside "management"
  function wordBoundaryMatch(text, keyword) {
    var escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      return new RegExp('\\b' + escaped + '\\b', 'i').test(text);
    } catch (e) {
      return text.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
    }
  }

  // ✅ FIX: Check keyword + all synonym variants against resume
  function keywordMatchesResume(resumeLower, keywordTerm) {
    // Direct match with word boundaries
    if (wordBoundaryMatch(resumeLower, keywordTerm)) return true;

    var termLower = keywordTerm.toLowerCase();

    // Check if keyword is an abbreviation — try matching its canonical form
    var canonical = ABBR_TO_CANONICAL[termLower];
    if (canonical && canonical !== termLower) {
      if (wordBoundaryMatch(resumeLower, canonical)) return true;
    }

    // Check if keyword is a canonical form — try matching all its abbreviations
    var variants = CANONICAL_VARIANTS[termLower];
    if (variants) {
      for (var i = 0; i < variants.length; i++) {
        if (variants[i] !== termLower && wordBoundaryMatch(resumeLower, variants[i])) return true;
      }
    }

    return false;
  }

  // --- Analysis ---
  function runAnalysis() {
    if (!resumeText) {
      showToast('Please upload a resume first', 'error');
      return;
    }
    var jdText = el.jdInput.value.trim();
    if (!jdText) {
      showToast('Please enter a job description', 'error');
      return;
    }
    // ✅ FIX: Minimum JD length validation
    if (jdText.length < 30) {
      showToast('Job description seems too short for meaningful analysis', 'error');
      return;
    }

    // ✅ FIX: Loading state — disable button, show spinner
    setAnalyzing(true);

    // Small delay to let UI update before heavy computation
    setTimeout(function() {
      try {
        performAnalysis(jdText);
      } finally {
        setAnalyzing(false);
      }
    }, 60);
  }

  function performAnalysis(jdText) {
    var keywords = extractKeywords(jdText);
    if (keywords.length === 0) {
      showToast('Could not extract keywords from the job description', 'error');
      return;
    }

    var resumeLower = resumeText.toLowerCase();
    var matched = [];
    var missing = [];
    var totalWeight = 0;
    var matchedWeight = 0;

    for (var i = 0; i < keywords.length; i++) {
      var kw = keywords[i];
      totalWeight += kw.weight;
      if (keywordMatchesResume(resumeLower, kw.term)) {
        matched.push(kw);
        matchedWeight += kw.weight;
      } else {
        missing.push(kw);
      }
    }

    // ✅ FIX: Weighted keyword scoring — frequent JD keywords contribute more to score
    var keywordPercent = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;
    var keywordScore = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 60) : 0;

    // Density score (0-20)
    var resumeWords = resumeText.split(/\s+/).length;
    var densityScore = resumeWords > 0 ? Math.min(Math.round((matched.length / resumeWords) * 200), 20) : 0;

    // Format score (0-20)
    var formatPoints = 0;
    if (resumeWords > 50) formatPoints += 5;
    if (/experience|education|skills|summary/i.test(resumeText)) formatPoints += 5;
    if (/[\w.-]+@[\w.-]+\.\w+/.test(resumeText)) formatPoints += 5;
    if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText)) formatPoints += 5;

    var totalScore = Math.min(keywordScore + densityScore + formatPoints, 100);

    var suggestions = generateSuggestions(matched, missing, keywords, formatPoints, resumeWords);

    renderResults(totalScore, keywordPercent, formatPoints, matched, missing, suggestions);
  }

  // ✅ FIX: Cleaner suggestion generation with more specific guidance
  function generateSuggestions(matched, missing, allKeywords, formatScore, resumeWords) {
    var suggestions = [];
    var matchRatio = allKeywords.length > 0 ? matched.length / allKeywords.length : 0;

    if (matchRatio < 0.3) {
      var topMissing = missing.slice(0, 5).map(function(k) { return k.term; }).join(', ');
      suggestions.push('Many critical keywords are missing. Add these to your resume: ' + topMissing);
    } else if (matchRatio < 0.5) {
      var topMissing2 = missing.slice(0, 4).map(function(k) { return k.term; }).join(', ');
      suggestions.push('Add missing keywords to strengthen your match: ' + topMissing2);
    } else if (matchRatio < 0.75) {
      var topMissing3 = missing.slice(0, 3).map(function(k) { return k.term; }).join(', ');
      suggestions.push('Consider adding these keywords: ' + topMissing3);
    }

    if (formatScore < 15) {
      suggestions.push('Ensure standard section headers (Experience, Skills, Education) and contact info are present and clearly labeled.');
    }

    if (!/increased|decreased|reduced|improved|achieved|%|\$|managed|led|built|created|delivered|grew|saved/i.test(resumeText)) {
      suggestions.push('Add measurable achievements (e.g., "Increased revenue by 20%") to strengthen your impact.');
    }

    if (resumeWords < 200) {
      suggestions.push('Your resume appears short. Expand on experience, responsibilities, and accomplishments.');
    } else if (resumeWords > 1500) {
      suggestions.push('Your resume is quite long. Consider condensing to the most relevant experience for this role.');
    }

    // ✅ FIX: Highlight important missing multi-word phrases
    var importantPhrases = missing.filter(function(k) {
      return k.term.indexOf(' ') !== -1 && k.weight > 3;
    }).map(function(k) { return k.term; });
    if (importantPhrases.length > 0 && suggestions.length < 5) {
      suggestions.push('Important phrases missing from your resume: ' + importantPhrases.slice(0, 3).join(', '));
    }

    if (suggestions.length === 0) {
      suggestions.push('Great job! Your resume is well-optimized for this role.');
    }

    return suggestions;
  }

  function setAnalyzing(isLoading) {
    el.analyzeBtn.disabled = isLoading;
    if (isLoading) {
      el.analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
      el.analyzeBtn.classList.add('opacity-75', 'cursor-not-allowed');
    } else {
      el.analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Resume';
      el.analyzeBtn.classList.remove('opacity-75', 'cursor-not-allowed');
    }
  }

  // --- Rendering ---
  function renderResults(score, keywordPercent, formatScore, matched, missing, suggestions) {
    el.resultsEmpty.classList.add('hidden');
    el.resultsContent.classList.remove('hidden');

    // Animate score circle
    var circumference = 440;
    var offset = circumference - (score / 100) * circumference;
    el.scoreCircle.style.strokeDashoffset = offset;

    // Color tier
    var color, dark, msg;
    if (score >= 80) {
      color = 'text-emerald-500'; dark = 'dark:text-emerald-400'; msg = 'Excellent Match!';
    } else if (score >= 60) {
      color = 'text-blue-500'; dark = 'dark:text-blue-400'; msg = 'Good Candidate';
    } else if (score >= 40) {
      color = 'text-yellow-500'; dark = 'dark:text-yellow-400'; msg = 'Moderate Match';
    } else {
      color = 'text-red-500'; dark = 'dark:text-red-400'; msg = 'Needs Improvement';
    }

    // ✅ FIX: SVG elements return SVGAnimatedString for className, not a string.
    // Use classList.remove() instead of string replace to avoid TypeError.
    var colorClasses = [
      'text-emerald-500','text-emerald-400',
      'text-blue-500','text-blue-400',
      'text-yellow-500','text-yellow-400',
      'text-red-500','text-red-400',
      'dark:text-emerald-400','dark:text-blue-400',
      'dark:text-yellow-400','dark:text-red-400'
    ];
    for (var c = 0; c < colorClasses.length; c++) {
      el.scoreCircle.classList.remove(colorClasses[c]);
    }
    el.scoreCircle.classList.add('progress-ring__circle', color, dark);

    el.scoreValue.textContent = score;
    el.scoreMessage.textContent = msg;
    el.scoreMessage.className = 'text-lg sm:text-xl font-medium mb-4 ' + color + ' ' + dark;

    el.statMatch.textContent = keywordPercent + '%';
    el.statFormat.textContent = formatScore + '/20';

    // ✅ FIX: Use .term property since keywords are now objects
    el.matchedKeywords.innerHTML = matched.map(function(k) {
      return '<span class="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded text-xs border border-emerald-200 dark:border-emerald-800">' + escapeHtml(k.term) + '</span>';
    }).join('');

    el.missingKeywords.innerHTML = missing.map(function(k) {
      return '<span class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded text-xs border border-red-200 dark:border-red-800">' + escapeHtml(k.term) + '</span>';
    }).join('');

    el.suggestionsList.innerHTML = suggestions.map(function(s) {
      return '<li>' + escapeHtml(s) + '</li>';
    }).join('');

    // ✅ FIX: Scroll with navbar offset — prevents results hiding behind fixed nav on mobile
    requestAnimationFrame(function() {
      var navEl = document.getElementById('navbar-container');
      var navH = navEl ? navEl.offsetHeight : 0;
      var top = el.resultsContent.getBoundingClientRect().top + window.pageYOffset - navH - 16;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });

    showToast('Analysis complete', 'success');
  }

  // ✅ FIX: HTML escape to prevent XSS in keyword display
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // --- Report Actions ---
  function getReportText() {
    var matchedText = Array.prototype.slice.call(el.matchedKeywords.children).map(function(c) { return c.textContent; }).join(', ');
    var missingText = Array.prototype.slice.call(el.missingKeywords.children).map(function(c) { return c.textContent; }).join(', ');
    var suggestionText = Array.prototype.slice.call(el.suggestionsList.children).map(function(li) { return '- ' + li.textContent; }).join('\n');

    return 'ATS Resume Analysis Report\n---------------------------\n' +
      'Overall Score: ' + el.scoreValue.textContent + '/100\n' +
      'Keyword Match: ' + el.statMatch.textContent + '\n' +
      'Format Score: ' + el.statFormat.textContent + '\n\n' +
      'Matched Keywords: ' + matchedText + '\n' +
      'Missing Keywords: ' + missingText + '\n\n' +
      'Suggestions:\n' + suggestionText;
  }

  function copyReport() {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      showToast('Clipboard not available in this browser', 'error');
      return;
    }
    navigator.clipboard.writeText(getReportText()).then(function() {
      showToast('Report copied to clipboard', 'success');
    }).catch(function() {
      showToast('Failed to copy', 'error');
    });
  }

  function downloadReport() {
    var blob = new Blob([getReportText()], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'ats-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Report downloaded', 'success');
  }

  // --- ✅ FIX: Toast system with deduplication — prevents stacking identical toasts
  function showToast(message, type) {
    type = type || 'info';
    var key = message + '|' + type;
    if (activeToasts[key]) return;
    activeToasts[key] = true;

    var container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed bottom-6 right-6 z-50 space-y-2';
      document.body.appendChild(container);
    }

    var bgMap = { success: 'bg-emerald-500', error: 'bg-red-500', info: 'bg-slate-700' };
    var iconMap = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };

    var toast = document.createElement('div');
    toast.className = (bgMap[type] || bgMap.info) + ' text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium transform translate-x-full transition-transform duration-300 flex items-center gap-2';
    toast.innerHTML = '<i class="fas ' + (iconMap[type] || iconMap.info) + '"></i> ' + escapeHtml(message);
    container.appendChild(toast);

    requestAnimationFrame(function() { toast.style.transform = 'translateX(0)'; });

    setTimeout(function() {
      delete activeToasts[key];
      toast.style.transform = 'translateX(120%)';
      setTimeout(function() { if (toast.parentNode) toast.remove(); }, 300);
    }, 3000);
  }

  // --- Init ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
