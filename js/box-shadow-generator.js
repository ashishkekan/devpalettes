// assets/js/box-shadow-generator.js
(function() {
  'use strict';

  var preview = document.getElementById('shadow-preview');
  var codeOutput = document.getElementById('code-output');
  var codeStatus = document.getElementById('code-status');
  var ariaAnnouncer = document.getElementById('aria-announcer');

  // Bind both input and change events for live slider feedback
  var controls = ['sh-x', 'sh-y', 'sh-blur', 'sh-spread', 'sh-color', 'sh-op', 'sh-inset'];
  controls.forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', updateShadow);
    el.addEventListener('change', updateShadow);
  });

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
      preview.setAttribute('aria-label', 'Box shadow preview: ' + shadowVal);
      
      generateCode(shadowVal);

      // Announce changes to screen readers (debounced)
      clearTimeout(window._shadowAnnounceTimer);
      window._shadowAnnounceTimer = setTimeout(function() {
        if (ariaAnnouncer) {
          ariaAnnouncer.textContent = 'Shadow updated: X ' + x + ', Y ' + y + ', blur ' + blur + ', spread ' + spread + ', opacity ' + op.toFixed(2);
        }
      }, 300);
  };
  
  function generateCode(val) {
      var css = '.shadow-box {\n  box-shadow: ' + val + ';\n}';
      codeOutput.value = css;
  }
  
  window.copyCode = function() {
      var text = codeOutput.value;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
          announceCopySuccess();
        }).catch(function() {
          fallbackCopy(text);
        });
      } else {
        fallbackCopy(text);
      }
  };

  function fallbackCopy(text) {
    codeOutput.select();
    try {
      document.execCommand('copy');
      announceCopySuccess();
    } catch(e) {
      if (codeStatus) codeStatus.textContent = 'Copy failed — please select and copy manually';
    }
  }

  function announceCopySuccess() {
    if (window.Devpalettes && window.Devpalettes.Toast) {
      window.Devpalettes.Toast.show('CSS Copied!', 'success');
    }
    if (codeStatus) {
      codeStatus.textContent = 'CSS code copied to clipboard';
      setTimeout(function() { codeStatus.textContent = ''; }, 3000);
    }
  }

  // Bind copy button (remove inline onclick dependency)
  var copyBtn = document.getElementById('copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', window.copyCode);
    copyBtn.removeAttribute('onclick');
  }

  // Keyboard shortcut: Ctrl/Cmd+C when textarea is focused
  if (codeOutput) {
    codeOutput.addEventListener('focus', function() {
      this.select();
    });
  }

  // Initialize
  updateShadow();
  
})();
