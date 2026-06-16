(function() {
  'use strict';

  var pxInput = document.getElementById('px-in');
  var remInput = document.getElementById('rem-in');
  var baseInput = document.getElementById('base-size');
  var baseVal = document.getElementById('base-val');
  var refTable = document.getElementById('ref-table');
  var formulaText = document.getElementById('formula-text');
  var srAnnouncer = document.getElementById('sr-announcer');

  // ── Screen Reader Announcements ──
  function announce(message) {
    if (srAnnouncer) {
      srAnnouncer.textContent = message;
    }
  }

  function convert(type) {
    var base = parseFloat(baseInput.value);
    if (isNaN(base) || base === 0) return;

    if (type === 'px') {
      var px = parseFloat(pxInput.value);
      if (!isNaN(px)) {
        var remResult = px / base;
        remInput.value = remResult.toFixed(3);
        if (formulaText) formulaText.textContent = px + 'px \u00F7 ' + base + ' = ' + remResult.toFixed(3) + 'rem';
      }
    } else {
      var rem = parseFloat(remInput.value);
      if (!isNaN(rem)) {
        var pxResult = rem * base;
        pxInput.value = pxResult.toFixed(2);
        if (formulaText) formulaText.textContent = rem + 'rem \u00D7 ' + base + ' = ' + pxResult.toFixed(2) + 'px';
      }
    }
  }

  function recalc() {
    var val = baseInput.value;
    baseVal.textContent = val;
    baseInput.setAttribute('aria-valuenow', val);
    convert('px');
    generateTable();
    announce('Base size changed to ' + val + ' pixels');
  }

  function generateTable() {
    var base = parseFloat(baseInput.value);
    if (isNaN(base) || base === 0) return;
    var refs = [10, 12, 14, 16, 18, 20, 24, 32, 40, 48, 64, 96];
    var html = '<div class="p-2 bg-slate-200 dark:bg-slate-700 rounded font-bold" role="columnheader">PX</div>' +
               '<div class="p-2 bg-slate-200 dark:bg-slate-700 rounded font-bold" role="columnheader">REM</div>' +
               '<div class="p-2 bg-slate-200 dark:bg-slate-700 rounded font-bold" role="columnheader">PX</div>' +
               '<div class="p-2 bg-slate-200 dark:bg-slate-700 rounded font-bold" role="columnheader">REM</div>';

    for (var i = 0; i < refs.length; i++) {
      var px = refs[i];
      var rem = (px / base).toFixed(2);
      html += '<div class="p-2 bg-slate-100 dark:bg-slate-800 rounded" role="cell">' + px + 'px</div>' +
              '<div class="p-2 bg-slate-100 dark:bg-slate-800 rounded text-emerald-600 dark:text-emerald-400" role="cell">' + rem + 'rem</div>';
    }

    refTable.innerHTML = html;
  }

  // ── Bind Events (replacing inline handlers) ──
  pxInput.addEventListener('input', function() { convert('px'); });
  remInput.addEventListener('input', function() { convert('rem'); });
  baseInput.addEventListener('input', recalc);

  // ── Copy Link Button ──
  var copyLinkBtn = document.getElementById('copy-link-btn');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', function() {
      var pageUrl = window.location.href;
      navigator.clipboard.writeText(pageUrl).then(function() {
        if (window.Devpalettes && window.Devpalettes.Toast) {
          window.Devpalettes.Toast.show('Link copied!', 'success');
        }
        announce('Page link copied to clipboard');
      }).catch(function() {
        if (window.Devpalettes && window.Devpalettes.Toast) {
          window.Devpalettes.Toast.show('Failed to copy link', 'error');
        }
      });
    });
  }

  // ── FAQ Toggle with ARIA ──
  function initFaqToggles() {
    var faqToggles = document.querySelectorAll('.faq-toggle');
    if (faqToggles.length === 0) return;

    faqToggles.forEach(function(toggle) {
      toggle.addEventListener('click', function(e) {
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
          setTimeout(function() {
            content.classList.add('hidden');
            content.style.maxHeight = '';
          }, 300);
        }
      });

      // Initialize aria-expanded
      var content = toggle.nextElementSibling;
      if (content && content.classList.contains('hidden')) {
        toggle.setAttribute('aria-expanded', 'false');
      } else if (content) {
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  }

  // ── Initialize ──
  generateTable();
  initFaqToggles();

})();
