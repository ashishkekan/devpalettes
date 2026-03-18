/* ============================================
   Devpalettes - Gradient Generator
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.Devpalettes) return;
  
  const { ColorUtils, Clipboard, Toast } = window.Devpalettes;
  
  // State
  let gradientType = 'linear';
  let angle = 135;
  let colorStops = [
    { color: '#10b981', position: 0 },
    { color: '#0ea5e9', position: 100 }
  ];
  
  // Elements
  const preview = document.getElementById('gradient-preview');
  const cssOutput = document.getElementById('css-output');
  const colorStopsContainer = document.getElementById('color-stops');
  const angleSlider = document.getElementById('angle-slider');
  const angleValue = document.getElementById('angle-value');
  const angleControl = document.getElementById('angle-control');
  const addStopBtn = document.getElementById('add-stop-btn');
  const copyCssBtn = document.getElementById('copy-css-btn');
  const copyGradientBtn = document.getElementById('copy-gradient-btn');
  const randomGradientBtn = document.getElementById('random-gradient-btn');
  
  // Render gradient
  function render() {
    const gradientCSS = buildGradientCSS();
    preview.style.background = gradientCSS;
    cssOutput.textContent = `background: ${gradientCSS};`;
    renderColorStops();
  }
  
  // Build gradient CSS string
  function buildGradientCSS() {
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
    const stopsStr = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ');
    
    if (gradientType === 'linear') {
      return `linear-gradient(${angle}deg, ${stopsStr})`;
    } else {
      return `radial-gradient(circle, ${stopsStr})`;
    }
  }
  
  // Render color stops UI
  function renderColorStops() {
    colorStopsContainer.innerHTML = '';
    
    colorStops.forEach((stop, index) => {
      const stopEl = document.createElement('div');
      stopEl.className = 'flex items-center gap-3 bg-slate-100 dark:bg-slate-700 rounded-xl p-3';
      
      stopEl.innerHTML = `
        <input type="color" value="${stop.color}" class="w-12 h-12 rounded-lg cursor-pointer border-0" data-index="${index}" data-field="color">
        <div class="flex-1">
          <input type="text" value="${stop.color}" class="input-field text-sm font-mono mb-1" data-index="${index}" data-field="colorText" placeholder="#000000">
          <input type="range" min="0" max="100" value="${stop.position}" class="w-full" data-index="${index}" data-field="position">
        </div>
        <span class="text-sm font-mono w-12">${stop.position}%</span>
        <button class="remove-stop-btn p-2 text-slate-400 hover:text-red-500 transition-colors ${colorStops.length <= 2 ? 'opacity-30 cursor-not-allowed' : ''}" data-index="${index}" ${colorStops.length <= 2 ? 'disabled' : ''}>
          <i class="fas fa-times"></i>
        </button>
      `;
      
      colorStopsContainer.appendChild(stopEl);
    });
    
    // Add event listeners
    colorStopsContainer.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', handleStopInput);
      input.addEventListener('change', handleStopInput);
    });
    
    colorStopsContainer.querySelectorAll('.remove-stop-btn').forEach(btn => {
      btn.addEventListener('click', handleRemoveStop);
    });
  }
  
  // Handle color stop input
  function handleStopInput(e) {
    const index = parseInt(e.target.dataset.index);
    const field = e.target.dataset.field;
    
    if (field === 'color' || field === 'colorText') {
      let value = e.target.value;
      // Validate hex color
      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        colorStops[index].color = value;
        render();
      }
    } else if (field === 'position') {
      colorStops[index].position = parseInt(e.target.value);
      render();
    }
  }
  
  // Remove color stop
  function handleRemoveStop(e) {
    if (colorStops.length <= 2) return;
    
    const index = parseInt(e.currentTarget.dataset.index);
    colorStops.splice(index, 1);
    // Renormalize positions
    colorStops.forEach((stop, i) => {
      stop.position = Math.round((i / (colorStops.length - 1)) * 100);
    });
    render();
  }
  
  // Add color stop
  function addStop() {
    if (colorStops.length >= 8) {
      Toast.show('Maximum 8 color stops', 'error');
      return;
    }
    
    const newColor = ColorUtils.randomHex();
    const newPosition = 50;
    
    colorStops.push({ color: newColor, position: newPosition });
    colorStops.sort((a, b) => a.position - b.position);
    render();
  }
  
  // Generate random gradient
  function randomGradient() {
    const numStops = Math.floor(Math.random() * 3) + 2; // 2-4 stops
    colorStops = [];
    
    for (let i = 0; i < numStops; i++) {
      colorStops.push({
        color: ColorUtils.randomHex(),
        position: Math.round((i / (numStops - 1)) * 100)
      });
    }
    
    angle = Math.floor(Math.random() * 360);
    angleSlider.value = angle;
    angleValue.textContent = angle;
    
    render();
  }
  
  // Copy CSS
  function copyCSS() {
    Clipboard.copy(`background: ${buildGradientCSS()};`, 'CSS copied to clipboard!');
  }
  
  // Gradient type toggle
  document.querySelectorAll('.gradient-type-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      gradientType = e.target.dataset.type;
      
      document.querySelectorAll('.gradient-type-btn').forEach(b => {
        b.classList.remove('bg-emerald-500', 'text-white');
        b.classList.add('bg-slate-200', 'dark:bg-slate-700');
      });
      
      e.target.classList.remove('bg-slate-200', 'dark:bg-slate-700');
      e.target.classList.add('bg-emerald-500', 'text-white');
      
      // Show/hide angle control
      angleControl.style.display = gradientType === 'linear' ? 'block' : 'none';
      
      render();
    });
  });
  
  // Angle slider
  if (angleSlider) {
    angleSlider.addEventListener('input', (e) => {
      angle = parseInt(e.target.value);
      angleValue.textContent = angle;
      render();
    });
  }
  
  // Preset gradients
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const gradientStr = btn.dataset.gradient;
      
      // Parse gradient string
      const colorMatch = gradientStr.match(/#[0-9A-Fa-f]{6}/g);
      if (colorMatch) {
        colorStops = colorMatch.map((color, i) => ({
          color,
          position: Math.round((i / (colorMatch.length - 1)) * 100)
        }));
        
        const angleMatch = gradientStr.match(/(\d+)deg/);
        if (angleMatch) {
          angle = parseInt(angleMatch[1]);
          angleSlider.value = angle;
          angleValue.textContent = angle;
        }
        
        render();
      }
    });
  });
  
  // Event listeners
  if (addStopBtn) addStopBtn.addEventListener('click', addStop);
  if (copyCssBtn) copyCssBtn.addEventListener('click', copyCSS);
  if (copyGradientBtn) copyGradientBtn.addEventListener('click', copyCSS);
  if (randomGradientBtn) randomGradientBtn.addEventListener('click', randomGradient);
  
  // Initialize
  render();
});