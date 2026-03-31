/**
 * SEO Analyzer - Devpalettes
 * Parses HTML source code and checks on-page SEO elements
 */
(function() {
  'use strict';

  /* ========== SAMPLE HTML ========== */
  var SAMPLES = {
    good: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Best SEO Tools for 2024 - Complete Guide | Devpalettes</title>\n  <meta name="description" content="Discover the best free SEO tools for 2024. Our complete guide covers keyword research, rank tracking, site audits, and more to boost your search rankings.">\n  <meta name="keywords" content="seo tools, free seo tools, keyword research, rank tracker">\n  <meta name="robots" content="index, follow">\n  <link rel="canonical" href="https://devpalettes.com/best-seo-tools/">\n  <meta property="og:type" content="article">\n  <meta property="og:title" content="Best SEO Tools for 2024 - Complete Guide">\n  <meta property="og:description" content="Discover the best free SEO tools for 2024. Our complete guide covers keyword research, rank tracking, and more.">\n  <meta property="og:image" content="https://devpalettes.com/images/seo-tools-guide.png">\n  <meta property="og:url" content="https://devpalettes.com/best-seo-tools/">\n  <meta name="twitter:card" content="summary_large_image">\n  <meta name="twitter:title" content="Best SEO Tools for 2024 - Complete Guide">\n  <meta name="twitter:description" content="Discover the best free SEO tools for 2024.">\n  <meta name="twitter:image" content="https://devpalettes.com/images/seo-tools-guide.png">\n</head>\n<body>\n  <header>\n    <nav><a href="/">Home</a><a href="/tools/">Tools</a><a href="/blog/">Blog</a></nav>\n  </header>\n  <main>\n    <h1>Best Free SEO Tools for 2024: Complete Guide</h1>\n    <h2>Why SEO Tools Matter</h2>\n    <p>Search engine optimization requires the right tools to be effective. In this comprehensive guide, we review the top free SEO tools that can help you improve your website rankings, track keyword positions, audit your site for technical issues, and analyze your competition. Whether you are a beginner just starting with SEO or an experienced professional looking for free alternatives to premium tools, this guide has something for everyone.</p>\n    <h2>Top Keyword Research Tools</h2>\n    <p>Keyword research is the foundation of any successful SEO strategy. These tools help you find the right keywords to target based on search volume, competition, and relevance to your business.</p>\n    <h3>Google Keyword Planner</h3>\n    <p>Google Keyword Planner is a free tool provided by Google Ads that shows search volume data, keyword ideas, and bid estimates. While designed for advertisers, it is invaluable for SEO keyword research.</p>\n    <img src="keyword-planner.png" alt="Google Keyword Planner interface showing search volume data">\n    <img src="tool-screenshot.webp" alt="SEO tool dashboard with ranking data">\n    <h3>Ubersuggest</h3>\n    <p>Ubersuggest by Neil Patel provides keyword suggestions, content ideas, and competitive analysis. The free tier allows a limited number of searches per day.</p>\n    <h2>Rank Tracking Tools</h2>\n    <p>Monitoring your keyword rankings over time is essential to measure the effectiveness of your SEO efforts. Here are the best free options for tracking your positions in Google search results.</p>\n    <a href="/keyword-tracker/">Try our free keyword rank tracker</a>\n    <a href="https://searchengineland.com/guide/seo" rel="noopener noreferrer" target="_blank">SEO Guide on Search Engine Land</a>\n  </main>\n  <footer>\n    <p>&copy; 2024 Devpalettes. All rights reserved.</p>\n  </footer>\n</body>\n</html>',
    bad: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Page</title>\n</head>\n<body>\n  <h2>Welcome</h2>\n  <h4>Some heading</h4>\n  <p>Short text.</p>\n  <img src="photo.jpg">\n  <img src="banner.png">\n  <img src="icon.gif">\n</body>\n</html>'
  };

  /* ========== DOM ========== */
  var el = {
    input: document.getElementById('html-input'),
    analyzeBtn: document.getElementById('analyze-btn'),
    clearBtn: document.getElementById('clear-btn'),
    pasteBtn: document.getElementById('paste-btn'),
    inputCharCount: document.getElementById('input-char-count'),
    emptyState: document.getElementById('empty-state'),
    loadingState: document.getElementById('loading-state'),
    resultsContainer: document.getElementById('results-container'),
    checksList: document.getElementById('checks-list'),
    findingsList: document.getElementById('findings-list'),
    copyReportBtn: document.getElementById('copy-report-btn'),
    scoreRing: document.getElementById('score-ring'),
    scoreNumber: document.getElementById('score-number'),
    scoreLabel: document.getElementById('score-label'),
    scoreSublabel: document.getElementById('score-sublabel'),
    scoreBarFill: document.getElementById('score-bar-fill'),
    statScore: document.getElementById('stat-score'),
    statPassed: document.getElementById('stat-passed'),
    statWarnings: document.getElementById('stat-warnings'),
    statErrors: document.getElementById('stat-errors'),
    statTotal: document.getElementById('stat-total')
  };

  var currentFilter = 'all';
  var lastReport = null;

  /* ========== HELPERS ========== */
  function escapeHtml(s) {
    if (!s) return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function getTextContent(doc, selector) {
    var el = doc.querySelector(selector);
    return el ? el.getAttribute('content') || el.textContent.trim() : '';
  }

  function getMetaContent(doc, name) {
    var el = doc.querySelector('meta[name="' + name + '"]') || doc.querySelector('meta[property="' + name + '"]');
    return el ? el.getAttribute('content') || '' : '';
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

  /* ========== ANALYSIS ENGINE ========== */
  function analyzeHTML(html) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    var checks = [];
    var findings = [];

    // --- TITLE TAG ---
    var title = getTextContent(doc, 'title');
    if (!title) {
      checks.push({ status: 'error', cat: 'meta', label: 'Title Tag', detail: 'Missing title tag. Every page must have a unique title.', tip: 'Add a <title> tag between 50-60 characters describing the page.' });
    } else if (title.length < 30) {
      checks.push({ status: 'warning', cat: 'meta', label: 'Title Tag Length', detail: 'Title is ' + title.length + ' characters — too short (recommended: 50-60).', tip: 'Expand your title to include more descriptive keywords.', value: title });
    } else if (title.length <= 60) {
      checks.push({ status: 'pass', cat: 'meta', label: 'Title Tag', detail: 'Title is ' + title.length + ' characters — optimal length.', value: title });
    } else {
      checks.push({ status: 'warning', cat: 'meta', label: 'Title Tag Length', detail: 'Title is ' + title.length + ' characters — may be truncated in search results (max ~60).', tip: 'Shorten your title to under 60 characters.', value: title });
    }
    if (title) findings.push({ label: 'Page Title', value: title });

    // --- META DESCRIPTION ---
    var desc = getMetaContent(doc, 'description');
    if (!desc) {
      checks.push({ status: 'error', cat: 'meta', label: 'Meta Description', detail: 'Missing meta description. This hurts click-through rates from search results.', tip: 'Add a meta description between 150-160 characters.' });
    } else if (desc.length < 80) {
      checks.push({ status: 'warning', cat: 'meta', label: 'Meta Description Length', detail: 'Description is ' + desc.length + ' characters — too short (recommended: 150-160).', tip: 'Write a more compelling description to improve clicks.', value: desc });
    } else if (desc.length <= 160) {
      checks.push({ status: 'pass', cat: 'meta', label: 'Meta Description', detail: 'Description is ' + desc.length + ' characters — optimal length.', value: desc });
    } else {
      checks.push({ status: 'warning', cat: 'meta', label: 'Meta Description Length', detail: 'Description is ' + desc.length + ' characters — may be truncated (max ~160).', tip: 'Shorten to 150-160 characters.', value: desc });
    }
    if (desc) findings.push({ label: 'Meta Description', value: desc });

    // --- META KEYWORDS ---
    var keywords = getMetaContent(doc, 'keywords');
    if (keywords) {
      checks.push({ status: 'pass', cat: 'meta', label: 'Meta Keywords', detail: 'Meta keywords tag is present (note: Google ignores this for ranking).', value: keywords });
    } else {
      checks.push({ status: 'info', cat: 'meta', label: 'Meta Keywords', detail: 'No meta keywords tag found. This is fine — Google does not use it for ranking.', tip: 'Optional. Only add if other search engines in your market still reference it.' });
    }

    // --- CANONICAL ---
    var canonical = doc.querySelector('link[rel="canonical"]');
    if (canonical) {
      checks.push({ status: 'pass', cat: 'technical', label: 'Canonical URL', detail: 'Canonical URL is set — helps prevent duplicate content issues.', value: canonical.getAttribute('href') });
      findings.push({ label: 'Canonical URL', value: canonical.getAttribute('href') });
    } else {
      checks.push({ status: 'warning', cat: 'technical', label: 'Canonical URL', detail: 'No canonical URL specified. This may cause duplicate content problems.', tip: 'Add <link rel="canonical" href="https://..."> to specify the preferred URL.' });
    }

    // --- ROBOTS ---
    var robots = getMetaContent(doc, 'robots');
    if (robots) {
      var noindex = robots.indexOf('noindex') !== -1;
      if (noindex) {
        checks.push({ status: 'error', cat: 'technical', label: 'Robots Meta Tag', detail: 'Page has "noindex" directive — search engines will NOT index this page.', tip: 'Remove "noindex" if you want this page to appear in search results.', value: robots });
      } else {
        checks.push({ status: 'pass', cat: 'technical', label: 'Robots Meta Tag', detail: 'Robots directive allows indexing and following.', value: robots });
      }
      findings.push({ label: 'Robots Directive', value: robots });
    } else {
      checks.push({ status: 'pass', cat: 'technical', label: 'Robots Meta Tag', detail: 'No robots meta tag — defaults to index, follow (which is usually fine).' });
    }

    // --- H1 TAG ---
    var h1s = doc.querySelectorAll('h1');
    if (h1s.length === 0) {
      checks.push({ status: 'error', cat: 'content', label: 'H1 Heading', detail: 'No H1 heading found. The H1 is the most important on-page SEO element after the title.', tip: 'Add exactly one H1 heading that includes your primary keyword.' });
    } else if (h1s.length === 1) {
      checks.push({ status: 'pass', cat: 'content', label: 'H1 Heading', detail: 'Exactly one H1 heading found — correct.', value: h1s[0].textContent.trim() });
      findings.push({ label: 'H1 Text', value: h1s[0].textContent.trim() });
    } else {
      checks.push({ status: 'error', cat: 'content', label: 'H1 Heading', detail: h1s.length + ' H1 headings found. Each page should have exactly one H1.', tip: 'Remove extra H1 tags and use H2-H6 for subheadings.' });
    }

    // --- HEADING HIERARCHY ---
    var allHeadings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    var headingCounts = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
    allHeadings.forEach(function(h) { headingCounts[h.tagName.toLowerCase()]++; });
    var totalHeadings = allHeadings.length;
    if (totalHeadings === 0) {
      checks.push({ status: 'error', cat: 'content', label: 'Heading Structure', detail: 'No headings found at all. Headings help search engines understand content structure.', tip: 'Add at least an H1 and H2 headings to structure your content.' });
    } else if (totalHeadings >= 3) {
      checks.push({ status: 'pass', cat: 'content', label: 'Heading Structure', detail: totalHeadings + ' headings found (H1:' + headingCounts.h1 + ' H2:' + headingCounts.h2 + ' H3:' + headingCounts.h3 + ' H4:' + headingCounts.h4 + ' H5:' + headingCounts.h5 + ' H6:' + headingCounts.h6 + ').', value: 'H1:' + headingCounts.h1 + ' H2:' + headingCounts.h2 + ' H3:' + headingCounts.h3 });
    } else {
      checks.push({ status: 'warning', cat: 'content', label: 'Heading Structure', detail: 'Only ' + totalHeadings + ' heading(s) found. Consider adding more to better structure content.', tip: 'Break content into sections with H2 and H3 subheadings.' });
    }

    // Check for skipped heading levels
    var prevLevel = 0;
    var skipped = false;
    allHeadings.forEach(function(h) {
      var level = parseInt(h.tagName.charAt(1));
      if (level > prevLevel + 1 && prevLevel > 0) skipped = true;
      prevLevel = level;
    });
    if (skipped && totalHeadings > 2) {
      checks.push({ status: 'warning', cat: 'content', label: 'Heading Nesting', detail: 'Heading levels are skipped (e.g., H1 → H3 without H2). This can confuse search engines.', tip: 'Use sequential heading levels: H1 → H2 → H3 without skipping.' });
    }

    // --- CONTENT LENGTH ---
    var bodyText = (doc.body ? doc.body.textContent || '' : '').replace(/\s+/g, ' ').trim();
    var wordCount = bodyText ? bodyText.split(/\s+/).length : 0;
    if (wordCount < 100) {
      checks.push({ status: 'warning', cat: 'content', label: 'Content Length', detail: 'Only ~' + wordCount + ' words found. Thin content may struggle to rank for competitive terms.', tip: 'Aim for at least 300 words for standard pages, 1000+ for blog posts.' });
    } else if (wordCount < 300) {
      checks.push({ status: 'info', cat: 'content', label: 'Content Length', detail: '~' + wordCount + ' words. Adequate for simple pages but consider expanding for better SEO.', value: wordCount + ' words' });
    } else {
      checks.push({ status: 'pass', cat: 'content', label: 'Content Length', detail: '~' + wordCount + ' words — good content depth.', value: wordCount + ' words' });
    }
    findings.push({ label: 'Word Count', value: wordCount });

    // --- IMAGES ---
    var images = doc.querySelectorAll('img');
    var imagesNoAlt = [];
    images.forEach(function(img) {
      if (!img.getAttribute('alt') && !img.hasAttribute('alt')) {
        imagesNoAlt.push(img.getAttribute('src') || 'unknown');
      }
    });
    if (images.length === 0) {
      checks.push({ status: 'info', cat: 'images', label: 'Images', detail: 'No images found on this page.' });
    } else if (imagesNoAlt.length === 0) {
      checks.push({ status: 'pass', cat: 'images', label: 'Image Alt Tags', detail: 'All ' + images.length + ' image(s) have alt attributes.', value: images.length + ' images' });
    } else {
      checks.push({ status: 'error', cat: 'images', label: 'Image Alt Tags', detail: imagesNoAlt.length + ' of ' + images.length + ' image(s) missing alt text. This hurts accessibility and image SEO.', tip: 'Add descriptive alt attributes to all images.', value: imagesNoAlt.length + '/' + images.length + ' missing' });
      findings.push({ label: 'Images Missing Alt', value: imagesNoAlt.join(', ') });
    }
    findings.push({ label: 'Total Images', value: images.length });

    // --- LINKS ---
    var internalLinks = 0;
    var externalLinks = 0;
    doc.querySelectorAll('a[href]').forEach(function(a) {
      var href = a.getAttribute('href');
      if (href.indexOf('://') !== -1 && href.indexOf(location.hostname) === -1) {
        externalLinks++;
      } else if (href && href !== '#' && href.indexOf('javascript:') === -1) {
        internalLinks++;
      }
    });
    if (internalLinks === 0 && externalLinks === 0) {
      checks.push({ status: 'error', cat: 'links', label: 'Links', detail: 'No links found. Pages without links are dead ends for crawlers and users.', tip: 'Add internal links to other pages and at least one external link to an authoritative source.' });
    } else {
      if (internalLinks > 0) {
        checks.push({ status: 'pass', cat: 'links', label: 'Internal Links', detail: internalLinks + ' internal link(s) found — helps search engines discover other pages.', value: internalLinks });
      } else {
        checks.push({ status: 'warning', cat: 'links', label: 'Internal Links', detail: 'No internal links found. Internal linking helps distribute page authority.', tip: 'Add links to other relevant pages on your site.' });
      }
      if (externalLinks > 0) {
        checks.push({ status: 'pass', cat: 'links', label: 'External Links', detail: externalLinks + ' external link(s) found — good for referencing sources.', value: externalLinks });
      } else {
        checks.push({ status: 'info', cat: 'links', label: 'External Links', detail: 'No external links. Linking to authoritative sources can improve content credibility.', tip: 'Consider adding a link to a relevant, authoritative source.' });
      }
    }
    findings.push({ label: 'Internal Links', value: internalLinks });
    findings.push({ label: 'External Links', value: externalLinks });

    // --- OPEN GRAPH ---
    var ogTitle = getMetaContent(doc, 'og:title');
    var ogDesc = getMetaContent(doc, 'og:description');
    var ogImage = getMetaContent(doc, 'og:image');
    var ogType = getMetaContent(doc, 'og:type');
    var ogUrl = getMetaContent(doc, 'og:url');
    var ogPresent = ogTitle || ogDesc || ogImage;

    if (!ogPresent) {
      checks.push({ status: 'warning', cat: 'social', label: 'Open Graph Tags', detail: 'No Open Graph tags found. Your page may look poor when shared on Facebook/LinkedIn.', tip: 'Add og:title, og:description, og:image, and og:type meta tags.' });
    } else {
      var ogMissing = [];
      if (!ogTitle) ogMissing.push('og:title');
      if (!ogDesc) ogMissing.push('og:description');
      if (!ogImage) ogMissing.push('og:image');
      if (!ogType) ogMissing.push('og:type');
      if (ogMissing.length > 0) {
        checks.push({ status: 'warning', cat: 'social', label: 'Open Graph Tags', detail: 'Partial OG tags. Missing: ' + ogMissing.join(', ') + '.', tip: 'Add the missing Open Graph properties for complete social sharing support.' });
      } else {
        checks.push({ status: 'pass', cat: 'social', label: 'Open Graph Tags', detail: 'All key Open Graph tags present.', value: ogTitle });
      }
    }
    if (ogTitle) findings.push({ label: 'OG Title', value: ogTitle });
    if (ogImage) findings.push({ label: 'OG Image', value: ogImage });

    // --- TWITTER CARDS ---
    var twCard = getMetaContent(doc, 'twitter:card');
    var twTitle = getMetaContent(doc, 'twitter:title');
    var twDesc = getMetaContent(doc, 'twitter:description');
    var twImage = getMetaContent(doc, 'twitter:image');
    var twPresent = twCard || twTitle || twDesc || twImage;

    if (!twPresent) {
      checks.push({ status: 'warning', cat: 'social', label: 'Twitter Card Tags', detail: 'No Twitter Card tags found. Shared links on Twitter/X will use fallback values.', tip: 'Add twitter:card, twitter:title, twitter:description, and twitter:image.' });
    } else {
      var twMissing = [];
      if (!twCard) twMissing.push('twitter:card');
      if (!twTitle) twMissing.push('twitter:title');
      if (!twImage) twMissing.push('twitter:image');
      if (twMissing.length > 0) {
        checks.push({ status: 'warning', cat: 'social', label: 'Twitter Card Tags', detail: 'Partial Twitter tags. Missing: ' + twMissing.join(', ') + '.', tip: 'Add the missing Twitter Card properties.' });
      } else {
        checks.push({ status: 'pass', cat: 'social', label: 'Twitter Card Tags', detail: 'All key Twitter Card tags present.', value: twCard });
      }
    }
    if (twCard) findings.push({ label: 'Twitter Card Type', value: twCard });

    // --- LANG ATTRIBUTE ---
    var lang = doc.documentElement.getAttribute('lang');
    if (lang) {
      checks.push({ status: 'pass', cat: 'technical', label: 'HTML Lang Attribute', detail: 'Language set to "' + lang + '" — helps search engines serve the right audience.', value: lang });
    } else {
      checks.push({ status: 'warning', cat: 'technical', label: 'HTML Lang Attribute', detail: 'No lang attribute on <html> element. Search engines use this for language detection.', tip: 'Add lang="en" (or your language code) to the <html> tag.' });
    }

    // --- CHARSET ---
    var charset = doc.querySelector('meta[charset]');
    if (charset) {
      checks.push({ status: 'pass', cat: 'technical', label: 'Charset Declaration', detail: 'Charset declared: ' + charset.getAttribute('charset') + '.', value: charset.getAttribute('charset') });
    } else {
      checks.push({ status: 'warning', cat: 'technical', label: 'Charset Declaration', detail: 'No charset meta tag found. This can cause character encoding issues.', tip: 'Add <meta charset="UTF-8"> as the first element in <head>.' });
    }

    // --- VIEWPORT ---
    var viewport = doc.querySelector('meta[name="viewport"]');
    if (viewport) {
      checks.push({ status: 'pass', cat: 'technical', label: 'Viewport Meta Tag', detail: 'Viewport tag present — page is mobile-friendly.', value: viewport.getAttribute('content') });
    } else {
      checks.push({ status: 'error', cat: 'technical', label: 'Viewport Meta Tag', detail: 'No viewport meta tag. Page will not be properly optimized for mobile devices.', tip: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">.' });
    }

    // Calculate score
    var score = 0;
    var maxScore = 0;
    var passed = 0, warnings = 0, errors = 0, infos = 0;
    checks.forEach(function(c) {
      maxScore += 10;
      if (c.status === 'pass') { score += 10; passed++; }
      else if (c.status === 'warning') { score += 5; warnings++; }
      else if (c.status === 'error') { errors++; }
      else { infos++; }
    });

    var pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    return { checks: checks, findings: findings, score: pct, passed: passed, warnings: warnings, errors: errors, total: checks.length };
  }

  /* ========== RENDERING ========== */
  function getStatusIcon(status) {
    if (status === 'pass') return '<i class="fas fa-check-circle text-emerald-500"></i>';
    if (status === 'warning') return '<i class="fas fa-exclamation-triangle text-amber-500"></i>';
    if (status === 'error') return '<i class="fas fa-times-circle text-red-500"></i>';
    return '<i class="fas fa-info-circle text-blue-500"></i>';
  }

  function getStatusBg(status) {
    if (status === 'pass') return 'bg-emerald-500/5 border-emerald-500/20';
    if (status === 'warning') return 'bg-amber-500/5 border-amber-500/20';
    if (status === 'error') return 'bg-red-500/5 border-red-500/20';
    return 'bg-blue-500/5 border-blue-500/20';
  }

  function renderChecks(checks) {
    var filtered = currentFilter === 'all' ? checks : checks.filter(function(c) { return c.cat === currentFilter; });

    if (filtered.length === 0) {
      el.checksList.innerHTML = '<p class="text-sm text-slate-400 text-center py-6">No checks in this category</p>';
      return;
    }

    var html = '';
    filtered.forEach(function(c) {
      html += '<div class="p-4 rounded-xl border ' + getStatusBg(c.status) + ' transition-all">' +
        '<div class="flex items-start gap-3">' +
          '<span class="mt-0.5 flex-shrink-0">' + getStatusIcon(c.status) + '</span>' +
          '<div class="flex-1 min-w-0">' +
            '<div class="flex items-center gap-2 mb-1">' +
              '<span class="font-semibold text-sm">' + escapeHtml(c.label) + '</span>' +
              '<span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 capitalize">' + c.cat + '</span>' +
            '</div>' +
            '<p class="text-sm text-slate-600 dark:text-slate-400">' + escapeHtml(c.detail) + '</p>' +
            (c.tip ? '<p class="text-xs text-slate-500 mt-1.5"><i class="fas fa-lightbulb text-amber-400 mr-1"></i>' + escapeHtml(c.tip) + '</p>' : '') +
            (c.value ? '<p class="text-xs font-mono text-slate-400 mt-1.5 bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded truncate">' + escapeHtml(c.value) + '</p>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
    });
    el.checksList.innerHTML = html;
  }

  function renderFindings(findings) {
    if (findings.length === 0) {
      el.findingsList.innerHTML = '<p class="text-sm text-slate-400 text-center py-4">No findings</p>';
      return;
    }
    var html = '';
    findings.forEach(function(f) {
      html += '<div class="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800/50 last:border-0">' +
        '<span class="text-sm text-slate-500 flex-shrink-0 w-36">' + escapeHtml(f.label) + '</span>' +
        '<span class="text-sm font-mono text-slate-700 dark:text-slate-300 break-all">' + escapeHtml(f.value) + '</span>' +
      '</div>';
    });
    el.findingsList.innerHTML = html;
  }

  function updateScoreRing(pct) {
    var circumference = 2 * Math.PI * 42;
    var offset = circumference - (pct / 100) * circumference;

    var color, textColor, label, sub;
    if (pct >= 80) {
      color = '#10b981'; textColor = 'text-emerald-500';
      label = 'Excellent'; sub = 'Your page is well optimized';
    } else if (pct >= 60) {
      color = '#3b82f6'; textColor = 'text-blue-500';
      label = 'Good'; sub = 'Minor improvements recommended';
    } else if (pct >= 40) {
      color = '#f59e0b'; textColor = 'text-amber-500';
      label = 'Needs Work'; sub = 'Several issues need attention';
    } else {
      color = '#ef4444'; textColor = 'text-red-500';
      label = 'Poor'; sub = 'Significant SEO issues found';
    }

    el.scoreRing.style.stroke = color;
    el.scoreRing.style.strokeDashoffset = offset;
    el.scoreNumber.textContent = pct;
    el.scoreNumber.className = 'absolute inset-0 flex items-center justify-center text-3xl font-bold ' + textColor;
    el.scoreLabel.textContent = label;
    el.scoreLabel.className = 'text-lg font-semibold ' + textColor;
    el.scoreSublabel.textContent = sub;

    el.scoreBarFill.style.width = pct + '%';
    el.scoreBarFill.className = 'h-full rounded-full transition-all duration-1000';
    el.scoreBarFill.style.backgroundColor = color;

    el.statScore.textContent = pct;
    el.statScore.className = 'text-3xl font-bold ' + textColor;
  }

  function updateStats(r) {
    el.statPassed.textContent = r.passed;
    el.statPassed.className = 'text-3xl font-bold text-emerald-500';
    el.statWarnings.textContent = r.warnings;
    el.statWarnings.className = 'text-3xl font-bold text-amber-500';
    el.statErrors.textContent = r.errors;
    el.statErrors.className = 'text-3xl font-bold text-red-500';
    el.statTotal.textContent = r.total;
    el.statTotal.className = 'text-3xl font-bold text-slate-700 dark:text-slate-300';
  }

  function generateReportText(r) {
    var lines = [];
    lines.push('=== SEO ANALYSIS REPORT ===');
    lines.push('Score: ' + r.score + '/100');
    lines.push('Passed: ' + r.passed + ' | Warnings: ' + r.warnings + ' | Errors: ' + r.errors);
    lines.push('');
    r.checks.forEach(function(c, i) {
      var icon = c.status === 'pass' ? '[PASS]' : c.status === 'warning' ? '[WARN]' : c.status === 'error' ? '[FAIL]' : '[INFO]';
      lines.push((i + 1) + '. ' + icon + ' ' + c.label + ' (' + c.cat + ')');
      lines.push('   ' + c.detail);
      if (c.tip) lines.push('   TIP: ' + c.tip);
      if (c.value) lines.push('   Value: ' + c.value);
      lines.push('');
    });
    lines.push('=== DETAILED FINDINGS ===');
    lines.push('');
    r.findings.forEach(function(f) {
      lines.push(f.label + ': ' + f.value);
    });
    return lines.join('\n');
  }

  /* ========== MAIN FLOW ========== */
  function runAnalysis() {
    var html = el.input.value.trim();
    if (html.length < 20) {
      showToast('Please paste valid HTML source code', 'error');
      return;
    }

    el.emptyState.classList.add('hidden');
    el.resultsContainer.classList.add('hidden');
    el.loadingState.classList.remove('hidden');

    setTimeout(function() {
      try {
        var result = analyzeHTML(html);
        lastReport = result;

        el.loadingState.classList.add('hidden');
        el.resultsContainer.classList.remove('hidden');

        updateScoreRing(result.score);
        updateStats(result);
        renderChecks(result.checks);
        renderFindings(result.findings);

        showToast('Analysis complete! Score: ' + result.score + '/100', 'success');
      } catch (e) {
        el.loadingState.classList.add('hidden');
        el.emptyState.classList.remove('hidden');
        showToast('Error parsing HTML: ' + e.message, 'error');
      }
    }, 600);
  }

  /* ========== EVENTS ========== */
  function bindEvents() {
    el.input.addEventListener('input', function() {
      el.inputCharCount.textContent = el.input.value.length.toLocaleString() + ' characters';
      el.analyzeBtn.disabled = el.input.value.trim().length < 20;
    });

    el.analyzeBtn.addEventListener('click', runAnalysis);

    el.clearBtn.addEventListener('click', function() {
      el.input.value = '';
      el.inputCharCount.textContent = '0 characters';
      el.analyzeBtn.disabled = true;
      el.emptyState.classList.remove('hidden');
      el.resultsContainer.classList.add('hidden');
      el.loadingState.classList.add('hidden');
      updateScoreRing(0);
      el.statScore.textContent = '—';
      el.statScore.className = 'text-3xl font-bold text-slate-400';
      el.statPassed.textContent = '0'; el.statPassed.className = 'text-3xl font-bold text-slate-400';
      el.statWarnings.textContent = '0'; el.statWarnings.className = 'text-3xl font-bold text-slate-400';
      el.statErrors.textContent = '0'; el.statErrors.className = 'text-3xl font-bold text-slate-400';
      el.statTotal.textContent = '0'; el.statTotal.className = 'text-3xl font-bold text-slate-400';
      el.scoreLabel.textContent = 'Awaiting analysis';
      el.scoreLabel.className = 'text-lg font-semibold text-slate-400';
      el.scoreSublabel.textContent = 'Paste HTML and click Analyze';
      el.scoreBarFill.style.width = '0%';
      lastReport = null;
    });

    el.pasteBtn.addEventListener('click', function() {
      if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then(function(text) {
          el.input.value = text;
          el.inputCharCount.textContent = text.length.toLocaleString() + ' characters';
          el.analyzeBtn.disabled = text.trim().length < 20;
          showToast('Pasted from clipboard!', 'success');
        }).catch(function() {
          showToast('Cannot access clipboard. Please paste manually.', 'error');
        });
      } else {
        showToast('Clipboard API not supported. Please paste manually.', 'error');
      }
    });

    document.querySelectorAll('.sample-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var key = this.getAttribute('data-sample');
        var html = SAMPLES[key];
        if (html) {
          el.input.value = html;
          el.inputCharCount.textContent = html.length.toLocaleString() + ' characters';
          el.analyzeBtn.disabled = false;
          showToast('Sample HTML loaded — click Analyze', 'success');
        }
      });
    });

    document.querySelectorAll('.cat-filter').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.cat-filter').forEach(function(b) {
          b.classList.remove('active','border-emerald-500','bg-emerald-500/10','text-emerald-600','dark:text-emerald-400');
          b.classList.add('border-slate-200','dark:border-slate-700','text-slate-600','dark:text-slate-400');
        });
        this.classList.add('active','border-emerald-500','bg-emerald-500/10','text-emerald-600','dark:text-emerald-400');
        this.classList.remove('border-slate-200','dark:border-slate-700','text-slate-600','dark:text-slate-400');
        currentFilter = this.getAttribute('data-cat');
        if (lastReport) renderChecks(lastReport.checks);
      });
    });

    el.copyReportBtn.addEventListener('click', function() {
      if (!lastReport) { showToast('No report to copy', 'error'); return; }
      var text = generateReportText(lastReport);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
          showToast('Report copied!', 'success');
        }).catch(function() { fallbackCopy(text); });
      } else {
        fallbackCopy(text);
      }
    });

    function fallbackCopy(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); showToast('Report copied!', 'success'); }
      catch (e) { showToast('Failed to copy', 'error'); }
      document.body.removeChild(ta);
    }

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
