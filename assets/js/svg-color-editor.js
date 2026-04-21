// /js/svg-color-editor.js
(function() {
  'use strict';
  
  // State
  let originalSvg = '';
  let currentSvg = '';
  let detectedColors = [];
  
  // DOM Elements
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  const svgInput = document.getElementById('svg-input');
  const loadBtn = document.getElementById('load-btn');
  const previewContainer = document.getElementById('preview-container');
  const colorsPanel = document.getElementById('colors-panel');
  const colorsList = document.getElementById('colors-list');
  const colorCount = document.getElementById('color-count');
  const copyBtn = document.getElementById('copy-btn');
  const downloadBtn = document.getElementById('download-btn');
  const invertBtn = document.getElementById('invert-btn');
  const grayscaleBtn = document.getElementById('grayscale-btn');
  const resetBtn = document.getElementById('reset-btn');
  
  // Toast helper
  function showToast(message, type) {
    if (window.Devpalettes && window.Devpalettes.Toast) {
      window.Devpalettes.Toast.show(message, type);
    } else {
      alert(message);
    }
  }
  
  // Initialize
  function init() {
    setupEventListeners();
    setupDragAndDrop();
  }
  
  // Event Listeners
  function setupEventListeners() {
    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });
    
    fileInput.addEventListener('change', handleFileSelect);
    loadBtn.addEventListener('click', loadSvgFromInput);
    copyBtn.addEventListener('click', copySvgToClipboard);
    downloadBtn.addEventListener('click', downloadSvg);
    invertBtn.addEventListener('click', invertAllColors);
    grayscaleBtn.addEventListener('click', convertToGrayscale);
    resetBtn.addEventListener('click', resetToOriginal);
  }
  
  // Drag and Drop
  function setupDragAndDrop() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      uploadZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
      uploadZone.addEventListener(eventName, () => {
        uploadZone.classList.add('drag-over');
      }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      uploadZone.addEventListener(eventName, () => {
        uploadZone.classList.remove('drag-over');
      }, false);
    });
    
    uploadZone.addEventListener('drop', handleDrop, false);
  }
  
  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }
  
  function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }
  
  function handleFile(file) {
    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
      showToast('Please upload a valid SVG file', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      svgInput.value = content;
      processSvg(content);
    };
    reader.readAsText(file);
  }
  
  function loadSvgFromInput() {
    const code = svgInput.value.trim();
    if (!code) {
      showToast('Please enter SVG code', 'error');
      return;
    }
    
    if (!code.includes('<svg')) {
      showToast('Invalid SVG code', 'error');
      return;
    }
    
    processSvg(code);
  }
  
  // SVG Processing
  function processSvg(svgCode) {
    try {
      // Validate SVG
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgCode, 'image/svg+xml');
      const parseError = doc.querySelector('parsererror');
      
      if (parseError) {
        showToast('Invalid SVG: parsing error', 'error');
        return;
      }
      
      originalSvg = svgCode;
      currentSvg = svgCode;
      
      // Detect colors
      detectColors(svgCode);
      
      // Update preview
      updatePreview(svgCode);
      
      // Enable buttons
      copyBtn.disabled = false;
      downloadBtn.disabled = false;
      
      // Show colors panel
      colorsPanel.classList.remove('hidden');
      colorCount.textContent = `(${detectedColors.length} found)`;
      
      // Render color list
      renderColorList();
      
      showToast('SVG loaded successfully', 'success');
      
    } catch (error) {
      showToast('Error processing SVG', 'error');
      console.error(error);
    }
  }
  
  // Color Detection
  function detectColors(svgCode) {
    detectedColors = [];
    
    const colorPatterns = [
      /fill\s*=\s*["']([^"']+)["']/gi,
      /stroke\s*=\s*["']([^"']+)["']/gi,
      /stop-color\s*=\s*["']([^"']+)["']/gi,
      /color\s*:\s*([^;}\s]+)/gi,
      /fill\s*:\s*([^;}\s]+)/gi,
      /stroke\s*:\s*([^;}\s]+)/gi
    ];
    
    const foundColors = new Set();
    
    colorPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(svgCode)) !== null) {
        const colorValue = match[1].trim();
        if (colorValue && 
            colorValue.toLowerCase() !== 'none' && 
            colorValue.toLowerCase() !== 'transparent' && 
            colorValue.toLowerCase() !== 'currentColor' &&
            !colorValue.startsWith('url(') &&
            !colorValue.startsWith('var(')) {
          foundColors.add(colorValue);
        }
      }
    });
    
    foundColors.forEach(color => {
      const normalizedColor = normalizeColor(color);
      if (normalizedColor) {
        detectedColors.push({
          original: color,
          normalized: normalizedColor,
          current: normalizedColor
        });
      }
    });
  }
  
  // Normalize color to hex
  function normalizeColor(color) {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillStyle = color;
    return ctx.fillStyle;
  }
  
  // Render Color List
  function renderColorList() {
    colorsList.innerHTML = '';
    
    detectedColors.forEach((colorObj, index) => {
      const item = document.createElement('div');
      item.className = 'flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors';
      
      item.innerHTML = `
        <div class="color-swatch" style="background-color: ${colorObj.current}">
          <input type="color" value="${colorObj.current}" data-index="${index}" aria-label="Change color">
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-mono text-sm font-medium">${colorObj.current.toUpperCase()}</div>
          <div class="text-xs text-slate-500 truncate">Original: ${colorObj.original}</div>
        </div>
        <button class="reset-color-btn text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-2" data-index="${index}" aria-label="Reset color">
          <i class="fas fa-rotate-left"></i>
        </button>
      `;
      
      const colorInput = item.querySelector('input[type="color"]');
      colorInput.addEventListener('input', (e) => {
        updateColor(index, e.target.value);
      });
      
      const resetColorBtn = item.querySelector('.reset-color-btn');
      resetColorBtn.addEventListener('click', () => {
        resetColor(index);
      });
      
      colorsList.appendChild(item);
    });
  }
  
  // Update Color
  function updateColor(index, newColor) {
    const colorObj = detectedColors[index];
    const oldColor = colorObj.current;
    colorObj.current = newColor;
    
    // Replace in SVG
    currentSvg = currentSvg.replace(new RegExp(escapeRegex(colorObj.original), 'gi'), newColor);
    
    if (oldColor !== colorObj.original) {
      currentSvg = currentSvg.replace(new RegExp(escapeRegex(oldColor), 'gi'), newColor);
    }
    
    updatePreview(currentSvg);
    
    // Update swatch background
    const swatches = document.querySelectorAll('.color-swatch');
    if (swatches[index]) {
      swatches[index].style.backgroundColor = newColor;
    }
  }
  
  // Reset Color
  function resetColor(index) {
    const colorObj = detectedColors[index];
    colorObj.current = colorObj.normalized;
    
    rebuildSvg();
    renderColorList();
    updatePreview(currentSvg);
    showToast('Color reset', 'success');
  }
  
  // Rebuild SVG with current colors
  function rebuildSvg() {
    currentSvg = originalSvg;
    detectedColors.forEach(colorObj => {
      if (colorObj.current !== colorObj.normalized) {
        currentSvg = currentSvg.replace(new RegExp(escapeRegex(colorObj.original), 'gi'), colorObj.current);
      }
    });
  }
  
  // Escape regex
  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  // Update Preview
  function updatePreview(svgCode) {
    previewContainer.innerHTML = svgCode;
  }
  
  // Invert All Colors
  function invertAllColors() {
    detectedColors.forEach((colorObj) => {
      colorObj.current = invertColor(colorObj.current);
    });
    
    rebuildSvg();
    renderColorList();
    updatePreview(currentSvg);
    showToast('Colors inverted', 'success');
  }
  
  // Invert single color
  function invertColor(hex) {
    const r = 255 - parseInt(hex.slice(1, 3), 16);
    const g = 255 - parseInt(hex.slice(3, 5), 16);
    const b = 255 - parseInt(hex.slice(5, 7), 16);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  // Convert to Grayscale
  function convertToGrayscale() {
    detectedColors.forEach((colorObj) => {
      colorObj.current = grayscaleColor(colorObj.current);
    });
    
    rebuildSvg();
    renderColorList();
    updatePreview(currentSvg);
    showToast('Converted to grayscale', 'success');
  }
  
  // Grayscale single color
  function grayscaleColor(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    return `#${gray.toString(16).padStart(2, '0')}${gray.toString(16).padStart(2, '0')}${gray.toString(16).padStart(2, '0')}`;
  }
  
  // Reset to Original
  function resetToOriginal() {
    detectedColors.forEach(colorObj => {
      colorObj.current = colorObj.normalized;
    });
    
    currentSvg = originalSvg;
    renderColorList();
    updatePreview(currentSvg);
    showToast('Reset to original', 'success');
  }
  
  // Copy to Clipboard
  async function copySvgToClipboard() {
    try {
      await navigator.clipboard.writeText(currentSvg);
      showToast('SVG copied to clipboard', 'success');
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = currentSvg;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('SVG copied to clipboard', 'success');
    }
  }
  
  // Download SVG
  function downloadSvg() {
    const blob = new Blob([currentSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edited-svg.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('SVG downloaded', 'success');
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
