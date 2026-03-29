// color-wheel.js
(function() {
  // --- Color Math Utilities ---
  const ColorMath = {
    hslToRgb: (h, s, l) => {
      s /= 100; l /= 100;
      const k = n => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
    },
    rgbToHex: (r, g, b) => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase(),
    rgbToHsl: (r, g, b) => {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      if (max === min) { h = s = 0; } 
      else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
          case g: h = ((b - r) / d + 2); break;
          case b: h = ((r - g) / d + 4); break;
        }
        h = Math.round(h * 60);
      }
      return [h, Math.round(s * 100), Math.round(l * 100)];
    }
  };

  // --- Wheel Setup ---
  const canvas = document.getElementById('color-wheel-canvas');
  const ctx = canvas.getContext('2d');
  const radius = canvas.width / 2;
  const centerX = radius;
  const centerY = radius;
  
  let currentHue = 180;
  let currentSat = 60;
  let currentLit = 50;
  let currentMode = 'analogous';
  let isDragging = false;

  // Draw Wheel
  function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Draw Hue Ring using Conic Gradient (Smoothest)
    const hueGrad = ctx.createConicGradient(0, centerX, centerY);
    for(let i=0; i<=360; i+=30) { hueGrad.addColorStop(i/360, `hsl(${i}, 100%, 50%)`); }
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = hueGrad;
    ctx.fill();
    
    // 2. Overlay Saturation (White center -> Transparent edge)
    // This creates the "color wheel" effect where center is white
    const satGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    satGrad.addColorStop(0, 'rgba(255,255,255,1)');
    satGrad.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = satGrad;
    ctx.fill();
  }

  // --- Interaction Logic ---
  function updateColor(e) {
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    // Handle Touch vs Mouse
    if (e.touches) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    // Calculate Polar Coords
    const dx = x - centerX;
    const dy = y - centerY;
    let dist = Math.sqrt(dx*dx + dy*dy);
    
    if (dist > radius) dist = radius; // Clamp to circle
    
    // Hue = Angle, Saturation = Distance
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angle < 0) angle += 360;
    
    currentHue = Math.round(angle);
    currentSat = Math.round((dist / radius) * 100);
    
    // Update UI
    updateUI();
  }

  function updateUI() {
    // Get RGB and HEX for current HSL
    const [r, g, b] = ColorMath.hslToRgb(currentHue, currentSat, currentLit);
    const hex = ColorMath.rgbToHex(r, g, b);
    
    // Update Base Color UI
    document.getElementById('preview-swatch').style.backgroundColor = hex;
    document.getElementById('base-hex').textContent = hex;
    document.getElementById('base-rgb').textContent = `${r}, ${g}, ${b}`;
    document.getElementById('base-hsl').textContent = `${currentHue}°, ${currentSat}%, ${currentLit}%`;
    
    // Update Marker Position
    const marker = document.getElementById('marker-base');
    const angleRad = currentHue * Math.PI / 180;
    const distPx = (currentSat / 100) * radius;
    marker.style.left = (centerX + distPx * Math.cos(angleRad)) + 'px';
    marker.style.top = (centerY + distPx * Math.sin(angleRad)) + 'px';
    marker.style.backgroundColor = hex;
    
    // Generate Harmonies
    generateHarmonies();
  }

  function generateHarmonies() {
    const harmonies = [];
    
    // Helper to create color object
    const createColor = (h, s, l) => {
      const [r, g, b] = ColorMath.hslToRgb(h, s, l);
      return {
        hex: ColorMath.rgbToHex(r, g, b),
        r, g, b,
        h, s, l
      };
    };

    // Logic
    switch(currentMode) {
      case 'analogous':
        harmonies.push(createColor(currentHue, currentSat, currentLit));
        harmonies.push(createColor((currentHue + 30) % 360, currentSat, currentLit));
        harmonies.push(createColor((currentHue + 60) % 360, currentSat, currentLit));
        harmonies.push(createColor((currentHue - 30 + 360) % 360, currentSat, currentLit));
        break;
      case 'monochromatic':
        harmonies.push(createColor(currentHue, currentSat, currentLit));
        harmonies.push(createColor(currentHue, currentSat - 20, currentLit + 10));
        harmonies.push(createColor(currentHue, currentSat - 40, currentLit - 10));
        harmonies.push(createColor(currentHue, currentSat, currentLit + 20));
        break;
      case 'triad':
        harmonies.push(createColor(currentHue, currentSat, currentLit));
        harmonies.push(createColor((currentHue + 120) % 360, currentSat, currentLit));
        harmonies.push(createColor((currentHue + 240) % 360, currentSat, currentLit));
        break;
      case 'complementary':
        harmonies.push(createColor(currentHue, currentSat, currentLit));
        harmonies.push(createColor((currentHue + 180) % 360, currentSat, currentLit));
        harmonies.push(createColor(currentHue, currentSat - 20, currentLit + 10));
        harmonies.push(createColor((currentHue + 180) % 360, currentSat - 20, currentLit + 10));
        break;
      case 'compound':
        harmonies.push(createColor(currentHue, currentSat, currentLit));
        harmonies.push(createColor((currentHue + 30) % 360, currentSat, currentLit));
        harmonies.push(createColor((currentHue + 180) % 360, currentSat, currentLit));
        harmonies.push(createColor((currentHue + 210) % 360, currentSat, currentLit));
        break;
      case 'shades':
        harmonies.push(createColor(currentHue, currentSat, currentLit));
        harmonies.push(createColor(currentHue, currentSat, currentLit - 15));
        harmonies.push(createColor(currentHue, currentSat, currentLit + 15));
        harmonies.push(createColor(currentHue, currentSat, currentLit - 30));
        break;
    }

    // Render List
    const container = document.getElementById('scheme-output');
    container.innerHTML = '';
    
    harmonies.forEach(c => {
      const div = document.createElement('div');
      div.className = 'color-row';
      div.innerHTML = `
        <div class="w-10 h-10 rounded-lg shadow" style="background-color: ${c.hex}"></div>
        <div class="text-xs font-mono text-slate-600 dark:text-slate-400">
          <div class="font-bold text-slate-900 dark:text-white">${c.hex}</div>
          <div class="opacity-70">${c.r}, ${c.g}, ${c.b}</div>
        </div>
        <button class="copy-btn" onclick="copyText('${c.hex}')">Copy</button>
      `;
      container.appendChild(div);
    });
  }
  
  // Global helper for copy
  window.copyText = (text) => {
    navigator.clipboard.writeText(text);
    if(window.Devpalettes && window.Devpalettes.Toast) {
      window.Devpalettes.Toast.show(`${text} Copied!`, 'success');
    }
  };

  // --- Event Listeners ---
  
  // Mouse Events
  canvas.addEventListener('mousedown', (e) => { isDragging = true; updateColor(e); });
  window.addEventListener('mousemove', (e) => { if(isDragging) updateColor(e); });
  window.addEventListener('mouseup', () => isDragging = false);
  
  // Touch Events
  canvas.addEventListener('touchstart', (e) => { isDragging = true; updateColor(e); e.preventDefault(); }, {passive: false});
  window.addEventListener('touchmove', (e) => { if(isDragging) updateColor(e); }, {passive: false});
  window.addEventListener('touchend', () => isDragging = false);

  // Harmony Buttons
  document.querySelectorAll('.harmony-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.harmony-btn').forEach(b => {
        b.classList.remove('active', 'bg-emerald-500', 'text-white', 'border-emerald-500');
      });
      e.target.classList.add('active', 'bg-emerald-500', 'text-white', 'border-emerald-500');
      currentMode = e.target.dataset.mode;
      generateHarmonies();
    });
  });
  
  // Lightness Slider
  document.getElementById('lightness-slider').addEventListener('input', (e) => {
    currentLit = parseInt(e.target.value);
    updateUI();
  });

  // Save Button
  document.getElementById('save-scheme-btn').addEventListener('click', () => {
     // Logic to save or export (simplified for now)
     alert('Scheme Export feature coming soon!');
  });

  // Init
  drawWheel();
  updateUI(); // Set initial state

})();
