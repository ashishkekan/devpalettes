/**
 * Open Graph Generator
 * Generates OG meta tags with live social preview
 */
(function() {
  'use strict';

  /* ========== ELEMENTS ========== */
  var el = {
    title: document.getElementById('og-title'),
    description: document.getElementById('og-description'),
    url: document.getElementById('og-url'),
    image: document.getElementById('og-image'),
    type: document.getElementById('og-type'),
    siteName: document.getElementById('og-site-name'),
    locale: document.getElementById('og-locale'),
    includeTwitter: document.getElementById('include-twitter'),
    twitterCardType: document.getElementById('twitter-card-type'),
    twitterCardWrap: document.getElementById('twitter-card-type-wrap'),
    imagePreviewBtn: document.getElementById('og-image-preview-btn'),
    imageThumb: document.getElementById('og-image-thumb'),
    imageThumbImg: document.getElementById('og-image-thumb-img'),
    titleCount: document.getElementById('og-title-count'),
    titleBar: document.getElementById('og-title-bar'),
    descCount: document.getElementById('og-desc-count'),
    descBar: document.getElementById('og-desc-bar'),
    generatedCode: document.getElementById('generated-code'),
    tagCountInfo: document.getElementById('tag-count-info'),
    copyTagsBtn: document.getElementById('copy-tags-btn'),
    copyHtmlBtn: document.getElementById('copy-html-btn'),
    copyCodeInline: document.getElementById('copy-code-inline'),
    statTags: document.getElementById('stat-tags'),
    statPreview: document.getElementById('stat-preview'),
    statTwitter: document.getElementById('stat-twitter'),
    statFields: document.getElementById('stat-fields'),
    validationList: document.getElementById('validation-list'),
    // Previews
    fbImage: document.getElementById('fb-preview-image'),
    fbTitle: document.getElementById('fb-preview-title'),
    fbDesc: document.getElementById('fb-preview-desc'),
    fbSite: document.getElementById('fb-preview-site'),
    twImage: document.getElementById('tw-preview-image'),
    twTitle: document.getElementById('tw-preview-title'),
    twDesc: document.getElementById('tw-preview-desc'),
    twDomain: document.getElementById('tw-preview-domain'),
    liImage: document.getElementById('li-preview-image'),
    liTitle: document.getElementById('li-preview-title'),
    liDesc: document.getElementById('li-preview-desc'),
    liDomain: document.getElementById('li-preview-domain')
  };

  /* ========== PRESETS ========== */
  var presets = {
    blog: {
      title: '10 Essential Web Development Tips for 2026',
      description: 'Discover the most important web development practices that every developer should follow in 2026, from performance optimization to accessibility standards.',
      url: 'https://example.com/blog/web-development-tips-2026',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=630&fit=crop',
      type: 'article',
      siteName: 'DevBlog',
      locale: 'en_US'
    },
    product: {
      title: 'Pro Wireless Headphones - Active Noise Cancelling',
      description: 'Experience crystal-clear audio with 40-hour battery life, premium comfort, and studio-grade active noise cancellation. Free shipping worldwide.',
      url: 'https://example.com/products/pro-wireless-headphones',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=630&fit=crop',
      type: 'website',
      siteName: 'AudioStore',
      locale: 'en_US'
    },
    portfolio: {
      title: 'Jane Doe - Creative Frontend Developer',
      description: 'Specializing in interactive web experiences, UI animation, and design systems. Available for freelance projects and full-time roles.',
      url: 'https://janedoe.dev',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=630&fit=crop',
      type: 'profile',
      siteName: 'Jane Doe',
      locale: 'en_US'
    },
    landing: {
      title: 'Launch Your SaaS in 30 Days - Free Growth Playbook',
      description: 'Get the exact framework used by 500+ startups to launch, validate, and grow their SaaS product. Download the free playbook now.',
      url: 'https://example.com/launch-playbook',
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=630&fit=crop',
      type: 'website',
      siteName: 'LaunchPad',
      locale: 'en_US'
    }
  };

  /* ========== HELPERS ========== */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function isValidUrl(str) {
    try {
      var u = new URL(str);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch(e) {
      return false;
    }
  }

  function getDomain(url) {
    try {
      return new URL(url).hostname;
    } catch(e) {
      return url.replace(/https?:\/\//, '').split('/')[0];
    }
  }

  function truncate(str, max) {
    if (!str) return '';
    return str.length > max ? str.substring(0, max) + '...' : str;
  }

  function getBarColor(current, min, max) {
    if (current === 0) return '#e2e8f0';
    if (current < min) return '#f59e0b';
    if (current <= max) return '#10b981';
    return '#f59e0b';
  }

  function showToast(message, type) {
    var container = document.getElementById('toast-container');
    var toast = document.createElement('div');
    var bgColor = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    toast.className = 'px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg transform translate-x-full transition-transform duration-300 ' + bgColor;
    toast.innerHTML = '<i class="fas fa-' + (type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle') + ' mr-2"></i>' + message;
    container.appendChild(toast);
    requestAnimationFrame(function() {
      toast.style.transform = 'translateX(0)';
    });
    setTimeout(function() {
      toast.style.transform = 'translateX(120%)';
      setTimeout(function() { toast.remove(); }, 300);
    }, 2500);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showToast('Copied to clipboard!', 'success');
      }).catch(function() {
        fallbackCopy(text);
      });
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
    } catch(e) {
      showToast('Failed to copy', 'error');
    }
    document.body.removeChild(ta);
  }

  /* ========== VALIDATION ========== */
  var validationItems = [
    { id: 'v-title', label: 'OG title provided', check: function() { return el.title.value.trim().length > 0; } },
    { id: 'v-desc', label: 'OG description provided', check: function() { return el.description.value.trim().length > 0; } },
    { id: 'v-url', label: 'Page URL is valid', check: function() { return isValidUrl(el.url.value.trim()); } },
    { id: 'v-image', label: 'OG image URL provided', check: function() { return el.image.value.trim().length > 0; } },
    { id: 'v-title-len', label: 'Title length optimal (40–60)', check: function() { var l = el.title.value.trim().length; return l >= 40 && l <= 60; } },
    { id: 'v-desc-len', label: 'Description length optimal (100–160)', check: function() { var l = el.description.value.trim().length; return l >= 100 && l <= 160; } },
    { id: 'v-twitter', label: 'Twitter Card tags included', check: function() { return el.includeTwitter.checked; } }
  ];

  function updateValidation() {
    var html = '';
    var passed = 0;
    for (var i = 0; i < validationItems.length; i++) {
      var item = validationItems[i];
      var ok = item.check();
      if (ok) passed++;
      html += '<div class="flex items-center gap-3 text-sm">';
      html += ok
        ? '<i class="fas fa-check-circle text-emerald-500"></i>'
        : '<i class="fas fa-circle text-[8px] text-slate-300 dark:text-slate-600"></i>';
      html += '<span class="' + (ok ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400') + '">' + item.label + '</span>';
      html += '</div>';
    }
    el.validationList.innerHTML = html;
    return passed;
  }

  /* ========== GENERATE TAGS ========== */
  function generateTags() {
    var title = el.title.value.trim();
    var desc = el.description.value.trim();
    var url = el.url.value.trim();
    var image = el.image.value.trim();
    var type = el.type.value;
    var siteName = el.siteName.value.trim();
    var locale = el.locale.value;
    var includeTwitter = el.includeTwitter.checked;
    var twitterType = el.twitterCardType.value;

    var tags = [];
    var tagCount = 0;

    if (title) { tags.push('<meta property="og:title" content="' + escapeHtml(title) + '">'); tagCount++; }
    if (desc) { tags.push('<meta property="og:description" content="' + escapeHtml(desc) + '">'); tagCount++; }
    if (url) { tags.push('<meta property="og:url" content="' + escapeHtml(url) + '">'); tagCount++; }
    if (image) { tags.push('<meta property="og:image" content="' + escapeHtml(image) + '">'); tagCount++; }
    tags.push('<meta property="og:type" content="' + escapeHtml(type) + '">'); tagCount++;
    if (siteName) { tags.push('<meta property="og:site_name" content="' + escapeHtml(siteName) + '">'); tagCount++; }
    tags.push('<meta property="og:locale" content="' + escapeHtml(locale) + '">'); tagCount++;

    if (includeTwitter) {
      tags.push('');
      tags.push('<!-- Twitter Card -->');
      tags.push('<meta name="twitter:card" content="' + escapeHtml(twitterType) + '">'); tagCount++;
      if (title) { tags.push('<meta name="twitter:title" content="' + escapeHtml(title) + '">'); tagCount++; }
      if (desc) { tags.push('<meta name="twitter:description" content="' + escapeHtml(desc) + '">'); tagCount++; }
      if (image) { tags.push('<meta name="twitter:image" content="' + escapeHtml(image) + '">'); tagCount++; }
    }

    if (tags.length === 0) {
      el.generatedCode.textContent = '<!-- Fill in the fields to generate Open Graph meta tags -->';
      el.tagCountInfo.textContent = '0 meta tags generated';
      el.statTags.textContent = '0';
      return tags;
    }

    var output = '<!-- Open Graph Meta Tags -->\n' + tags.join('\n');
    el.generatedCode.textContent = output;
    el.tagCountInfo.textContent = tagCount + ' meta tag' + (tagCount !== 1 ? 's' : '') + ' generated';
    el.statTags.textContent = tagCount;
    el.statTags.classList.remove('text-slate-400');
    el.statTags.classList.add('text-emerald-500');

    return tags;
  }

  function generateFullHtml() {
    var title = el.title.value.trim();
    var desc = el.description.value.trim();
    var url = el.url.value.trim();
    var image = el.image.value.trim();
    var type = el.type.value;
    var siteName = el.siteName.value.trim();
    var locale = el.locale.value;
    var includeTwitter = el.includeTwitter.checked;
    var twitterType = el.twitterCardType.value;

    var lines = [];
    lines.push('<head>');
    lines.push('  <meta charset="UTF-8">');
    lines.push('  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
    if (title) lines.push('  <title>' + escapeHtml(title) + '</title>');
    if (desc) lines.push('  <meta name="description" content="' + escapeHtml(desc) + '">');
    lines.push('');
    lines.push('  <!-- Open Graph Meta Tags -->');
    if (title) lines.push('  <meta property="og:title" content="' + escapeHtml(title) + '">');
    if (desc) lines.push('  <meta property="og:description" content="' + escapeHtml(desc) + '">');
    if (url) lines.push('  <meta property="og:url" content="' + escapeHtml(url) + '">');
    if (image) lines.push('  <meta property="og:image" content="' + escapeHtml(image) + '">');
    lines.push('  <meta property="og:type" content="' + escapeHtml(type) + '">');
    if (siteName) lines.push('  <meta property="og:site_name" content="' + escapeHtml(siteName) + '">');
    lines.push('  <meta property="og:locale" content="' + escapeHtml(locale) + '">');

    if (includeTwitter) {
      lines.push('');
      lines.push('  <!-- Twitter Card -->');
      lines.push('  <meta name="twitter:card" content="' + escapeHtml(twitterType) + '">');
      if (title) lines.push('  <meta name="twitter:title" content="' + escapeHtml(title) + '">');
      if (desc) lines.push('  <meta name="twitter:description" content="' + escapeHtml(desc) + '">');
      if (image) lines.push('  <meta name="twitter:image" content="' + escapeHtml(image) + '">');
    }

    lines.push('</head>');
    return lines.join('\n');
  }

  /* ========== PREVIEW UPDATE ========== */
  function setImagePreview(container, imageUrl) {
    if (imageUrl && isValidUrl(imageUrl)) {
      container.innerHTML = '<img src="' + escapeHtml(imageUrl) + '" alt="OG Preview" class="w-full h-full object-cover" onerror="this.parentNode.innerHTML=\'<div class=\\\'text-center p-6\\\'><i class=\\\'fas fa-exclamation-triangle text-3xl text-amber-400 mb-2\\\'></i><p class=\\\'text-xs text-slate-400\\\'>Failed to load image</p></div>\'">';
    } else {
      container.innerHTML = '<div class="text-center p-6"><i class="fas fa-image text-3xl text-slate-300 dark:text-slate-500 mb-2"></i><p class="text-xs text-slate-400">Image preview</p></div>';
    }
  }

  function updatePreview() {
    var title = el.title.value.trim() || 'Your Page Title';
    var desc = el.description.value.trim() || 'Your page description will appear here';
    var url = el.url.value.trim();
    var image = el.image.value.trim();
    var siteName = el.siteName.value.trim();
    var domain = url ? getDomain(url) : 'example.com';

    // Facebook
    setImagePreview(el.fbImage, image);
    el.fbTitle.textContent = title;
    el.fbDesc.textContent = desc;
    el.fbSite.textContent = siteName || domain;

    // Twitter
    setImagePreview(el.twImage, image);
    el.twTitle.textContent = title;
    el.twDesc.textContent = desc;
    el.twDomain.innerHTML = '<i class="fas fa-link text-[10px]"></i>' + escapeHtml(domain);

    // LinkedIn
    setImagePreview(el.liImage, image);
    el.liTitle.textContent = title;
    el.liDesc.textContent = desc;
    el.liDomain.textContent = domain.toUpperCase();

    // Stats
    var hasRequired = title && desc && url && image;
    el.statPreview.textContent = hasRequired ? 'Yes' : 'No';
    el.statPreview.className = 'text-3xl font-bold ' + (hasRequired ? 'text-emerald-500' : 'text-slate-400');

    el.statTwitter.textContent = el.includeTwitter.checked ? 'Yes' : 'No';
    el.statTwitter.className = 'text-3xl font-bold ' + (el.includeTwitter.checked ? 'text-emerald-500' : 'text-slate-400');

    var filled = 0;
    if (title) filled++;
    if (desc) filled++;
    if (url) filled++;
    if (image) filled++;
    if (siteName) filled++;
    filled += 2; // type and locale always set
    el.statFields.textContent = filled + '/7';
    el.statFields.className = 'text-3xl font-bold ' + (filled >= 5 ? 'text-emerald-500' : filled >= 3 ? 'text-amber-500' : 'text-slate-400');
  }

  /* ========== CHARACTER BARS ========== */
  function updateCharBars() {
    var tLen = el.title.value.length;
    var dLen = el.description.value.length;

    el.titleCount.textContent = tLen + '/100';
    var tPct = Math.min((tLen / 100) * 100, 100);
    el.titleBar.style.width = tPct + '%';
    el.titleBar.style.background = getBarColor(tLen, 40, 60);

    el.descCount.textContent = dLen + '/200';
    var dPct = Math.min((dLen / 200) * 100, 100);
    el.descBar.style.width = dPct + '%';
    el.descBar.style.background = getBarColor(dLen, 100, 160);
  }

  /* ========== MASTER UPDATE ========== */
  function updateAll() {
    updateCharBars();
    updatePreview();
    generateTags();
    updateValidation();
  }

  /* ========== EVENT BINDING ========== */
  function bindEvents() {
    // Input fields -> live update
    var inputFields = [el.title, el.description, el.url, el.image, el.siteName];
    for (var i = 0; i < inputFields.length; i++) {
      inputFields[i].addEventListener('input', updateAll);
    }

    // Selects
    el.type.addEventListener('change', updateAll);
    el.locale.addEventListener('change', updateAll);
    el.twitterCardType.addEventListener('change', updateAll);

    // Twitter toggle
    el.includeTwitter.addEventListener('change', function() {
      el.twitterCardWrap.style.display = this.checked ? 'block' : 'none';
      updateAll();
    });

    // Image preview toggle
    el.imagePreviewBtn.addEventListener('click', function() {
      var url = el.image.value.trim();
      if (url && isValidUrl(url)) {
        el.imageThumb.classList.toggle('hidden');
        if (!el.imageThumb.classList.contains('hidden')) {
          el.imageThumbImg.src = url;
          el.imageThumbImg.onerror = function() {
            el.imageThumb.classList.add('hidden');
            showToast('Failed to load image', 'error');
          };
        }
      } else {
        showToast('Enter a valid image URL first', 'error');
      }
    });

    // Copy tags only
    el.copyTagsBtn.addEventListener('click', function() {
      var code = el.generatedCode.textContent;
      if (code.indexOf('Fill in the fields') !== -1) {
        showToast('No tags generated yet', 'error');
        return;
      }
      copyText(code);
    });

    // Copy full HTML
    el.copyHtmlBtn.addEventListener('click', function() {
      var title = el.title.value.trim();
      if (!title) {
        showToast('Fill in at least the title first', 'error');
        return;
      }
      copyText(generateFullHtml());
    });

    // Inline copy
    el.copyCodeInline.addEventListener('click', function() {
      var code = el.generatedCode.textContent;
      if (code.indexOf('Fill in the fields') !== -1) {
        showToast('No tags generated yet', 'error');
        return;
      }
      copyText(code);
    });

    // Show inline copy on hover
    var codeWrap = el.generatedCode.parentElement;
    codeWrap.addEventListener('mouseenter', function() {
      el.copyCodeInline.style.opacity = '1';
    });
    codeWrap.addEventListener('mouseleave', function() {
      el.copyCodeInline.style.opacity = '0';
    });

    // Presets
    var presetBtns = document.querySelectorAll('.preset-btn');
    for (var p = 0; p < presetBtns.length; p++) {
      presetBtns[p].addEventListener('click', function() {
        var key = this.getAttribute('data-preset');
        var data = presets[key];
        if (!data) return;
        el.title.value = data.title;
        el.description.value = data.description;
        el.url.value = data.url;
        el.image.value = data.image;
        el.type.value = data.type;
        el.siteName.value = data.siteName;
        el.locale.value = data.locale;
        el.imageThumb.classList.add('hidden');
        updateAll();
        showToast('Preset loaded: ' + key, 'info');
      });
    }

    // Preview tabs
    var previewTabs = document.querySelectorAll('.preview-tab');
    for (var t = 0; t < previewTabs.length; t++) {
      previewTabs[t].addEventListener('click', function() {
        var platform = this.getAttribute('data-platform');

        // Update tab styles
        for (var j = 0; j < previewTabs.length; j++) {
          previewTabs[j].className = 'preview-tab px-3 py-1.5 rounded-lg text-xs font-medium border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 transition-all hover:border-emerald-500/50';
        }
        this.className = 'preview-tab active-tab px-3 py-1.5 rounded-lg text-xs font-medium border-2 border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-all';

        // Show/hide panels
        var panels = document.querySelectorAll('.preview-panel');
        for (var k = 0; k < panels.length; k++) {
          panels[k].classList.add('hidden');
        }
        document.getElementById('preview-' + platform).classList.remove('hidden');
      });
    }

    // FAQ toggles
    var faqToggles = document.querySelectorAll('.faq-toggle');
    for (var f = 0; f < faqToggles.length; f++) {
      faqToggles[f].addEventListener('click', function() {
        var content = this.nextElementSibling;
        var icon = this.querySelector('i');
        var isOpen = !content.classList.contains('hidden');

        if (isOpen) {
          content.classList.add('hidden');
          icon.style.transform = 'rotate(0deg)';
        } else {
          content.classList.remove('hidden');
          icon.style.transform = 'rotate(180deg)';
        }
      });
    }
  }

  /* ========== INIT ========== */
  function init() {
    bindEvents();
    updateAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
