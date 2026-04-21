(function() {
  var inputImg = document.getElementById('input-img');
  var inputTitle = document.getElementById('input-title');
  var inputDesc = document.getElementById('input-desc');
  var inputBtn = document.getElementById('input-btn');
  var colorBg = document.getElementById('color-bg');
  var colorBtn = document.getElementById('color-btn');
  var cardPreview = document.getElementById('card-preview');
  var codeOutput = document.getElementById('code-output');
  
  var currentStyle = 'standard';
  
  function adjustColor(hex, amount) {
    var num = parseInt(hex.replace("#", ""), 16);
    var r = Math.min(255, Math.max(0, (num >> 16) + amount));
    var g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    var b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return "#" + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
  }
  
  function setCardStyle(style) {
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
    updateCard();
  }
  
  function updateCard() {
    var img = inputImg.value;
    var title = inputTitle.value;
    var desc = inputDesc.value;
    var btnText = inputBtn.value;
    var bg = colorBg.value;
    var btn = colorBtn.value;
    
    var cardStyles = '';
    var cssCode = '';
    
    var baseStyle = "\n   width: 100%;\n   border-radius: 16px;\n   overflow: hidden;\n   font-family: 'Inter', sans-serif;";
    
    if (currentStyle === 'standard') {
      cardStyles = "background-color: " + bg + "; box-shadow: 0 10px 25px rgba(0,0,0,0.1);";
      cssCode = ".card-standard { " + baseStyle + " " + cardStyles + " }";
    } 
    else if (currentStyle === 'glass') {
      var isDark = document.documentElement.classList.contains('dark');
      cardStyles = "background: " + (isDark ? "rgba(30, 41, 59, 0.4)" : "rgba(255, 255, 255, 0.4)") + "; backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.2);";
      cssCode = ".card-glass { " + baseStyle + " " + cardStyles + " }";
    }
    else if (currentStyle === 'gradient') {
      var grad2 = adjustColor(btn, 40);
      cardStyles = "background: linear-gradient(135deg, " + btn + ", " + grad2 + "); color: white;";
      cssCode = ".card-gradient { " + baseStyle + " " + cardStyles + " }";
    }
    else if (currentStyle === 'neumorphic') {
      var isDark = document.documentElement.classList.contains('dark');
      cardStyles = "background: " + (isDark ? "#2c2c2c" : "#e0e0e0") + "; box-shadow: " + (isDark ? "8px 8px 16px #1a1a1a, -8px -8px 16px #3e3e3e" : "8px 8px 16px #bebebe, -8px -8px 16px #ffffff") + ";";
      cssCode = ".card-neumorphic { " + baseStyle + " " + cardStyles + " }";
    }
    
    var htmlContent = "<div class=\"generated-card\" style=\"" + cardStyles + "\">\n" +
      "   " + (img ? "<img src=\"" + img + "\" style=\"width:100%; height: 180px; object-fit: cover;\">" : "") + "\n" +
      "   <div style=\"padding: 20px;\">\n" +
      "      <h3 style=\"font-size: 18px; font-weight: bold; margin-bottom: 8px;\">" + title + "</h3>\n" +
      "      <p style=\"font-size: 14px; opacity: 0.8; margin-bottom: 16px;\">" + desc + "</p>\n" +
      "      <button style=\"background: " + (currentStyle === 'gradient' ? "rgba(255,255,255,0.2)" : btn) + "; color: white; padding: 8px 16px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer;\">\n" +
      "         " + btnText + "\n" +
      "      </button>\n" +
      "   </div>\n" +
      "</div>";
    
    cardPreview.innerHTML = htmlContent;
    
    codeOutput.textContent = "<!-- HTML -->\n " + htmlContent + "\n\n<!-- CSS -->\n<style>\n " + cssCode + "\n</style>";
  }
  
  function copyCode() {
    var text = codeOutput.textContent;
    navigator.clipboard.writeText(text).then(function() {
      if (window.Devpalettes && window.Devpalettes.Toast) {
        window.Devpalettes.Toast.show('Code Copied!', 'success');
      } else {
        alert('Code Copied!');
      }
    });
  }
  
  window.setCardStyle = setCardStyle;
  window.updateCard = updateCard;
  window.copyCode = copyCode;
  
  var inputs = [inputImg, inputTitle, inputDesc, inputBtn, colorBg, colorBtn];
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener('input', updateCard);
  }
  
  updateCard();
  
})();
