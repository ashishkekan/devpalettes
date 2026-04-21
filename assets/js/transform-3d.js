(function() {
  var box = document.getElementById('box');
  var scene = document.getElementById('scene');
  var codeOutput = document.getElementById('code-output');
  
  var ctrlRx = document.getElementById('ctrl-rx');
  var ctrlRy = document.getElementById('ctrl-ry');
  var ctrlRz = document.getElementById('ctrl-rz');
  var ctrlP = document.getElementById('ctrl-p');
  var ctrlS = document.getElementById('ctrl-s');
  var ctrlTz = document.getElementById('ctrl-tz');
  var ctrlColor = document.getElementById('ctrl-color');
  var ctrlRadius = document.getElementById('ctrl-radius');
  
  var valRx = document.getElementById('val-rx');
  var valRy = document.getElementById('val-ry');
  var valRz = document.getElementById('val-rz');
  var valP = document.getElementById('val-p');
  var valS = document.getElementById('val-s');
  var valTz = document.getElementById('val-tz');
  
  var isDragging = false;
  var startX, startY;
  
  function updateTransform() {
    var rx = ctrlRx.value;
    var ry = ctrlRy.value;
    var rz = ctrlRz.value;
    var p = ctrlP.value;
    var s = ctrlS.value;
    var tz = ctrlTz.value;
    var color = ctrlColor.value;
    var radius = ctrlRadius.value;
    
    valRx.textContent = rx + '°';
    valRy.textContent = ry + '°';
    valRz.textContent = rz + '°';
    valP.textContent = p + 'px';
    valS.textContent = s;
    valTz.textContent = tz + 'px';
    
    scene.style.perspective = p + 'px';
    box.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) rotateZ(' + rz + 'deg) translateZ(' + tz + 'px) scale(' + s + ')';
    box.style.backgroundColor = color;
    box.style.borderRadius = radius + '%';
    
    generateCode();
  }
  
  function generateCode() {
    var rx = ctrlRx.value;
    var ry = ctrlRy.value;
    var rz = ctrlRz.value;
    var p = ctrlP.value;
    var s = ctrlS.value;
    var tz = ctrlTz.value;
    var color = ctrlColor.value;
    var radius = ctrlRadius.value;
    
    var css = '.parent {\n' +
      '  perspective: ' + p + 'px;\n' +
      '}\n' +
      '\n' +
      '.box {\n' +
      '  width: 150px;\n' +
      '  height: 150px;\n' +
      '  background-color: ' + color + ';\n' +
      '  border-radius: ' + radius + '%;\n' +
      '  transform: rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) rotateZ(' + rz + 'deg) translateZ(' + tz + 'px) scale(' + s + ');\n' +
      '}';
    codeOutput.textContent = css;
  }
  
  function setPreset(rx, ry, rz, p, s, tz) {
    ctrlRx.value = rx;
    ctrlRy.value = ry;
    ctrlRz.value = rz;
    ctrlP.value = p;
    ctrlS.value = s;
    ctrlTz.value = tz;
    updateTransform();
  }
  
  box.addEventListener('mousedown', function(e) {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    box.style.cursor = 'grabbing';
  });
  
  window.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    
    var deltaX = e.clientX - startX;
    var deltaY = e.clientY - startY;
    
    ctrlRy.value = parseFloat(ctrlRy.value) + deltaX * 0.5;
    ctrlRx.value = parseFloat(ctrlRx.value) - deltaY * 0.5;
    
    ctrlRy.value = Math.min(180, Math.max(-180, ctrlRy.value));
    ctrlRx.value = Math.min(180, Math.max(-180, ctrlRx.value));
    
    startX = e.clientX;
    startY = e.clientY;
    
    updateTransform();
  });
  
  window.addEventListener('mouseup', function() {
    isDragging = false;
    box.style.cursor = 'grab';
  });
  
  var inputs = [ctrlRx, ctrlRy, ctrlRz, ctrlP, ctrlS, ctrlTz, ctrlColor, ctrlRadius];
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener('input', updateTransform);
  }
  
  function copyCode() {
    var text = codeOutput.textContent;
    navigator.clipboard.writeText(text).then(function() {
      if (window.Devpalettes && window.Devpalettes.Toast) {
        window.Devpalettes.Toast.show('CSS Copied!', 'success');
      } else {
        alert('CSS Copied!');
      }
    });
  }
  
  window.updateTransform = updateTransform;
  window.setPreset = setPreset;
  window.copyCode = copyCode;
  
  updateTransform();
  
})();
