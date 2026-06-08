// color-accessibility.js
(function() {
  'use strict';

  var textInput = document.getElementById('text-color');
  var bgInput = document.getElementById('bg-color');
  var textLabel = document.getElementById('text-label');
  var bgLabel = document.getElementById('bg-label');
  var previewBox = document.getElementById('preview-box');
  var scoreValue = document.getElementById('score-value');
  var statusBar = document.getElementById('progress-bar');
  var progressContainer = document.getElementById('progress-container');
  var statusBadge = document.getElementById('status-badge');
  var announceRegion = document.getElementById('a11y-announce');

  function announce(msg) {
    if (announceRegion) {
      announceRegion.textContent = msg;
      setTimeout(function() { announceRegion.textContent = ''; }, 2500);
    }
  }

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
  function testAccessibility() {
    var tRgb = hexToRgb(textInput.value);
    var bRgb = hexToRgb(bgInput.value);

    var tBrightness = getBrightness(tRgb.r, tRgb.g, tRgb.b);
    var bBrightness = getBrightness(bRgb.r, bRgb.g, bRgb.b);

    // Calculate absolute difference (0-255)
    var difference = Math.abs(tBrightness - bBrightness);

    // Update UI
    updateUI(difference);
  }

  function updateUI(diff) {
     // Update Preview
     previewBox.style.backgroundColor = bgInput.value;
     previewBox.style.color = textInput.value;
     previewBox.setAttribute('aria-label',
       'Readability preview with text color ' + textInput.value.toUpperCase() + ' on background ' + bgInput.value.toUpperCase()
     );

     // Update Labels
     textLabel.textContent = textInput.value.toUpperCase();
     bgLabel.textContent = bgInput.value.toUpperCase();

     // Update Score
     var roundedDiff = Math.round(diff);
     scoreValue.textContent = roundedDiff;

     // Update Progress Bar
     var percentage = (diff / 255) * 100;
     statusBar.style.width = percentage + "%";

     // Update ARIA on progress bar
     if (progressContainer) {
       progressContainer.setAttribute('aria-valuenow', roundedDiff);
     }

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

     // Announce to screen readers
     announce('Brightness difference: ' + roundedDiff + ' out of 255. ' + (diff >= 125 ? 'Good readability.' : 'Low readability — consider adjusting your colors.'));
  }

  function switchColors() {
     var temp = textInput.value;
     textInput.value = bgInput.value;
     bgInput.value = temp;
     testAccessibility();
     announce('Colors swapped');
  }

  function randomTest() {
     textInput.value = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
     bgInput.value = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
     testAccessibility();
     announce('Random colors generated');
  }

  // Expose to global scope for onclick handlers
  window.testAccessibility = testAccessibility;
  window.switchColors = switchColors;
  window.randomTest = randomTest;

  // Event Listeners
  textInput.addEventListener('input', testAccessibility);
  bgInput.addEventListener('input', testAccessibility);

  // Init
  testAccessibility();

})();
