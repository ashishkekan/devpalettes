// ─── Mode Toggle (updated for ARIA) ───
  function setMode(mode) {
    currentMode = mode;

    if (mode === 'encode') {
      modeEncodeBtn.className = 'mode-btn px-4 py-3 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 text-sm font-medium transition-all text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2';
      modeEncodeBtn.setAttribute('aria-checked', 'true');
      modeEncodeBtn.setAttribute('aria-pressed', 'true');
      modeDecodeBtn.className = 'mode-btn px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-sm font-medium transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2';
      modeDecodeBtn.setAttribute('aria-checked', 'false');
      modeDecodeBtn.setAttribute('aria-pressed', 'false');
      inputHint.textContent = 'Enter text or URL to percent-encode';
      statMode.textContent = 'Encode';
      statMode.className = 'text-3xl font-bold text-emerald-500';
    } else {
      modeDecodeBtn.className = 'mode-btn px-4 py-3 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 text-sm font-medium transition-all text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2';
      modeDecodeBtn.setAttribute('aria-checked', 'true');
      modeDecodeBtn.setAttribute('aria-pressed', 'true');
      modeEncodeBtn.className = 'mode-btn px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-sm font-medium transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2';
      modeEncodeBtn.setAttribute('aria-checked', 'false');
      modeEncodeBtn.setAttribute('aria-pressed', 'false');
      inputHint.textContent = 'Paste a percent-encoded string to decode';
      statMode.textContent = 'Decode';
      statMode.className = 'text-3xl font-bold text-blue-500';
    }

    process();
  }

  // ─── Preview Tabs (updated for ARIA) ───
  document.querySelectorAll('.preview-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var view = this.getAttribute('data-view');

      document.querySelectorAll('.preview-tab').forEach(function (t) {
        t.className = 'preview-tab px-3 py-1.5 rounded-lg text-xs font-medium border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 transition-all hover:border-emerald-500/50';
        t.setAttribute('aria-selected', 'false');
      });
      this.className = 'preview-tab active-tab px-3 py-1.5 rounded-lg text-xs font-medium border-2 border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-all';
      this.setAttribute('aria-selected', 'true');

      document.getElementById('view-result').classList.toggle('hidden', view !== 'result');
      document.getElementById('view-raw').classList.toggle('hidden', view !== 'raw');
    });
  });

  // ─── Copy Buttons (updated with state announcements) ───
  copyBtn.addEventListener('click', function () {
    if (!currentOutput) {
      showToast('No output to copy', 'error');
      return;
    }
    copyToClipboard(currentOutput, 'Output copied to clipboard');
    // Visual + accessible feedback
    var originalHTML = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check mr-1" aria-hidden="true"></i>Copied!';
    copyBtn.setAttribute('aria-label', 'Output copied to clipboard');
    setTimeout(function () {
      copyBtn.innerHTML = originalHTML;
      copyBtn.setAttribute('aria-label', 'Copy encoded or decoded output to clipboard');
    }, 2000);
  });

  copyInlineBtn.addEventListener('click', function () {
    if (!currentOutput) {
      showToast('No output to copy', 'error');
      return;
    }
    copyToClipboard(currentOutput, 'Output copied to clipboard');
  });

  // ─── Copy Link Button ───
  var copyLinkBtn = document.getElementById('copy-link-btn');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', function () {
      var url = 'https://devpalettes.com/url-tool/';
      copyToClipboard(url, 'Link copied!');
      var originalHTML = copyLinkBtn.innerHTML;
      copyLinkBtn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Copied!';
      copyLinkBtn.setAttribute('aria-label', 'Link copied to clipboard');
      setTimeout(function () {
        copyLinkBtn.innerHTML = originalHTML;
        copyLinkBtn.setAttribute('aria-label', 'Copy page link to clipboard');
      }, 2000);
    });
  }

  // ─── FAQ Toggle (updated with aria-expanded) ───
  setTimeout(function initFaqToggles() {
    var faqToggles = document.querySelectorAll('.faq-toggle');
    if (faqToggles.length === 0) {
      setTimeout(initFaqToggles, 100);
      return;
    }

    faqToggles.forEach(function (toggle) {
      var clone = toggle.cloneNode(true);
      toggle.parentNode.replaceChild(clone, toggle);
      clone.addEventListener('click', function (e) {
        e.preventDefault();
        var content = this.nextElementSibling;
        var icon = this.querySelector('i');
        if (!content) return;

        var isHidden = content.classList.contains('hidden');
        if (isHidden) {
          content.classList.remove('hidden');
          content.style.maxHeight = content.scrollHeight + 'px';
          icon.style.transform = 'rotate(180deg)';
          this.setAttribute('aria-expanded', 'true');
        } else {
          content.style.maxHeight = '0px';
          icon.style.transform = 'rotate(0deg)';
          this.setAttribute('aria-expanded', 'false');
          setTimeout(function () {
            content.classList.add('hidden');
            content.style.maxHeight = '';
          }, 300);
        }
      });
    });
  }, 50);
