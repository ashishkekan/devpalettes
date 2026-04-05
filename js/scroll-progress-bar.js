(function() {
  var previewContainer = document.getElementById('preview-container');
  var previewBar = document.getElementById('preview-bar');
  var codeOutput = document.getElementById('code-output');
  
  window.updateBar = function() {
    var pos = document.getElementById('ctrl-pos').value;
    var height = document.getElementById('ctrl-height').value;
    var color = document.getElementById('ctrl-color').value;
    var bg = document.getElementById('ctrl-bg').value;
    var progress = document.getElementById('ctrl-simulate').value;
    
    previewContainer.style.top = pos === 'top' ? '0' : 'auto';
    previewContainer.style.bottom = pos === 'bottom' ? '0' : 'auto';
    previewContainer.style.height = height;
    previewContainer.style.backgroundColor = bg;
    
    previewBar.style.width = progress + '%';
    previewBar.style.backgroundColor = color;
    
    var css = '/* CSS */\n#progress-container {\n  position: fixed;\n  ' + pos + ': 0;\n  left: 0;\n  width: 100%;\n  height: ' + height + ';\n  background-color: ' + bg + ';\n  z-index: 9999;\n  transition: opacity 0.3s;\n}\n\n#progress-bar {\n  height: 100%;\n  width: 0%;\n  background-color: ' + color + ';\n}';
    
    var js = '/* JavaScript */\nconst progressBar = document.getElementById(\'progress-bar\');\nwindow.addEventListener(\'scroll\', () => {\n  const scrollTop = window.scrollY;\n  const docHeight = document.body.scrollHeight - window.innerHeight;\n  const scrollPercent = (scrollTop / docHeight) * 100;\n  progressBar.style.width = scrollPercent + \'%\';\n});';
    
    codeOutput.textContent = '<!-- HTML -->\n<div id="progress-container"><div id="progress-bar"></div></div>\n\n ' + css + '\n\n ' + js;
  };
  
  window.copyCode = function() {
    var text = codeOutput.textContent;
    navigator.clipboard.writeText(text).then(function() {
        if(window.Devpalettes && window.Devpalettes.Toast) {
          window.Devpalettes.Toast.show('Code Copied!', 'success');
        } else {
          alert('Copied!');
        }
    });
  };
  
  updateBar();
})();
