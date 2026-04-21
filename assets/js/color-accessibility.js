// color-accessibility.js
(function() {
  const textInput = document.getElementById('text-color');
  const bgInput = document.getElementById('bg-color');
  const textLabel = document.getElementById('text-label');
  const bgLabel = document.getElementById('bg-label');
  const previewBox = document.getElementById('preview-box');
  const scoreValue = document.getElementById('score-value');
  const statusBar = document.getElementById('progress-bar');
  const statusBadge = document.getElementById('status-badge');
  
  // --- Logic ---
  
  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
  }
  
  // Calculate Brightness (YIQ equation)
  function getBrightness(r, g, b) {
    return (r * 299 + g * 587 + b * 114) / 1000;
  }
  
  // Main Test Function
  window.testAccessibility = function() {
    const tRgb = hexToRgb(textInput.value);
    const bRgb = hexToRgb(bgInput.value);
    
    const tBrightness = getBrightness(tRgb.r, tRgb.g, tRgb.b);
    const bBrightness = getBrightness(bRgb.r, bRgb.g, bRgb.b);
    
    // Calculate absolute difference (0-255)
    const difference = Math.abs(tBrightness - bBrightness);
    
    // Update UI
    updateUI(difference);
  };
  
  function updateUI(diff) {
     // Update Preview
     previewBox.style.backgroundColor = bgInput.value;
     previewBox.style.color = textInput.value;
     
     // Update Labels
     textLabel.textContent = textInput.value.toUpperCase();
     bgLabel.textContent = bgInput.value.toUpperCase();
     
     // Update Score
     scoreValue.textContent = Math.round(diff);
     
     // Update Progress Bar (Max diff is 255)
     const percentage = (diff / 255) * 100;
     statusBar.style.width = percentage + "%";
     
     // Update Status Color/Text
     if (diff >= 125) {
        statusBar.className = "h-full rounded-full transition-all duration-500 bg-emerald-500";
        statusBadge.textContent = "Good Readability";
        statusBadge.className = "px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300";
     } else {
        statusBar.className = "h-full rounded-full transition-all duration-500 bg-red-500";
        statusBadge.textContent = "Low Readability";
        statusBadge.className = "px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300";
     }
  }
  
  window.switchColors = function() {
     const temp = textInput.value;
     textInput.value = bgInput.value;
     bgInput.value = temp;
     testAccessibility();
  };
  
  window.randomTest = function() {
     textInput.value = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
     bgInput.value = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
     testAccessibility();
  };
  
  // Event Listeners
  textInput.addEventListener('input', testAccessibility);
  bgInput.addEventListener('input', testAccessibility);
  
  // Init
  testAccessibility();
  
})();
