// Meta Tags Analyzer - ../js/meta-tags-analyzer.js
(function () {
  'use strict';

  // ── State ──
  const state = {
    url: '',
    html: '',
    tags: {},
    score: 0,
    warnings: [],
    rawMetaHtml: '',
    analyzed: false
  };

  const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?'
  ];

  // ── DOM References ──
  const els = {
    urlInput: document.getElementById('url-input'),
    urlError: document.getElementById('url-error'),
    urlHint: document.getElementById('url-hint'),
    analyzeBtn: document.getElementById('analyze-btn'),
    clearBtn: document.getElementById('clear-btn'),
    tagsContent: document.getElementById('tags-content'),
    rawContent: document.getElementById('raw-content'),
    copyRawBtn: document.getElementById('copy-raw-btn'),
    generatedCode: document.getElementById('generated-code'),
    exportInfo: document.getElementById('export-info'),
    copyReportBtn: document.getElementById('copy-report-btn'),
    downloadBtn: document.getElementById('download-btn'),
    statScore: document.getElementById('stat-score'),
    statTags: document.getElementById('stat-tags'),
    statWarnings: document.getElementById('stat-warnings'),
    statStatus: document.getElementById('stat-status'),
    validationList: document.getElementById('validation-list'),
    copyLinkBtn: document.getElementById('copy-link-btn')
  };

  // ── Helpers ──
  function showToast(message, type) {
    const container = document.getElementById('toast-container');
    if (!container) return;
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
    }, 3000);
  }

  function escapeHTML(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function setStat(el, value, active) {
    if (!el) return;
    el.textContent = value;
    el.className = `text-3xl font-bold ${active ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`;
  }

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

  function isValidURL(str) {
    try {
      const u = new URL(str);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch { return false; }
  }

  function normalizeURL(str) {
    let url = str.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    return url;
  }

  // ── Fetch HTML ──
  async function fetchHTML(url) {
    for (let i = 0; i < CORS_PROXIES.length; i++) {
      const proxyUrl = CORS_PROXIES[i] + encodeURIComponent(url);
      try {
        const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) });
        if (resp.ok) {
          const text = await resp.text();
          if (text && text.includes('<')) return text;
        }
      } catch (e) {
        if (i === CORS_PROXIES.length - 1) throw e;
      }
    }
    throw new Error('Could not fetch the page. It may be blocked or offline.');
  }

  // ── Parse Meta Tags ──
  function parseMetaTags(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const head = doc.querySelector('head');
    if (!head) return { tags: {}, rawHtml: '' };

    const result = {
      title: { value: doc.title || '', status: 'fail', label: 'Title' },
      description: { value: '', status: 'fail', label: 'Meta Description' },
      viewport: { value: '', status: 'fail', label: 'Viewport' },
      charset: { value: '', status: 'fail', label: 'Charset' },
      canonical: { value: '', status: 'fail', label: 'Canonical URL' },
      robots: { value: '', status: 'fail', label: 'Robots' },
      ogTitle: { value: '', status: 'fail', label: 'og:title' },
      ogDescription: { value: '', status: 'fail', label: 'og:description' },
      ogImage: { value: '', status: 'fail', label: 'og:image' },
      ogUrl: { value: '', status: 'fail', label: 'og:url' },
      ogType: { value: '', status: 'fail', label: 'og:type' },
      ogSiteName: { value: '', status: 'fail', label: 'og:site_name' },
      ogLocale: { value: '', status: 'fail', label: 'og:locale' },
      twitterCard: { value: '', status: 'fail', label: 'twitter:card' },
      twitterTitle: { value: '', status: 'fail', label: 'twitter:title' },
      twitterDescription: { value: '', status: 'fail', label: 'twitter:description' },
      twitterImage: { value: '', status: 'fail', label: 'twitter:image' },
      twitterSite: { value: '', status: 'fail', label: 'twitter:site' },
      author: { value: '', status: 'fail', label: 'Author' },
      themeColor: { value: '', status: 'fail', label: 'Theme Color' },
      otherMeta: [],
      otherLinks: []
    };

    // Extract raw meta HTML
    const rawLines = [];
    head.querySelectorAll('meta, title, link[rel="canonical"], link[rel="alternate"], base').forEach(el => {
      rawLines.push(el.outerHTML.trim());
    });
    const rawHtml = rawLines.join('\n');

    // Basic meta
    const descMeta = head.querySelector('meta[name="description"]');
    if (descMeta) { result.description.value = descMeta.getAttribute('content') || ''; result.description.status = 'pass'; }

    const viewMeta = head.querySelector('meta[name="viewport"]');
    if (viewMeta) { result.viewport.value = viewMeta.getAttribute('content') || ''; result.viewport.status = 'pass'; }

    const charsetMeta = head.querySelector('meta[charset]') || head.querySelector('meta[http-equiv="content-type"]');
    if (charsetMeta) {
      result.charset.value = charsetMeta.getAttribute('charset') || charsetMeta.getAttribute('content') || '';
      result.charset.status = 'pass';
    }

    const canonLink = head.querySelector('link[rel="canonical"]');
    if (canonLink) { result.canonical.value = canonLink.getAttribute('href') || ''; result.canonical.status = 'pass'; }

    const robotsMeta = head.querySelector('meta[name="robots"]');
    if (robotsMeta) { result.robots.value = robotsMeta.getAttribute('content') || ''; result.robots.status = 'pass'; }

    const authorMeta = head.querySelector('meta[name="author"]');
    if (authorMeta) { result.author.value = authorMeta.getAttribute('content') || ''; result.author.status = 'pass'; }

    const themeMeta = head.querySelector('meta[name="theme-color"]');
    if (themeMeta) { result.themeColor.value = themeMeta.getAttribute('content') || ''; result.themeColor.status = 'pass'; }

    // Open Graph
    const ogTitle = head.querySelector('meta[property="og:title"]');
    if (ogTitle) { result.ogTitle.value = ogTitle.getAttribute('content') || ''; result.ogTitle.status = 'pass'; }

    const ogDesc = head.querySelector('meta[property="og:description"]');
    if (ogDesc) { result.ogDescription.value = ogDesc.getAttribute('content') || ''; result.ogDescription.status = 'pass'; }

    const ogImg = head.querySelector('meta[property="og:image"]');
    if (ogImg) { result.ogImage.value = ogImg.getAttribute('content') || ''; result.ogImage.status = 'pass'; }

    const ogUrlEl = head.querySelector('meta[property="og:url"]');
    if (ogUrlEl) { result.ogUrl.value = ogUrlEl.getAttribute('content') || ''; result.ogUrl.status = 'pass'; }

    const ogTypeEl = head.querySelector('meta[property="og:type"]');
    if (ogTypeEl) { result.ogType.value = ogTypeEl.getAttribute('content') || ''; result.ogType.status = 'pass'; }

    const ogSiteEl = head.querySelector('meta[property="og:site_name"]');
    if (ogSiteEl) { result.ogSiteName.value = ogSiteEl.getAttribute('content') || ''; result.ogSiteName.status = 'pass'; }

    const ogLocaleEl = head.querySelector('meta[property="og:locale"]');
    if (ogLocaleEl) { result.ogLocale.value = ogLocaleEl.getAttribute('content') || ''; result.ogLocale.status = 'pass'; }

    // Twitter
    const twCard = head.querySelector('meta[name="twitter:card"]');
    if (twCard) { result.twitterCard.value = twCard.getAttribute('content') || ''; result.twitterCard.status = 'pass'; }

    const twTitle = head.querySelector('meta[name="twitter:title"]');
    if (twTitle) { result.twitterTitle.value = twTitle.getAttribute('content') || ''; result.twitterTitle.status = 'pass'; }

    const twDesc = head.querySelector('meta[name="twitter:description"]');
    if (twDesc) { result.twitterDescription.value = twDesc.getAttribute('content') || ''; result.twitterDescription.status = 'pass'; }

    const twImg = head.querySelector('meta[name="twitter:image"]');
    if (twImg) { result.twitterImage.value = twImg.getAttribute('content') || ''; result.twitterImage.status = 'pass'; }

    const twSite = head.querySelector('meta[name="twitter:site"]');
    if (twSite) { result.twitterSite.value = twSite.getAttribute('content') || ''; result.twitterSite.status = 'pass'; }

    // Other meta tags
    const knownNames = ['description','viewport','charset','robots','author','theme-color','twitter:card','twitter:title','twitter:description','twitter:image','twitter:site','twitter:creator'];
    const knownProps = ['og:title','og:description','og:image','og:url','og:type','og:site_name','og:locale','og:image:width','og:image:height','og:image:alt'];
    head.querySelectorAll('meta').forEach(meta => {
      const name = meta.getAttribute('name') || '';
      const prop = meta.getAttribute('property') || '';
      const httpEquiv = meta.getAttribute('http-equiv') || '';
      const content = meta.getAttribute('content') || '';
      const isKnown = knownNames.includes(name) || knownProps.includes(prop) || httpEquiv || meta.getAttribute('charset');
      if (!isKnown && (name || prop)) {
        result.otherMeta.push({ key: prop || name, value: content });
      }
    });

    // Other link tags
    head.querySelectorAll('link[rel="alternate"], link[rel="icon"], link[rel="apple-touch-icon"], link[rel="stylesheet"], link[rel="preload"]').forEach(link => {
      const rel = link.getAttribute('rel') || '';
      const href = link.getAttribute('href') || '';
      const type = link.getAttribute('type') || '';
      if (href) {
        result.otherLinks.push({ rel, href, type });
      }
    });

    return { tags: result, rawHtml };
  }

  // ── Calculate Score & Warnings ──
  function calculateScore(tags) {
    let score = 0;
    const warnings = [];

    // Title (max 20)
    if (tags.title.value) {
      const len = tags.title.value.length;
      if (len >= 30 && len <= 60) {
        score += 20;
        tags.title.status = 'pass';
      } else if (len > 0 && len < 30) {
        score += 12;
        tags.title.status = 'warn';
        warnings.push({ tag: 'Title', msg: `Title is ${len} characters (recommended: 30-60). Short titles may not use SERP space effectively.` });
      } else if (len > 60 && len <= 70) {
        score += 14;
        tags.title.status = 'warn';
        warnings.push({ tag: 'Title', msg: `Title is ${len} characters (recommended: 30-60). May be truncated in search results.` });
      } else {
        score += 6;
        tags.title.status = 'warn';
        warnings.push({ tag: 'Title', msg: `Title is ${len} characters (recommended: 30-60). Likely to be truncated.` });
      }
    } else {
      tags.title.status = 'fail';
      warnings.push({ tag: 'Title', msg: 'Missing title tag. This is critical for SEO.' });
    }

    // Description (max 20)
    if (tags.description.value) {
      const len = tags.description.value.length;
      if (len >= 120 && len <= 160) {
        score += 20;
        tags.description.status = 'pass';
      } else if (len > 0 && len < 120) {
        score += 12;
        tags.description.status = 'warn';
        warnings.push({ tag: 'Description', msg: `Description is ${len} characters (recommended: 120-160). Shorter snippets waste SERP space.` });
      } else if (len > 160 && len <= 170) {
        score += 14;
        tags.description.status = 'warn';
        warnings.push({ tag: 'Description', msg: `Description is ${len} characters (recommended: 120-160). May be truncated.` });
      } else {
        score += 6;
        tags.description.status = 'warn';
        warnings.push({ tag: 'Description', msg: `Description is ${len} characters (recommended: 120-160). Will likely be truncated.` });
      }
    } else {
      tags.description.status = 'fail';
      warnings.push({ tag: 'Description', msg: 'Missing meta description. Search engines will auto-generate a snippet.' });
    }

    // Viewport (max 10)
    if (tags.viewport.value) {
      score += 10;
      tags.viewport.status = 'pass';
    } else {
      tags.viewport.status = 'fail';
      warnings.push({ tag: 'Viewport', msg: 'Missing viewport meta tag. Page will not be mobile-friendly.' });
    }

    // Canonical (max 10)
    if (tags.canonical.value) {
      score += 10;
      tags.canonical.status = 'pass';
    } else {
      tags.canonical.status = 'fail';
      warnings.push({ tag: 'Canonical', msg: 'Missing canonical URL. Risk of duplicate content issues.' });
    }

    // OG Tags (max 20)
    const ogCore = ['ogTitle', 'ogDescription', 'ogImage', 'ogUrl', 'ogType'];
    const ogPresent = ogCore.filter(k => tags[k].value).length;
    if (ogPresent === 5) {
      score += 20;
      ogCore.forEach(k => { tags[k].status = 'pass'; });
    } else if (ogPresent >= 3) {
      score += 14;
      ogCore.forEach(k => { tags[k].status = tags[k].value ? 'pass' : 'warn'; });
      const missing = ogCore.filter(k => !tags[k].value).map(k => tags[k].label);
      warnings.push({ tag: 'Open Graph', msg: `Missing OG tags: ${missing.join(', ')}. Social sharing previews may be incomplete.` });
    } else if (ogPresent >= 1) {
      score += 8;
      ogCore.forEach(k => { tags[k].status = tags[k].value ? 'pass' : 'fail'; });
      const missing = ogCore.filter(k => !tags[k].value).map(k => tags[k].label);
      warnings.push({ tag: 'Open Graph', msg: `Most OG tags missing: ${missing.join(', ')}. Social sharing will use defaults.` });
    } else {
      ogCore.forEach(k => { tags[k].status = 'fail'; });
      warnings.push({ tag: 'Open Graph', msg: 'No Open Graph tags found. Social platforms will guess link previews.' });
    }

    // Twitter Tags (max 10)
    const twCore = ['twitterCard', 'twitterTitle', 'twitterImage'];
    const twPresent = twCore.filter(k => tags[k].value).length;
    if (twPresent === 3) {
      score += 10;
      twCore.forEach(k => { tags[k].status = 'pass'; });
    } else if (twPresent >= 1) {
      score += 5;
      twCore.forEach(k => { tags[k].status = tags[k].value ? 'pass' : 'warn'; });
      const missing = twCore.filter(k => !tags[k].value).map(k => tags[k].label);
      warnings.push({ tag: 'Twitter Card', msg: `Missing Twitter tags: ${missing.join(', ')}. Twitter will fall back to OG tags.` });
    } else {
      twCore.forEach(k => { tags[k].status = 'fail'; });
      warnings.push({ tag: 'Twitter Card', msg: 'No Twitter Card tags found. Twitter will use OG tags if available.' });
    }

    // Charset (max 5)
    if (tags.charset.value) {
      score += 5;
      tags.charset.status = 'pass';
    } else {
      tags.charset.status = 'warn';
      warnings.push({ tag: 'Charset', msg: 'Charset not explicitly declared. Browser may guess incorrectly.' });
    }

    // Robots (max 5)
    if (tags.robots.value) {
      score += 5;
      tags.robots.status = 'pass';
      if (tags.robots.value.includes('noindex')) {
        warnings.push({ tag: 'Robots', msg: `Robots directive: "${tags.robots.value}". Page is set to noindex — search engines won't index it.` });
      }
    }
    // No penalty for missing robots (defaults to index, follow)

    return { score: Math.min(100, score), warnings };
  }

  // ── Render Tags View ──
  function renderTags(tags) {
    const statusIcon = { pass: 'fa-circle-check text-emerald-500', warn: 'fa-triangle-exclamation text-amber-500', fail: 'fa-circle-xmark text-red-400' };
    const statusLabel = { pass: 'text-emerald-600 dark:text-emerald-400', warn: 'text-amber-600 dark:text-amber-400', fail: 'text-red-500' };

    function renderGroup(title, icon, entries) {
      const items = entries.filter(e => e.value);
      if (items.length === 0) return '';
      let html = `<div class="mb-5"><h3 class="text-sm font-bold mb-3 flex items-center gap-2"><i class="${icon} text-slate-400"></i>${title}</h3><div class="space-y-2">`;
      items.forEach(e => {
        const isUrl = e.value.startsWith('http');
        const displayVal = e.value.length > 120 ? e.value.substring(0, 120) + '...' : e.value;
        html += `<div class="flex items-start gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
          <i class="fas ${statusIcon[e.status] || statusIcon.fail} mt-0.5 text-xs flex-shrink-0"></i>
          <div class="flex-1 min-w-0">
            <span class="text-[10px] font-mono text-slate-400 block">${escapeHTML(e.label)}</span>
            ${isUrl
              ? `<a href="${escapeHTML(e.value)}" target="_blank" rel="noopener noreferrer" class="text-sm ${statusLabel[e.status] || ''} break-all hover:underline">${escapeHTML(displayVal)}</a>`
              : `<span class="text-sm ${statusLabel[e.status] || ''} break-all">${escapeHTML(displayVal)}</span>`
            }
          </div>
          <span class="text-[10px] text-slate-400 flex-shrink-0">${e.value.length} chars</span>
        </div>`;
      });
      html += '</div></div>';
      return html;
    }

    function renderMissingGroup(title, icon, entries) {
      const missing = entries.filter(e => !e.value);
      if (missing.length === 0) return '';
      let html = `<div class="mb-5"><h3 class="text-sm font-bold mb-3 flex items-center gap-2 text-red-400"><i class="${icon}"></i>${title}</h3><div class="space-y-1.5">`;
      missing.forEach(e => {
        html += `<div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10">
          <i class="fas ${statusIcon.fail} text-xs"></i>
          <span class="text-xs font-mono text-red-500">${escapeHTML(e.label)}</span>
          <span class="text-[10px] text-red-400 ml-auto">Missing</span>
        </div>`;
      });
      html += '</div></div>';
      return html;
    }

    let html = '';

    // Basic Meta
    const basicEntries = ['title', 'description', 'viewport', 'charset', 'canonical', 'robots', 'author', 'themeColor'];
    html += renderGroup('Basic Meta Tags', 'fas fa-tags', basicEntries.map(k => tags[k]));
    html += renderMissingGroup('Missing Basic Tags', 'fas fa-tags', basicEntries.map(k => tags[k]));

    // Open Graph
    const ogEntries = ['ogTitle', 'ogDescription', 'ogImage', 'ogUrl', 'ogType', 'ogSiteName', 'ogLocale'];
    html += renderGroup('Open Graph Tags', 'fab fa-facebook', ogEntries.map(k => tags[k]));
    html += renderMissingGroup('Missing OG Tags', 'fab fa-facebook', ogEntries.map(k => tags[k]));

    // Twitter
    const twEntries = ['twitterCard', 'twitterTitle', 'twitterDescription', 'twitterImage', 'twitterSite'];
    html += renderGroup('Twitter Card Tags', 'fab fa-x-twitter', twEntries.map(k => tags[k]));
    html += renderMissingGroup('Missing Twitter Tags', 'fab fa-x-twitter', twEntries.map(k => tags[k]));

    // Other
    if (tags.otherMeta.length > 0) {
      html += `<div class="mb-5"><h3 class="text-sm font-bold mb-3 flex items-center gap-2"><i class="fas fa-ellipsis text-slate-400"></i>Other Meta Tags</h3><div class="space-y-1.5">`;
      tags.otherMeta.forEach(m => {
        html += `<div class="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
          <span class="text-[10px] font-mono text-slate-400">${escapeHTML(m.key)}</span>
          <span class="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">${escapeHTML(m.value.length > 100 ? m.value.substring(0, 100) + '...' : m.value)}</span>
        </div>`;
      });
      html += '</div></div>';
    }

    // Other Links
    if (tags.otherLinks.length > 0) {
      html += `<div class="mb-2"><h3 class="text-sm font-bold mb-3 flex items-center gap-2"><i class="fas fa-link text-slate-400"></i>Link Tags</h3><div class="space-y-1.5">`;
      tags.otherLinks.slice(0, 10).forEach(l => {
        html += `<div class="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
          <span class="text-[10px] font-mono text-blue-500">${escapeHTML(l.rel)}</span>
          <span class="text-xs text-slate-500 truncate flex-1">${escapeHTML(l.href.length > 80 ? l.href.substring(0, 80) + '...' : l.href)}</span>
          ${l.type ? `<span class="text-[10px] text-slate-400">${escapeHTML(l.type)}</span>` : ''}
        </div>`;
      });
      html += '</div></div>';
    }

    els.tagsContent.innerHTML = html || '<span class="text-slate-400">No meta tags found in the page head.</span>';
  }

  // ── Build Report Text ──
  function buildReport() {
    let report = `META TAGS ANALYSIS REPORT\n`;
    report += `${'='.repeat(50)}\n`;
    report += `URL: ${state.url}\n`;
    report += `SEO Score: ${state.score}/100\n`;
    report += `Tags Found: ${Object.values(state.tags).filter(t => t && t.value).length}\n`;
    report += `Warnings: ${state.warnings.length}\n`;
    report += `${'='.repeat(50)}\n\n`;

    // Tags
    report += `EXTRACTED TAGS\n${'-'.repeat(30)}\n`;
    const entries = Object.values(state.tags).filter(t => t && t.label);
    entries.forEach(t => {
      if (t.value) {
        report += `${t.label}: ${t.value}\n`;
      }
    });

    if (state.tags.otherMeta && state.tags.otherMeta.length > 0) {
      report += `\nOTHER META TAGS\n${'-'.repeat(30)}\n`;
      state.tags.otherMeta.forEach(m => {
        report += `${m.key}: ${m.value}\n`;
      });
    }

    // Warnings
    if (state.warnings.length > 0) {
      report += `\nWARNINGS (${state.warnings.length})\n${'-'.repeat(30)}\n`;
      state.warnings.forEach((w, i) => {
        report += `${i + 1}. [${w.tag}] ${w.msg}\n`;
      });
    }

    return report;
  }

  // ── Main Analyze ──
  async function analyze() {
    const rawUrl = els.urlInput.value.trim();
    if (!rawUrl) {
      els.urlError.textContent = 'Please enter a URL';
      els.urlError.classList.remove('hidden');
      els.urlHint.classList.add('hidden');
      return;
    }

    const url = normalizeURL(rawUrl);
    if (!isValidURL(url)) {
      els.urlError.textContent = 'Invalid URL format. Use https://example.com';
      els.urlError.classList.remove('hidden');
      els.urlHint.classList.add('hidden');
      return;
    }

    els.urlError.classList.add('hidden');
    els.urlHint.classList.remove('hidden');
    state.url = url;

    setStat(els.statStatus, 'Fetching...', false);
    els.statStatus.className = 'text-3xl font-bold text-amber-500';
    els.analyzeBtn.disabled = true;
    els.analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

    try {
      const html = await fetchHTML(url);
      state.html = html;

      setStat(els.statStatus, 'Parsing...', false);

      const { tags, rawHtml } = parseMetaTags(html);
      state.tags = tags;
      state.rawMetaHtml = rawHtml;

      const { score, warnings } = calculateScore(tags);
      state.score = score;
      state.warnings = warnings;
      state.analyzed = true;

      // Stats
      const scoreColor = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-red-500';
      els.statScore.textContent = score + '/100';
      els.statScore.className = `text-3xl font-bold ${scoreColor}`;

      const tagCount = Object.values(tags).filter(t => t && t.value).length + (tags.otherMeta ? tags.otherMeta.length : 0);
      setStat(els.statTags, tagCount, true);

      const warnColor = warnings.length === 0 ? 'text-emerald-500' : warnings.length <= 3 ? 'text-amber-500' : 'text-red-500';
      els.statWarnings.textContent = warnings.length;
      els.statWarnings.className = `text-3xl font-bold ${warnColor}`;

      setStat(els.statStatus, 'Done', false);
      els.statStatus.className = 'text-3xl font-bold text-emerald-500';

      // Render
      renderTags(tags);
      els.rawContent.textContent = rawHtml || 'No meta tags found in the page head.';

      const report = buildReport();
      els.generatedCode.textContent = report.substring(0, 250) + (report.length > 250 ? '\n...' : '');
      els.exportInfo.textContent = `${tagCount} tags extracted · ${warnings.length} warning${warnings.length !== 1 ? 's' : ''} · Score ${score}/100`;

      // Validation
      updateValidation({
        'has-url': true,
        'has-title': !!tags.title.value,
        'has-description': !!tags.description.value,
        'has-og-tags': !!tags.ogTitle.value,
        'has-twitter-tags': !!tags.twitterCard.value,
        'has-canonical': !!tags.canonical.value
      });

      showToast(`Analysis complete — Score: ${score}/100`, score >= 60 ? 'success' : 'error');

    } catch (err) {
      setStat(els.statStatus, 'Error', false);
      els.statStatus.className = 'text-3xl font-bold text-red-500';
      els.tagsContent.innerHTML = `<div class="text-center py-8"><i class="fas fa-triangle-exclamation text-3xl text-red-400 mb-3"></i><p class="text-sm text-red-500 font-medium">${escapeHTML(err.message)}</p><p class="text-xs text-slate-400 mt-1">Make sure the URL is publicly accessible and returns valid HTML.</p></div>`;
      showToast(err.message, 'error');
      updateValidation({
        'has-url': true,
        'has-title': false,
        'has-description': false,
        'has-og-tags': false,
        'has-twitter-tags': false,
        'has-canonical': false
      });
    } finally {
      els.analyzeBtn.disabled = false;
      els.analyzeBtn.innerHTML = '<i class="fas fa-magnifying-glass-chart"></i> Analyze Meta Tags';
    }
  }

  // ── Clear ──
  function clearAll() {
    state.url = '';
    state.html = '';
    state.tags = {};
    state.score = 0;
    state.warnings = [];
    state.rawMetaHtml = '';
    state.analyzed = false;

    els.urlInput.value = '';
    els.urlError.classList.add('hidden');
    els.urlHint.classList.remove('hidden');

    setStat(els.statScore, '—', false);
    setStat(els.statTags, '0', false);
    setStat(els.statWarnings, '0', false);
    setStat(els.statStatus, 'Idle', false);
    els.statStatus.className = 'text-3xl font-bold text-slate-400';

    els.tagsContent.innerHTML = '<span class="text-slate-400">Enter a URL and click "Analyze" to see extracted meta tags here</span>';
    els.rawContent.textContent = 'Enter a URL to see raw meta tag HTML here';
    els.generatedCode.textContent = 'Analyze a URL to generate an exportable report';
    els.exportInfo.textContent = 'No analysis generated yet';

    updateValidation({
      'has-url': false,
      'has-title': false,
      'has-description': false,
      'has-og-tags': false,
      'has-twitter-tags': false,
      'has-canonical': false
    });

    showToast('Cleared', 'info');
  }

  // ── Copy Report ──
  function copyReport() {
    if (!state.analyzed) {
      showToast('Analyze a URL first', 'error');
      return;
    }
    const report = buildReport();
    navigator.clipboard.writeText(report).then(() => {
      showToast('Report copied to clipboard', 'success');
    }).catch(() => {
      showToast('Failed to copy', 'error');
    });
  }

  // ── Download Report ──
  function downloadReport() {
    if (!state.analyzed) {
      showToast('Analyze a URL first', 'error');
      return;
    }
    const report = buildReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const hostname = (() => { try { return new URL(state.url).hostname; } catch { return 'page'; } })();
    a.download = `meta-tags-${hostname}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Report downloaded', 'success');
  }

  // ── Event Listeners ──
  els.analyzeBtn.addEventListener('click', analyze);
  els.clearBtn.addEventListener('click', clearAll);
  els.copyReportBtn.addEventListener('click', copyReport);
  els.downloadBtn.addEventListener('click', downloadReport);

  els.urlInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') analyze();
  });

  els.urlInput.addEventListener('input', function () {
    els.urlError.classList.add('hidden');
    els.urlHint.classList.remove('hidden');
  });

  els.copyRawBtn.addEventListener('click', function () {
    if (!state.rawMetaHtml) {
      showToast('No raw HTML to copy', 'error');
      return;
    }
    navigator.clipboard.writeText(state.rawMetaHtml).then(() => {
      showToast('Raw HTML copied', 'success');
    });
  });

  // Preview Tabs
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
      const panel = document.getElementById(`view-${view}`);
      if (panel) panel.classList.remove('hidden');
    });
  });

  // Presets
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const url = this.getAttribute('data-url');
      if (url) {
        els.urlInput.value = url;
        analyze();
      }
    });
  });

  // Copy Link
  if (els.copyLinkBtn) {
    els.copyLinkBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('Page link copied', 'success');
      });
    });
  }

  // ── Init ──
  updateValidation({
    'has-url': false,
    'has-title': false,
    'has-description': false,
    'has-og-tags': false,
    'has-twitter-tags': false,
    'has-canonical': false
  });

})();
