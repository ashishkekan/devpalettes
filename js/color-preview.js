(function() {
  var inputs = {
     pri: { c: document.getElementById('c-primary'), t: document.getElementById('t-primary') },
     sec: { c: document.getElementById('c-secondary'), t: document.getElementById('t-secondary') },
     acc: { c: document.getElementById('c-accent'), t: document.getElementById('t-accent') },
     bg: { c: document.getElementById('c-bg'), t: document.getElementById('t-bg') }
  };

  var copyStatus = document.getElementById('copy-status');
  var codeOutput = document.getElementById('code-output');

  // Sync color picker to text input
  Object.keys(inputs).forEach(function(k) {
     inputs[k].c.addEventListener('input', function() {
        inputs[k].t.value = inputs[k].c.value;
     });
  });

  window.syncText = function(type) {
     var val = inputs[type].t.value;
     // Validate hex format before syncing
     if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
       inputs[type].c.value = val;
     }
  };

  // Also sync text input on input event (not just onchange)
  Object.keys(inputs).forEach(function(k) {
     inputs[k].t.addEventListener('input', function() {
        var val = inputs[k].t.value;
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
          inputs[k].c.value = val;
        }
     });
  });

  window.applyColors = function() {
     var pri = inputs.pri.c.value;
     var sec = inputs.sec.c.value;
     var acc = inputs.acc.c.value;
     var bg = inputs.bg.c.value;

     var container = document.getElementById('preview-container');
     container.style.backgroundColor = bg;

     document.getElementById('prev-navbar').style.backgroundColor = pri;
     document.getElementById('btn-pri').style.backgroundColor = pri;
     document.getElementById('alert-prev').style.backgroundColor = pri;

     document.getElementById('btn-sec').style.backgroundColor = sec;
     document.getElementById('btn-acc').style.backgroundColor = acc;

     drawChart(pri, sec, acc);
     generateCode(pri, sec, acc, bg);
  };

  window.randomize = function() {
     var rand = function() { return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'); };
     inputs.pri.c.value = rand();
     inputs.sec.c.value = rand();
     inputs.acc.c.value = rand();
     inputs.bg.c.value = rand();

     Object.keys(inputs).forEach(function(k) { inputs[k].t.value = inputs[k].c.value; });
     applyColors();
  };

  function drawChart(c1, c2, c3) {
     var canvas = document.getElementById('chart-canvas');
     var ctx = canvas.getContext('2d');

     // Handle high-DPI displays
     var dpr = window.devicePixelRatio || 1;
     var displayWidth = 400;
     var displayHeight = 150;
     canvas.width = displayWidth * dpr;
     canvas.height = displayHeight * dpr;
     canvas.style.width = displayWidth + 'px';
     canvas.style.height = displayHeight + 'px';
     ctx.scale(dpr, dpr);

     ctx.clearRect(0, 0, displayWidth, displayHeight);

     var data = [80, 120, 60, 90, 150];
     var colors = [c1, c2, c3, c1, c2];
     var xStep = 70;

     data.forEach(function(h, i) {
        ctx.fillStyle = colors[i];
        ctx.fillRect(20 + (i * xStep), displayHeight - h, 40, h);
     });
  }

  function generateCode(p, s, a, b) {
     var css = ':root {\n  --primary: ' + p + ';\n  --secondary: ' + s + ';\n  --accent: ' + a + ';\n  --background: ' + b + ';\n}';
     codeOutput.textContent = css;
  }

  window.copyCode = function() {
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
  };

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
         window.Devpalettes.Toast.show('CSS Variables Copied!', 'success');
       }
       if (copyStatus) {
         copyStatus.textContent = 'CSS variables copied to clipboard';
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

  // Init
  applyColors();

})();
