(function() {
  var btnText = document.getElementById('btn-text');
  var colorPrimary = document.getElementById('color-primary');
  var colorText = document.getElementById('color-text');
  var radiusSlider = document.getElementById('radius-slider');
  var paddingSlider = document.getElementById('padding-slider');
  var previewBtn = document.getElementById('preview-btn');
  var cssOutput = document.getElementById('css-output');
  var radiusVal = document.getElementById('radius-val');
  var paddingVal = document.getElementById('padding-val');
  
  var currentStyle = 'gradient';
  
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
  
  function setStyle(style) {
    currentStyle = style;
    var buttons = document.querySelectorAll('.style-btn');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].classList.remove('active', 'bg-emerald-500', 'text-white');
      buttons[i].setAttribute('aria-checked', 'false');
    }
    if (event && event.target) {
      event.target.classList.add('active', 'bg-emerald-500', 'text-white');
      event.target.setAttribute('aria-checked', 'true');
    }
    updateButton();
  }
  
  function updateButton() {
    var text = btnText.value || "Button";
    var primary = colorPrimary.value;
    var txtColor = colorText.value;
    var radius = radiusSlider.value;
    var padding = paddingSlider.value;
    
    radiusVal.textContent = radius;
    paddingVal.textContent = padding;
    
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
    navigator.clipboard.writeText(text).then(function() {
      if (window.Devpalettes && window.Devpalettes.Toast) {
        window.Devpalettes.Toast.show('CSS Copied!', 'success');
      } else {
        alert('CSS Copied!');
      }
    });
  }
  
  window.setStyle = setStyle;
  window.updateButton = updateButton;
  window.copyCSS = copyCSS;
  
  btnText.addEventListener('input', updateButton);
  colorPrimary.addEventListener('input', updateButton);
  colorText.addEventListener('input', updateButton);
  radiusSlider.addEventListener('input', updateButton);
  paddingSlider.addEventListener('input', updateButton);
  
  updateButton();
  
})();
