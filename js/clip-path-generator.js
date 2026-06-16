(function() {
  'use strict';

  var preview = document.getElementById('clip-preview');
  var codeOutput = document.getElementById('code-output');
  var copyBtn = document.getElementById('copy-btn');
  var shapeAnnouncer = document.getElementById('shape-announcer');
  var copyAnnouncer = document.getElementById('copy-announcer');
  var shapeButtons = document.querySelectorAll('.shape-btn');

  function setShape(shape, clickedButton) {
    // Update button states
    for (var i = 0; i < shapeButtons.length; i++) {
      shapeButtons[i].classList.remove('active', 'bg-emerald-500', 'text-white');
      shapeButtons[i].classList.add('bg-slate-200', 'dark:bg-slate-700');
      shapeButtons[i].setAttribute('aria-pressed', 'false');
    }
    
    if (clickedButton) {
      clickedButton.classList.add('active', 'bg-emerald-500', 'text-white');
      clickedButton.classList.remove('bg-slate-200', 'dark:bg-slate-700');
      clickedButton.setAttribute('aria-pressed', 'true');
    }
    
    preview.style.clipPath = shape;
    preview.setAttribute('aria-label', 'Clip path shape preview: ' + shape);
    generateCode(shape);

    // Announce to screen readers
    if (shapeAnnouncer) {
      var shapeName = clickedButton ? clickedButton.textContent.trim() : 'shape';
      shapeAnnouncer.textContent = 'Shape changed to ' + shapeName + ': ' + shape;
    }
  }
  
  function generateCode(shape) {
    var css = '.clipped-element {\n  clip-path: ' + shape + ';\n}';
    codeOutput.textContent = css;
  }
  
  function copyCode() {
    var text = codeOutput.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        announceCopy();
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
    try {
      document.execCommand('copy');
      announceCopy();
    } catch(e) {
      // Silent fail
    }
    document.body.removeChild(textarea);
  }

  function announceCopy() {
    if (window.Devpalettes && window.Devpalettes.Toast) {
      window.Devpalettes.Toast.show('Code Copied!', 'success');
    }
    if (copyAnnouncer) {
      copyAnnouncer.textContent = 'CSS code copied to clipboard';
      setTimeout(function() { copyAnnouncer.textContent = ''; }, 3000);
    }
  }

  // Bind shape buttons using event delegation
  function setupListeners() {
    for (var i = 0; i < shapeButtons.length; i++) {
      shapeButtons[i].addEventListener('click', function(e) {
        var shape = this.getAttribute('data-shape');
        setShape(shape, this);
      });

      // Keyboard support
      shapeButtons[i].addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          var shape = this.getAttribute('data-shape');
          setShape(shape, this);
        }
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', copyCode);
    }
  }

  // Initialize
  setupListeners();

  // Set default shape (Circle)
  var defaultBtn = document.querySelector('.shape-btn[data-shape="circle(50%)"]');
  setShape('circle(50%)', defaultBtn);
  
})();
