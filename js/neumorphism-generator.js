// Neumorphism Generator - ../js/neumorphism-generator.js
(function() {
  'use strict';

  var preview = document.getElementById('neumo-preview');
  var previewBg = document.getElementById('preview-bg');
  var codeOutput = document.getElementById('code-output');
  var srAnnouncer = document.getElementById('sr-announcer');
  
  var shape = 'rect';
  
  // ── Screen Reader Announcements ──
  function announce(message) {
    if (srAnnouncer) {
      srAnnouncer.textContent = message;
    }
  }

  function setShape(s) {
    shape = s;
    var buttons = document.querySelectorAll('.shape-btn');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].classList.remove('active', 'bg-slate-500', 'text-white');
      buttons[i].setAttribute('aria-checked', 'false');
      buttons[i].setAttribute('tabindex', '-1');
    }
    var activeBtn = document.getElementById('btn-' + s);
    if (activeBtn) {
      activeBtn.classList.add('active', 'bg-slate-500', 'text-white');
      activeBtn.setAttribute('aria-checked', 'true');
      activeBtn.setAttribute('tabindex', '0');
      activeBtn.focus();
    }
    updateNeumo();
    announce('Shape changed to ' + s);
  }
  
  function adjustColor(hex, percent) {
    var num = parseInt(hex.slice(1), 16);
    var amt = Math.round(2.55 * percent);
    var R = Math.min(255, Math.max(0, (num >> 16) + amt));
    var G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
    var B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }
  
  function generateCode(bg, dist, blur, dark, light, inset, rad) {
    var insetStr = inset ? 'inset ' : '';
    var radiusCSS = shape === 'circle' ? 'border-radius: 50%;' : 'border-radius: ' + rad + 'px;';
    
    var css = '.neumorphic {\n' +
      '  background-color: ' + bg + ';\n' +
      '  ' + radiusCSS + '\n' +
      '  box-shadow: ' + insetStr + dist + 'px ' + dist + 'px ' + blur + 'px ' + dark + ',\n' +
      '              ' + insetStr + '-' + dist + 'px -' + dist + 'px ' + blur + 'px ' + light + ';\n' +
      '}';
    codeOutput.textContent = css;
  }
  
  function updateNeumo() {
    var bg = document.getElementById('ctrl-bg').value;
    var dist = document.getElementById('ctrl-dist').value;
    var blur = document.getElementById('ctrl-blur').value;
    var intVal = document.getElementById('ctrl-int').value;
    var rad = document.getElementById('ctrl-rad').value;
    var inset = document.getElementById('ctrl-inset').checked;
    
    document.getElementById('val-dist').textContent = dist;
    document.getElementById('val-blur').textContent = blur;
    document.getElementById('val-int').textContent = intVal;
    document.getElementById('val-rad').textContent = rad;

    // Update aria-valuenow for range inputs
    document.getElementById('ctrl-dist').setAttribute('aria-valuenow', dist);
    document.getElementById('ctrl-blur').setAttribute('aria-valuenow', blur);
    document.getElementById('ctrl-int').setAttribute('aria-valuenow', intVal);
    document.getElementById('ctrl-rad').setAttribute('aria-valuenow', rad);
    
    var darkColor = adjustColor(bg, -intVal);
    var lightColor = adjustColor(bg, intVal);
    
    previewBg.style.backgroundColor = bg;
    
    var insetStr = inset ? 'inset ' : '';
    var shadow = insetStr + dist + 'px ' + dist + 'px ' + blur + 'px ' + darkColor + ', ' + insetStr + '-' + dist + 'px -' + dist + 'px ' + blur + 'px ' + lightColor;
    
    preview.style.boxShadow = shadow;
    preview.style.backgroundColor = bg;
    
    if (shape === 'circle') {
      preview.style.borderRadius = '50%';
    } else {
      preview.style.borderRadius = rad + 'px';
    }
    
    generateCode(bg, dist, blur, darkColor, lightColor, inset, rad);
  }
  
  function copyCode() {
    var text = codeOutput.textContent;
    navigator.clipboard.writeText(text).then(function() {
      if (window.Devpalettes && window.Devpalettes.Toast) {
        window.Devpalettes.Toast.show('Code Copied!', 'success');
      }
      announce('CSS code copied to clipboard');
    }).catch(function() {
      if (window.Devpalettes && window.Devpalettes.Toast) {
        window.Devpalettes.Toast.show('Failed to copy', 'error');
      }
      announce('Failed to copy CSS code');
    });
  }
  
  // ── Event Listeners (moved from inline handlers) ──
  document.getElementById('ctrl-bg').addEventListener('input', updateNeumo);
  document.getElementById('ctrl-dist').addEventListener('input', updateNeumo);
  document.getElementById('ctrl-blur').addEventListener('input', updateNeumo);
  document.getElementById('ctrl-int').addEventListener('input', updateNeumo);
  document.getElementById('ctrl-rad').addEventListener('input', updateNeumo);
  document.getElementById('ctrl-inset').addEventListener('change', updateNeumo);
  
  document.getElementById('copy-code-btn').addEventListener('click', copyCode);
  document.getElementById('btn-rect').addEventListener('click', function() { setShape('rect'); });
  document.getElementById('btn-circle').addEventListener('click', function() { setShape('circle'); });

  // ── Keyboard Navigation for Shape Radiogroup (Accessibility) ──
  (function initShapeKeyboardNav() {
    var shapeButtons = document.querySelectorAll('.shape-btn');
    shapeButtons.forEach(function(btn, index) {
      btn.addEventListener('keydown', function(e) {
        var newIndex;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          newIndex = (index + 1) % shapeButtons.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          newIndex = (index - 1 + shapeButtons.length) % shapeButtons.length;
        }
        if (newIndex !== undefined) {
          shapeButtons[newIndex].click();
        }
      });
    });
  })();

  // ── Copy Link Button ──
  var copyLinkBtn = document.getElementById('copy-link-btn');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', function() {
      var pageUrl = window.location.href;
      navigator.clipboard.writeText(pageUrl).then(function() {
        if (window.Devpalettes && window.Devpalettes.Toast) {
          window.Devpalettes.Toast.show('Link Copied!', 'success');
        }
        announce('Page link copied to clipboard');
      }).catch(function() {
        if (window.Devpalettes && window.Devpalettes.Toast) {
          window.Devpalettes.Toast.show('Failed to copy link', 'error');
        }
      });
    });
  }

  // ─── FAQ Toggle (self-contained, works independently of enhancements.js) ───
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

      // Initialize aria-expanded
      var content = clone.nextElementSibling;
      if (content && content.classList.contains('hidden')) {
        clone.setAttribute('aria-expanded', 'false');
      } else if (content) {
        clone.setAttribute('aria-expanded', 'true');
      }
    });
  }, 50);
  
  // ── Init ──
  updateNeumo();
})();
