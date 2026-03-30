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
    div.onclick = function() {
      if (div.classList.contains('flex-grow')) {
        div.classList.remove('flex-grow');
        div.style.flexGrow = '0';
      } else {
        div.classList.add('flex-grow');
        div.style.flexGrow = '1';
      }
      updateCode();
    };
    container.appendChild(div);
    updateItemCounts();
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
  
  function copyCode() {
    var text = codeOutput.textContent;
    navigator.clipboard.writeText(text).then(function() {
      if (window.Devpalettes && window.Devpalettes.Toast) {
        window.Devpalettes.Toast.show('CSS Copied!', 'success');
      } else {
        alert('CSS Copied!');
      }
    });
  }
  
  window.updateFlex = updateFlex;
  window.addItem = addItem;
  window.removeItem = removeItem;
  window.copyCode = copyCode;
  
  addItem();
  addItem();
  addItem();
  updateFlex();
  
})();
