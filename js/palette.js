/* ============================================
   ColorPallates - Palette Generator
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Wait for main.js to load
  if (!window.ColorPallates) {
    console.error('ColorPallates main.js not loaded');
    return;
  }
  
  const { ColorUtils, Clipboard, Storage, KeyboardShortcuts, Toast } = window.ColorPallates;
  
  // State
  let colors = [];
  let lockedColors = new Set();
  let minColors = 3;
  let maxColors = 8;
  
  // Elements
  const container = document.getElementById('palette-container');
  const generateBtn = document.getElementById('generate-btn');
  const addColorBtn = document.getElementById('add-color-btn');
  const removeColorBtn = document.getElementById('remove-color-btn');
  const exportCssBtn = document.getElementById('export-css-btn');
  const exportJsonBtn = document.getElementById('export-json-btn');
  const exportPngBtn = document.getElementById('export-png-btn');
  const savePaletteBtn = document.getElementById('save-palette-btn');
  const exportModal = document.getElementById('export-modal');
  const exportCode = document.getElementById('export-code');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const copyExportBtn = document.getElementById('copy-export-btn');
  const savedPalettesSection = document.getElementById('saved-palettes-section');
  const savedPalettesGrid = document.getElementById('saved-palettes-grid');
  
  // Initialize with 5 colors
  function init() {
    colors = Array(5).fill(null).map(() => generateRandomColor());
    render();
    loadSavedPalettes();
  }
  
  // Generate random color with variety
  function generateRandomColor() {
    const hsl = ColorUtils.randomHSL();
    return ColorUtils.hslToHex(hsl.h, hsl.s, hsl.l);
  }
  
  // Render palette
  function render() {
    container.innerHTML = '';
    
    colors.forEach((color, index) => {
      const isLocked = lockedColors.has(index);
      const textColor = ColorUtils.getContrastColor(color);
      
      const block = document.createElement('div');
      block.className = 'color-block relative flex-1 flex flex-col items-center justify-end p-6 transition-all cursor-pointer group';
      block.style.backgroundColor = color;
      block.style.color = textColor;
      
      block.innerHTML = `
        <!-- Refresh button -->
        <button class="refresh-btn absolute top-4 left-4 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-all" data-action="refresh" data-index="${index}" title="Refresh color">
          <i class="fas fa-sync-alt"></i>
        </button>
        
        <!-- Lock button -->
        <button class="lock-btn absolute top-4 right-4 w-10 h-10 rounded-full ${isLocked ? 'bg-emerald-500' : 'bg-black/20 hover:bg-black/40'} flex items-center justify-center transition-all" data-action="lock" data-index="${index}" title="${isLocked ? 'Unlock' : 'Lock'} color">
          <i class="fas ${isLocked ? 'fa-lock' : 'fa-lock-open'}"></i>
        </button>
        
        <!-- Color info -->
        <div class="text-center opacity-0 group-hover:opacity-100 transition-opacity">
          <p class="font-mono text-lg font-bold mb-1">${color.toUpperCase()}</p>
          <p class="text-sm opacity-75">${ColorUtils.getColorName(color)}</p>
        </div>
      `;
      
      // Click to copy
      block.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        Clipboard.copy(color.toUpperCase(), `Copied ${color.toUpperCase()}`);
      });
      
      container.appendChild(block);
    });
    
    // Event delegation for buttons
    container.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', handleButtonClick);
    });
  }
  
  // Handle button clicks
  function handleButtonClick(e) {
    const btn = e.currentTarget;
    const action = btn.dataset.action;
    const index = parseInt(btn.dataset.index);
    
    if (action === 'refresh') {
      colors[index] = generateRandomColor();
      render();
    } else if (action === 'lock') {
      if (lockedColors.has(index)) {
        lockedColors.delete(index);
      } else {
        lockedColors.add(index);
      }
      render();
    }
  }
  
  // Generate new palette (respect locks)
  function generatePalette() {
    colors = colors.map((color, index) => {
      if (lockedColors.has(index)) {
        return color;
      }
      return generateRandomColor();
    });
    render();
  }
  
  // Add color
  function addColor() {
    if (colors.length < maxColors) {
      colors.push(generateRandomColor());
      render();
    } else {
      Toast.show(`Maximum ${maxColors} colors allowed`, 'error');
    }
  }
  
  // Remove color
  function removeColor() {
    if (colors.length > minColors) {
      const removedIndex = colors.length - 1;
      lockedColors.delete(removedIndex);
      colors.pop();
      render();
    } else {
      Toast.show(`Minimum ${minColors} colors required`, 'error');
    }
  }
  
  // Export CSS
  function exportCSS() {
    const css = `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')}\n}`;
    showExportModal(css);
  }
  
  // Export JSON
  function exportJSON() {
    const json = JSON.stringify({
      name: 'Custom Palette',
      colors: colors,
      created: new Date().toISOString()
    }, null, 2);
    showExportModal(json);
  }
  
  // Show export modal
  function showExportModal(code) {
    exportCode.textContent = code;
    exportModal.classList.remove('hidden');
    exportModal.classList.add('flex');
  }
  
  // Hide export modal
  function hideExportModal() {
    exportModal.classList.add('hidden');
    exportModal.classList.remove('flex');
  }
  
  // Export PNG
  function exportPNG() {
    const canvas = document.createElement('canvas');
    const width = 1200;
    const height = 400;
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    const blockWidth = width / colors.length;
    
    colors.forEach((color, index) => {
      ctx.fillStyle = color;
      ctx.fillRect(index * blockWidth, 0, blockWidth, height);
    });
    
    // Download
    const link = document.createElement('a');
    link.download = `palette-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    Toast.show('PNG downloaded!');
  }
  
  // Save palette to localStorage
  function savePalette() {
    const savedPalettes = Storage.get('saved-palettes', []);
    savedPalettes.push({
      id: Date.now(),
      colors: [...colors],
      created: new Date().toISOString()
    });
    Storage.set('saved-palettes', savedPalettes);
    Toast.show('Palette saved!');
    loadSavedPalettes();
  }
  
  // Load saved palettes
  function loadSavedPalettes() {
    const savedPalettes = Storage.get('saved-palettes', []);
    
    if (savedPalettes.length === 0) {
      savedPalettesSection.classList.add('hidden');
      return;
    }
    
    savedPalettesSection.classList.remove('hidden');
    savedPalettesGrid.innerHTML = '';
    
    savedPalettes.forEach(palette => {
      const card = document.createElement('div');
      card.className = 'glass-card p-4';
      
      card.innerHTML = `
        <div class="flex rounded-lg overflow-hidden mb-3">
          ${palette.colors.map(c => `<div class="flex-1 h-16" style="background: ${c}"></div>`).join('')}
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-slate-500">${new Date(palette.created).toLocaleDateString()}</span>
          <div class="flex gap-2">
            <button class="text-slate-400 hover:text-emerald-500" onclick="loadPalette(${palette.id})" title="Load palette">
              <i class="fas fa-upload"></i>
            </button>
            <button class="text-slate-400 hover:text-red-500" onclick="deletePalette(${palette.id})" title="Delete palette">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
      
      savedPalettesGrid.appendChild(card);
    });
  }
  
  // Global functions for saved palette actions
  window.loadPalette = function(id) {
    const savedPalettes = Storage.get('saved-palettes', []);
    const palette = savedPalettes.find(p => p.id === id);
    if (palette) {
      colors = [...palette.colors];
      lockedColors.clear();
      render();
      Toast.show('Palette loaded!');
    }
  };
  
  window.deletePalette = function(id) {
    let savedPalettes = Storage.get('saved-palettes', []);
    savedPalettes = savedPalettes.filter(p => p.id !== id);
    Storage.set('saved-palettes', savedPalettes);
    loadSavedPalettes();
    Toast.show('Palette deleted');
  };
  
  // Event listeners
  if (generateBtn) generateBtn.addEventListener('click', generatePalette);
  if (addColorBtn) addColorBtn.addEventListener('click', addColor);
  if (removeColorBtn) removeColorBtn.addEventListener('click', removeColor);
  if (exportCssBtn) exportCssBtn.addEventListener('click', exportCSS);
  if (exportJsonBtn) exportJsonBtn.addEventListener('click', exportJSON);
  if (exportPngBtn) exportPngBtn.addEventListener('click', exportPNG);
  if (savePaletteBtn) savePaletteBtn.addEventListener('click', savePalette);
  if (closeModalBtn) closeModalBtn.addEventListener('click', hideExportModal);
  if (copyExportBtn) {
    copyExportBtn.addEventListener('click', () => {
      Clipboard.copy(exportCode.textContent, 'Code copied!');
    });
  }
  
  // Close modal on outside click
  if (exportModal) {
    exportModal.addEventListener('click', (e) => {
      if (e.target === exportModal) hideExportModal();
    });
  }
  
  // Keyboard shortcuts
  KeyboardShortcuts.on('space', generatePalette);
  
  // Initialize
  init();
});