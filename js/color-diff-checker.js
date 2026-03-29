(function() {
  const inputArea = document.getElementById('input-area');
  const resultsSection = document.getElementById('results-section');
  const resultsGrid = document.getElementById('results-grid');
  const noResults = document.getElementById('no-results');
  const countBadge = document.getElementById('count-badge');
  
  window.clearInput = function() {
    inputArea.value = '';
    resultsSection.classList.add('hidden');
  };
  
  window.checkColorDifference = function() {
    const text = inputArea.value;
    
    // Regex to find HEX colors (#RGB or #RRGGBB)
    const hexRegex = /#([A-Fa-f0-9]{3}){1,2}\b/g;
    const matches = text.match(hexRegex);
    
    if (!matches || matches.length === 0) {
       resultsSection.classList.remove('hidden');
       resultsGrid.innerHTML = '';
       noResults.classList.remove('hidden');
       countBadge.textContent = '0';
       noResults.innerHTML = `<i class="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-3"></i><p class="text-slate-500 font-medium">No valid HEX colors found.</p>`;
       return;
    }
    
    // Normalize colors (uppercase #FF00FF)
    const normalizedColors = matches.map(c => c.toUpperCase());
    
    // Count occurrences and track differences
    const colorData = {};
    normalizedColors.forEach(color => {
       if (!colorData[color]) {
           colorData[color] = { count: 0, diff: 0 };
       }
       colorData[color].count++;
    });
    
    // Calculate difference from the first color (Base Color)
    const baseColor = normalizedColors[0];
    const results = Object.entries(colorData).map(([color, data]) => {
        if (color === baseColor) {
            data.diff = 0;
        } else {
            data.diff = getColorDifference(baseColor, color);
        }
        return { color, count: data.count, diff: data.diff };
    }).sort((a, b) => a.diff - b.diff); // Sort by difference ascending
    
    // Update UI
    resultsSection.classList.remove('hidden');
    
    if (results.length <= 1) {
       resultsGrid.innerHTML = '';
       noResults.classList.remove('hidden');
       noResults.innerHTML = `<i class="fas fa-check-circle text-4xl text-emerald-500 mb-3"></i><p class="text-slate-500 font-medium">Add more colors to compare differences!</p>`;
       countBadge.textContent = '0';
    } else {
       noResults.classList.add('hidden');
       countBadge.textContent = results.length;
       resultsGrid.innerHTML = '';
       
       results.forEach((item) => {
          const textColor = getContrastYIQ(item.color);
          const card = document.createElement('div');
          card.className = "p-3 rounded-lg flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform";
          card.style.backgroundColor = item.color;
          card.style.color = textColor;
          
          let diffLabel = '';
          if (item.diff === 0) {
              diffLabel = item.count > 1 ? 'Identical Match' : 'Base Color';
          } else {
              diffLabel = 'Diff: ' + item.diff;
          }
          
          card.innerHTML = `
            <div class="flex-1">
               <div class="font-mono text-xs font-bold">${item.color}</div>
               <div class="text-xs opacity-80">${diffLabel}</div>
            </div>
            <i class="fas fa-copy text-xs opacity-70"></i>
          `;
          
          card.onclick = () => {
             navigator.clipboard.writeText(item.color);
             if(window.Devpalettes && window.Devpalettes.Toast) {
                window.Devpalettes.Toast.show(`Copied ${item.color}`, 'success');
             }
          };
          
          resultsGrid.appendChild(card);
       });
    }
  };
  
  // Helper: Contrast
  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    if(hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
  }
  
  function getContrastYIQ(hex) {
    const rgb = hexToRgb(hex);
    const yiq = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#FFFFFF';
  }

  // Helper: Simple Euclidean distance in RGB space
  function getColorDifference(c1, c2) {
    const rgb1 = hexToRgb(c1);
    const rgb2 = hexToRgb(c2);
    return Math.round(Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) + 
      Math.pow(rgb1.g - rgb2.g, 2) + 
      Math.pow(rgb1.b - rgb2.b, 2)
    ));
  }
  
})();
