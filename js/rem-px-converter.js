(function() {
  const pxInput = document.getElementById('px-in');
  const remInput = document.getElementById('rem-in');
  const baseInput = document.getElementById('base-size');
  const baseVal = document.getElementById('base-val');
  const refTable = document.getElementById('ref-table');
  
  window.convert = function(type) {
    const base = parseFloat(baseInput.value);
    if(type === 'px') {
      const px = parseFloat(pxInput.value);
      if(!isNaN(px)) remInput.value = (px / base).toFixed(3);
    } else {
      const rem = parseFloat(remInput.value);
      if(!isNaN(rem)) pxInput.value = (rem * base).toFixed(2);
    }
  };
  
  window.recalc = function() {
    baseVal.textContent = baseInput.value;
    convert('px');
    generateTable();
  };
  
  function generateTable() {
    const base = parseFloat(baseInput.value);
    const refs = [10, 12, 14, 16, 18, 20, 24, 32, 40, 48, 64, 96];
    refTable.innerHTML = '';
    
    refs.forEach(function(px) {
      const rem = (px / base).toFixed(2);
      refTable.innerHTML += '<div class="p-2 bg-slate-100 dark:bg-slate-800 rounded">' + px + 'px</div><div class="p-2 bg-slate-200 dark:bg-slate-700 rounded">' + rem + 'rem</div>';
    });
  }
  
  generateTable();
})();
