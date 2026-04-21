// wcag-contrast.js
(function() {
  const textInput = document.getElementById('text-color');
  const bgInput = document.getElementById('bg-color');
  const textLabel = document.getElementById('text-label');
  const bgLabel = document.getElementById('bg-label');
  const previewBox = document.getElementById('preview-box');
  const ratioDisplay = document.getElementById('ratio-display');
  
  // Elements for Grades
  const gradeAANormal = document.getElementById('grade-aa-normal');
  const gradeAALarge = document.getElementById('grade-aa-large');
  const gradeAAANormal = document.getElementById('grade-aaa-normal');
  const gradeAAALarge = document.getElementById('grade-aaa-large');
  
  const statusAANormal = document.getElementById('status-aa-normal');
  const statusAALarge = document.getElementById('status-aa-large');
  const statusAAANormal = document.getElementById('status-aaa-normal');
  const statusAAALarge = document.getElementById('status-aaa-large');
  
  // --- Logic ---
  
  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
  }
  
  // Relative Luminance
  function luminance(r, g, b) {
    let a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  
  function calculateRatio(hex1, hex2) {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    const L1 = luminance(rgb1.r, rgb1.g, rgb1.b);
    const L2 = luminance(rgb2.r, rgb2.g, rgb2.b);
    const lighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);
    return (lighter + 0.05) / (darker + 0.05);
  }
  
  function updateUI(ratio) {
     const rFixed = ratio.toFixed(2);
     ratioDisplay.textContent = rFixed;
     
     // Update Preview
     previewBox.style.backgroundColor = bgInput.value;
     previewBox.style.color = textInput.value;
     
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
  
  window.checkContrast = function() {
     const ratio = calculateRatio(textInput.value, bgInput.value);
     updateUI(ratio);
  };
  
  window.switchColors = function() {
     const temp = textInput.value;
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
  
  // Init
  checkContrast();
  
})();
