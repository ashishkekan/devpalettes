(function() {
  var outputBox = document.getElementById('output-box');
  var countSlider = document.getElementById('ctrl-count');
  
  var lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
  
  window.updateVal = function() {
    document.getElementById('v-count').textContent = countSlider.value;
  };
  
  window.generate = function() {
    var count = parseInt(countSlider.value);
    var html = "";
    for (var i = 0; i < count; i++) {
      html += "<p>" + lorem + "</p>";
    }
    outputBox.innerHTML = html;
  };
  
  window.copyText = function() {
    var text = outputBox.innerText;
    navigator.clipboard.writeText(text);
    if (window.Devpalettes && window.Devpalettes.Toast) {
      window.Devpalettes.Toast.show('Text Copied!', 'success');
    }
  };
  
  generate();
})();
