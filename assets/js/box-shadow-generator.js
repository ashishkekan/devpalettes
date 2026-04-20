// assets/js/box-shadow-generator.js
(function() {
  var preview = document.getElementById('shadow-preview');
  var codeOutput = document.getElementById('code-output');
  
  window.updateShadow = function() {
      var x = document.getElementById('sh-x').value;
      var y = document.getElementById('sh-y').value;
      var blur = document.getElementById('sh-blur').value;
      var spread = document.getElementById('sh-spread').value;
      var color = document.getElementById('sh-color').value;
      var op = document.getElementById('sh-op').value / 100;
      var inset = document.getElementById('sh-inset').checked;
      
      document.getElementById('v-x').textContent = x;
      document.getElementById('v-y').textContent = y;
      document.getElementById('v-blur').textContent = blur;
      document.getElementById('v-spread').textContent = spread;
      document.getElementById('v-op').textContent = op.toFixed(2);
      
      var r = parseInt(color.slice(1, 3), 16);
      var g = parseInt(color.slice(3, 5), 16);
      var b = parseInt(color.slice(5, 7), 16);
      var rgba = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + op.toFixed(2) + ')';
      
      var insetStr = inset ? 'inset ' : '';
      var shadowVal = insetStr + x + 'px ' + y + 'px ' + blur + 'px ' + spread + 'px ' + rgba;
      
      preview.style.boxShadow = shadowVal;
      
      generateCode(shadowVal);
  };
  
  function generateCode(val) {
      var css = '.shadow-box {\n  box-shadow: ' + val + ';\n}';
      codeOutput.value = css;
  }
  
  window.copyCode = function() {
      navigator.clipboard.writeText(codeOutput.value);
      if(window.Devpalettes && window.Devpalettes.Toast) window.Devpalettes.Toast.show('CSS Copied!', 'success');
  };
  
  updateShadow();
  
})();
