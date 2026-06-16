(function() {
  'use strict';

  var btnText = document.getElementById('btn-text');
  var colorPrimary = document.getElementById('color-primary');
  var colorText = document.getElementById('color-text');
  var radiusSlider = document.getElementById('radius-slider');
  var paddingSlider = document.getElementById('padding-slider');
  var previewBtn = document.getElementById('preview-btn');
  var cssOutput = document.getElementById('css-output');
  var radiusVal = document.getElementById('radius-val');
  var paddingVal = document.getElementById('padding-val');
  var colorPrimaryVal = document.getElementById('color-primary-val');
  var colorTextVal = document.getElementById('color-text-val');
  var announceRegion = document.getElementById('a11y-announce');

  var currentStyle = 'gradient';

  // Accessibility announcer
  function announce(msg) {
    if (announceRegion) {
      announceRegion.textContent = msg;
      setTimeout(function() { announceRegion.textContent = ''; }, 2500);
    }
  }

  function getSecondaryColor(hex) {
    return adjustBrightness(hex, -20);
  }

  function adjustBrightness(hex, percent) {
    var num = parseInt(hex.replace("#", ""), 16);
    var amt = Math.round(2.55 * percent);
    var R = (num >> 16) + amt;
    var G = (num >> 8 & 0x00FF) + amt;
    var B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 +
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
  }

  // FIX: Pass clicked element explicitly instead of relying on implicit event global
  function setStyle(style, clickedBtn) {
    currentStyle = style;
    var buttons = document.querySelectorAll('.style-btn');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].classList.remove('active', 'bg-emerald-500', 'text-white');
      buttons[i].classList.add('bg-slate-200', 'dark:bg-slate-700');
      buttons[i].setAttribute('aria-checked', 'false');
    }
    if (clickedBtn) {
      clickedBtn.classList.add('active', 'bg-emerald-500', 'text-white');
      clickedBtn.classList.remove('bg-slate-200', 'dark:bg-slate-700');
      clickedBtn.setAttribute('aria-checked', 'true');
    }
    updateButton();
    announce('Style changed to ' + style);
  }

  function updateButton() {
    var text = btnText.value || "Button";
    var primary = colorPrimary.value;
    var txtColor = colorText.value;
    var radius = radiusSlider.value;
    var padding = paddingSlider.value;

    radiusVal.textContent = radius;
    paddingVal.textContent = padding;
    radiusSlider.setAttribute('aria-valuetext', radius + ' pixels');
    paddingSlider.setAttribute('aria-valuetext', padding + ' pixels');

    // Update color value displays
    if (colorPrimaryVal) colorPrimaryVal.textContent = primary.toUpperCase();
    if (colorTextVal) colorTextVal.textContent = txtColor.toUpperCase();

    previewBtn.textContent = text;

    var css = "";

    var base = "\n  padding: " + padding + "px 24px;\n" +
      "  border-radius: " + radius + "px;\n" +
      "  font-weight: 600;\n" +
      "  border: none;\n" +
      "  cursor: pointer;\n" +
      "  transition: all 0.3s ease;";

    if (currentStyle === 'gradient') {
      var secondary = getSecondaryColor(primary);
      previewBtn.style.background = "linear-gradient(135deg, " + primary + ", " + secondary + ")";
      previewBtn.style.color = txtColor;
      previewBtn.style.boxShadow = 'none';
      previewBtn.style.border = 'none';
      previewBtn.style.backdropFilter = 'none';
      previewBtn.style.borderBottom = 'none';
      previewBtn.style.transform = 'none';

      css = ".btn-gradient {\n  " + base + "\n" +
        "  background: linear-gradient(135deg, " + primary + ", " + secondary + ");\n" +
        "  color: " + txtColor + ";\n" +
        "}\n" +
        ".btn-gradient:hover {\n" +
        "  transform: translateY(-2px);\n" +
        "  box-shadow: 0 10px 20px rgba(0,0,0,0.2);\n" +
        "}";
    }
    else if (currentStyle === 'glass') {
      previewBtn.style.background = 'rgba(255, 255, 255, 0.15)';
      previewBtn.style.backdropFilter = 'blur(10px)';
      previewBtn.style.color = txtColor;
      previewBtn.style.border = '1px solid rgba(255, 255, 255, 0.2)';
      previewBtn.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
      previewBtn.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
      previewBtn.style.transform = 'none';

      css = ".btn-glass {\n  " + base + "\n" +
        "  background: rgba(255, 255, 255, 0.15);\n" +
        "  backdrop-filter: blur(10px);\n" +
        "  border: 1px solid rgba(255, 255, 255, 0.2);\n" +
        "  color: " + txtColor + ";\n" +
        "}";
    }
    else if (currentStyle === 'neumorphism') {
      var isDark = document.documentElement.classList.contains('dark');
      var bgColor = isDark ? '#2c2c2c' : '#e0e0e0';
      var shadowDark = isDark ? '#1a1a1a' : '#bebebe';
      var shadowLight = isDark ? '#3e3e3e' : '#ffffff';

      previewBtn.style.background = bgColor;
      previewBtn.style.boxShadow = "8px 8px 16px " + shadowDark + ", -8px -8px 16px " + shadowLight;
      previewBtn.style.color = txtColor;
      previewBtn.style.border = 'none';
      previewBtn.style.backdropFilter = 'none';
      previewBtn.style.borderBottom = 'none';
      previewBtn.style.transform = 'none';

      css = ".btn-neumorphic {\n  " + base + "\n" +
        "  background: " + bgColor + ";\n" +
        "  box-shadow: 8px 8px 16px " + shadowDark + ", -8px -8px 16px " + shadowLight + ";\n" +
        "  color: " + txtColor + ";\n" +
        "}";
    }
    else if (currentStyle === 'neon') {
      previewBtn.style.background = 'transparent';
      previewBtn.style.color = primary;
      previewBtn.style.border = "2px solid " + primary;
      previewBtn.style.boxShadow = "0 0 10px " + primary + "80, 0 0 20px " + primary + "40, inset 0 0 10px " + primary + "20";
      previewBtn.style.backdropFilter = 'none';
      previewBtn.style.borderBottom = "2px solid " + primary;
      previewBtn.style.transform = 'none';

      css = ".btn-neon {\n  " + base + "\n" +
        "  background: transparent;\n" +
        "  color: " + primary + ";\n" +
        "  border: 2px solid " + primary + ";\n" +
        "  box-shadow: 0 0 10px " + primary + "80;\n" +
        "}\n" +
        ".btn-neon:hover {\n" +
        "  background: " + primary + ";\n" +
        "  color: " + txtColor + ";\n" +
        "}";
    }
    else if (currentStyle === 'outline') {
      previewBtn.style.background = 'transparent';
      previewBtn.style.color = primary;
      previewBtn.style.border = "2px solid " + primary;
      previewBtn.style.boxShadow = 'none';
      previewBtn.style.backdropFilter = 'none';
      previewBtn.style.borderBottom = "2px solid " + primary;
      previewBtn.style.transform = 'none';

      css = ".btn-outline {\n  " + base + "\n" +
        "  background: transparent;\n" +
        "  color: " + primary + ";\n" +
        "  border: 2px solid " + primary + ";\n" +
        "}\n" +
        ".btn-outline:hover {\n" +
        "  background: " + primary + ";\n" +
        "  color: " + txtColor + ";\n" +
        "}";
    }
    else if (currentStyle === '3d') {
      var darker = adjustBrightness(primary, -30);
      previewBtn.style.background = primary;
      previewBtn.style.color = txtColor;
      previewBtn.style.border = 'none';
      previewBtn.style.boxShadow = 'none';
      previewBtn.style.backdropFilter = 'none';
      previewBtn.style.borderBottom = "4px solid " + darker;
      previewBtn.style.transform = 'translateY(0)';

      css = ".btn-3d {\n  " + base + "\n" +
        "  background: " + primary + ";\n" +
        "  color: " + txtColor + ";\n" +
        "  border-bottom: 4px solid " + darker + ";\n" +
        "  transform: translateY(0);\n" +
        "}\n" +
        ".btn-3d:hover {\n" +
        "  transform: translateY(2px);\n" +
        "  border-bottom-width: 2px;\n" +
        "}";
    }

    cssOutput.textContent = css;
  }

  function copyCSS() {
    var text = cssOutput.textContent;
    if (!text) {
      announce('No CSS to copy');
      return;
    }
    navigator.clipboard.writeText(text).then(function() {
      if (window.Devpalettes && window.Devpalettes.Toast) {
        window.Devpalettes.Toast.show('CSS Copied!', 'success');
      }
      announce('CSS code copied to clipboard');
    }).catch(function() {
      // Fallback copy
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        if (window.Devpalettes && window.Devpalettes.Toast) {
          window.Devpalettes.Toast.show('CSS Copied!', 'success');
        }
        announce('CSS code copied to clipboard');
      } catch (e) {
        announce('Failed to copy CSS');
      }
      document.body.removeChild(textarea);
    });
  }

  // Expose to global scope for onclick handlers
  window.setStyle = setStyle;
  window.updateButton = updateButton;
  window.copyCSS = copyCSS;

  // Event listeners
  btnText.addEventListener('input', updateButton);
  colorPrimary.addEventListener('input', updateButton);
  colorText.addEventListener('input', updateButton);
  radiusSlider.addEventListener('input', updateButton);
  paddingSlider.addEventListener('input', updateButton);

  // FIX: Keyboard navigation for style radio group
  var styleRadiogroup = document.getElementById('style-radiogroup');
  if (styleRadiogroup) {
    styleRadiogroup.addEventListener('keydown', function(e) {
      var buttons = Array.prototype.slice.call(styleRadiogroup.querySelectorAll('.style-btn'));
      var currentIndex = buttons.indexOf(document.activeElement);
      if (currentIndex === -1) return;

      var nextIndex = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % buttons.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
      }

      if (nextIndex !== -1) {
        buttons[nextIndex].focus();
        buttons[nextIndex].click();
      }
    });
  }

  // Initialize
  updateButton();

})();
