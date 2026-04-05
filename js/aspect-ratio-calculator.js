(function() {
  var box = document.getElementById('ratio-box');
  var codeOutput = document.getElementById('code-output');
  
  function setRatio(w, h) {
    document.getElementById('ctrl-w').value = w * 120;
    document.getElementById('ctrl-h').value = h * 120;
    calc();
  }
  
  function calc() {
    var w = parseInt(document.getElementById('ctrl-w').value) || 1;
    var h = parseInt(document.getElementById('ctrl-h').value) || 1;
    
    var gcd = function(a, b) { return b ? gcd(b, a % b) : a; };
    var d = gcd(w, h);
    var ratioW = w / d;
    var ratioH = h / d;
    
    document.getElementById('result-ratio').textContent = ratioW + ':' + ratioH;
    document.getElementById('result-pixels').textContent = (w * h).toLocaleString();
    
    var maxDisplaySize = 300;
    var displayW, displayH;
    
    if (w > h) {
      displayW = maxDisplaySize;
      displayH = (h / w) * maxDisplaySize;
    } else {
      displayH = maxDisplaySize;
      displayW = (w / h) * maxDisplaySize;
    }
    
    box.style.width = displayW + 'px';
    box.style.height = displayH + 'px';
    box.textContent = ratioW + ':' + ratioH;
    
    generateCode(ratioW, ratioH);
  }
  
  function resize() {
    var origW = parseInt(document.getElementById('ctrl-w').value) || 1;
    var origH = parseInt(document.getElementById('ctrl-h').value) || 1;
    var newW = parseInt(document.getElementById('new-w').value) || 1;
    
    var newH = Math.round((origH / origW) * newW);
    document.getElementById('new-h').textContent = newH + 'px';
  }
  
  function generateCode(rw, rh) {
    var css = '.aspect-container {\n' +
      '  aspect-ratio: ' + rw + ' / ' + rh + '; /* Modern way */\n' +
      '  width: 100%;\n' +
      '}\n' +
      '\n' +
      '/* Fallback for older browsers */\n' +
      '.aspect-container::before {\n' +
      '  content: "";\n' +
      '  display: block;\n' +
      '  padding-top: ' + ((rh / rw) * 100) + '%;\n' +
      '}';
    codeOutput.textContent = css;
  }
  
  function copyCode() {
    var text = codeOutput.textContent;
    navigator.clipboard.writeText(text);
    if (window.Devpalettes && window.Devpalettes.Toast) {
      window.Devpalettes.Toast.show('Code Copied!', 'success');
    }
  }
  
  window.setRatio = setRatio;
  window.calc = calc;
  window.resize = resize;
  window.copyCode = copyCode;
  
  calc();
})();
