/* ============================================
   ColorPallates - RGB ↔ HEX Converter
   Pure RGB to HEX and HEX to RGB (like htmlcolorcodes.com)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.ColorPallates) return;

  const els = {
    preview:     document.getElementById('preview-box'),
    hexInput:    document.getElementById('hex-input'),
    rInput:      document.getElementById('r'),
    gInput:      document.getElementById('g'),
    bInput:      document.getElementById('b'),
    rgbOutput:   document.getElementById('rgb-output'),
    picker:      document.getElementById('color-picker'),
    copyHexBtn:  document.getElementById('copy-hex'),
    copyRgbBtn:  document.getElementById('copy-rgb')
  };

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = Math.max(0, Math.min(255, parseInt(x) || 0)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  }

  function hexToRgb(hex) {
    hex = hex.replace('#', '').trim();
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    if (hex.length !== 6) return null;
    const num = parseInt(hex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function updateUI(from = '') {
    let hex = els.hexInput.value.trim().toUpperCase();
    if (!hex.startsWith('#')) hex = '#' + hex;

    const rgb = hexToRgb(hex);
    if (!rgb) return;

    // Update inputs
    if (from !== 'rgb') {
      els.rInput.value = rgb.r;
      els.gInput.value = rgb.g;
      els.bInput.value = rgb.b;
    }
    if (from !== 'hex') {
      els.hexInput.value = hex;
    }
    if (from !== 'picker') {
      els.picker.value = hex;
    }

    // Preview + output
    els.preview.style.backgroundColor = hex;
    els.rgbOutput.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  // Event Listeners
  els.hexInput.addEventListener('input', () => updateUI('hex'));
  els.hexInput.addEventListener('blur', () => {
    let val = els.hexInput.value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    els.hexInput.value = val.toUpperCase();
    updateUI('hex');
  });

  [els.rInput, els.gInput, els.bInput].forEach(input => {
    input.addEventListener('input', () => {
      const hex = rgbToHex(els.rInput.value, els.gInput.value, els.bInput.value);
      els.hexInput.value = hex;
      updateUI('rgb');
    });
  });

  els.picker.addEventListener('input', (e) => {
    els.hexInput.value = e.target.value.toUpperCase();
    updateUI('picker');
  });

  // Copy buttons
  els.copyHexBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(els.hexInput.value);
    window.ColorPallates.Toast.show(`Copied ${els.hexInput.value}`, 'success');
  });

  els.copyRgbBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(els.rgbOutput.textContent);
    window.ColorPallates.Toast.show('RGB copied!', 'success');
  });

  // Initial load
  updateUI();
});