(function() {
  var textA = document.getElementById('text-a');
  var textB = document.getElementById('text-b');
  var resultOutput = document.getElementById('result-output');
  var addedCountEl = document.getElementById('added-count');
  var removedCountEl = document.getElementById('removed-count');
  
  // --- Clipboard helper with fallback ---
  function copyToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showCopySuccess(successMsg || 'Copied!');
      }).catch(function() {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }
  
  function fallbackCopy(text, successMsg) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand('copy'); showCopySuccess(successMsg || 'Copied!'); }
    catch(e) { /* silent fail */ }
    document.body.removeChild(textarea);
  }
  
  function showCopySuccess(msg) {
    if (window.Devpalettes && window.Devpalettes.Toast) {
      window.Devpalettes.Toast.show(msg, 'success');
    }
  }
  
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
    var oldWords = oldText.split(/(\s+)/);
    var newWords = newText.split(/(\s+)/);
    
    var m = oldWords.length;
    var n = newWords.length;
    var dp = [];
    for(var i=0; i<=m; i++){
       dp[i] = [];
       for(var j=0; j<=n; j++){
          if(i===0) dp[i][j] = 0;
          else if(j===0) dp[i][j] = 0;
          else if(oldWords[i-1] === newWords[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
          else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
       }
    }
    
    var i = m, j = n;
    var result = [];
    var added = 0;
    var removed = 0;
    
    while(i > 0 || j > 0){
       if (i > 0 && j > 0 && oldWords[i-1] === newWords[j-1]){
          result.unshift(escapeHtml(oldWords[i-1]));
          i--; j--;
       } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])){
          var word = escapeHtml(newWords[j-1]);
          if(!/^\s+$/.test(word)) {
             result.unshift("<span class=\"diff-added\">" + word + "</span>");
             added++;
          } else {
             result.unshift(word);
          }
          j--;
       } else if (i > 0 && (j === 0 || dp[i-1][j] > dp[i][j-1])){
          var word = escapeHtml(oldWords[i-1]);
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
    var valA = textA.value;
    var valB = textB.value;
    
    if (!valA && !valB) {
      resultOutput.innerHTML = '<span class="text-slate-400">No text to compare.</span>';
      addedCountEl.textContent = '0';
      removedCountEl.textContent = '0';
      return;
    }
    
    var res = diff(valA, valB);
    
    resultOutput.innerHTML = res.html || '<span class="text-slate-400">Texts are identical.</span>';
    addedCountEl.textContent = res.added;
    removedCountEl.textContent = res.removed;
  };
  
  window.clearPane = function(id) {
    if(id === 'a') textA.value = '';
    else textB.value = '';
  };
  
  window.copyResult = function() {
    var text = resultOutput.innerText;
    var copyBtn = document.getElementById('copy-result-btn');
    
    copyToClipboard(text, 'Result Copied!');
    
    // Visual + accessible feedback
    var originalHTML = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check mr-1" aria-hidden="true"></i> Copied!';
    copyBtn.setAttribute('aria-label', 'Result copied to clipboard');
    
    setTimeout(function() {
      copyBtn.innerHTML = originalHTML;
      copyBtn.setAttribute('aria-label', 'Copy comparison result to clipboard');
    }, 2000);
  };
  
  window.loadSamples = function() {
    textA.value = "The quick brown fox jumps over the lazy dog. This is a sample text for testing the diff checker. It works perfectly.";
    textB.value = "The fast brown fox jumped over the lazy cat. This is an example text for testing the diff checker. It works perfectly now!";
  };
  
})();
