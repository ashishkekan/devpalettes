(function() {
  var wrapper = document.getElementById('border-wrapper');
  var inner = document.getElementById('border-inner');
  var codeOutput = document.getElementById('code-output');

  var cStart = document.getElementById('c-start');
  var cEnd = document.getElementById('c-end');
  var cBg = document.getElementById('c-bg');
  var ctrlW = document.getElementById('ctrl-w');
  var ctrlR = document.getElementById('ctrl-r');

  function updateBorder() {
    var start = cStart.value;
    var end = cEnd.value;
    var bg = cBg.value;
    var w = parseInt(ctrlW.value);
    var r = parseInt(ctrlR.value);

    document.getElementById('v-w').textContent = w;
    document.getElementById('v-r').textContent = r;

    // Accessibility: Update aria-valuetext dynamically
    ctrlW.setAttribute('aria-valuetext', w + ' pixels');
    ctrlR.setAttribute('aria-valuetext', r + ' pixels');

    wrapper.style.background = 'linear-gradient(90deg, ' + start + ', ' + end + ')';
    wrapper.style.borderRadius = r + 'px';
    wrapper.style.padding = w + 'px';

    inner.style.backgroundColor = bg;
    inner.style.borderRadius = (r - w < 0 ? 0 : r - w) + 'px';

    generateCode(start, end, bg, w, r);
  }

  function generateCode(s, e, bg, w, r) {
    var innerR = (r - w < 0 ? 0 : r - w);
    var css = '.gradient-border-box {\n' +
      '  background: linear-gradient(90deg, ' + s + ', ' + e + ');\n' +
      '  padding: ' + w + 'px;\n' +
      '  border-radius: ' + r + 'px;\n' +
      '}\n' +
      '\n' +
      '.gradient-border-inner {\n' +
      '  background: ' + bg + ';\n' +
      '  border-radius: ' + innerR + 'px;\n' +
      '  height: 100%;\n' +
      '  width: 100%;\n' +
      '}';
    codeOutput.textContent = css;
  }

  // Fix: Added Clipboard Error Handling + Fallback Copy
  function copyCode() {
    var text = codeOutput.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showCopyFeedback('Code Copied!');
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
      showCopyFeedback('Code Copied!');
    } catch (e) {
      showCopyFeedback('Copy failed. Please select and copy manually.', true);
    }
    document.body.removeChild(textarea);
  }

  function showCopyFeedback(msg, isError) {
    if (window.Devpalettes && window.Devpalettes.Toast) {
      window.Devpalettes.Toast.show(msg, isError ? 'error' : 'success');
    }
  }

  // Bind copy button
  var copyBtn = document.getElementById('btn-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', copyCode);
  }

  // Fix: Bind 'input' event for real-time preview on sliders and color pickers
  var inputs = [cStart, cEnd, cBg, ctrlW, ctrlR];
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener('input', updateBorder);
  }

  // Cookie consent
  var cookieConsent = document.getElementById('cookie-consent');
  if (cookieConsent && !localStorage.getItem('cookie-consent')) {
    cookieConsent.style.display = 'block';
  }
  var cookieAccept = document.getElementById('cookie-accept');
  var cookieDecline = document.getElementById('cookie-decline');
  if (cookieAccept) {
    cookieAccept.addEventListener('click', function() {
      localStorage.setItem('cookie-consent', 'accepted');
      cookieConsent.style.display = 'none';
    });
  }
  if (cookieDecline) {
    cookieDecline.addEventListener('click', function() {
      localStorage.setItem('cookie-consent', 'declined');
      cookieConsent.style.display = 'none';
    });
  }

  // Initialize
  updateBorder();
})();
