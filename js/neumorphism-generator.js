(function() {
  var preview = document.getElementById('neumo-preview');
  var previewBg = document.getElementById('preview-bg');
  var codeOutput = document.getElementById('code-output');
  
  var shape = 'rect';
  
  function setShape(s) {
    shape = s;
    var buttons = document.querySelectorAll('.shape-btn');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].classList.remove('active', 'bg-slate-500', 'text-white');
      buttons[i].setAttribute('aria-checked', 'false');
    }
    var activeBtn = document.getElementById('btn-' + s);
    if (activeBtn) {
      activeBtn.classList.add('active', 'bg-slate-500', 'text-white');
      activeBtn.setAttribute('aria-checked', 'true');
    }
    updateNeumo();
  }
  
  function adjustColor(hex, percent) {
    var num = parseInt(hex.slice(1), 16);
    var amt = Math.round(2.55 * percent);
    var R = Math.min(255, Math.max(0, (num >> 16) + amt));
    var G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
    var B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }
  
  function generateCode(bg, dist, blur, dark, light, inset, rad) {
    var insetStr = inset ? 'inset ' : '';
    var radiusCSS = shape === 'circle' ? 'border-radius: 50%;' : 'border-radius: ' + rad + 'px;';
    
    var css = '.neumorphic {\n' +
      '  background-color: ' + bg + ';\n' +
      '  ' + radiusCSS + '\n' +
      '  box-shadow: ' + insetStr + dist + 'px ' + dist + 'px ' + blur + 'px ' + dark + ',\n' +
      '              ' + insetStr + '-' + dist + 'px -' + dist + 'px ' + blur + 'px ' + light + ';\n' +
      '}';
    codeOutput.textContent = css;
  }
  
  function updateNeumo() {
    var bg = document.getElementById('ctrl-bg').value;
    var dist = document.getElementById('ctrl-dist').value;
    var blur = document.getElementById('ctrl-blur').value;
    var int = document.getElementById('ctrl-int').value;
    var rad = document.getElementById('ctrl-rad').value;
    var inset = document.getElementById('ctrl-inset').checked;
    
    document.getElementById('val-dist').textContent = dist;
    document.getElementById('val-blur').textContent = blur;
    document.getElementById('val-int').textContent = int;
    document.getElementById('val-rad').textContent = rad;
    
    var darkColor = adjustColor(bg, -int);
    var lightColor = adjustColor(bg, int);
    
    previewBg.style.backgroundColor = bg;
    
    var insetStr = inset ? 'inset ' : '';
    var shadow = insetStr + dist + 'px ' + dist + 'px ' + blur + 'px ' + darkColor + ', ' + insetStr + '-' + dist + 'px -' + dist + 'px ' + blur + 'px ' + lightColor;
    
    preview.style.boxShadow = shadow;
    preview.style.backgroundColor = bg;
    
    if (shape === 'circle') {
      preview.style.borderRadius = '50%';
    } else {
      preview.style.borderRadius = rad + 'px';
    }
    
    generateCode(bg, dist, blur, darkColor, lightColor, inset, rad);
  }
  
  function copyCode() {
    var text = codeOutput.textContent;
    navigator.clipboard.writeText(text);
    if (window.Devpalettes && window.Devpalettes.Toast) {
      window.Devpalettes.Toast.show('Code Copied!', 'success');
    }
  }
  
  window.setShape = setShape;
  window.updateNeumo = updateNeumo;
  window.copyCode = copyCode;
  
  updateNeumo();
})();
