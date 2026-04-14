/**
 * Meta Tag Generator - Devpalettes
 * Generates optimized HTML meta tags with live preview and SEO scoring
 */
(function() {
  'use strict';

  // DOM Cache
  const DOM = {
    title: document.getElementById('meta-title'),
    desc: document.getElementById('meta-description'),
    keywords: document.getElementById('meta-keywords'),
    canonical: document.getElementById('canonical-url'),
    author: document.getElementById('meta-author'),
    viewport: document.getElementById('meta-viewport'),
    charset: document.getElementById('meta-charset'),
    language: document.getElementById('meta-language'),

    ogTitle: document.getElementById('og-title'),
    ogDesc: document.getElementById('og-description'),
    ogImage: document.getElementById('og-image'),
    ogUrl: document.getElementById('og-url'),
    ogType: document.getElementById('og-type'),

    twCard: document.getElementById('twitter-card'),
    twTitle: document.getElementById('twitter-title'),
    twDesc: document.getElementById('twitter-description'),
    twImage: document.getElementById('twitter-image'),

    robotsIndex: document.getElementById('robots-index'),
    robotsFollow: document.getElementById('robots-follow'),
    robotsNoImg: document.getElementById('robots-noimageindex'),
    robotsNoSnip: document.getElementById('robots-nosnippet'),

    includeViewport: document.getElementById('include-viewport'),
    includeCharset: document.getElementById('include-charset'),
    includeOg: document.getElementById('include-og'),
    includeTwitter: document.getElementById('include-twitter'),
    includeRobots: document.getElementById('include-robots'),
    includeKeywords: document.getElementById('include-keywords'),

    titleCounter: document.getElementById('title-counter'),
    descCounter: document.getElementById('desc-counter'),
    titleFeedback: document.getElementById('title-feedback'),
    descFeedback: document.getElementById('desc-feedback'),

    codeOutput: document.getElementById('generated-code'),
    scoreRing: document.getElementById('score-ring'),
    scoreNumber: document.getElementById('score-number'),
    scoreLabel: document.getElementById('score-label'),
    scoreSublabel: document.getElementById('score-sublabel'),
    seoChecks: document.getElementById('seo-checks'),

    previewUrl: document.getElementById('preview-url'),
    previewTitle: document.getElementById('preview-title'),
    previewDesc: document.getElementById('preview-desc'),

    socialImageContainer: document.getElementById('social-image-container'),
    socialOgType: document.getElementById('social-og-type'),
    socialOgTitle: document.getElementById('social-og-title'),
    socialOgDesc: document.getElementById('social-og-desc'),

    twitterImageContainer: document.getElementById('twitter-image-container'),
    socialTwTitle: document.getElementById('social-tw-title'),
    socialTwDesc: document.getElementById('social-tw-desc'),
    socialTwCard: document.getElementById('social-tw-card'),

    copyBtn: document.getElementById('copy-code-btn'),
    downloadBtn: document.getElementById('download-code-btn'),
  };

  // Escape HTML for safe display
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Get effective value (fallback chain)
  function getVal(field, fallbackField) {
    return (field && field.value.trim()) || (fallbackField && fallbackField.value.trim()) || '';
  }

  // Character counter with feedback
  function updateCounter(input, counter, feedback, min, max) {
    const len = input.value.length;
    counter.textContent = len + ' / ' + max;
    feedback.classList.remove('hidden');

    if (len === 0) {
      counter.className = 'text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500';
      feedback.className = 'text-xs mt-1.5 text-slate-400';
      feedback.textContent = '';
      return 'empty';
    } else if (len >= min && len <= max) {
      counter.className = 'text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold';
      feedback.className = 'text-xs mt-1.5 text-emerald-600 dark:text-emerald-400';
      feedback.innerHTML = '<i class="fas fa-check-circle mr-1"></i>Optimal length';
      return 'good';
    } else if (len < min) {
      counter.className = 'text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold';
      feedback.className = 'text-xs mt-1.5 text-amber-600 dark:text-amber-400';
      feedback.innerHTML = '<i class="fas fa-exclamation-circle mr-1"></i>Too short (' + min + '-' + max + ' recommended)';
      return 'short';
    } else {
      counter.className = 'text-xs font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-semibold';
      feedback.className = 'text-xs mt-1.5 text-red-600 dark:text-red-400';
      feedback.innerHTML = '<i class="fas fa-exclamation-triangle mr-1"></i>May be truncated in search results';
      return 'long';
    }
  }

  // Build robots content string
  function getRobotsContent() {
    var parts = [];
    if (DOM.robotsIndex.checked) {
      parts.push('index');
    } else {
      parts.push('noindex');
    }
    if (DOM.robotsFollow.checked) {
      parts.push('follow');
    } else {
      parts.push('nofollow');
    }
    if (DOM.robotsNoImg.checked) {
      parts.push('noimageindex');
    }
    if (DOM.robotsNoSnip.checked) {
      parts.push('nosnippet');
    }
    return parts.join(', ');
  }

  // Generate the meta tag HTML code
  function generateCode() {
    var lines = [];
    var title = DOM.title.value.trim();
    var desc = DOM.desc.value.trim();
    var keywords = DOM.keywords.value.trim();
    var canonical = DOM.canonical.value.trim();
    var author = DOM.author.value.trim();
    var ogTitle = getVal(DOM.ogTitle, DOM.title);
    var ogDesc = getVal(DOM.ogDesc, DOM.desc);
    var ogImage = DOM.ogImage.value.trim();
    var ogUrl = getVal(DOM.ogUrl, DOM.canonical);
    var ogType = DOM.ogType.value;
    var twCard = DOM.twCard.value;
    var twTitle = getVal(DOM.twTitle, DOM.title);
    var twDesc = getVal(DOM.twDesc, DOM.desc);
    var twImage = DOM.twImage.value.trim();
    var robots = getRobotsContent();
    var viewport = DOM.viewport.value.trim();
    var charset = DOM.charset.value;
    var lang = DOM.language.value;

    // Charset
    if (DOM.includeCharset.checked) {
      lines.push('<meta charset="' + escapeHtml(charset) + '">');
    }

    // Viewport
    if (DOM.includeViewport.checked && viewport) {
      lines.push('<meta name="viewport" content="' + escapeHtml(viewport) + '">');
    }

    // Title
    if (title) {
      lines.push('<title>' + escapeHtml(title) + '</title>');
    }

    // Description
    if (desc) {
      lines.push('<meta name="description" content="' + escapeHtml(desc) + '">');
    }

    // Author
    if (author) {
      lines.push('<meta name="author" content="' + escapeHtml(author) + '">');
    }

    // Robots
    if (DOM.includeRobots.checked) {
      lines.push('<meta name="robots" content="' + escapeHtml(robots) + '">');
    }

    // Canonical
    if (canonical) {
      lines.push('<link rel="canonical" href="' + escapeHtml(canonical) + '">');
    }

    // Language
    if (lang) {
      lines.push('<meta name="language" content="' + escapeHtml(lang) + '">');
    }

    // Open Graph
    if (DOM.includeOg.checked) {
      if (ogTitle) {
        lines.push('');
        lines.push('<!-- Open Graph / Facebook -->');
        lines.push('<meta property="og:type" content="' + escapeHtml(ogType) + '">');
        lines.push('<meta property="og:title" content="' + escapeHtml(ogTitle) + '">');
      }
      if (ogDesc) {
        lines.push('<meta property="og:description" content="' + escapeHtml(ogDesc) + '">');
      }
      if (ogUrl) {
        lines.push('<meta property="og:url" content="' + escapeHtml(ogUrl) + '">');
      }
      if (ogImage) {
        lines.push('<meta property="og:image" content="' + escapeHtml(ogImage) + '">');
      }
    }

    // Twitter
    if (DOM.includeTwitter.checked) {
      lines.push('');
      lines.push('<!-- Twitter -->');
      lines.push('<meta property="twitter:card" content="' + escapeHtml(twCard) + '">');
      if (twTitle) {
        lines.push('<meta property="twitter:title" content="' + escapeHtml(twTitle) + '">');
      }
      if (twDesc) {
        lines.push('<meta property="twitter:description" content="' + escapeHtml(twDesc) + '">');
      }
      if (twImage) {
        lines.push('<meta property="twitter:image" content="' + escapeHtml(twImage) + '">');
      }
      if (ogUrl) {
        lines.push('<meta property="twitter:url" content="' + escapeHtml(ogUrl) + '">');
      }
    }

    if (lines.length === 0) {
      return '<!-- Add your meta tags by filling in the fields on the left -->';
    }

    return lines.join('\n');
  }

  // Calculate SEO score
  function calculateScore() {
    var score = 0;
    var checks = [];
    var title = DOM.title.value.trim();
    var desc = DOM.desc.value.trim();
    var keywords = DOM.keywords.value.trim();
    var canonical = DOM.canonical.value.trim();
    var ogTitle = getVal(DOM.ogTitle, DOM.title);
    var ogImage = DOM.ogImage.value.trim();
    var twTitle = getVal(DOM.twTitle, DOM.title);
    var twImage = DOM.twImage.value.trim();

    // Check 1: Title present
    if (title) {
      score += 15;
      checks.push({ pass: true, text: 'Title tag present' });
    } else {
      checks.push({ pass: false, text: 'Title tag present' });
    }

    // Check 2: Title length optimal
    if (title.length >= 50 && title.length <= 60) {
      score += 15;
      checks.push({ pass: true, text: 'Title length optimal (50-60)' });
    } else if (title.length > 0) {
      score += 5;
      checks.push({ pass: 'partial', text: 'Title length optimal (50-60)' });
    } else {
      checks.push({ pass: false, text: 'Title length optimal (50-60)' });
    }

    // Check 3: Description present
    if (desc) {
      score += 15;
      checks.push({ pass: true, text: 'Description present' });
    } else {
      checks.push({ pass: false, text: 'Description present' });
    }

    // Check 4: Description length optimal
    if (desc.length >= 150 && desc.length <= 160) {
      score += 15;
      checks.push({ pass: true, text: 'Description length optimal (150-160)' });
    } else if (desc.length > 0) {
      score += 5;
      checks.push({ pass: 'partial', text: 'Description length optimal (150-160)' });
    } else {
      checks.push({ pass: false, text: 'Description length optimal (150-160)' });
    }

    // Check 5: OG tags set
    if (ogTitle && ogImage) {
      score += 15;
      checks.push({ pass: true, text: 'Open Graph tags set' });
    } else if (ogTitle || ogImage) {
      score += 7;
      checks.push({ pass: 'partial', text: 'Open Graph tags set' });
    } else {
      checks.push({ pass: false, text: 'Open Graph tags set' });
    }

    // Check 6: Twitter Card tags set
    if (twTitle && twImage) {
      score += 10;
      checks.push({ pass: true, text: 'Twitter Card tags set' });
    } else if (twTitle || twImage) {
      score += 5;
      checks.push({ pass: 'partial', text: 'Twitter Card tags set' });
    } else {
      checks.push({ pass: false, text: 'Twitter Card tags set' });
    }

    // Check 7: Canonical URL
    if (canonical) {
      score += 15;
      checks.push({ pass: true, text: 'Canonical URL provided' });
    } else {
      checks.push({ pass: false, text: 'Canonical URL provided' });
    }

    return { score: score, checks: checks };
  }

  // Update SEO score display
  function updateScore() {
    var result = calculateScore();
    var score = result.score;
    var checks = result.checks;
    var circumference = 2 * Math.PI * 42; // ~263.89
    var offset = circumference - (score / 100) * circumference;

    // Ring color
    var ringColor = '#e2e8f0';
    var textColor = 'text-slate-400';
    if (score >= 80) {
      ringColor = '#10b981';
      textColor = 'text-emerald-500';
    } else if (score >= 50) {
      ringColor = '#f59e0b';
      textColor = 'text-amber-500';
    } else if (score > 0) {
      ringColor = '#ef4444';
      textColor = 'text-red-500';
    }

    DOM.scoreRing.style.stroke = ringColor;
    DOM.scoreRing.style.strokeDashoffset = offset;
    DOM.scoreNumber.textContent = score;
    DOM.scoreNumber.className = 'absolute inset-0 flex items-center justify-center text-2xl font-bold ' + textColor;

    // Label
    if (score === 0) {
      DOM.scoreLabel.textContent = 'Fill in fields to see score';
      DOM.scoreSublabel.textContent = 'Start by adding a title and description';
      DOM.scoreLabel.className = 'font-semibold text-slate-400';
    } else if (score >= 80) {
      DOM.scoreLabel.textContent = 'Excellent';
      DOM.scoreSublabel.textContent = 'Your meta tags are well optimized';
      DOM.scoreLabel.className = 'font-semibold text-emerald-500';
    } else if (score >= 50) {
      DOM.scoreLabel.textContent = 'Good, can improve';
      DOM.scoreSublabel.textContent = 'Check the items marked below';
      DOM.scoreLabel.className = 'font-semibold text-amber-500';
    } else {
      DOM.scoreLabel.textContent = 'Needs work';
      DOM.scoreSublabel.textContent = 'Add more meta tags for better SEO';
      DOM.scoreLabel.className = 'font-semibold text-red-500';
    }

    // Checks list
    var checksHtml = '';
    for (var i = 0; i < checks.length; i++) {
      var c = checks[i];
      var icon, bgClass, textClass;

      if (c.pass === true) {
        icon = 'fa-check text-emerald-500';
        bgClass = 'bg-emerald-500/10';
        textClass = 'text-slate-700 dark:text-slate-300';
      } else if (c.pass === 'partial') {
        icon = 'fa-minus text-amber-500';
        bgClass = 'bg-amber-500/10';
        textClass = 'text-slate-500';
      } else {
        icon = 'fa-times text-slate-300 dark:text-slate-600';
        bgClass = 'bg-slate-100 dark:bg-slate-800';
        textClass = 'text-slate-400';
      }

      checksHtml += '<div class="flex items-center gap-3 text-sm">' +
        '<span class="w-6 h-6 rounded-full ' + bgClass + ' flex items-center justify-center flex-shrink-0">' +
        '<i class="fas ' + icon + ' text-xs"></i></span>' +
        '<span class="' + textClass + '">' + c.text + '</span></div>';
    }
    DOM.seoChecks.innerHTML = checksHtml;
  }

  // Update Google preview
  function updateGooglePreview() {
    var title = DOM.title.value.trim();
    var desc = DOM.desc.value.trim();
    var canonical = DOM.canonical.value.trim();

    DOM.previewUrl.textContent = canonical || 'https://example.com/page/';
    DOM.previewTitle.textContent = title || 'Page Title Will Appear Here';
    DOM.previewDesc.textContent = desc || 'Your meta description will appear here. Write a compelling description to improve click-through rates from search results.';
  }

  // Update social previews
  function updateSocialPreview() {
    var ogTitle = getVal(DOM.ogTitle, DOM.title);
    var ogDesc = getVal(DOM.ogDesc, DOM.desc);
    var ogImage = DOM.ogImage.value.trim();
    var ogType = DOM.ogType.value;
    var ogUrl = getVal(DOM.ogUrl, DOM.canonical);
    var twTitle = getVal(DOM.twTitle, DOM.title);
    var twDesc = getVal(DOM.twDesc, DOM.desc);
    var twImage = DOM.twImage.value.trim();
    var twCard = DOM.twCard.value;

    // OG preview
    if (ogImage) {
      DOM.socialImageContainer.innerHTML = '<img src="' + escapeHtml(ogImage) + '" alt="OG Preview" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML=\'<i class=\\\'fas fa-exclamation-triangle text-3xl text-red-400\\\'></i><p class=\\\'text-xs text-red-400 mt-2\\\'>Image failed to load</p>\'">';
    } else {
      DOM.socialImageContainer.innerHTML = '<i class="fas fa-image text-3xl text-slate-300 dark:text-slate-600"></i>';
    }

    var domain = '';
    try {
      var urlObj = new URL(ogUrl || canonical || 'https://example.com');
      domain = urlObj.hostname;
    } catch (e) {
      domain = 'example.com';
    }

    DOM.socialOgType.textContent = domain;
    DOM.socialOgTitle.textContent = ogTitle || 'OG Title';
    DOM.socialOgDesc.textContent = ogDesc || 'OG description will appear here';

    // Twitter preview
    if (twImage) {
      DOM.twitterImageContainer.innerHTML = '<img src="' + escapeHtml(twImage) + '" alt="Twitter Preview" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML=\'<i class=\\\'fas fa-exclamation-triangle text-3xl text-red-400\\\'></i><p class=\\\'text-xs text-red-400 mt-2\\\'>Image failed to load</p>\'">';
    } else {
      DOM.twitterImageContainer.innerHTML = '<i class="fas fa-image text-3xl text-slate-300 dark:text-slate-600"></i>';
    }

    DOM.socialTwTitle.textContent = twTitle || 'Twitter Title';
    DOM.socialTwDesc.textContent = twDesc || 'Twitter description will appear here';
    DOM.socialTwCard.innerHTML = '<i class="fas fa-chart-bar mr-1"></i>' + twCard;
  }

  // Update code output
  function updateCode() {
    var code = generateCode();
    DOM.codeOutput.innerHTML = '<code>' + escapeHtml(code) + '</code>';
  }

  // Master update function
  function update() {
    updateCode();
    updateScore();
    updateGooglePreview();
    updateSocialPreview();
  }

  // Toast notification
  function showToast(message, type) {
    var container = document.getElementById('toast-container');
    if (!container) return;

    var toast = document.createElement('div');
    var bgColor = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-slate-700';
    toast.className = bgColor + ' text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium transform translate-x-full transition-transform duration-300 flex items-center gap-2';

    var icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    toast.innerHTML = '<i class="fas ' + icon + '"></i>' + escapeHtml(message);

    container.appendChild(toast);

    requestAnimationFrame(function() {
      toast.style.transform = 'translateX(0)';
    });

    setTimeout(function() {
      toast.style.transform = 'translateX(120%)';
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 2500);
  }

  // Copy to clipboard
  function copyCode() {
    var code = generateCode();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(function() {
        showToast('Meta tags copied to clipboard!', 'success');
      }).catch(function() {
        fallbackCopy(code);
      });
    } else {
      fallbackCopy(code);
    }
  }

  function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('Meta tags copied to clipboard!', 'success');
    } catch (e) {
      showToast('Failed to copy. Please select and copy manually.', 'error');
    }
    document.body.removeChild(textarea);
  }

  // Download as HTML
  function downloadCode() {
    var code = generateCode();
    var fullHtml = '<!DOCTYPE html>\n<html lang="' + (DOM.language.value || 'en') + '">\n<head>\n  ' + code.replace(/\n/g, '\n  ') + '\n</head>\n<body>\n  <!-- Your content here -->\n</body>\n</html>';

    var blob = new Blob([fullHtml], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'meta-tags.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('File downloaded!', 'success');
  }

  // Debounce utility
  function debounce(fn, delay) {
    var timer;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function() {
        fn.apply(context, args);
      }, delay);
    };
  }

  var debouncedUpdate = debounce(update, 150);

  // Event listeners
  function bindEvents() {
    // Title
    DOM.title.addEventListener('input', function() {
      updateCounter(DOM.title, DOM.titleCounter, DOM.titleFeedback, 50, 60);
      debouncedUpdate();
    });

    // Description
    DOM.desc.addEventListener('input', function() {
      updateCounter(DOM.desc, DOM.descCounter, DOM.descFeedback, 150, 160);
      debouncedUpdate();
    });

    // All other text inputs and textareas
    var textInputs = [
      DOM.keywords, DOM.canonical, DOM.author, DOM.viewport,
      DOM.ogTitle, DOM.ogDesc, DOM.ogImage, DOM.ogUrl,
      DOM.twTitle, DOM.twDesc, DOM.twImage
    ];
    textInputs.forEach(function(el) {
      if (el) {
        el.addEventListener('input', debouncedUpdate);
      }
    });

    // Select elements
    var selects = [DOM.charset, DOM.language, DOM.ogType, DOM.twCard];
    selects.forEach(function(el) {
      if (el) {
        el.addEventListener('change', debouncedUpdate);
      }
    });

    // Checkboxes
    var checkboxes = [
      DOM.robotsIndex, DOM.robotsFollow, DOM.robotsNoImg, DOM.robotsNoSnip,
      DOM.includeViewport, DOM.includeCharset, DOM.includeOg,
      DOM.includeTwitter, DOM.includeRobots, DOM.includeKeywords
    ];
    checkboxes.forEach(function(el) {
      if (el) {
        el.addEventListener('change', debouncedUpdate);
      }
    });

    // Copy & Download buttons
    DOM.copyBtn.addEventListener('click', copyCode);
    DOM.downloadBtn.addEventListener('click', downloadCode);

    // FAQ toggles
    var faqToggles = document.querySelectorAll('.faq-toggle');
    faqToggles.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var content = this.nextElementSibling;
        var icon = this.querySelector('i');
        var isOpen = !content.classList.contains('hidden');

        // Close all others
        faqToggles.forEach(function(otherBtn) {
          var otherContent = otherBtn.nextElementSibling;
          var otherIcon = otherBtn.querySelector('i');
          otherContent.classList.add('hidden');
          otherIcon.style.transform = 'rotate(0deg)';
        });

        if (!isOpen) {
          content.classList.remove('hidden');
          icon.style.transform = 'rotate(180deg)';
        }
      });
    });
  }

  // Initialize
  function init() {
    bindEvents();
    update();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
