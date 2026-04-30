/**
 * Live Code Editor — Devpalettes
 * Self-contained IIFE. Depends on: CodeMirror 5, JSZip (optional).
 * Exposes nothing global except via DOM event listeners.
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════
     DEFAULT CODE
     ═══════════════════════════════════════ */
  var DEFAULTS = {
    html: [
      '<div class="card">',
      '  <h1>Live Editor</h1>',
      '  <p>Edit HTML, CSS & JS and see results instantly.</p>',
      '  <button id="btn">Click Me</button>',
      '  <p id="output"></p>',
      '</div>'
    ].join('\n'),

    css: [
      '* { margin: 0; box-sizing: border-box; }',
      '',
      'body {',
      '  font-family: \'Segoe UI\', sans-serif;',
      '  display: flex;',
      '  justify-content: center;',
      '  align-items: center;',
      '  min-height: 100vh;',
      '  background: linear-gradient(135deg, #0f172a, #1e293b);',
      '  color: #f1f5f9;',
      '}',
      '',
      '.card {',
      '  background: rgba(255,255,255,0.05);',
      '  backdrop-filter: blur(10px);',
      '  border: 1px solid rgba(255,255,255,0.1);',
      '  border-radius: 16px;',
      '  padding: 2.5rem;',
      '  text-align: center;',
      '  max-width: 400px;',
      '}',
      '',
      'h1 {',
      '  font-size: 1.75rem;',
      '  margin-bottom: 0.5rem;',
      '  background: linear-gradient(135deg, #10b981, #3b82f6);',
      '  -webkit-background-clip: text;',
      '  -webkit-text-fill-color: transparent;',
      '}',
      '',
      'p { color: #94a3b8; margin-bottom: 1rem; }',
      '',
      'button {',
      '  padding: 0.6rem 1.5rem;',
      '  border: none;',
      '  border-radius: 8px;',
      '  background: #10b981;',
      '  color: white;',
      '  font-size: 0.95rem;',
      '  cursor: pointer;',
      '  transition: all 0.2s;',
      '}',
      '',
      'button:hover {',
      '  background: #059669;',
      '  transform: translateY(-1px);',
      '}',
      '',
      '#output {',
      '  margin-top: 1rem;',
      '  font-weight: 600;',
      '  color: #10b981;',
      '}'
    ].join('\n'),

    js: [
      "let count = 0;",
      "const btn = document.getElementById('btn');",
      "const output = document.getElementById('output');",
      "",
      "btn.addEventListener('click', () => {",
      "  count++;",
      "  output.textContent = 'Clicked ' + count + ' time' + (count !== 1 ? 's' : '') + '!';",
      "  console.log('Click count:', count);",
      "});",
      "",
      "console.log('Editor ready!');"
    ].join('\n')
  };

  /* Console override injected into iframe <head> */
  var CONSOLE_HOOK = [
    '<script>(function(){',
    'var o={log:console.log,error:console.error,warn:console.warn,info:console.info};',
    'function s(t,a){try{parent.postMessage({type:"ed-con",m:t,a:Array.from(a).map(function(v){',
    'try{return typeof v==="object"?JSON.stringify(v,null,2):String(v)}catch(e){return String(v)}})},"*")}catch(e){}}',
    'console.log=function(){s("log",arguments);o.log.apply(console,arguments)};',
    'console.error=function(){s("error",arguments);o.error.apply(console,arguments)};',
    'console.warn=function(){s("warn",arguments);o.warn.apply(console,arguments)};',
    'console.info=function(){s("info",arguments);o.info.apply(console,arguments)};',
    'window.onerror=function(m,u,l){s("error",["Error: "+m+" (line "+l+")"])};',
    '})();<\/script>'
  ].join('');

  /* ═══════════════════════════════════════
     STATE
     ═══════════════════════════════════════ */
  var editors = { html: null, css: null, js: null };
  var activeTab = 'html';
  var conOpen = false;
  var conCount = 0;
  var dragging = false;
  var conDragging = false;
  var menuOpen = false;
  var runTimer = null;
  var saveTimer = null;
  var wasDark = document.documentElement.classList.contains('dark');

  var STORAGE_KEY = 'devpalettes-live-editor';

  /* ═══════════════════════════════════════
     DOM REFS
     ═══════════════════════════════════════ */
  function $(id) { return document.getElementById(id); }

  var dom = {
    saveInd:    $('ed-save-ind'),
    moreMenu:   $('ed-more-menu'),
    panelL:     $('ed-panel-l'),
    panelR:     $('ed-panel-r'),
    drag:       $('ed-drag'),
    device:     $('ed-device'),
    frame:      $('ed-frame'),
    conPanel:   $('ed-con'),
    conDrag:    $('ed-con-drag'),
    conOut:     $('ed-con-out'),
    conBadge:   $('ed-con-badge'),
    conBtn:     $('ed-con-btn'),
    conClear:   $('ed-con-clear'),
    fsModal:    $('ed-fs-modal'),
    fsFrame:    $('ed-fs-frame'),
    fsClose:    $('ed-fs-close'),
    toastBox:   $('toast-container'),
    wraps: {
      html: $('ed-html'),
      css:  $('ed-css'),
      js:   $('ed-js')
    }
  };

  /* ═══════════════════════════════════════
     HELPERS
     ═══════════════════════════════════════ */
  function cmTheme() {
    return document.documentElement.classList.contains('dark') ? 'dracula' : 'default';
  }

  function getCode() {
    return {
      html: editors.html.getValue(),
      css:  editors.css.getValue(),
      js:   editors.js.getValue()
    };
  }

  function srcdoc(html, css, js) {
    return '<!DOCTYPE html><html><head><meta charset="UTF-8">'
      + '<style>' + css + '</style>'
      + CONSOLE_HOOK
      + '</head><body>' + html
      + '<script>' + js + '<\/script>'
      + '</body></html>';
  }

  function esc(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function downloadBlob(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    }, 100);
  }

  /* ═══════════════════════════════════════
     TOAST
     ═══════════════════════════════════════ */
  function toast(msg, icon) {
    if (window.Devpalettes && window.Devpalettes.Toast) {
      window.Devpalettes.Toast.show(msg);
      return;
    }
    var el = document.createElement('div');
    el.className = 'ed-toast-in glass-card rounded-xl px-4 py-2.5 shadow-xl shadow-black/10 dark:shadow-black/30 flex items-center gap-2 text-xs font-medium pointer-events-auto min-w-[180px]';
    el.innerHTML = '<i class="' + (icon || 'fas fa-check-circle text-emerald-500') + '"></i><span>' + msg + '</span>';
    dom.toastBox.appendChild(el);
    setTimeout(function () {
      el.classList.remove('ed-toast-in');
      el.classList.add('ed-toast-out');
      setTimeout(function () { el.remove(); }, 260);
    }, 2200);
  }

  /* ═══════════════════════════════════════
     SAVE INDICATOR
     ═══════════════════════════════════════ */
  function flashSave() {
    dom.saveInd.classList.remove('hidden');
    dom.saveInd.classList.add('flex');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      dom.saveInd.classList.add('hidden');
      dom.saveInd.classList.remove('flex');
    }, 2000);
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(getCode()));
      flashSave();
    } catch (e) { /* quota exceeded — silent */ }
  }

  /* ═══════════════════════════════════════
     INIT EDITORS
     ═══════════════════════════════════════ */
  function initEditors() {
    var saved = null;

    /* Try URL hash first */
    if (window.location.hash.length > 1) {
      try { saved = JSON.parse(atob(decodeURIComponent(window.location.hash.slice(1)))); } catch (e) {}
    }

    /* Fallback to localStorage */
    if (!saved) {
      try { var r = localStorage.getItem(STORAGE_KEY); if (r) saved = JSON.parse(r); } catch (e) {}
    }

    var h = (saved && saved.html) || DEFAULTS.html;
    var c = (saved && saved.css)  || DEFAULTS.css;
    var j = (saved && saved.js)   || DEFAULTS.js;

    var base = {
      theme: cmTheme(),
      lineNumbers: true,
      indentUnit: 2,
      tabSize: 2,
      indentWithTabs: false,
      lineWrapping: false,
      autoCloseBrackets: true,
      matchBrackets: true
    };

    editors.html = CodeMirror(dom.wraps.html, Object.assign({}, base, { value: h, mode: 'htmlmixed', autoCloseTags: true }));
    editors.css  = CodeMirror(dom.wraps.css,  Object.assign({}, base, { value: c, mode: 'css' }));
    editors.js   = CodeMirror(dom.wraps.js,   Object.assign({}, base, { value: j, mode: 'javascript' }));

    /* Auto-run + auto-save on change */
    Object.keys(editors).forEach(function (key) {
      editors[key].on('change', function () {
        clearTimeout(runTimer);
        runTimer = setTimeout(run, 600);
        clearTimeout(saveTimer);
        saveTimer = setTimeout(persist, 800);
      });
    });

    /* Initial render after layout settles */
    setTimeout(function () {
      editors.html.refresh();
      editors.css.refresh();
      editors.js.refresh();
      run();
    }, 150);
  }

  /* ═══════════════════════════════════════
     RUN / CONSOLE
     ═══════════════════════════════════════ */
  function run() {
    var c = getCode();
    dom.frame.srcdoc = srcdoc(c.html, c.css, c.js);
  }

  function toggleConsole() {
    conOpen = !conOpen;
    dom.conPanel.classList.toggle('hidden', !conOpen);
    dom.conDrag.classList.toggle('hidden', !conOpen);
    dom.conBtn.classList.toggle('text-emerald-500', conOpen);
  }

  function clearConsole() {
    dom.conOut.innerHTML = '';
    conCount = 0;
    dom.conBadge.textContent = '0';
    dom.conBadge.classList.add('hidden');
    dom.conBadge.classList.remove('flex');
  }

  function pushConsole(method, args) {
    var colors = { log: 'text-slate-600 dark:text-slate-300', error: 'text-red-500', warn: 'text-amber-500', info: 'text-blue-500' };
    var icons  = { log: 'fa-chevron-right', error: 'fa-circle-xmark', warn: 'fa-triangle-exclamation', info: 'fa-circle-info' };
    var row = document.createElement('div');
    row.className = 'flex items-start gap-2 py-1 px-1 rounded hover:bg-slate-100/50 dark:hover:bg-white/[0.02] ' + (colors[method] || colors.log);
    row.innerHTML = '<i class="fas ' + (icons[method] || icons.log) + ' text-[9px] mt-1 opacity-60 flex-shrink-0"></i>'
      + '<span class="break-all leading-relaxed">' + esc(args.join(' ')) + '</span>';
    dom.conOut.appendChild(row);
    dom.conOut.scrollTop = dom.conOut.scrollHeight;
    conCount++;
    dom.conBadge.textContent = conCount > 99 ? '99+' : conCount;
    dom.conBadge.classList.remove('hidden');
    dom.conBadge.classList.add('flex');
  }

  /* Listen for console messages from iframe */
  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'ed-con') {
      if (!conOpen) toggleConsole();
      pushConsole(e.data.m, e.data.a);
    }
  });

  /* ═══════════════════════════════════════
     TABS
     ═══════════════════════════════════════ */
  function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.ed-tab').forEach(function (btn) {
      var isActive = btn.dataset.tab === tab;
      btn.classList.toggle('active', isActive);
      btn.classList.toggle('text-slate-500', !isActive);
      btn.classList.toggle('dark:text-slate-400', !isActive);
    });
    Object.keys(dom.wraps).forEach(function (key) {
      dom.wraps[key].classList.toggle('hidden', key !== tab);
    });
    var ed = editors[tab];
    setTimeout(function () { ed.refresh(); }, 10);
    ed.focus();
  }

  /* ═══════════════════════════════════════
     DEVICE PREVIEW
     ═══════════════════════════════════════ */
  var DEVICE_WIDTHS  = { desktop: '100%', tablet: '768px', mobile: '375px' };
  var DEVICE_SHADOWS = { desktop: 'none', tablet: '0 0 0 1px rgba(0,0,0,0.08)', mobile: '0 0 0 1px rgba(0,0,0,0.08)' };

  function setDevice(device) {
    document.querySelectorAll('.ed-dev-btn').forEach(function (btn) {
      var isActive = btn.dataset.device === device;
      btn.classList.toggle('active', isActive);
      btn.classList.toggle('text-emerald-500', isActive);
      btn.classList.toggle('dark:text-emerald-400', isActive);
      btn.classList.toggle('text-slate-600', !isActive);
      btn.classList.toggle('dark:text-slate-400', !isActive);
    });
    dom.device.style.maxWidth = DEVICE_WIDTHS[device] || '100%';
    dom.device.style.boxShadow = DEVICE_SHADOWS[device] || 'none';
    var framed = device !== 'desktop';
    dom.device.style.margin = framed ? '0 auto' : '0';
    dom.device.style.borderRadius = framed ? '8px' : '0';
  }

  /* ═══════════════════════════════════════
     FULLSCREEN
     ═══════════════════════════════════════ */
  function toggleFullscreen() {
    var hidden = dom.fsModal.classList.contains('hidden');
    if (hidden) {
      var c = getCode();
      dom.fsFrame.srcdoc = srcdoc(c.html, c.css, c.js);
      dom.fsModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    } else {
      dom.fsModal.classList.add('hidden');
      dom.fsFrame.srcdoc = '';
      document.body.style.overflow = '';
    }
  }

  /* ═══════════════════════════════════════
     EXPORT ACTIONS
     ═══════════════════════════════════════ */
  function fullHTML(c) {
    return '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <style>\n'
      + c.css + '\n  </style>\n</head>\n<body>\n'
      + c.html + '\n  <script>\n' + c.js + '\n  <\/script>\n</body>\n</html>';
  }

  function copyCode() {
    var c = getCode();
    navigator.clipboard.writeText(fullHTML(c))
      .then(function () { toast('Code copied to clipboard'); })
      .catch(function () { toast('Failed to copy', 'fas fa-times-circle text-red-500'); });
  }

  function downloadHTML() {
    var c = getCode();
    var blob = new Blob([fullHTML(c)], { type: 'text/html' });
    downloadBlob(blob, 'index.html');
    toast('Downloaded index.html');
  }

  function downloadZip() {
    if (typeof JSZip === 'undefined') {
      toast('JSZip not loaded', 'fas fa-times-circle text-red-500');
      return;
    }
    var c = getCode();
    var zip = new JSZip();
    zip.file('index.html',
      '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n'
      + c.html + '\n  <script src="script.js"><\/script>\n</body>\n</html>'
    );
    zip.file('style.css', c.css);
    zip.file('script.js', c.js);
    zip.generateAsync({ type: 'blob' }).then(function (blob) {
      downloadBlob(blob, 'project.zip');
      toast('Downloaded project.zip');
    });
  }

  function openCodePen() {
    var c = getCode();
    var form = document.createElement('form');
    form.action = 'https://codepen.io/pen/define';
    form.method = 'POST';
    form.target = '_blank';
    var input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'data';
    input.value = JSON.stringify({ html: c.html, css: c.css, js: c.js });
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    toast('Opening CodePen...');
  }

  function shareURL() {
    var c = getCode();
    try {
      var encoded = btoa(JSON.stringify(c));
      var url = location.origin + location.pathname + '#' + encodeURIComponent(encoded);
      if (url.length > 8000) {
        toast('Code too long for URL sharing', 'fas fa-exclamation-triangle text-amber-500');
        return;
      }
      navigator.clipboard.writeText(url)
        .then(function () { toast('Share URL copied'); })
        .catch(function () { toast('Failed to copy URL', 'fas fa-times-circle text-red-500'); });
    } catch (e) {
      toast('Failed to generate URL', 'fas fa-times-circle text-red-500');
    }
  }

  /* ═══════════════════════════════════════
     MENU
     ═══════════════════════════════════════ */
  function toggleMenu() {
    menuOpen = !menuOpen;
    dom.moreMenu.classList.toggle('hidden', !menuOpen);
  }

  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    dom.moreMenu.classList.add('hidden');
  }

  /* ═══════════════════════════════════════
     DRAG RESIZE
     ═══════════════════════════════════════ */
  function initDrag() {
    /* Panel divider */
    dom.drag.addEventListener('mousedown', function (e) {
      dragging = true;
      dom.drag.classList.add('active');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });

    /* Console divider */
    dom.conDrag.addEventListener('mousedown', function (e) {
      conDragging = true;
      dom.conDrag.classList.add('active');
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
      if (dragging) {
        var rect = dom.panelL.parentElement.getBoundingClientRect();
        var pct;
        if (window.innerWidth <= 768) {
          pct = ((e.clientY - rect.top) / rect.height) * 100;
          pct = Math.max(20, Math.min(80, pct));
          dom.panelL.style.height = pct + '%';
          dom.panelL.style.width = '100%';
        } else {
          pct = ((e.clientX - rect.left) / rect.width) * 100;
          pct = Math.max(20, Math.min(80, pct));
          dom.panelL.style.width = pct + '%';
        }
        editors.html.refresh();
        editors.css.refresh();
        editors.js.refresh();
      }

      if (conDragging) {
        var bRect = dom.conPanel.parentElement.getBoundingClientRect();
        var h = bRect.bottom - e.clientY;
        h = Math.max(60, Math.min(400, h));
        dom.conPanel.style.height = h + 'px';
      }
    });

    document.addEventListener('mouseup', function () {
      if (dragging) {
        dragging = false;
        dom.drag.classList.remove('active');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
      if (conDragging) {
        conDragging = false;
        dom.conDrag.classList.remove('active');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    });

    /* Touch support */
    dom.drag.addEventListener('touchstart', function (e) {
      dragging = true;
      dom.drag.classList.add('active');
      e.preventDefault();
    }, { passive: false });

    dom.conDrag.addEventListener('touchstart', function (e) {
      conDragging = true;
      dom.conDrag.classList.add('active');
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchmove', function (e) {
      if (!dragging && !conDragging) return;
      var touch = e.touches[0];
      if (dragging) {
        var rect = dom.panelL.parentElement.getBoundingClientRect();
        var pct;
        if (window.innerWidth <= 768) {
          pct = ((touch.clientY - rect.top) / rect.height) * 100;
          pct = Math.max(20, Math.min(80, pct));
          dom.panelL.style.height = pct + '%';
          dom.panelL.style.width = '100%';
        } else {
          pct = ((touch.clientX - rect.left) / rect.width) * 100;
          pct = Math.max(20, Math.min(80, pct));
          dom.panelL.style.width = pct + '%';
        }
      }
      if (conDragging) {
        var bRect = dom.conPanel.parentElement.getBoundingClientRect();
        var h = bRect.bottom - touch.clientY;
        h = Math.max(60, Math.min(400, h));
        dom.conPanel.style.height = h + 'px';
      }
    }, { passive: false });

    document.addEventListener('touchend', function () {
      if (dragging) { dragging = false; dom.drag.classList.remove('active'); }
      if (conDragging) { conDragging = false; dom.conDrag.classList.remove('active'); }
    });
  }

  /* ═══════════════════════════════════════
     KEYBOARD SHORTCUTS
     ═══════════════════════════════════════ */
  function initKeys() {
    document.addEventListener('keydown', function (e) {
      var mod = e.ctrlKey || e.metaKey;

      if (mod && e.key === 'Enter') {
        e.preventDefault();
        run();
      }

      if (mod && e.key === 's') {
        e.preventDefault();
        persist();
        toast('Code saved');
      }

      if (e.key === 'Escape') {
        if (!dom.fsModal.classList.contains('hidden')) toggleFullscreen();
        closeMenu();
      }
    });
  }

  /* ═══════════════════════════════════════
     THEME SYNC (CodeMirror ↔ site dark mode)
     ═══════════════════════════════════════ */
  function initThemeSync() {
    var observer = new MutationObserver(function () {
      var dark = document.documentElement.classList.contains('dark');
      if (dark !== wasDark) {
        wasDark = dark;
        var t = cmTheme();
        editors.html.setOption('theme', t);
        editors.css.setOption('theme', t);
        editors.js.setOption('theme', t);
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  /* ═══════════════════════════════════════
     EVENT BINDING
     ═══════════════════════════════════════ */
  function bindEvents() {
    /* Toolbar buttons */
    $('ed-run-btn').addEventListener('click', run);
    $('ed-copy-btn').addEventListener('click', copyCode);
    $('ed-dl-btn').addEventListener('click', downloadHTML);
    $('ed-more-btn').addEventListener('click', toggleMenu);
    $('ed-fs-btn').addEventListener('click', toggleFullscreen);
    $('ed-fs-close').addEventListener('click', toggleFullscreen);

    /* Console */
    dom.conBtn.addEventListener('click', toggleConsole);
    dom.conClear.addEventListener('click', clearConsole);

    /* Tabs (delegated) */
    document.querySelectorAll('.ed-tab').forEach(function (btn) {
      btn.addEventListener('click', function () { switchTab(btn.dataset.tab); });
    });

    /* Device buttons (delegated) */
    document.querySelectorAll('.ed-dev-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { setDevice(btn.dataset.device); });
    });

    /* Menu items (delegated) */
    document.querySelectorAll('.ed-menu-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = btn.dataset.action;
        if (action === 'zip') downloadZip();
        else if (action === 'codepen') openCodePen();
        else if (action === 'share') shareURL();
        closeMenu();
      });
    });

    /* Close menu on outside click */
    document.addEventListener('click', function (e) {
      if (menuOpen && !e.target.closest('#ed-more-menu') && !e.target.closest('#ed-more-btn')) {
        closeMenu();
      }
    });
  }

  /* ═══════════════════════════════════════
     BOOT
     ═══════════════════════════════════════ */
  function boot() {
    initEditors();
    bindEvents();
    initDrag();
    initKeys();
    initThemeSync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
