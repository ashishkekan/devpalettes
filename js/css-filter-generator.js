(function() {
  var preview = document.getElementById('filter-preview');
  var codeOutput = document.getElementById('code-output');
  var copyStatus = document.getElementById('copy-status');

  function updateFilter() {
    var bl = document.getElementById('f-blur').value;
    var br = document.getElementById('f-bri').value;
    var co = document.getElementById('f-con').value;
    var gr = document.getElementById('f-gray').value;
    var se = document.getElementById('f-sep').value;
    var hu = document.getElementById('f-hue').value;

    document.getElementById('v-blur').textContent = bl;
    document.getElementById('v-bri').textContent = br;
    document.getElementById('v-con').textContent = co;
    document.getElementById('v-gray').textContent = gr;
    document.getElementById('v-sep').textContent = se;
    document.getElementById('v-hue').textContent = hu;

    var filterStr = 'blur(' + bl + 'px) brightness(' + br + '%) contrast(' + co + '%) grayscale(' + gr + '%) sepia(' + se + '%) hue-rotate(' + hu + 'deg)';

    preview.style.filter = filterStr;
    generateCode(bl, br, co, gr, se, hu);
  }

  function generateCode(bl, br, co, gr, se, hu) {
    var css = '.filtered-image {\n  filter: \n    blur(' + bl + 'px) \n    brightness(' + br + '%) \n    contrast(' + co + '%) \n    grayscale(' + gr + '%) \n    sepia(' + se + '%) \n    hue-rotate(' + hu + 'deg);\n}';
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
  }

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
        window.Devpalettes.Toast.show('Code Copied!', 'success');
      }
      if (copyStatus) {
        copyStatus.textContent = 'CSS code copied to clipboard';
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

  window.updateFilter = updateFilter;
  window.resetFilters = resetFilters;
  window.copyCode = copyCode;

  updateFilter();
})();
