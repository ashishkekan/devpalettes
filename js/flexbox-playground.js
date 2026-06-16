(function() {
  var container = document.getElementById('flex-container');
  var itemCountEl = document.getElementById('item-count');
  var gapValEl = document.getElementById('gap-val');
  var codeOutput = document.getElementById('code-output');

  var ctrlDir = document.getElementById('ctrl-direction');
  var ctrlJust = document.getElementById('ctrl-justify');
  var ctrlAlignItems = document.getElementById('ctrl-align-items');
  var ctrlWrap = document.getElementById('ctrl-wrap');
  var ctrlAlignContent = document.getElementById('ctrl-align-content');
  var ctrlGap = document.getElementById('ctrl-gap');

  var itemColors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
    'bg-orange-500', 'bg-cyan-500'
  ];

  function addItem() {
    if (container.children.length >= 10) return;
    var div = document.createElement('div');
    var index = container.children.length;
    div.className = 'flex-item flex items-center justify-center text-white font-bold rounded-lg cursor-pointer hover:opacity-80 ' + itemColors[index % itemColors.length];
    div.style.width = '80px';
    div.style.height = '80px';
    div.textContent = index + 1;
    
    // Accessibility: Make items keyboard accessible
    div.setAttribute('role', 'button');
    div.setAttribute('tabindex', '0');
    div.setAttribute('aria-label', 'Flex item ' + (index + 1) + '. Click or press Enter to toggle flex-grow.');
    div.setAttribute('aria-pressed', 'false');

    // Click handler
    div.addEventListener('click', function() {
      toggleGrow(div);
    });
    
    // Keyboard handler
    div.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleGrow(div);
      }
    });

    container.appendChild(div);
    updateItemCounts();
    updateCode();
  }

  function toggleGrow(div) {
    if (div.classList.contains('flex-grow')) {
      div.classList.remove('flex-grow');
      div.style.flexGrow = '0';
      div.setAttribute('aria-pressed', 'false');
    } else {
      div.classList.add('flex-grow');
      div.style.flexGrow = '1';
      div.setAttribute('aria-pressed', 'true');
    }
    updateCode();
  }

  function removeItem() {
    if (container.children.length > 0) {
      container.lastChild.remove();
      updateItemCounts();
      updateCode();
    }
  }

  function updateFlex() {
    var dir = ctrlDir.value;
    var just = ctrlJust.value;
    var align = ctrlAlignItems.value;
    var wrap = ctrlWrap.value;
    var alignCont = ctrlAlignContent.value;
    var gap = ctrlGap.value;

    gapValEl.textContent = gap;
    
    // Accessibility: Update aria-valuetext dynamically
    ctrlGap.setAttribute('aria-valuetext', gap + ' pixels');

    container.style.flexDirection = dir;
    container.style.justifyContent = just;
    container.style.alignItems = align;
    container.style.flexWrap = wrap;
    container.style.alignContent = alignCont;
    container.style.gap = gap + 'px';
    container.style.display = 'flex';

    updateCode();
  }

  function updateItemCounts() {
    itemCountEl.textContent = container.children.length;
  }

  function updateCode() {
    var dir = ctrlDir.value;
    var just = ctrlJust.value;
    var align = ctrlAlignItems.value;
    var wrap = ctrlWrap.value;
    var alignCont = ctrlAlignContent.value;
    var gap = ctrlGap.value;

    var code = '.container {\n' +
      '  display: flex;\n' +
      '  flex-direction: ' + dir + ';\n' +
      '  justify-content: ' + just + ';\n' +
      '  align-items: ' + align + ';\n' +
      '  flex-wrap: ' + wrap + ';\n' +
      '  align-content: ' + alignCont + ';\n' +
      '  gap: ' + gap + 'px;\n' +
      '}';

    var items = container.querySelectorAll('.flex-item');
    var grownItems = [];
    items.forEach(function(item, i) {
      if (item.style.flexGrow === '1') {
        grownItems.push('.item-' + (i + 1) + ' { flex-grow: 1; }');
      }
    });

    if (grownItems.length > 0) {
      code += '\n\n/* Clicked Items (Grow enabled) */\n' + grownItems.join('\n');
    }

    codeOutput.textContent = code;
  }

  // Fix: Added Clipboard Error Handling + Fallback Copy
  function copyCode() {
    var text = codeOutput.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showCopyFeedback('CSS Copied!');
      }).catch(function() {
        fallbackCopy(text, 'CSS Copied!');
      });
    } else {
      fallbackCopy(text, 'CSS Copied!');
    }
  }

  function fallbackCopy(text, msg) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showCopyFeedback(msg);
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

  // Fix: Added Missing Copy Link Functionality
  function copyLink() {
    var url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function() {
        showCopyFeedback('Link Copied!');
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
      showCopyFeedback('Link Copied!');
    } catch (e) {
      showCopyFeedback('Copy failed. Please copy the URL from the address bar.', true);
    }
    document.body.removeChild(textarea);
  }

  // Bind buttons using IDs (removed inline onclick from HTML)
  document.getElementById('btn-add').addEventListener('click', addItem);
  document.getElementById('btn-remove').addEventListener('click', removeItem);
  document.getElementById('btn-copy').addEventListener('click', copyCode);

  var copyLinkBtn = document.getElementById('copy-link-btn');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', copyLink);
  }

  // Bind selects with 'change' event (removed inline onchange from HTML)
  var selects = [ctrlDir, ctrlJust, ctrlAlignItems, ctrlWrap, ctrlAlignContent];
  for (var i = 0; i < selects.length; i++) {
    selects[i].addEventListener('change', updateFlex);
  }

  // Fix: Bind gap slider with 'input' for real-time live preview (onchange waits for mouseup)
  ctrlGap.addEventListener('input', updateFlex);

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

  // Initialize defaults
  addItem();
  addItem();
  addItem();
  updateFlex();
})();
