// color-opacity.js
(function() {
  // Elements
  const picker = document.getElementById('color-picker');
  const slider = document.getElementById('opacity-slider');
  const preview = document.getElementById('color-preview');
  const hexLabel = document.getElementById('hex-label');
  const opacityVal = document.getElementById('opacity-value');
  const rgbaText = document.getElementById('rgba-text');
  const cssText = document.getElementById('css-text');
  
  // Helper: HEX to RGB object
  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
  }
  
  // Update Logic
  function updateColor() {
    const hex = picker.value;
    const opacity = slider.value / 100; // Convert 0-100 to 0-1
    
    const rgb = hexToRgb(hex);
    const rgbaString = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity.toFixed(2)})`;
    
    // Update UI Labels
    hexLabel.textContent = hex.toUpperCase();
    opacityVal.textContent = `${slider.value}%`;
    
    // Update Preview
    preview.style.backgroundColor = rgbaString;
    
    // Update Code Outputs
    rgbaText.textContent = rgbaString;
    cssText.textContent = `background-color: ${rgbaString};`;
    
    // Update Slider Track Color dynamically
    // This sets the 'color' property of the slider which is used by CSS 'currentColor'
    slider.style.color = hex;
  }
  
  // Global Functions
  window.copyRGBA = function() {
    const text = rgbaText.textContent;
    navigator.clipboard.writeText(text).then(() => {
       if(window.Devpalettes && window.Devpalettes.Toast) {
         window.Devpalettes.Toast.show(`Copied ${text}`, 'success');
       } else {
         alert(`Copied: ${text}`);
       }
    });
  };
  
  window.copyCSS = function() {
    const text = cssText.textContent;
    navigator.clipboard.writeText(text).then(() => {
       if(window.Devpalettes && window.Devpalettes.Toast) {
         window.Devpalettes.Toast.show('CSS Copied!', 'success');
       } else {
         alert('CSS Copied!');
       }
    });
  };
  
  window.randomColor = function() {
     // Generate random hex
     const randomHex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
     picker.value = randomHex;
     // Optional: Random opacity
     // slider.value = Math.floor(Math.random() * 100);
     updateColor();
  };
  
  // Event Listeners
  picker.addEventListener('input', updateColor);
  slider.addEventListener('input', updateColor);
  
  // Init
  updateColor();
  
})();
