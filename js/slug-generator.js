(function() {
  const inputText = document.getElementById('input-text');
  const outputSlug = document.getElementById('output-slug');
  
  window.generateSlug = function() {
    let text = inputText.value;
    
    // Get separator
    let separatorEl = document.querySelector('input[name="separator"]:checked');
    let separator = separatorEl ? separatorEl.value : "-";
    
    // Trim
    text = text.trim();
    
    // Lowercase (optional)
    if(document.getElementById('lowercase-check').checked) {
      text = text.toLowerCase();
    }
    
    // Remove accents (e.g., é -> e)
    text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Replace spaces and underscores with separator
    text = text.replace(/[\s_]+/g, separator);
    
    // Remove all non-alphanumeric except separator
    const escapedSep = separator === '-' ? '\\-' : '_';
    const regex = new RegExp("[^a-zA-Z0-9" + escapedSep + "]", "g");
    text = text.replace(regex, "");
    
    // Remove multiple separators
    const multiSep = new RegExp(escapedSep + "+", "g");
    text = text.replace(multiSep, separator);
    
    // Remove leading/trailing separators
    const trimSep = new RegExp("^" + escapedSep + "+|" + escapedSep + "+$", "g");
    text = text.replace(trimSep, "");
    
    if (!text) {
      outputSlug.textContent = "Enter text to generate slug...";
      outputSlug.classList.remove('text-emerald-600', 'dark:text-emerald-400');
      outputSlug.classList.add('text-slate-400');
    } else {
      outputSlug.textContent = text;
      outputSlug.classList.add('text-emerald-600', 'dark:text-emerald-400');
      outputSlug.classList.remove('text-slate-400');
    }
  };
  
  window.copySlug = function() {
    const text = outputSlug.textContent;
    if(text && text !== "Enter text to generate slug...") {
      navigator.clipboard.writeText(text);
      if(window.Devpalettes && window.Devpalettes.Toast) {
        window.Devpalettes.Toast.show('Slug Copied!', 'success');
      } else {
        alert('Slug Copied!');
      }
    }
  };
  
  window.clearInput = function() {
    inputText.value = '';
    generateSlug();
  };
})();
