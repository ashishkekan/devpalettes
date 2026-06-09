// wcag-contrast.js
(function() {
  var textInput = document.getElementById('text-color');
  var bgInput = document.getElementById('bg-color');
  var textLabel = document.getElementById('text-label');
  var bgLabel = document.getElementById('bg-label');
  var previewBox = document.getElementById('preview-box');
  var ratioDisplay = document.getElementById('ratio-display');
  
  var gradeAANormal = document.getElementById('grade-aa-normal');
  var gradeAALarge = document.getElementById('grade-aa-large');
  var gradeAAANormal = document.getElementById('grade-aaa-normal');
  var gradeAAALarge = document.getElementById('grade-aaa-large');
  
  var statusAANormal = document.getElementById('status-aa-normal');
  var statusAALarge = document.getElementById('status-aa-large');
  var statusAAANormal = document.getElementById('status-aaa-normal');
  var statusAAALarge = document.getElementById('status-aaa-large');
  
  // --- Logic ---
  
  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
  }
  
  function luminance(r, g, b) {
    var a = [r, g, b].map(function(v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  
  function calculateRatio(hex1, hex2) {
    var rgb1 = hexToRgb(hex1);
    var rgb2 = hexToRgb(hex2);
    var L1 = luminance(rgb1.r, rgb1.g, rgb1.b);
    var L2 = luminance(rgb2.r, rgb2.g, rgb2.b);
    var lighter = Math.max(L1, L2);
    var darker = Math.min(L1, L2);
    return (lighter + 0.05) / (darker + 0.05);
  }
  
  function updateUI(ratio) {
     var rFixed = ratio.toFixed(2);
     ratioDisplay.textContent = rFixed;
     
     // Update Preview
     previewBox.style.backgroundColor = bgInput.value;
     previewBox.style.color = textInput.value;
     previewBox.setAttribute('aria-label', 'Preview of ' + textInput.value.toUpperCase() + ' text on ' + bgInput.value.toUpperCase() + ' background');
     
     // Update Labels
     textLabel.textContent = textInput.value.toUpperCase();
     bgLabel.textContent = bgInput.value.toUpperCase();
     
     // Update Grades
     updateGrade(gradeAANormal, statusAANormal, ratio >= 4.5);
     updateGrade(gradeAALarge, statusAALarge, ratio >= 3);
     updateGrade(gradeAAANormal, statusAAANormal, ratio >= 7);
     updateGrade(gradeAAALarge, statusAAALarge, ratio >= 4.5);
  }
  
  function updateGrade(cardEl, statusEl, isPass) {
     if (isPass) {
        cardEl.classList.remove('border-red-500', 'border-slate-200', 'dark:border-slate-700');
        cardEl.classList.add('border-emerald-500');
        statusEl.textContent = "Pass";
        statusEl.classList.remove('text-red-500');
        statusEl.classList.add('text-emerald-500');
     } else {
        cardEl.classList.remove('border-emerald-500', 'border-slate-200', 'dark:border-slate-700');
        cardEl.classList.add('border-red-500');
        statusEl.textContent = "Fail";
        statusEl.classList.remove('text-emerald-500');
        statusEl.classList.add('text-red-500');
     }
  }
  
  // --- Clipboard helper ---
  function copyToClipboard(text, message) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showCopyToast(message || 'Copied!');
      }).catch(function() {
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
    try { document.execCommand('copy'); showCopyToast(message || 'Copied!'); }
    catch(e) { /* silent */ }
    document.body.removeChild(textarea);
  }
  
  function showCopyToast(message) {
    if (window.Devpalettes && window.Devpalettes.Toast) {
      window.Devpalettes.Toast.show(message, 'success');
    }
  }
  
  window.checkContrast = function() {
     var ratio = calculateRatio(textInput.value, bgInput.value);
     updateUI(ratio);
  };
  
  window.switchColors = function() {
     var temp = textInput.value;
     textInput.value = bgInput.value;
     bgInput.value = temp;
     checkContrast();
  };
  
  window.randomCheck = function() {
     textInput.value = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
     bgInput.value = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
     checkContrast();
  };
  
  // Event Listeners
  textInput.addEventListener('input', checkContrast);
  bgInput.addEventListener('input', checkContrast);
  
  // Copy Link button
  var copyLinkBtn = document.getElementById('copy-link-btn');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', function() {
      var url = 'https://devpalettes.com/wcag-contrast-checker/';
      copyToClipboard(url, 'Link copied!');
      var originalHTML = copyLinkBtn.innerHTML;
      copyLinkBtn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Copied!';
      copyLinkBtn.setAttribute('aria-label', 'Link copied to clipboard');
      setTimeout(function() {
        copyLinkBtn.innerHTML = originalHTML;
        copyLinkBtn.setAttribute('aria-label', 'Copy page link to clipboard');
      }, 2000);
    });
  }
  
  // FAQ Toggle
  setTimeout(function initFaqToggles() {
    var faqToggles = document.querySelectorAll('.faq-toggle');
    if (faqToggles.length === 0) {
      setTimeout(initFaqToggles, 100);
      return;
    }

    faqToggles.forEach(function(toggle) {
      var clone = toggle.cloneNode(true);
      toggle.parentNode.replaceChild(clone, toggle);
      clone.addEventListener('click', function(e) {
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
    });
  }, 50);
  
  // Init
  checkContrast();
  
})();
