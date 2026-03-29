// js/border-radius-generator.js
(function() {
  var preview = document.getElementById('shape-preview');
  var codeOutput = document.getElementById('code-output');
  
  window.updateRadius = function() {
      var tl = document.getElementById('r-tl').value;
      var tr = document.getElementById('r-tr').value;
      var br = document.getElementById('r-br').value;
      var bl = document.getElementById('r-bl').value;
      var size = document.getElementById('r-size').value;
      var color = document.getElementById('r-color').value;
      
      document.getElementById('v-tl').textContent = tl;
      document.getElementById('v-tr').textContent = tr;
      document.getElementById('v-br').textContent = br;
      document.getElementById('v-bl').textContent = bl;
      document.getElementById('v-size').textContent = size;
      
      var radiusVal = tl + '% ' + tr + '% ' + br + '% ' + bl + '%';
      
      preview.style.width = size + 'px';
      preview.style.height = size + 'px';
      preview.style.backgroundColor = color;
      preview.style.borderRadius = radiusVal;
      
      generateCode(radiusVal);
  };
  
  window.setPreset = function(tl, tr, br, bl) {
      document.getElementById('r-tl').value = tl;
      document.getElementById('r-tr').value = tr;
      document.getElementById('r-br').value = br;
      document.getElementById('r-bl').value = bl;
      updateRadius();
  };
  
  window.randomShape = function() {
      var r = function() { return Math.floor(Math.random() * 100); };
      setPreset(r(), r(), r(), r());
  };
  
  function generateCode(rad) {
      var css = '.shape {\n  width: 200px;\n  height: 200px;\n  background: #333; /* Your color */\n  border-radius: ' + rad + ';\n}';
      codeOutput.value = css;
  }
  
  window.copyCode = function() {
      navigator.clipboard.writeText(codeOutput.value);
      if(window.Devpalettes && window.Devpalettes.Toast) window.Devpalettes.Toast.show('CSS Copied!', 'success');
  };
  
  updateRadius();
  
})();
