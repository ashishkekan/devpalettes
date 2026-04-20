(function() {
  var wrapper = document.getElementById('border-wrapper');
  var inner = document.getElementById('border-inner');
  var codeOutput = document.getElementById('code-output');
  
  function updateBorder() {
    var start = document.getElementById('c-start').value;
    var end = document.getElementById('c-end').value;
    var bg = document.getElementById('c-bg').value;
    var w = document.getElementById('ctrl-w').value;
    var r = document.getElementById('ctrl-r').value;
    
    document.getElementById('v-w').textContent = w;
    document.getElementById('v-r').textContent = r;
    
    wrapper.style.background = 'linear-gradient(90deg, ' + start + ', ' + end + ')';
    wrapper.style.borderRadius = r + 'px';
    wrapper.style.padding = w + 'px';
    
    inner.style.backgroundColor = bg;
    inner.style.borderRadius = (r - w < 0 ? 0 : r - w) + 'px';
    
    generateCode(start, end, bg, w, r);
  }
  
  function generateCode(s, e, bg, w, r) {
    var css = '.gradient-border-box {\n' +
      '  background: linear-gradient(90deg, ' + s + ', ' + e + ');\n' +
      '  padding: ' + w + 'px;\n' +
      '  border-radius: ' + r + 'px;\n' +
      '}\n' +
      '\n' +
      '.gradient-border-inner {\n' +
      '  background: ' + bg + ';\n' +
      '  border-radius: ' + (r - 4 < 0 ? 0 : r - 4) + 'px;\n' +
      '  height: 100%;\n' +
      '  width: 100%;\n' +
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
  
  window.updateBorder = updateBorder;
  window.copyCode = copyCode;
  
  updateBorder();
})();
