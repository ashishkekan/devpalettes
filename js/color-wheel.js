// color-wheel.js
(function() {
  'use strict';

  // --- Color Math Utilities ---
  var ColorMath = {
    hslToRgb: function(h, s, l) {
      s /= 100; l /= 100;
      var k = function(n) { return (n + h / 30) % 12; };
      var a = s * Math.min(l, 1 - l);
      var f = function(n) { return l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); };
      return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
    },
    rgbToHex: function(r, g, b) {
      return '#' + [r, g, b].map(function(x) { return x.toString(16).padStart(2, '0'); }).join('').toUpperCase();
    },
    rgbToHsl: function(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h, s, l = (max + min) / 2;
      if (max === min) { h = s = 0; } 
      else {
        var d = max - min;
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
  var canvas = document.getElementById('color-wheel-canvas');
  var ctx = canvas.getContext('2d');
  var radius = canvas.width / 2;
  var centerX = radius;
  var centerY = radius;
  
  var currentHue = 180;
  var currentSat = 60;
  var currentLit = 50;
  var currentMode = 'analogous';
  var isDragging = false;
  var wheelAnnouncer = document.getElementById('wheel-announcer');

  // Draw Wheel
  function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    var hueGrad = ctx.createConicGradient(0, centerX, centerY);
    for(var i = 0; i <= 360; i += 30) { hueGrad.addColorStop(i/360, 'hsl(' + i + ', 100%, 50%)'); }
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = hueGrad;
    ctx.fill();
    
    var satGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    satGrad.addColorStop(0, 'rgba(255,255,255,1)');
    satGrad.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = satGrad;
    ctx.fill();
  }

  // --- Interaction Logic ---
  function updateColor(e) {
    var rect = canvas.getBoundingClientRect();
    var x, y;
    
    if (e.touches) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    var dx = x - centerX;
    var dy = y - centerY;
    var dist = Math.sqrt(dx*dx + dy*dy);
    
    if (dist > radius) dist = radius;
    
    var angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angle < 0) angle += 360;
    
    currentHue = Math.round(angle);
    currentSat = Math.round((dist / radius) * 100);
    
    updateUI();
  }

  function updateUI() {
    var rgb = ColorMath.hslToRgb(currentHue, currentSat, currentLit);
    var r = rgb[0], g = rgb[1], b = rgb[2];
    var hex = ColorMath.rgbToHex(r, g, b);
    
    document.getElementById('preview-swatch').style.backgroundColor = hex;
    document.getElementById('base-hex').textContent = hex;
    document.getElementById('base-rgb').textContent = r + ', ' + g + ', ' + b;
    document.getElementById('base-hsl').textContent = currentHue + '\u00B0, ' + currentSat + '%, ' + currentLit + '%';
    
    var marker = document.getElementById('marker-base');
    var angleRad = currentHue * Math.PI / 180;
    var distPx = (currentSat / 100) * radius;
    marker.style.left = (centerX + distPx * Math.cos(angleRad)) + 'px';
    marker.style.top = (centerY + distPx * Math.sin(angleRad)) + 'px';
    marker.style.backgroundColor = hex;
    
    generateHarmonies();
  }

  function announceColor() {
    if (wheelAnnouncer) {
      var rgb = ColorMath.hslToRgb(currentHue, currentSat, currentLit);
      var hex = ColorMath.rgbToHex(rgb[0], rgb[1], rgb[2]);
      wheelAnnouncer.textContent = 'Base color: ' + hex + ', hue ' + currentHue + ' degrees, saturation ' + currentSat + '%, lightness ' + currentLit + '%';
    }
  }

  var announceTimer = null;
  function debouncedAnnounce() {
    clearTimeout(announceTimer);
    announceTimer = setTimeout(announceColor, 200);
  }

  function generateHarmonies() {
    var harmonies = [];
    
    var createColor = function(h, s, l) {
      var rgb = ColorMath.hslToRgb(h, s, l);
      return {
        hex: ColorMath.rgbToHex(rgb[0], rgb[1], rgb[2]),
        r: rgb[0], g: rgb[1], b: rgb[2],
        h: h, s: s, l: l
      };
    };

    switch(currentMode) {
      case 'analogous':
        harmonies.push(createColor(currentHue, currentSat, currentLit));
        harmonies.push(createColor((currentHue + 30) % 360, currentSat, currentLit));
        harmonies.push(createColor((currentHue + 60) % 360, currentSat, currentLit));
        harmonies.push(createColor((currentHue - 30 + 360) % 360, currentSat, currentLit));
        break;
      case 'monochromatic':
        harmonies.push(createColor(currentHue, currentSat, currentLit));
        harmonies.push(createColor(currentHue, Math.max(0, currentSat - 20), Math.min(100, currentLit + 10)));
        harmonies.push(createColor(currentHue, Math.max(0, currentSat - 40), Math.max(0, currentLit - 10)));
        harmonies.push(createColor(currentHue, currentSat, Math.min(100, currentLit + 20)));
        break;
      case 'triad':
        harmonies.push(createColor(currentHue, currentSat, currentLit));
        harmonies.push(createColor((currentHue + 120) % 360, currentSat, currentLit));
        harmonies.push(createColor((currentHue + 240) % 360, currentSat, currentLit));
        break;
      case 'complementary':
        harmonies.push(createColor(currentHue, currentSat, currentLit));
        harmonies.push(createColor((currentHue + 180) % 360, currentSat, currentLit));
        harmonies.push(createColor(currentHue, Math.max(0, currentSat - 20), Math.min(100, currentLit + 10)));
        harmonies.push(createColor((currentHue + 180) % 360, Math.max(0, currentSat - 20), Math.min(100, currentLit + 10)));
        break;
      case 'compound':
        harmonies.push(createColor(currentHue, currentSat, currentLit));
        harmonies.push(createColor((currentHue + 30) % 360, currentSat, currentLit));
        harmonies.push(createColor((currentHue + 180) % 360, currentSat, currentLit));
        harmonies.push(createColor((currentHue + 210) % 360, currentSat, currentLit));
        break;
      case 'shades':
        harmonies.push(createColor(currentHue, currentSat, currentLit));
        harmonies.push(createColor(currentHue, currentSat, Math.max(0, currentLit - 15)));
        harmonies.push(createColor(currentHue, currentSat, Math.min(100, currentLit + 15)));
        harmonies.push(createColor(currentHue, currentSat, Math.max(0, currentLit - 30)));
        break;
    }

    var container = document.getElementById('scheme-output');
    container.innerHTML = '';
    
    harmonies.forEach(function(c) {
      var div = document.createElement('div');
      div.setAttribute('role', 'listitem');
      div.className = 'color-row';
      div.innerHTML =
        '<div class="w-10 h-10 rounded-lg shadow" style="background-color: ' + c.hex + '" aria-hidden="true"></div>' +
        '<div class="text-xs font-mono text-slate-600 dark:text-slate-400">' +
          '<div class="font-bold text-slate-900 dark:text-white">' + c.hex + '</div>' +
          '<div class="opacity-70">' + c.r + ', ' + c.g + ', ' + c.b + '</div>' +
        '</div>' +
        '<button class="copy-btn" data-scheme-hex="' + c.hex + '" aria-label="Copy ' + c.hex + '">Copy</button>';
      container.appendChild(div);
    });

    debouncedAnnounce();
  }
  
  // Clipboard helper with fallback
  function copyToClipboard(text, message) {
    var toast = (window.Devpalettes && window.Devpalettes.Toast) ? window.Devpalettes.Toast : null;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        if (toast) toast.show(message || (text + ' Copied!'), 'success');
      }).catch(function() {
        fallbackCopy(text, message, toast);
      });
    } else {
      fallbackCopy(text, message, toast);
    }
  }

  function fallbackCopy(text, message, toast) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      if (toast) toast.show(message || (text + ' Copied!'), 'success');
    } catch(e) {}
    document.body.removeChild(ta);
  }

  // --- Event Listeners ---
  
  // Mouse Events
  canvas.addEventListener('mousedown', function(e) { isDragging = true; updateColor(e); });
  window.addEventListener('mousemove', function(e) { if(isDragging) updateColor(e); });
  window.addEventListener('mouseup', function() { isDragging = false; });
  
  // Touch Events
  canvas.addEventListener('touchstart', function(e) { isDragging = true; updateColor(e); e.preventDefault(); }, {passive: false});
  window.addEventListener('touchmove', function(e) { if(isDragging) updateColor(e); }, {passive: false});
  window.addEventListener('touchend', function() { isDragging = false; });

  // Keyboard Events for color wheel accessibility
  canvas.addEventListener('keydown', function(e) {
    var step = e.shiftKey ? 10 : 5;
    var handled = true;
    
    switch(e.key) {
      case 'ArrowLeft':
        currentHue = (currentHue - step + 360) % 360;
        break;
      case 'ArrowRight':
        currentHue = (currentHue + step) % 360;
        break;
      case 'ArrowUp':
        currentSat = Math.min(100, currentSat + step);
        e.preventDefault(); // Prevent page scroll
        break;
      case 'ArrowDown':
        currentSat = Math.max(0, currentSat - step);
        e.preventDefault();
        break;
      default:
        handled = false;
    }
    
    if (handled) {
      e.preventDefault();
      updateUI();
    }
  });

  // Harmony Buttons
  document.querySelectorAll('.harmony-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.harmony-btn').forEach(function(b) {
        b.classList.remove('active', 'bg-emerald-500', 'text-white', 'border-emerald-500');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active', 'bg-emerald-500', 'text-white', 'border-emerald-500');
      btn.setAttribute('aria-pressed', 'true');
      currentMode = btn.dataset.mode;
      generateHarmonies();
    });
  });
  
  // Lightness Slider
  document.getElementById('lightness-slider').addEventListener('input', function(e) {
    currentLit = parseInt(e.target.value);
    updateUI();
  });

  // Save Button (Export + Copy JSON)
  document.getElementById('save-scheme-btn').addEventListener('click', function() {
    var colors = [];

    document.querySelectorAll('#scheme-output .color-row').forEach(function(row) {
      var hex = row.querySelector('.font-bold').textContent.trim();
      var rgbText = row.querySelector('.opacity-70').textContent.trim();
      var rgbParts = rgbText.split(',').map(function(v) { return parseInt(v.trim()); });

      var hsl = ColorMath.rgbToHsl(rgbParts[0], rgbParts[1], rgbParts[2]);

      colors.push({
        hex: hex,
        rgb: { r: rgbParts[0], g: rgbParts[1], b: rgbParts[2] },
        hsl: { h: hsl[0], s: hsl[1], l: hsl[2] }
      });
    });

    var jsonData = JSON.stringify(colors, null, 2);

    copyToClipboard(jsonData, 'Color scheme exported & copied!');

    var blob = new Blob([jsonData], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'color-scheme.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Base color copy buttons (event delegation)
  document.querySelectorAll('.copy-btn[data-copy]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var type = btn.getAttribute('data-copy');
      var value = '';

      if (type === 'hex') {
        value = document.getElementById('base-hex').textContent;
      } else if (type === 'rgb') {
        value = document.getElementById('base-rgb').textContent;
      } else if (type === 'hsl') {
        value = document.getElementById('base-hsl').textContent;
      }

      copyToClipboard(value, value + ' Copied!');
    });
  });

  // Scheme color copy buttons (event delegation for dynamic content)
  document.getElementById('scheme-output').addEventListener('click', function(e) {
    var btn = e.target.closest('[data-scheme-hex]');
    if (btn) {
      var hex = btn.getAttribute('data-scheme-hex');
      copyToClipboard(hex, hex + ' Copied!');
    }
  });

  // Copy link button
  var copyLinkBtn = document.getElementById('copy-link-btn');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', function() {
      var url = window.location.href;
      copyToClipboard(url, 'Link copied to clipboard!');
    });
  }

  // Init
  drawWheel();
  updateUI();

})();
