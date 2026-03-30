(function() {
  var picker = document.getElementById('base-color');
  var label = {
    '500': document.getElementById('base-label')
  };
  
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
  
  function mix(color, target, amount) {
    return {
      r: color.r + (target.r - color.r) * amount,
      g: color.g + (target.g - color.g) * amount,
      b: color.b + (target.b - color.b) * amount
    };
  }
  
  var white = { r: 255, g: 255, b: 255 };
  var black = { r: 0, g: 0, b: 0 };
  
  var shadesConfig = [
    { name: '50', mix: 0.95, target: 'white' },
    { name: '100', mix: 0.90, target: 'white' },
    { name: '200', mix: 0.75, target: 'white' },
    { name: '300', mix: 0.60, target: 'white' },
    { name: '400', mix: 0.30, target: 'white' },
    { name: '500', mix: 0, target: 'base' },
    { name: '600', mix: 0.20, target: 'black' },
    { name: '700', mix: 0.40, target: 'black' },
    { name: '800', mix: 0.60, target: 'black' },
    { name: '900', mix: 0.80, target: 'black' },
    { name: '950', mix: 0.90, target: 'black' }
  ];
  
  function updateLabel() {
    var hex = picker.value;
    if (label['500']) {
      label['500'].textContent = hex.toUpperCase();
    }
  }
  
  window.generatePalette = function() {
    var hex = picker.value;
    var baseRgb = var baseRgb || hexToRgb(hex);
    
    var container = document.getElementById('palette-container');
    container.className = 'contents grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12';
    container.innerHTML = '';
    
    var configOutput = document.getElementById('config-output');
    var configStr = "theme: {\n  extend: {\n    colors: {";
    
    shadesConfig.forEach(function(shade) {
      var mixedColor;
      if (shade.target === 'white') {
        mixedColor = mix(baseRgb, white, shade.mix);
      } else if (shade.target === 'black') {
        mixedColor = mix(baseRgb, black, shade.mix);
      } else {
        mixedColor = baseRgb;
      }
      
      var hexVal = rgbToHex(mixedColor.r, mixedColor.g, mixedColor.b);
      
      var textColor = shade.mix > 0.5 && shade.target === 'white' ? '#000' : '#fff';
      
      var card = document.createElement('div');
      card.className = "glass-card rounded-xl overflow-hidden flex flex-col justify-between h-32 cursor-pointer hover:scale-105 transition-transform";
      card.innerHTML = '<div class="flex-1 flex items-center justify-center" style="background-color: ' + hexVal + '"><span class="font-mono text-xs font-bold" style="color: ' + textColor + '">' + shade.name + '</span></div><div class="p-2 bg-white/10 text-center"><span class="text-xs font-mono">' + hexVal + '</span></div>';
      
      card.onclick = function() {
        navigator.clipboard.writeText(hexVal);
        if (window.Devpalettes && window.Devpalettes.Toast) {
          window.Devpalettes.Toast.show(hexVal + ' copied!');
        }
      };
      
      container.appendChild(card);
      
      configStr += "\n        " + shade.name + ": '" + hexVal + "',";
    });
    
    configStr += "\n      }\n    }\n  }\n}";
    configOutput.textContent = configStr;
  };
  
  window.copyConfig = function() {
    var text = document.getElementById('config-output').textContent;
    navigator.clipboard.writeText(text).then(function() {
      if (window.Devpalettes && window.Devpalettes.Toast) {
        window.Devpalettes.Toast.show('Tailwind Config Copied!', 'success');
      }
    });
  };
  
  picker.addEventListener('input', updateLabel);
  
  updateLabel();
  generatePalette();
  
})();
