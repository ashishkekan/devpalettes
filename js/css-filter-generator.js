(function() {
  const preview = document.getElementById('filter-preview');
  const codeOutput = document.getElementById('code-output');
  
  function updateFilter() {
    const bl = document.getElementById('f-blur').value;
    const br = document.getElementById('f-bri').value;
    const co = document.getElementById('f-con').value;
    const gr = document.getElementById('f-gray').value;
    const se = document.getElementById('f-sep').value;
    const hu = document.getElementById('f-hue').value;
    
    document.getElementById('v-blur').textContent = bl;
    document.getElementById('v-bri').textContent = br;
    document.getElementById('v-con').textContent = co;
    document.getElementById('v-gray').textContent = gr;
    document.getElementById('v-sep').textContent = se;
    document.getElementById('v-hue').textContent = hu;
    
    const filterStr = `blur(${bl}px) brightness(${br}%) contrast(${co}%) grayscale(${gr}%) sepia(${se}%) hue-rotate(${hu}deg)`;
    
    preview.style.filter = filterStr;
    generateCode(bl, br, co, gr, se, hu);
  }
  
  function generateCode(bl, br, co, gr, se, hu) {
    const css = `.filtered-image {\n  filter: \n    blur(${bl}px) \n    brightness(${br}%) \n    contrast(${co}%) \n    grayscale(${gr}%) \n    sepia(${se}%) \n    hue-rotate(${hu}deg);\n}`;
    codeOutput.textContent = css;
  }
  
  function resetFilters() {
    document.getElementById('f-blur').value = 0;
    document.getElementById('f-bri').value = 100;
    document.getElementById('f-con').value = 100;
    document.getElementById('f-gray').value = 0;
    document.getElementById('f-sep').value = 0;
    document.getElementById('f-hue').value = 0;
    updateFilter();
  }
  
  function copyCode() {
    const text = codeOutput.textContent;
    navigator.clipboard.writeText(text);
    if(window.Devpalettes && window.Devpalettes.Toast) window.Devpalettes.Toast.show('Code Copied!', 'success');
  }
  
  window.updateFilter = updateFilter;
  window.resetFilters = resetFilters;
  window.copyCode = copyCode;
  
  updateFilter();
})();
