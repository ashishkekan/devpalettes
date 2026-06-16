(function() {
  var inputArea = document.getElementById('input-area');
  var resultsSection = document.getElementById('results-section');
  var resultsGrid = document.getElementById('results-grid');
  var noResults = document.getElementById('no-results');
  var countBadge = document.getElementById('count-badge');
  var resultsStatus = document.getElementById('results-status');

  window.clearInput = function() {
    inputArea.value = '';
    resultsSection.classList.add('hidden');
    if (resultsStatus) resultsStatus.textContent = 'Input cleared.';
  };

  window.checkColorDifference = function() {
    var text = inputArea.value;

    // Regex to find HEX colors (#RGB or #RRGGBB)
    var hexRegex = /#([A-Fa-f0-9]{3}){1,2}\b/g;
    var matches = text.match(hexRegex);

    if (!matches || matches.length === 0) {
       resultsSection.classList.remove('hidden');
       resultsGrid.innerHTML = '';
       noResults.classList.remove('hidden');
       countBadge.textContent = '0';
       noResults.innerHTML = '<i class="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-3" aria-hidden="true"></i><p class="text-slate-500 font-medium">No valid HEX colors found.</p>';
       if (resultsStatus) resultsStatus.textContent = 'No valid HEX colors found in the input.';
       return;
    }

    // Normalize colors (uppercase #FF00FF)
    var normalizedColors = matches.map(function(c) { return c.toUpperCase(); });

    // Count occurrences and track differences
    var colorData = {};
    normalizedColors.forEach(function(color) {
       if (!colorData[color]) {
           colorData[color] = { count: 0, diff: 0 };
       }
       colorData[color].count++;
    });

    // Calculate difference from the first color (Base Color)
    var baseColor = normalizedColors[0];
    var results = Object.entries(colorData).map(function(entry) {
        var color = entry[0];
        var data = entry[1];
        if (color === baseColor) {
            data.diff = 0;
        } else {
            data.diff = getColorDifference(baseColor, color);
        }
        return { color: color, count: data.count, diff: data.diff };
    }).sort(function(a, b) { return a.diff - b.diff; }); // Sort by difference ascending

    // Update UI
    resultsSection.classList.remove('hidden');

    if (results.length <= 1) {
       resultsGrid.innerHTML = '';
       noResults.classList.remove('hidden');
       noResults.innerHTML = '<i class="fas fa-check-circle text-4xl text-emerald-500 mb-3" aria-hidden="true"></i><p class="text-slate-500 font-medium">Add more colors to compare differences!</p>';
       countBadge.textContent = '0';
       if (resultsStatus) resultsStatus.textContent = 'Only one unique color found. Add more colors to compare.';
    } else {
       noResults.classList.add('hidden');
       countBadge.textContent = results.length;
       resultsGrid.innerHTML = '';

       results.forEach(function(item) {
          var textColor = getContrastYIQ(item.color);
          var card = document.createElement('div');
          card.className = "color-result-card p-3 rounded-lg flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform";
          card.setAttribute('role', 'button');
          card.setAttribute('tabindex', '0');
          card.setAttribute('aria-label', item.color + ', difference ' + item.diff + '. Click to copy.');
          card.style.backgroundColor = item.color;
          card.style.color = textColor;

          var diffLabel = '';
          if (item.diff === 0) {
              diffLabel = item.count > 1 ? 'Identical Match' : 'Base Color';
          } else {
              diffLabel = 'Diff: ' + item.diff;
          }

          card.innerHTML =
            '<div class="flex-1">' +
               '<div class="font-mono text-xs font-bold">' + item.color + '</div>' +
               '<div class="text-xs opacity-80">' + diffLabel + '</div>' +
            '</div>' +
            '<i class="fas fa-copy text-xs opacity-70" aria-hidden="true"></i>';

          // Click handler
          card.addEventListener('click', function() {
             copyToClipboard(item.color);
          });

          // Keyboard handler
          card.addEventListener('keydown', function(e) {
             if (e.key === 'Enter' || e.key === ' ') {
               e.preventDefault();
               copyToClipboard(item.color);
             }
          });

          resultsGrid.appendChild(card);
       });

       if (resultsStatus) {
         resultsStatus.textContent = results.length + ' colors compared. Differences range from ' + results[0].diff + ' to ' + results[results.length - 1].diff + '.';
       }
    }
  };

  // Clipboard helper with fallback
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        announceCopy(text);
      }).catch(function() {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    try {
      document.execCommand('copy');
      announceCopy(text);
    } catch (err) {
      // Silent fail
    }
    document.body.removeChild(textarea);
  }

  function announceCopy(color) {
    if (window.Devpalettes && window.Devpalettes.Toast) {
      window.Devpalettes.Toast.show('Copied ' + color, 'success');
    }
  }

  // Helper: HEX to RGB
  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
  }

  // Helper: Contrast text color
  function getContrastYIQ(hex) {
    var rgb = hexToRgb(hex);
    var yiq = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#FFFFFF';
  }

  // Helper: Euclidean distance in RGB space
  function getColorDifference(c1, c2) {
    var rgb1 = hexToRgb(c1);
    var rgb2 = hexToRgb(c2);
    return Math.round(Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    ));
  }

  // Allow Enter key in textarea to NOT submit (just newline), but allow Ctrl+Enter to trigger check
  inputArea.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      checkColorDifference();
    }
  });

})();
