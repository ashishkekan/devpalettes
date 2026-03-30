(function() {
  var STORAGE_KEY = 'devpalettes-code-snippets';
  
  var titleInput = document.getElementById('snippet-title');
  var langSelect = document.getElementById('snippet-lang');
  var codeInput = document.getElementById('snippet-code');
  var searchInput = document.getElementById('search-input');
  var filterLang = document.getElementById('filter-lang');
  var snippetsGrid = document.getElementById('snippets-grid');
  var emptyState = document.getElementById('empty-state');
  
  function getSnippets() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  
  function saveSnippets() {
    var title = titleInput.value.trim();
    var lang = langSelect.value;
    var code = codeInput.value;
    
    if (!title) {
      if (window.Devpalettes && window.Devpalettes.Toast) {
        window.Devpalettes.Toast.show('Please enter a title for the snippet.', 'error');
      } else {
        alert('Please enter a title for the snippet.');
      }
      return;
    }
    if (!code.trim()) {
      if (window.Devpalettes && window.Devpalettes.Toast) {
        window.Devpalettes.Toast.show('Please enter some code to save.', 'error');
      } else {
        alert('Please enter some code to save.');
      }
      return;
    }
    
    var snippets = getSnippets();
    snippets.unshift({
      id: Date.now(),
      title: title,
      language: lang,
      code: code,
      createdAt: new Date().toISOString()
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
    
    titleInput.value = '';
    codeInput.value = '';
    
    loadSnippets();
    
    if (window.Devpalettes && window.Devpalettes.Toast) {
      window.Devpalettes.Toast.show('Snippet Saved!', 'success');
    }
  }
  
  function copySnippetInput() {
    var code = codeInput.value;
    if (!code.trim()) return;
    navigator.clipboard.writeText(code).then(function() {
      if (window.Devpalettes && window.Devpalettes.Toast) {
        window.Devpalettes.Toast.show('Code Copied!', 'success');
      } else {
        alert('Code Copied!');
      }
    });
  }
  
  function clearInput() {
    titleInput.value = '';
    codeInput.value = '';
  }
  
  function deleteSnippet(id) {
    var snippets = getSnippets().filter(function(s) {
      return s.id !== id;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
    loadSnippets();
  }
  
  function copySavedSnippet(id) {
    var snippets = getSnippets();
    var snippet = snippets.find(function(s) { return s.id === id; });
    if (!snippet) return;
    
    navigator.clipboard.writeText(snippet.code).then(function() {
      if (window.Devpalettes && window.Devpalettes.Toast) {
        window.Devpalettes.Toast.show('Code Copied!', 'success');
      } else {
        alert('Code Copied!');
      }
    });
  }
  
  function loadSnippets() {
    var snippets = getSnippets();
    var searchTerm = (searchInput.value || '').toLowerCase();
    var filterLangVal = filterLang.value;
    
    var filtered = snippets.filter(function(s) {
      var matchSearch = !searchTerm || s.title.toLowerCase().indexOf(searchTerm) !== -1;
      var matchLang = filterLangVal === 'All' || s.language === filterLangVal;
      return matchSearch && matchLang;
    });
    
    if (filtered.length === 0) {
      snippetsGrid.innerHTML = '';
      emptyState.style.display = 'block';
      if (searchTerm || filterLangVal !== 'All') {
        emptyState.querySelector('p').textContent = 'No snippets found matching your search.';
      } else {
        emptyState.querySelector('p').textContent = 'No snippets saved yet. Create your first one!';
      }
      return;
    }
    
    emptyState.style.display = 'none';
    
    var langColors = {
      'JavaScript': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      'HTML': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
      'CSS': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      'JSON': 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
      'Python': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      'TypeScript': 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300',
      'Java': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      'C++': 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
      'C#': 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
      'PHP': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
      'SQL': 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
      'Go': 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
      'Ruby': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
      'Swift': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
      'Bash / Shell': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      'Other': 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
    };
    
    var html = '';
    for (var i = 0; i < filtered.length; i++) {
      var s = filtered[i];
      var previewCode = s.code.substring(0, 150).replace(/</g, '&lt;').replace(/>/g, '&gt;');
      var colorClass = langColors[s.language] || langColors['Other'];
      
      html += '<div class="glass-card p-5 shimmer-card flex flex-col gap-3">';
      html += '  <div class="flex justify-between items-start gap-2">';
      html += '    <h3 class="font-semibold text-sm">' + escapeHtml(s.title) + '</h3>';
      html += '    <span class="text-xs font-bold px-2 py-0.5 rounded ' + colorClass + ' shrink-0 whitespace-nowrap">' + escapeHtml(s.language) + '</span>';
      html += '  </div>';
      html += '  <div class="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 snippet-preview"><code class="text-xs text-slate-600 dark:text-slate-300">' + previewCode + (s.code.length > 150 ? '...' : '') + '</code></div>';
      html += '  <div class="flex gap-2 mt-1">';
      html += '    <button onclick="copySavedSnippet(' + s.id + ')" class="btn-secondary text-xs py-1.5 px-3 shrink-0" aria-label="Copy snippet"><i class="fas fa-copy mr-1" aria-hidden="true"></i>Copy</button>';
      html += '    <button onclick="deleteSnippet(' + s.id + ')" class="text-xs py-1.5 px-3 rounded font-medium text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors shrink-0" aria-label="Delete snippet"><i class="fas fa-trash mr-1" aria-hidden="true"></i>Delete</button>';
      html += '  </div>';
      html += '</div>';
    }
    
    snippetsGrid.innerHTML = html;
  }
  
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }
  
  window.saveSnippet = saveSnippet;
  window.copySnippetInput = copySnippetInput;
  window.clearInput = clearInput;
  window.deleteSnippet = deleteSnippet;
  window.copySavedSnippet = copySavedSnippet;
  
  // Populate filter dropdown dynamically
  (function populateFilters() {
    var langs = ['JavaScript', 'HTML', 'CSS', 'JSON', 'Python', 'TypeScript', 'Java', 'C++', 'C#', 'PHP', 'SQL', 'Go', 'Ruby', 'Swift', 'Bash / Shell', 'Other'];
    for (var i = 0; i < langs.length; i++) {
      var opt = document.createElement('option');
      opt.value = langs[i];
      opt.textContent = langs[i];
      filterLang.appendChild(opt);
    }
  })();
  
  loadSnippets();
  
})();
