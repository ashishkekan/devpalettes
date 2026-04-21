(function() {
  const textA = document.getElementById('text-a');
  const textB = document.getElementById('text-b');
  const resultOutput = document.getElementById('result-output');
  const addedCountEl = document.getElementById('added-count');
  const removedCountEl = document.getElementById('removed-count');
  
  // --- LCS Diff Logic ---
  
  function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
  }
  
  function diff(oldText, newText) {
    // Split by word (keeping spaces logic simple: split by space)
    // For a more robust version, you might use regex to keep punctuation attached.
    const oldWords = oldText.split(/(\s+)/); // Keep delimiters
    const newWords = newText.split(/(\s+)/);
    
    // Create matrix for LCS
    const m = oldWords.length;
    const n = newWords.length;
    const dp = [];
    for(let i=0; i<=m; i++){
       dp[i] = [];
       for(let j=0; j<=n; j++){
          if(i===0) dp[i][j] = 0;
          else if(j===0) dp[i][j] = 0;
          else if(oldWords[i-1] === newWords[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
          else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
       }
    }
    
    // Backtrack to generate diff
    let i = m, j = n;
    let result = [];
    let added = 0;
    let removed = 0;
    
    while(i > 0 || j > 0){
       if (i > 0 && j > 0 && oldWords[i-1] === newWords[j-1]){
          result.unshift(escapeHtml(oldWords[i-1]));
          i--; j--;
       } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])){
          // Added word
          let word = escapeHtml(newWords[j-1]);
          if(!/^\s+$/.test(word)) { // Ignore pure whitespace for counting
             result.unshift("<span class=\"diff-added\">" + word + "</span>");
             added++;
          } else {
             result.unshift(word); // Just whitespace
          }
          j--;
       } else if (i > 0 && (j === 0 || dp[i-1][j] > dp[i][j-1])){
          // Removed word
          let word = escapeHtml(oldWords[i-1]);
          if(!/^\s+$/.test(word)) {
             result.unshift("<span class=\"diff-removed\">" + word + "</span>");
             removed++;
          } else {
             result.unshift(word);
          }
          i--;
       }
    }
    
    return { html: result.join(''), added: added, removed: removed };
  }
  
  window.compareTexts = function() {
    const valA = textA.value;
    const valB = textB.value;
    
    if (!valA && !valB) {
      resultOutput.innerHTML = '<span class="text-slate-400">No text to compare.</span>';
      return;
    }
    
    const res = diff(valA, valB);
    
    resultOutput.innerHTML = res.html || '<span class="text-slate-400">Texts are identical.</span>';
    addedCountEl.textContent = res.added;
    removedCountEl.textContent = res.removed;
  };
  
  window.clearPane = function(id) {
    if(id === 'a') textA.value = '';
    else textB.value = '';
  };
  
  window.copyResult = function() {
    const text = resultOutput.innerText;
    navigator.clipboard.writeText(text).then(function() {
        if(window.Devpalettes && window.Devpalettes.Toast) {
          window.Devpalettes.Toast.show('Result Copied!', 'success');
        } else {
          alert('Result Copied!');
        }
    });
  };
  
  window.loadSamples = function() {
    textA.value = "The quick brown fox jumps over the lazy dog. This is a sample text for testing the diff checker. It works perfectly.";
    textB.value = "The fast brown fox jumped over the lazy cat. This is an example text for testing the diff checker. It works perfectly now!";
  };
  
})();
