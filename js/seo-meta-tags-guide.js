/**
 * SEO Meta Tags Guide - Devpalettes
 * Handles TOC highlighting, code copy, checklist, FAQ toggles
 */
(function() {
  'use strict';

  /* ========== HELPERS ========== */
  function escapeHtml(s) {
    if (!s) return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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

  /* ========== COPY CODE ========== */
  function copyCodeBlock(btn) {
    var block = btn.closest('.code-block');
    var codeEl = block.querySelector('code');
    if (!codeEl) return;
    var text = codeEl.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showToast('Code copied!', 'success');
        btn.innerHTML = '<i class="fas fa-check mr-1"></i>Copied';
        setTimeout(function() { btn.innerHTML = '<i class="fas fa-copy mr-1"></i>Copy'; }, 1500);
      }).catch(function() { fallbackCopy(text, btn); });
    } else {
      fallbackCopy(text, btn);
    }
  }

  function fallbackCopy(text, btn) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('Code copied!', 'success');
      btn.innerHTML = '<i class="fas fa-check mr-1"></i>Copied';
      setTimeout(function() { btn.innerHTML = '<i class="fas fa-copy mr-1"></i>Copy'; }, 1500);
    } catch (e) {
      showToast('Failed to copy', 'error');
    }
    document.body.removeChild(ta);
  }

  /* ========== TABLE OF CONTENTS ========== */
  function initTOC() {
    var links = document.querySelectorAll('.toc-link');
    var sections = [];

    links.forEach(function(link) {
      var href = link.getAttribute('href');
      if (href && href.charAt(0) === '#') {
        var section = document.getElementById(href.substring(1));
        if (section) sections.push({ link: link, section: section });
      }
    });

    function updateActive() {
      var scrollY = window.scrollY;
      var current = null;

      for (var i = sections.length - 1; i >= 0; i--) {
        var rect = sections[i].section.getBoundingClientRect();
        if (rect.top <= 120) {
          current = sections[i];
          break;
        }
      }

      links.forEach(function(l) { l.classList.remove('active'); });
      if (current) current.link.classList.add('active');
    }

    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          updateActive();
          ticking = false;
        });
        ticking = true;
      }
    });

    updateActive();
  }

  /* ========== SMOOTH SCROLL ========== */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(a) {
      a.addEventListener('click', function(e) {
        var href = this.getAttribute('href');
        if (href && href.length > 1) {
          var target = document.getElementById(href.substring(1));
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  /* ========== FAQ TOGGLES ========== */
  function initFAQ() {
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

  /* ========== CHECKLIST ========== */
  function initChecklist() {
    var container = document.getElementById('checklist-container');
    var progress = document.getElementById('checklist-progress');
    var bar = document.getElementById('checklist-bar');
    if (!container) return;

    var checkboxes = container.querySelectorAll('input[type="checkbox"]');

    function update() {
      var total = checkboxes.length;
      var checked = 0;
      checkboxes.forEach(function(cb) { if (cb.checked) checked++; });
      var pct = total > 0 ? Math.round((checked / total) * 100) : 0;
      progress.textContent = checked + '/' + total;
      bar.style.width = pct + '%';
      if (pct === 100) {
        bar.className = 'h-full bg-emerald-500 rounded-full transition-all duration-300';
      } else {
        bar.className = 'h-full bg-amber-500 rounded-full transition-all duration-300';
      }
    }

    checkboxes.forEach(function(cb) {
      cb.addEventListener('change', update);
    });

    update();
  }

  /* ========== INIT ========== */
  function init() {
    // Copy code buttons
    document.querySelectorAll('.copy-code-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        copyCodeBlock(this);
      });
    });

    initTOC();
    initSmoothScroll();
    initFAQ();
    initChecklist();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
