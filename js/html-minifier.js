// html-minifier.js

(function () {
  'use strict';

  // ─── DOM Elements ───
  var inputEl = document.getElementById('html-input');
  var inputCount = document.getElementById('html-input-count');
  var previewContent = document.getElementById('html-preview-content');
  var rawContent = document.getElementById('html-raw-content');
  var generatedCode = document.getElementById('generated-code');
  var outputInfo = document.getElementById('html-output-info');

  var statOriginal = document.getElementById('stat-original');
  var statMinified = document.getElementById('stat-minified');
  var statReduction = document.getElementById('stat-reduction');
  var statStatus = document.getElementById('stat-status');

  var validationList = document.getElementById('validation-list');

  var optWhitespace = document.getElementById('opt-whitespace');
  var optComments = document.getElementById('opt-comments');
  var optOptionalQuotes = document.getElementById('opt-optional-quotes');
  var optEmptyAttrs = document.getElementById('opt-empty-attrs');
  var clearBtn = document.getElementById('html-clear-btn');
  var copyBtn = document.getElementById('copy-tags-btn');
  var copyInlineBtn = document.getElementById('copy-code-inline');
  var downloadBtn = document.getElementById('download-file-btn');

  // ─── State ───
  var currentOutput = '';
  var hasError = false;

  // ─── Presets ───
  var presets = {
    basic: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My Website</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <header>\n    <nav>\n      <a href="/">Home</a>\n      <a href="/about">About</a>\n      <a href="/contact">Contact</a>\n    </nav>\n  </header>\n  <main>\n    <h1>Welcome to My Website</h1>\n    <p>This is a paragraph of text with some content.</p>\n    <p>Another paragraph here.</p>\n  </main>\n  <footer>\n    <p>&copy; 2024 My Website</p>\n  </footer>\n  <script src="app.js"><\/script>\n</body>\n</html>',
    comments: '<!-- Page Header -->\n<header class="site-header">\n  <!-- Logo Section -->\n  <div class="logo">\n    <img src="logo.png" alt="Company Logo">\n    <!-- TODO: Add retina logo -->\n  </div>\n  <!-- Navigation Menu -->\n  <nav>\n    <a href="/" class="nav-link active">Home</a>\n    <a href="/about" class="nav-link">About</a>\n    <!-- More links to be added -->\n    <a href="/services" class="nav-link">Services</a>\n  </nav>\n  <!-- End of Header -->\n</header>\n\n<!-- Main Content Area -->\n<main class="content">\n  <!-- Hero Section -->\n  <section class="hero">\n    <h1>Build Something Amazing</h1>\n    <p>Start your project today with our tools.</p>\n    <!-- CTA Button -->\n    <a href="/signup" class="btn btn-primary">Get Started</a>\n  </section>\n  <!-- End Main Content -->\n</main>',
    inline: '<div style="background-color: #f0f0f0; padding: 20px; margin: 0 auto; max-width: 800px; border-radius: 8px; font-family: Arial, sans-serif;">\n  <h1 style="color: #333333; font-size: 28px; margin-bottom: 16px; text-align: center;">\n    Styled Heading\n  </h1>\n  <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 12px;">\n    This paragraph has inline styles with multiple properties.\n  </p>\n  <div style="display: flex; gap: 12px; justify-content: center;">\n    <span style="background: #4CAF50; color: white; padding: 8px 16px; border-radius: 4px;">Button One</span>\n    <span style="background: #2196F3; color: white; padding: 8px 16px; border-radius: 4px;">Button Two</span>\n  </div>\n</div>',
    semantic: '<article class="blog-post" itemscope itemtype="https://schema.org/BlogPosting">\n  <header>\n    <h1 itemprop="headline">Understanding Semantic HTML</h1>\n    <time datetime="2024-01-15" itemprop="datePublished">January 15, 2024</time>\n    <address itemprop="author">By <a href="/authors/jane">Jane Doe</a></address>\n  </header>\n  <section itemprop="articleBody">\n    <h2>What is Semantic HTML?</h2>\n    <p>Semantic HTML uses elements that clearly describe their meaning to both the browser and the developer.</p>\n    <figure>\n      <img src="semantic-html.png" alt="Semantic HTML elements diagram" itemprop="image">\n      <figcaption>A diagram showing semantic HTML elements</figcaption>\n    </figure>\n    <h2>Why Does It Matter?</h2>\n    <p>Semantic HTML improves accessibility, SEO, and code maintainability.</p>\n    <aside>\n      <p><strong>Note:</strong> Always use the most specific element available for your content.</p>\n    </aside>\n  </section>\n  <footer>\n    <nav>\n      <a href="/blog/html-intro" rel="prev">Previous: HTML Introduction</a>\n      <a href="/blog/css-basics" rel="next">Next: CSS Basics</a>\n    </nav>\n  </footer>\n</article>'
  };

  // ─── Helpers ───
  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    var sizes = ['B', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(1024));
    var val = bytes / Math.pow(1024, i);
    return val.toFixed(i === 0 ? 0 : 1) + ' ' + sizes[i];
  }

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
    ['has-input', 'has-tags', 'minified', 'size-reduced', 'no-errors', 'output-ready'].forEach(function (k) {
      setCheck(k, null);
    });
  }

  function hasHtmlTags(str) {
    return /<[a-z][\s\S]*>/i.test(str);
  }

  // ─── Minification Logic ───
  function minifyHtml(html) {
    var output = html;

    // 1. Remove comments (must be done carefully to avoid script/style content)
    if (optComments.checked) {
      // Simple comment removal - doesn't go inside script/style tags
      output = output.replace(/<!--[\s\S]*?-->/g, '');
    }

    // 2. Remove empty attributes
    if (optEmptyAttrs.checked) {
      // Remove attributes with empty string values like type="" id="" class=""
      output = output.replace(/\s+(type|id|class|style|name|title|lang|dir|accesskey|tabindex|role|aria-\w+|data-\w+|draggable|spellcheck|contenteditable|translate)=""\s*/gi, ' ');
      // Clean up double spaces from removals
      output = output.replace(/  +/g, ' ');
    }

    // 3. Remove optional quotes on simple attribute values
    if (optOptionalQuotes.checked) {
      // Match attributes like class="simplevalue" where value has no spaces/quotes/special chars
      output = output.replace(/([a-zA-Z-]+)=(")([a-zA-Z0-9_-]+)(")/g, function (match, attr, q1, val, q2) {
        return attr + '=' + val;
      });
    }

    // 4. Remove trailing semicolons in inline styles
    output = output.replace(/style="([^"]*);"/g, function (match, content) {
      return 'style="' + content + '"';
    });
    output = output.replace(/style='([^']*);'/g, function (match, content) {
      return "style='" + content + "'";
    });

    // 5. Whitespace removal
    if (optWhitespace.checked) {
      // Protect pre, code, script, style content
      var protectedBlocks = [];
      var placeholders = [];

      // Protect <pre> blocks
      output = output.replace(/<pre[\s\S]*?<\/pre>/gi, function (match) {
        var idx = protectedBlocks.length;
        protectedBlocks.push(match);
        placeholders.push('___PROTECTED_' + idx + '___');
        return '___PROTECTED_' + idx + '___';
      });

      // Protect <script> blocks
      output = output.replace(/<script[\s\S]*?<\/script>/gi, function (match) {
        var idx = protectedBlocks.length;
        protectedBlocks.push(match);
        placeholders.push('___PROTECTED_' + idx + '___');
        return '___PROTECTED_' + idx + '___';
      });

      // Protect <style> blocks
      output = output.replace(/<style[\s\S]*?<\/style>/gi, function (match) {
        var idx = protectedBlocks.length;
        protectedBlocks.push(match);
        placeholders.push('___PROTECTED_' + idx + '___');
        return '___PROTECTED_' + idx + '___';
      });

      // Now safely remove whitespace
      // Replace newlines and tabs with spaces
      output = output.replace(/[\r\n\t]+/g, ' ');

      // Collapse multiple spaces into one
      output = output.replace(/  +/g, ' ');

      // Remove spaces between block-level tags
      var blockTags = ['address', 'article', 'aside', 'blockquote', 'body', 'br', 'canvas', 'dd', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html', 'legend', 'li', 'main', 'nav', 'noscript', 'ol', 'p', 'pre', 'section', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul'];
      var blockPattern = new RegExp('\\s*</?(' + blockTags.join('|') + ')(?:\\s|>)\\s*', 'gi');
      output = output.replace(blockPattern, function (match, tag) {
        return '</' + tag + '>';
      });
      output = output.replace(new RegExp('<(' + blockTags.join('|') + ')>\\s+', 'gi'), function (match, tag) {
        return '<' + tag + '>';
      });

      // Remove space after opening tag and before closing tag (more aggressive)
      output = output.replace(/>\s+</g, '><');
      // But restore space between inline elements that need it (add space between tags if there's text)
      // Simple approach: add space between > and < when there's alphanumeric between
      output = output.replace(/>(<[a-z])/gi, '> $1');

      // Remove leading and trailing whitespace
      output = output.trim();

      // Restore protected blocks
      for (var i = placeholders.length - 1; i >= 0; i--) {
        output = output.replace(placeholders[i], protectedBlocks[i]);
      }
    }

    // Final cleanup: remove spaces before closing tags
    output = output.replace(/\s+<\/>/g, '</>');

    return output;
  }

  // ─── Process ───
  function process() {
    var input = inputEl.value;
    var inputLen = input.length;
    var inputBytes = new Blob([input]).size;
    currentOutput = '';
    hasError = false;

    // Input count
    inputCount.textContent = inputLen + ' char' + (inputLen !== 1 ? 's' : '');

    // Stats
    statOriginal.textContent = formatBytes(inputBytes);
    statOriginal.className = 'text-3xl font-bold ' + (inputLen > 0 ? 'text-emerald-500' : 'text-slate-400');

    // Reset checks
    resetChecks();

    // Empty input
    if (inputLen === 0) {
      previewContent.textContent = 'Paste HTML code and select options to see the minified result here';
      rawContent.textContent = 'Paste HTML code to see the raw minified output here';
      generatedCode.textContent = 'Paste HTML code to generate minified output';
      outputInfo.textContent = 'No output generated yet';

      statMinified.textContent = '0 B';
      statMinified.className = 'text-3xl font-bold text-slate-400';
      statReduction.textContent = '0%';
      statReduction.className = 'text-3xl font-bold text-slate-400';
      statStatus.textContent = 'Idle';
      statStatus.className = 'text-3xl font-bold text-slate-400';

      return;
    }

    setCheck('has-input', true);

    // Check for HTML tags
    var hasTags = hasHtmlTags(input);
    setCheck('has-tags', hasTags);

    // Minify
    var minified = '';
    try {
      minified = minifyHtml(input);
    } catch (e) {
      minified = null;
    }

    if (minified !== null) {
      currentOutput = minified;
      var minBytes = new Blob([minified]).size;
      var reduction = inputBytes > 0 ? ((inputBytes - minBytes) / inputBytes) * 100 : 0;

      previewContent.textContent = minified;
      rawContent.textContent = minified;
      generatedCode.textContent = minified;
      outputInfo.textContent = formatBytes(inputBytes) + ' → ' + formatBytes(minBytes) + ' (' + reduction.toFixed(1) + '% smaller)';

      statMinified.textContent = formatBytes(minBytes);
      statMinified.className = 'text-3xl font-bold text-blue-500';

      if (reduction > 0) {
        statReduction.textContent = '-' + reduction.toFixed(1) + '%';
        statReduction.className = 'text-3xl font-bold text-emerald-500';
        setCheck('size-reduced', true);
      } else if (reduction === 0) {
        statReduction.textContent = '0%';
        statReduction.className = 'text-3xl font-bold text-slate-400';
        setCheck('size-reduced', null);
      } else {
        statReduction.textContent = '+' + Math.abs(reduction).toFixed(1) + '%';
        statReduction.className = 'text-3xl font-bold text-red-400';
        setCheck('size-reduced', false);
      }

      statStatus.textContent = 'Success';
      statStatus.className = 'text-3xl font-bold text-emerald-500';

      setCheck('minified', true);
      setCheck('no-errors', true);
      setCheck('output-ready', true);
    } else {
      hasError = true;
      previewContent.textContent = 'Error: Could not minify the HTML input.';
      rawContent.textContent = 'Error: Could not minify the HTML input.';
      generatedCode.textContent = 'Error: Could not minify the HTML input.';
      outputInfo.textContent = 'Minification failed';

      statMinified.textContent = '—';
      statMinified.className = 'text-3xl font-bold text-red-400';
      statReduction.textContent = '—';
      statReduction.className = 'text-3xl font-bold text-red-400';
      statStatus.textContent = 'Error';
      statStatus.className = 'text-3xl font-bold text-red-400';

      setCheck('minified', false);
      setCheck('no-errors', false);
      setCheck('output-ready', false);
      setCheck('size-reduced', false);
    }
  }

  // ─── Option Listeners ───
  [optWhitespace, optComments, optOptionalQuotes, optEmptyAttrs].forEach(function (el) {
    el.addEventListener('change', process);
  });

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
    copyToClipboard(currentOutput, 'Minified HTML copied to clipboard');
  });

  copyInlineBtn.addEventListener('click', function () {
    if (!currentOutput) {
      showToast('No output to copy', 'error');
      return;
    }
    copyToClipboard(currentOutput, 'Minified HTML copied to clipboard');
  });

  // ─── Download ───
  downloadBtn.addEventListener('click', function () {
    if (!currentOutput) {
      showToast('No output to download', 'error');
      return;
    }
    var blob = new Blob([currentOutput], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'minified.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('minified.html downloaded', 'success');
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
      process();
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

})();
