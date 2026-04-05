// js/color-usage-preview.js
(function() {
  const inputs = {
     pri: { c: document.getElementById('c-primary'), t: document.getElementById('t-primary') },
     sec: { c: document.getElementById('c-secondary'), t: document.getElementById('t-secondary') },
     acc: { c: document.getElementById('c-accent'), t: document.getElementById('t-accent') },
     bg: { c: document.getElementById('c-bg'), t: document.getElementById('t-bg') }
  };
  
  // Sync color to text
  Object.keys(inputs).forEach(k => {
     inputs[k].c.addEventListener('input', function() {
        inputs[k].t.value = inputs[k].c.value;
     });
  });
  
  window.syncText = function(type) {
     inputs[type].c.value = inputs[type].t.value;
  };
  
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
     ctx.clearRect(0, 0, 400, 150);
     
     var data = [80, 120, 60, 90, 150];
     var colors = [c1, c2, c3, c1, c2];
     var xStep = 70;
     
     data.forEach(function(h, i) {
        ctx.fillStyle = colors[i];
        ctx.fillRect(20 + (i * xStep), 150 - h, 40, h);
     });
  }
  
  function generateCode(p, s, a, b) {
     var css = ':root {\n  --primary: ' + p + ';\n  --secondary: ' + s + ';\n  --accent: ' + a + ';\n  --background: ' + b + ';\n}';
     document.getElementById('code-output').textContent = css;
  }
  
  window.copyCode = function() {
     var text = document.getElementById('code-output').textContent;
     navigator.clipboard.writeText(text);
     if(window.Devpalettes && window.Devpalettes.Toast) {
        window.Devpalettes.Toast.show('CSS Variables Copied!', 'success');
     }
  };
  
  // Init
  applyColors();
  
})();
