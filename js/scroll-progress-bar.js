(function() {
  var previewContainer = document.getElementById('preview-container');
  var previewBar = document.getElementById('preview-bar');
  var codeOutput = document.getElementById('code-output');
  var simulateValue = document.getElementById('simulate-value');
  var simulateSlider = document.getElementById('ctrl-simulate');
  
  window.updateBar = function() {
    var pos = document.getElementById('ctrl-pos').value;
    var height = document.getElementById('ctrl-height').value;
    var color = document.getElementById('ctrl-color').value;
    var bg = document.getElementById('ctrl-bg').value;
    var progress = document.getElementById('ctrl-simulate').value;
    
    // Update preview
    previewContainer.style.top = pos === 'top' ? '0' : 'auto';
    previewContainer.style.bottom = pos === 'bottom' ? '0' : 'auto';
    previewContainer.style.height = height;
    previewContainer.style.backgroundColor = bg;
    
    previewBar.style.width = progress + '%';
    previewBar.style.backgroundColor = color;
    
    // Update accessibility attributes
    simulateSlider.setAttribute('aria-valuenow', progress);
    simulateValue.textContent = progress + '%';
    
    // Generate code
    var css = '/* CSS */\n#progress-container {\n  position: fixed;\n  ' + pos + ': 0;\n  left: 0;\n  width: 100%;\n  height: ' + height + ';\n  background-color: ' + bg + ';\n  z-index: 9999;\n  transition: opacity 0.3s;\n}\n\n#progress-bar {\n  height: 100%;\n  width: 0%;\n  background-color: ' + color + ';\n}';
    
    var js = '/* JavaScript */\nconst progressBar = document.getElementById(\'progress-bar\');\nwindow.addEventListener(\'scroll\', () => {\n  const scrollTop = window.scrollY;\n  const docHeight = document.body.scrollHeight - window.innerHeight;\n  const scrollPercent = (scrollTop / docHeight) * 100;\n  progressBar.style.width = scrollPercent + \'%\';\n});';
    
    codeOutput.textContent = '<!-- HTML -->\n<div id="progress-container"><div id="progress-bar"></div></div>\n\n ' + css + '\n\n ' + js;
  };
  
  window.copyCode = function() {
    var text = codeOutput.textContent;
    var copyBtn = document.querySelector('.copy-btn');
    
    navigator.clipboard.writeText(text).then(function() {
      // Visual feedback
      var originalHTML = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check mr-1" aria-hidden="true"></i>Copied!';
      copyBtn.setAttribute('aria-label', 'Code copied to clipboard');
      
      // Announce to screen readers
      codeOutput.setAttribute('aria-label', 'Code has been copied to clipboard');
      
      setTimeout(function() {
        copyBtn.innerHTML = originalHTML;
        copyBtn.setAttribute('aria-label', 'Copy generated code to clipboard');
        codeOutput.removeAttribute('aria-label');
      }, 2000);
      
      if(window.Devpalettes && window.Devpalettes.Toast) {
        window.Devpalettes.Toast.show('Code Copied!', 'success');
      }
    }).catch(function() {
      // Fallback for older browsers
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        if(window.Devpalettes && window.Devpalettes.Toast) {
          window.Devpalettes.Toast.show('Code Copied!', 'success');
        }
      } catch(e) {
        alert('Copy failed. Please select the code manually.');
      }
      document.body.removeChild(textarea);
    });
  };
  
  updateBar();
})();
