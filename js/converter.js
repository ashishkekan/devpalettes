/* ============================================
   ColorPalettesHub - Color Converter
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.ColorPalettesHub) return;
  
  const { ColorUtils, Clipboard } = window.ColorPalettesHub;
  
  // State
  let currentColor = {
    hex: '#10b981',
    rgb: { r: 16, g: 185, b: 129 },
    hsl: { h: 160, s: 84, l: 39 }
  };
  
  // Elements
  const hexInput = document.getElementById('hex-input');
  const rgbR = document.getElementById('rgb-r');
  const rgbG = document.getElementById('rgb-g');
  const rgbB = document.getElementById('rgb-b');
  const rgbOutput = document.getElementById('rgb-output');
  const hslH = document.getElementById('hsl-h');
  const hslS = document.getElementById('hsl-s');
  const hslL = document.getElementById('hsl-l');
  const hslOutput = document.getElementById('hsl-output');
  const colorPreview = document.getElementById('color-preview');
  const colorPicker = document.getElementById('color-picker');
  const harmoniesContainer = document.getElementById('harmonies');
  
  // Update from HEX
  function updateFromHex(hex, source = 'input') {
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return;
    
    currentColor.hex = hex;
    const rgb = ColorUtils.hexToRgb(hex);
    currentColor.rgb = rgb;
    currentColor.hsl = ColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    updateUI(source);
  }
  
  // Update from RGB
  function updateFromRGB(source = 'input') {
    const r = parseInt(rgbR.value) || 0;
    const g = parseInt(rgbG.value) || 0;
    const b = parseInt(rgbB.value) || 0;
    
    currentColor.rgb = {
      r: Math.max(0, Math.min(255, r)),
      g: Math.max(0, Math.min(255, g)),
      b: Math.max(0, Math.min(255, b))
    };
    
    currentColor.hex = ColorUtils.rgbToHex(currentColor.rgb.r, currentColor.rgb.g, currentColor.rgb.b);
    currentColor.hsl = ColorUtils.rgbToHsl(currentColor.rgb.r, currentColor.rgb.g, currentColor.rgb.b);
    
    updateUI(source);
  }
  
  // Update from HSL
  function updateFromHSL(source = 'input') {
    const h = parseInt(hslH.value) || 0;
    const s = parseInt(hslS.value) || 0;
    const l = parseInt(hslL.value) || 0;
    
    currentColor.hsl = {
      h: Math.max(0, Math.min(360, h)),
      s: Math.max(0, Math.min(100, s)),
      l: Math.max(0, Math.min(100, l))
    };
    
    const rgb = ColorUtils.hslToRgb(currentColor.hsl.h, currentColor.hsl.s, currentColor.hsl.l);
    currentColor.rgb = rgb;
    currentColor.hex = ColorUtils.rgbToHex(rgb.r, rgb.g, rgb.b);
    
    updateUI(source);
  }
  
  // Update UI
  function updateUI(source) {
    if (source !== 'hex') {
      hexInput.value = currentColor.hex;
    }
    if (source !== 'rgb') {
      rgbR.value = currentColor.rgb.r;
      rgbG.value = currentColor.rgb.g;
      rgbB.value = currentColor.rgb.b;
    }
    if (source !== 'hsl') {
      hslH.value = currentColor.hsl.h;
      hslS.value = currentColor.hsl.s;
      hslL.value = currentColor.hsl.l;
    }
    if (source !== 'picker') {
      colorPicker.value = currentColor.hex;
    }
    
    // Update outputs
    rgbOutput.textContent = `rgb(${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b})`;
    hslOutput.textContent = `hsl(${currentColor.hsl.h}, ${currentColor.hsl.s}%, ${currentColor.hsl.l}%)`;
    
    // Update preview
    colorPreview.style.backgroundColor = currentColor.hex;
    
    // Update harmonies
    renderHarmonies();
  }
  
  // Calculate color harmonies
  function renderHarmonies() {
    const h = currentColor.hsl.h;
    const s = currentColor.hsl.s;
    const l = currentColor.hsl.l;
    
    const harmonies = [
      { name: 'Complementary', colors: [currentColor.hex, ColorUtils.hslToHex((h + 180) % 360, s, l)] },
      { name: 'Analogous', colors: [
        currentColor.hex,
        ColorUtils.hslToHex((h + 30) % 360, s, l),
        ColorUtils.hslToHex((h + 330) % 360, s, l)
      ]},
      { name: 'Triadic', colors: [
        currentColor.hex,
        ColorUtils.hslToHex((h + 120) % 360, s, l),
        ColorUtils.hslToHex((h + 240) % 360, s, l)
      ]},
      { name: 'Split Comp', colors: [
        currentColor.hex,
        ColorUtils.hslToHex((h + 150) % 360, s, l),
        ColorUtils.hslToHex((h + 210) % 360, s, l)
      ]},
      { name: 'Tetradic', colors: [
        currentColor.hex,
        ColorUtils.hslToHex((h + 90) % 360, s, l),
        ColorUtils.hslToHex((h + 180) % 360, s, l),
        ColorUtils.hslToHex((h + 270) % 360, s, l)
      ]},
      { name: 'Square', colors: [
        currentColor.hex,
        ColorUtils.hslToHex((h + 90) % 360, s, l),
        ColorUtils.hslToHex((h + 180) % 360, s, l),
        ColorUtils.hslToHex((h + 270) % 360, s, l)
      ]},
      { name: 'Lighter', colors: [
        ColorUtils.hslToHex(h, s, Math.min(100, l + 20)),
        ColorUtils.hslToHex(h, s, Math.min(100, l + 40)),
        ColorUtils.hslToHex(h, s, Math.min(100, l + 60))
      ]},
      { name: 'Darker', colors: [
        ColorUtils.hslToHex(h, s, Math.max(0, l - 20)),
        ColorUtils.hslToHex(h, s, Math.max(0, l - 40)),
        ColorUtils.hslToHex(h, s, Math.max(0, l - 60))
      ]}
    ];
    
    harmoniesContainer.innerHTML = '';
    
    harmonies.forEach(harmony => {
      const card = document.createElement('div');
      card.className = 'glass-card p-4';
      
      card.innerHTML = `
        <p class="text-sm font-medium mb-2">${harmony.name}</p>
        <div class="flex rounded-lg overflow-hidden">
          ${harmony.colors.map(c => `
            <div class="flex-1 h-12 cursor-pointer hover:opacity-80 transition-opacity" 
                 style="background: ${c}" 
                 title="${c}"
                 onclick="ColorPalettesHub.Clipboard.copy('${c}', 'Copied ${c}')">
            </div>
          `).join('')}
        </div>
      `;
      
      harmoniesContainer.appendChild(card);
    });
  }
  
  // Event listeners
  hexInput.addEventListener('input', (e) => {
    let val = e.target.value;
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      updateFromHex(val, 'hex');
    }
  });
  
  [rgbR, rgbG, rgbB].forEach(input => {
    input.addEventListener('input', () => updateFromRGB('rgb'));
  });
  
  [hslH, hslS, hslL].forEach(input => {
    input.addEventListener('input', () => updateFromHSL('hsl'));
  });
  
  colorPicker.addEventListener('input', (e) => {
    updateFromHex(e.target.value, 'picker');
  });
  
  // Copy buttons
  document.getElementById('copy-hex')?.addEventListener('click', () => {
    Clipboard.copy(currentColor.hex, 'HEX copied!');
  });
  
  document.getElementById('copy-rgb')?.addEventListener('click', () => {
    Clipboard.copy(rgbOutput.textContent, 'RGB copied!');
  });
  
  document.getElementById('copy-hsl')?.addEventListener('click', () => {
    Clipboard.copy(hslOutput.textContent, 'HSL copied!');
  });
  
  // Initialize
  updateFromHex('#10b981');
});