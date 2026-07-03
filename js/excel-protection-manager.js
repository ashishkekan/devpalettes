(function () {
  'use strict';

  // ─── DOM Elements ───
  var uploadZone = document.getElementById('upload-zone');
  var fileInput = document.getElementById('file-input');
  var fileInfoPanel = document.getElementById('file-info-panel');
  var fileName = document.getElementById('file-name');
  var fileMeta = document.getElementById('file-meta');
  var clearFileBtn = document.getElementById('clear-file-btn');

  var analyzeBtn = document.getElementById('analyze-btn');
  var removeProtectBtn = document.getElementById('remove-protect-btn');
  var downloadBtn = document.getElementById('download-btn');

  var progressContainer = document.getElementById('progress-container');
  var progressBar = document.getElementById('progress-bar');
  var progressPercent = document.getElementById('progress-percent');
  var progressStatus = document.getElementById('progress-status');

  var sheetsTableContainer = document.getElementById('sheets-table-container');
  var sheetsTableBody = document.getElementById('sheets-table-body');
  var toastLiveRegion = document.getElementById('toast-live-region');

  // ─── State ───
  var currentFile = null;
  var processedBlobUrl = null;
  var parsedSheetsData = []; // Stores mapping of sheet names to XML files

  // ─── Helpers ───
  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function showToast(message, type) {
    if (toastLiveRegion) {
      toastLiveRegion.textContent = '';
      requestAnimationFrame(function() { toastLiveRegion.textContent = message; });
    }

    var container = document.getElementById('toast-container');
    var toast = document.createElement('div');
    var iconClass = 'fas fa-circle-check text-emerald-500';
    var borderClass = 'border-emerald-500/30';
    
    if (type === 'error') {
      iconClass = 'fas fa-circle-xmark text-red-400';
      borderClass = 'border-red-400/30';
    } else if (type === 'info') {
      iconClass = 'fas fa-circle-info text-blue-400';
      borderClass = 'border-blue-400/30';
    }
    
    toast.className = 'flex items-center gap-3 px-5 py-3 rounded-xl border ' + borderClass + ' bg-white dark:bg-slate-800 shadow-lg text-sm transform translate-x-full transition-transform duration-300';
    toast.innerHTML = '<i class="' + iconClass + '" aria-hidden="true"></i><span class="text-slate-700 dark:text-slate-200">' + escapeHtml(message) + '</span>';
    container.appendChild(toast);

    requestAnimationFrame(function() {
      toast.classList.remove('translate-x-full');
      toast.classList.add('translate-x-0');
    });

    setTimeout(function() {
      toast.classList.remove('translate-x-0');
      toast.classList.add('translate-x-full');
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3000);
  }

  function updateProgress(percent, statusText) {
    progressBar.style.width = percent + '%';
    progressPercent.textContent = Math.round(percent) + '%';
    if (statusText) progressStatus.textContent = statusText;
  }

  function resetToolUI() {
    currentFile = null;
    parsedSheetsData = [];
    if (processedBlobUrl) {
      URL.revokeObjectURL(processedBlobUrl);
      processedBlobUrl = null;
    }
    fileInput.value = '';
    fileInfoPanel.classList.add('hidden');
    sheetsTableContainer.classList.add('hidden');
    progressContainer.classList.add('hidden');
    analyzeBtn.disabled = true;
    removeProtectBtn.disabled = true;
    downloadBtn.disabled = true;
    updateProgress(0, 'Idle');
  }

  // ─── Event Listeners ───
  uploadZone.addEventListener('click', function() { fileInput.click(); });
  uploadZone.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  clearFileBtn.addEventListener('click', resetToolUI);

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function(eventName) {
    uploadZone.addEventListener(eventName, function(e) { e.preventDefault(); e.stopPropagation(); }, false);
  });

  ['dragenter', 'dragover'].forEach(function(eventName) {
    uploadZone.addEventListener(eventName, function() {
      uploadZone.classList.add('drag-over', 'border-emerald-500', 'bg-emerald-500/10');
    }, false);
  });

  ['dragleave', 'drop'].forEach(function(eventName) {
    uploadZone.addEventListener(eventName, function() {
      uploadZone.classList.remove('drag-over', 'border-emerald-500', 'bg-emerald-500/10');
    }, false);
  });

  uploadZone.addEventListener('drop', function(e) {
    var files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  }, false);

  fileInput.addEventListener('change', function(e) {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
  });

  function handleFile(file) {
    var validExtensions = ['.xlsx', '.xlsm'];
    var fileNameStr = file.name.toLowerCase();
    var isValid = validExtensions.some(function(ext) { return fileNameStr.endsWith(ext); });

    if (!isValid) {
      showToast('Invalid file. Please upload .xlsx or .xlsm (Legacy .xls not supported)', 'error');
      return;
    }

    currentFile = file;
    fileName.textContent = file.name;
    fileMeta.textContent = 'Size: ' + formatBytes(file.size) + ' | Ready to analyze';
    
    fileInfoPanel.classList.remove('hidden');
    sheetsTableContainer.classList.add('hidden');
    progressContainer.classList.add('hidden');
    
    analyzeBtn.disabled = false;
    removeProtectBtn.disabled = true;
    downloadBtn.disabled = true;
    
    if (processedBlobUrl) {
      URL.revokeObjectURL(processedBlobUrl);
      processedBlobUrl = null;
    }
    
    showToast('File loaded successfully', 'success');
  }

  // ─── Core Actions ───
  analyzeBtn.addEventListener('click', async function() {
    if (!currentFile || typeof JSZip === 'undefined') {
      if (typeof JSZip === 'undefined') showToast('Library still loading, wait 2 seconds and try again.', 'info');
      return;
    }

    analyzeBtn.disabled = true;
    removeProtectBtn.disabled = true;
    sheetsTableContainer.classList.add('hidden');
    progressContainer.classList.remove('hidden');
    updateProgress(20, 'Reading Excel archive...');
    parsedSheetsData = [];

    try {
      const zip = await JSZip.loadAsync(currentFile);
      updateProgress(50, 'Scanning workbook structure...');

      // 1. Parse workbook.xml to get sheet names and r:id
      const workbookXmlText = await zip.file("xl/workbook.xml").async("string");
      const parser = new DOMParser();
      const workbookDoc = parser.parseFromString(workbookXmlText, "application/xml");
      const sheets = workbookDoc.getElementsByTagName("sheet");

      // 2. Parse workbook.xml.rels to map r:id to actual file paths
      const relsXmlText = await zip.file("xl/_rels/workbook.xml.rels").async("string");
      const relsDoc = parser.parseFromString(relsXmlText, "application/xml");
      const rels = relsDoc.getElementsByTagName("Relationship");
      
      const relMap = {};
      for (let rel of rels) {
        relMap[rel.getAttribute("Id")] = rel.getAttribute("Target");
      }

      // 3. Check each sheet XML for <sheetProtection>
      for (let i = 0; i < sheets.length; i++) {
        let sheetName = sheets[i].getAttribute("name");
        let rId = sheets[i].getAttribute("r:id") || sheets[i].getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id");
        let target = relMap[rId];

        if (!target) continue;

        // Normalize path (rels usually contain paths relative to xl/)
        let filePath = target.startsWith("/") ? target.substring(1) : "xl/" + target;
        
        // Fix specific issue where sometimes it's escaped
        filePath = filePath.replace(/\.\.\//g, '');

        let sheetFile = zip.file(filePath);
        if (!sheetFile) continue;

        let sheetXmlText = await sheetFile.async("string");
        let isProtected = sheetXmlText.includes("<sheetProtection");

        parsedSheetsData.push({
          name: sheetName,
          protected: isProtected,
          filePath: filePath
        });
      }

      updateProgress(100, 'Analysis complete!');
      renderSheetsTable(parsedSheetsData);
      
      fileMeta.textContent = 'Size: ' + formatBytes(currentFile.size) + ' | Sheets: ' + parsedSheetsData.length;
      removeProtectBtn.disabled = false;
      showToast('Workbook analyzed successfully', 'success');

    } catch (error) {
      console.error(error);
      showToast('Error reading Excel file. It might be corrupted.', 'error');
      updateProgress(0, 'Error');
    } finally {
      setTimeout(() => progressContainer.classList.add('hidden'), 1000);
      analyzeBtn.disabled = false;
    }
  });

  removeProtectBtn.addEventListener('click', async function() {
    if (!currentFile) return;

    analyzeBtn.disabled = true;
    removeProtectBtn.disabled = true;
    progressContainer.classList.remove('hidden');
    updateProgress(20, 'Modifying XML structure...');

    try {
      const zip = await JSZip.loadAsync(currentFile);
      let unlockedCount = 0;

      for (let sheet of parsedSheetsData) {
        if (sheet.protected) {
          let sheetFile = zip.file(sheet.filePath);
          if (sheetFile) {
            let sheetXmlText = await sheetFile.async("string");
            
            // Surgically remove the <sheetProtection ... /> tag
            // This preserves 100% of the data, formulas, and macros
            let newXmlText = sheetXmlText.replace(/<sheetProtection[^>]*\/>/g, "");
            
            zip.file(sheet.filePath, newXmlText);
            unlockedCount++;
          }
        }
      }

      updateProgress(70, 'Repackaging Excel file...');
      
      // Determine MIME type based on original extension
      let mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      if (currentFile.name.toLowerCase().endsWith('.xlsm')) {
        mimeType = "application/vnd.ms-excel.sheet.macroEnabled.12";
      }

      // Generate the new zip (Excel file)
      const blob = await zip.generateAsync({type: "blob", mimeType: mimeType});
      processedBlobUrl = URL.createObjectURL(blob);

      updateProgress(100, 'Processing complete!');

      // Update table UI to show all unprotected
      document.querySelectorAll('[data-protected="true"]').forEach(function(row) {
        row.setAttribute('data-protected', 'false');
        row.querySelector('.status-badge').innerHTML = '<i class="fas fa-unlock text-xs mr-1"></i> Unprotected';
        row.querySelector('.status-badge').className = 'status-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      });

      downloadBtn.disabled = false;
      showToast(unlockedCount + ' sheet(s) successfully unlocked', 'success');
      
    } catch (error) {
      console.error(error);
      showToast('Error removing protection', 'error');
      updateProgress(0, 'Error');
    } finally {
      setTimeout(() => progressContainer.classList.add('hidden'), 1000);
      analyzeBtn.disabled = false;
      removeProtectBtn.disabled = false;
    }
  });

  downloadBtn.addEventListener('click', function() {
    if (!processedBlobUrl) {
      showToast('No processed file available', 'error');
      return;
    }

    var a = document.createElement('a');
    a.href = processedBlobUrl;
    
    // Preserve original extension
    var originalName = currentFile.name.replace(/\.(xlsx|xlsm)$/i, '');
    var ext = currentFile.name.toLowerCase().endsWith('.xlsm') ? '.xlsm' : '.xlsx';
    a.download = originalName + '_unlocked' + ext;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showToast('File download started', 'info');
  });

  function renderSheetsTable(sheets) {
    sheetsTableBody.innerHTML = '';
    sheets.forEach(function(sheet) {
      var tr = document.createElement('tr');
      tr.setAttribute('data-protected', sheet.protected);
      tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/50';
      
      var statusHtml = sheet.protected 
        ? '<span class="status-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><i class="fas fa-lock text-xs mr-1"></i> Protected</span>'
        : '<span class="status-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"><i class="fas fa-unlock text-xs mr-1"></i> Unprotected</span>';
      
      tr.innerHTML = 
        '<td class="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">' + escapeHtml(sheet.name) + '</td>' +
        '<td class="py-3 px-4">' + statusHtml + '</td>';
        
      sheetsTableBody.appendChild(tr);
    });
    sheetsTableContainer.classList.remove('hidden');
  }

})();
