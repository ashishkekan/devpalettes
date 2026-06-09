(function() {
  var box = document.getElementById('box');
  var scene = document.getElementById('scene');
  var codeOutput = document.getElementById('code-output');
  var copyStatus = document.getElementById('copy-status');

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
  var startX = 0, startY = 0;

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

  // --- Mouse Drag ---
  box.addEventListener('mousedown', function(e) {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    box.style.cursor = 'grabbing';
    e.preventDefault();
  });

  window.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    var deltaX = e.clientX - startX;
    var deltaY = e.clientY - startY;

    ctrlRy.value = Math.min(180, Math.max(-180, parseFloat(ctrlRy.value) + deltaX * 0.5));
    ctrlRx.value = Math.min(180, Math.max(-180, parseFloat(ctrlRx.value) - deltaY * 0.5));

    startX = e.clientX;
    startY = e.clientY;
    updateTransform();
  });

  window.addEventListener('mouseup', function() {
    if (isDragging) {
      isDragging = false;
      box.style.cursor = 'grab';
    }
  });

  // --- Touch Drag ---
  box.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchmove', function(e) {
    if (!isDragging || e.touches.length !== 1) return;
    var deltaX = e.touches[0].clientX - startX;
    var deltaY = e.touches[0].clientY - startY;

    ctrlRy.value = Math.min(180, Math.max(-180, parseFloat(ctrlRy.value) + deltaX * 0.5));
    ctrlRx.value = Math.min(180, Math.max(-180, parseFloat(ctrlRx.value) - deltaY * 0.5));

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    updateTransform();
  }, { passive: true });

  window.addEventListener('touchend', function() {
    isDragging = false;
  });

  // --- Slider Input ---
  var inputs = [ctrlRx, ctrlRy, ctrlRz, ctrlP, ctrlS, ctrlTz, ctrlColor, ctrlRadius];
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener('input', updateTransform);
  }

  // --- Copy ---
  function copyCode() {
    var text = codeOutput.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        announceCopy(true);
      }).catch(function() {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    try {
      document.execCommand('copy');
      announceCopy(true);
    } catch (err) {
      announceCopy(false);
    }
    document.body.removeChild(textarea);
  }

  function announceCopy(success) {
    if (success) {
      if (window.Devpalettes && window.Devpalettes.Toast) {
        window.Devpalettes.Toast.show('CSS Copied!', 'success');
      }
      if (copyStatus) {
        copyStatus.textContent = 'CSS code copied to clipboard';
      }
    } else {
      if (copyStatus) {
        copyStatus.textContent = 'Failed to copy. Please select and copy the code manually.';
      }
    }
    if (copyStatus) {
      setTimeout(function() { copyStatus.textContent = ''; }, 3000);
    }
  }

  window.updateTransform = updateTransform;
  window.setPreset = setPreset;
  window.copyCode = copyCode;

  // Init
  updateTransform();

})();
