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
      div.setAttribute('aria-hidden', 'true');
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
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showCopyFeedback();
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
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showCopyFeedback();
    } catch (e) {
      if (window.Devpalettes && window.Devpalettes.Toast) {
        window.Devpalettes.Toast.show('Copy failed. Please select and copy manually.', 'error');
      }
    }
    document.body.removeChild(textarea);
  }

  function showCopyFeedback() {
    if (window.Devpalettes && window.Devpalettes.Toast) {
      window.Devpalettes.Toast.show('CSS Copied!', 'success');
    }
  }

  function copyLink() {
    var url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function() {
        if (window.Devpalettes && window.Devpalettes.Toast) {
          window.Devpalettes.Toast.show('Link Copied!', 'success');
        }
      }).catch(function() {
        fallbackCopyLink(url);
      });
    } else {
      fallbackCopyLink(url);
    }
  }

  function fallbackCopyLink(url) {
    var textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      if (window.Devpalettes && window.Devpalettes.Toast) {
        window.Devpalettes.Toast.show('Link Copied!', 'success');
      }
    } catch (e) {
      if (window.Devpalettes && window.Devpalettes.Toast) {
        window.Devpalettes.Toast.show('Copy failed. Please copy the URL from the address bar.', 'error');
      }
    }
    document.body.removeChild(textarea);
  }

  window.updateGrid = updateGrid;
  window.copyCode = copyCode;
  window.copyLink = copyLink;

  // Bind copy-link-btn
  var copyLinkBtn = document.getElementById('copy-link-btn');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', copyLink);
  }

  // Add both oninput and onchange for real-time preview + fallback
  var controls = ['ctrl-cols', 'ctrl-rows', 'ctrl-gap'];
  for (var i = 0; i < controls.length; i++) {
    var el = document.getElementById(controls[i]);
    if (el) {
      el.addEventListener('input', updateGrid);
    }
  }

  updateGrid();
})();
