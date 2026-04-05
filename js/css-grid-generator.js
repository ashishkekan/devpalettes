(function() {
  var preview = document.getElementById('grid-preview');
  var codeOutput = document.getElementById('code-output');
  
  function updateGrid() {
    var cols = document.getElementById('ctrl-cols').value;
    var rows = document.getElementById('ctrl-rows').value;
    var gap = document.getElementById('ctrl-gap').value;
    
    document.getElementById('v-cols').textContent = cols;
    document.getElementById('v-rows').textContent = rows;
    document.getElementById('v-gap').textContent = gap;
    
    preview.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
    preview.style.gridTemplateRows = 'repeat(' + rows + ', 1fr)';
    preview.style.gap = gap + 'px';
    
    var total = cols * rows;
    preview.innerHTML = '';
    for (var i = 0; i < total; i++) {
      var div = document.createElement('div');
      div.className = 'bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow';
      div.textContent = i + 1;
      preview.appendChild(div);
    }
    
    generateCode(cols, rows, gap);
  }
  
  function generateCode(c, r, g) {
    var css = '.grid-container {\n' +
      '  display: grid;\n' +
      '  grid-template-columns: repeat(' + c + ', 1fr);\n' +
      '  grid-template-rows: repeat(' + r + ', 1fr);\n' +
      '  gap: ' + g + 'px;\n' +
      '}';
    codeOutput.textContent = css;
  }
  
  function copyCode() {
    var text = codeOutput.textContent;
    navigator.clipboard.writeText(text);
    if (window.Devpalettes && window.Devpalettes.Toast) {
      window.Devpalettes.Toast.show('CSS Copied!', 'success');
    }
  }
  
  window.updateGrid = updateGrid;
  window.copyCode = copyCode;
  
  updateGrid();
})();
