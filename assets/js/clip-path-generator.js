(function() {
  var preview = document.getElementById('clip-preview');
  var codeOutput = document.getElementById('code-output');
  
  function setShape(shape) {
    var buttons = document.querySelectorAll('.shape-btn');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].classList.remove('active', 'bg-emerald-500', 'text-white');
    }
    if (event && event.target) {
      event.target.classList.add('active', 'bg-emerald-500', 'text-white');
    }
    
    preview.style.clipPath = shape;
    generateCode(shape);
  }
  
  function generateCode(shape) {
    var css = '.clipped-element {\n  clip-path: ' + shape + ';\n}';
    codeOutput.textContent = css;
  }
  
  function copyCode() {
    var text = codeOutput.textContent;
    navigator.clipboard.writeText(text);
    if (window.Devpalettes && window.Devpalettes.Toast) {
      window.Devpalettes.Toast.show('Code Copied!', 'success');
    }
  }
  
  window.setShape = setShape;
  window.copyCode = copyCode;
  
  setShape('circle(50%)');
  
})();
