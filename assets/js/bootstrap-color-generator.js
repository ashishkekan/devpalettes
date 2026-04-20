(function() {
  const picker = document.getElementById('base-color');
  const label = document.getElementById('base-label');
  
  // --- Logic: Color Manipulation ---
  
  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
  }
  
  function rgbToHex(r, g, b) {
    r = Math.max(0, Math.min(255, Math.round(r)));
    g = Math.max(0, Math.min(255, Math.round(g)));
    b = Math.max(0, Math.min(255, Math.round(b)));
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  
  function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
        case g: h = ((b - r) / d + 2); break;
        case b: h = ((r - g) / d + 4); break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }
  
  function hslToRgb(h, s, l) {
    let r, g, b;
    h /= 360; s /= 100; l /= 100;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }
  
  // Adjust Lightness
  function adjustColor(hex, amount) {
     const rgb = hexToRgb(hex);
     const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
     hsl.l = Math.max(0, Math.min(100, hsl.l + amount));
     const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
     return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  }
  
  // --- UI Logic ---
  
  window.generatePalette = function() {
    const hex = picker.value;
    const container = document.getElementById('palette-container');
    container.innerHTML = '';
    
    const configOutput = document.getElementById('config-output');
    let configStr = "// Bootstrap 5 SCSS Variables\n\n";
    
    // Define Semantic Colors Logic
    // We use the base color for Primary.
    // Secondary is usually a gray variant, we'll generate one.
    // Success, Info, Warning, Danger are standard but derived to look good with Primary if desired, 
    // but usually they stay standard for consistency. Let's keep standard and generate variants.
    
    const palette = [
      { name: '$primary', color: hex, desc: 'Main Brand' },
      { name: '$secondary', color: adjustColor('#6c757d', 0), desc: 'Neutral' }, // Fixed grey usually, or derived
      { name: '$success', color: '#198754', desc: 'Success' },
      { name: '$info', color: '#0dcaf0', desc: 'Info' },
      { name: '$warning', color: '#ffc107', desc: 'Warning' },
      { name: '$danger', color: '#dc3545', desc: 'Danger' },
      { name: '$light', color: '#f8f9fa', desc: 'Light' },
      { name: '$dark', color: '#212529', desc: 'Dark' }
    ];
    
    palette.forEach(item => {
       const textColor = getContrastYIQ(item.color);
       
       const card = document.createElement('div');
       card.className = "glass-card rounded-xl overflow-hidden flex flex-col justify-between h-40 cursor-pointer hover:scale-105 transition-transform";
       card.innerHTML = `
         <div class="flex-1 flex items-center justify-center p-4" style="background-color: ${item.color}">
            <span class="font-mono text-xs font-bold uppercase" style="color: ${textColor}">${item.name}</span>
         </div>
         <div class="p-3 bg-white/10 flex justify-between items-center">
            <span class="text-xs text-slate-500">${item.desc}</span>
            <span class="text-xs font-mono">${item.color.toUpperCase()}</span>
         </div>
       `;
       
       card.onclick = () => {
          navigator.clipboard.writeText(item.color);
          if(window.Devpalettes && window.Devpalettes.Toast) window.Devpalettes.Toast.show(`${item.color} copied!`);
       };
       
       container.appendChild(card);
       configStr += `${item.name}: ${item.color};\n`;
    });
    
    configOutput.textContent = configStr;
  };
  
  function getContrastYIQ(hex) {
    const rgb = hexToRgb(hex);
    return ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000 >= 128 ? '#000000' : '#FFFFFF';
  }
  
  window.copyConfig = function() {
    const text = document.getElementById('config-output').textContent;
    navigator.clipboard.writeText(text).then(() => {
       if(window.Devpalettes && window.Devpalettes.Toast) {
         window.Devpalettes.Toast.show('SCSS Variables Copied!', 'success');
       } else {
         alert('Copied!');
       }
    });
  };
  
  // Live update label
  picker.addEventListener('input', (e) => {
    label.textContent = e.target.value.toUpperCase();
  });
  
  // Init
  generatePalette();
  
})();
