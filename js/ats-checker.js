/**
 * ATS Resume Checker - DevPalettes
 * Client-side resume analysis using PDF.js
 */

(function() {
  'use strict';

  // --- Configuration ---
  const STOP_WORDS = new Set([
    "a", "an", "the", "and", "or", "but", "if", "because", "as", "what", "which", "this", "that", "these", "those", 
    "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", 
    "should", "can", "could", "may", "might", "must", "shall", "to", "of", "in", "for", "on", "with", "at", "by", "from", 
    "up", "about", "into", "over", "after", "job", "description", "role", "responsibilities", "requirements", "qualifications",
    "we", "you", "your", "our", "us", "looking", "seeking"
  ]);

  // --- State ---
  let resumeText = "";
  
  // --- DOM Elements ---
  const el = {
    dropZone: document.getElementById('drop-zone'),
    resumeInput: document.getElementById('resume-input'),
    fileInfo: document.getElementById('file-info'),
    previewContainer: document.getElementById('extracted-preview-container'),
    previewToggle: document.getElementById('toggle-preview'),
    resumeTextPreview: document.getElementById('resume-text-preview'),
    jdInput: document.getElementById('jd-input'),
    jdCharCount: document.getElementById('jd-char-count'),
    analyzeBtn: document.getElementById('analyze-btn'),
    resultsEmpty: document.getElementById('results-empty'),
    resultsContent: document.getElementById('results-content'),
    scoreCircle: document.getElementById('score-circle'),
    scoreValue: document.getElementById('score-value'),
    scoreMessage: document.getElementById('score-message'),
    statMatch: document.getElementById('stat-match'),
    statFormat: document.getElementById('stat-format'),
    matchedKeywords: document.getElementById('matched-keywords'),
    missingKeywords: document.getElementById('missing-keywords'),
    suggestionsList: document.getElementById('suggestions-list'),
    copyBtn: document.getElementById('copy-report-btn'),
    downloadBtn: document.getElementById('download-report-btn')
  };

  // --- Event Listeners ---
  function init() {
    // Drag & Drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      el.dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
      el.dropZone.addEventListener(eventName, () => el.dropZone.classList.add('drag-active'), false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      el.dropZone.addEventListener(eventName, () => el.dropZone.classList.remove('drag-active'), false);
    });
    
    el.dropZone.addEventListener('drop', handleDrop, false);
    el.dropZone.addEventListener('click', () => el.resumeInput.click());
    el.resumeInput.addEventListener('change', handleFiles);
    
    // JD Input
    el.jdInput.addEventListener('input', () => {
      el.jdCharCount.textContent = `${el.jdInput.value.length} characters`;
    });

    // Preview Toggle
    el.previewToggle.addEventListener('click', () => {
      el.resumeTextPreview.classList.toggle('hidden');
    });

    // Analyze
    el.analyzeBtn.addEventListener('click', runAnalysis);

    // Actions
    el.copyBtn.addEventListener('click', copyReport);
    el.downloadBtn.addEventListener('click', downloadReport);
  }

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // --- File Handling ---
  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles({ target: { files: files } });
  }

  function handleFiles(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      showToast('Please upload a PDF file', 'error');
      return;
    }

    el.fileInfo.textContent = `Selected: ${file.name} (${(file.size/1024).toFixed(1)} KB)`;
    el.fileInfo.classList.remove('hidden');
    
    extractTextFromPDF(file);
  }

  // --- PDF Extraction ---
  async function extractTextFromPDF(file) {
    showToast('Reading PDF...', 'info');
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      
      // Loop through all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + " ";
      }
      
      resumeText = fullText;
      el.resumeTextPreview.value = resumeText;
      el.previewContainer.classList.remove('hidden');
      showToast('PDF text extracted successfully', 'success');
      
    } catch (error) {
      console.error(error);
      showToast('Error parsing PDF. Ensure it is a text-based PDF.', 'error');
    }
  }

  // --- Analysis Logic ---
  function runAnalysis() {
    if (!resumeText) {
      showToast('Please upload a resume first', 'error');
      return;
    }
    if (!el.jdInput.value.trim()) {
      showToast('Please enter a job description', 'error');
      return;
    }

    const jdText = el.jdInput.value;
    
    // 1. Extract Keywords
    const keywords = extractKeywords(jdText);
    
    if (keywords.length === 0) {
      showToast('Could not extract keywords from JD. It might be too short.', 'error');
      return;
    }

    // 2. Match Keywords
    const normalizedResume = resumeText.toLowerCase();
    const matched = [];
    const missing = [];

    keywords.forEach(kw => {
      if (normalizedResume.includes(kw.toLowerCase())) {
        matched.push(kw);
      } else {
        missing.push(kw);
      }
    });

    // 3. Calculate Scores
    const totalKws = keywords.length;
    const matchCount = matched.length;
    const keywordPercent = Math.round((matchCount / totalKws) * 100);
    
    // Score Weighting
    // 60% Keyword Match
    const keywordScore = Math.round((matchCount / totalKws) * 60);
    
    // 20% Keyword Density (Relevance)
    const resumeWords = resumeText.split(/\s+/).length;
    const densityScore = resumeWords > 0 ? Math.min(Math.round((matchCount / resumeWords) * 200), 20) : 0; 

    // 20% Formatting Checks
    let formatPoints = 0;
    if (resumeWords > 50) formatPoints += 5; // Min length
    if (/experience|education|skills|summary/i.test(resumeText)) formatPoints += 5; // Standard headers
    if (/[\w\.-]+@[\w\.-]+\.\w+/.test(resumeText)) formatPoints += 5; // Has email
    if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText)) formatPoints += 5; // Has phone
    const formatScore = formatPoints;

    const totalScore = keywordScore + densityScore + formatScore;

    // 4. Generate Suggestions
    const suggestions = [];
    if (matchCount < totalKws * 0.5) {
      suggestions.push("Your resume is missing many keywords from the job description. Try to incorporate skills like: " + missing.slice(0, 3).join(", "));
    }
    if (formatScore < 15) {
      suggestions.push("Improve formatting by ensuring standard headers (Experience, Skills) and contact info are clear.");
    }
    if (!/quantified|increased|decreased|%|\$|managed/i.test(resumeText)) {
      suggestions.push("Add measurable results (e.g., 'Increased sales by 20%') to strengthen your impact.");
    }
    if (resumeWords < 200) {
      suggestions.push("Your resume seems too short. Expand on your experience and responsibilities.");
    }
    if (suggestions.length === 0) {
      suggestions.push("Great job! Your resume is well-optimized for this role.");
    }

    // 5. Render Results
    renderResults(totalScore, keywordPercent, formatScore, matched, missing, suggestions);
  }

  function extractKeywords(text) {
    // Normalize
    let clean = text.toLowerCase().replace(/[^\w\s+#]/g, ' ');
    let words = clean.split(/\s+/);
    
    // Filter
    let uniqueKeywords = new Set();
    words.forEach(w => {
      if (w.length > 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w)) {
        uniqueKeywords.add(w);
      }
    });
    
    return Array.from(uniqueKeywords);
  }

  // --- Rendering ---
  function renderResults(score, keywordPercent, formatScore, matched, missing, suggestions) {
    // Hide empty state, show content
    el.resultsEmpty.classList.add('hidden');
    el.resultsContent.classList.remove('hidden');
    
    // FIX: Removed 'animate-on-scroll' class here. 
    // This class makes the element invisible (opacity: 0) until you scroll. 
    // Since we are injecting it dynamically, we want it visible immediately.
    // We rely on the CSS class 'hidden' being removed to show it.

    // Update Score Circle
    // Circumference of r=70 is ~440
    const circumference = 440;
    const offset = circumference - (score / 100) * circumference;
    el.scoreCircle.style.strokeDashoffset = offset;
    
    // Color based on score
    el.scoreCircle.classList.remove('text-blue-600', 'text-emerald-500', 'text-red-500', 'text-yellow-500', 'dark:text-blue-400', 'dark:text-emerald-400', 'dark:text-red-400', 'dark:text-yellow-400');
    
    let colorClass = 'text-red-500';
    let message = "Needs Improvement";
    let darkColor = 'dark:text-red-400';
    
    if (score >= 80) {
      colorClass = 'text-emerald-500';
      darkColor = 'dark:text-emerald-400';
      message = "Excellent Match!";
    } else if (score >= 60) {
      colorClass = 'text-blue-500';
      darkColor = 'dark:text-blue-400';
      message = "Good Candidate";
    } else if (score >= 40) {
      colorClass = 'text-yellow-500';
      darkColor = 'dark:text-yellow-400';
      message = "Moderate Match";
    }

    el.scoreCircle.classList.add(colorClass, darkColor);
    el.scoreValue.textContent = score;
    el.scoreMessage.textContent = message;
    el.scoreMessage.className = `text-xl font-medium mb-4 ${colorClass} ${darkColor}`;

    // Stats
    el.statMatch.textContent = `${keywordPercent}%`;
    el.statFormat.textContent = `${formatScore}/20`;

    // Keywords
    el.matchedKeywords.innerHTML = matched.map(k => 
      `<span class="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded text-xs border border-emerald-200 dark:border-emerald-800">${k}</span>`
    ).join('');
    
    el.missingKeywords.innerHTML = missing.map(k => 
      `<span class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded text-xs border border-red-200 dark:border-red-800">${k}</span>`
    ).join('');

    // Suggestions
    el.suggestionsList.innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');

    // Scroll to results
    el.resultsContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast('Analysis Complete', 'success');
  }

  // --- Utilities ---
  function copyReport() {
    const text = `
ATS Resume Analysis Report
---------------------------
Overall Score: ${el.scoreValue.textContent}
Keyword Match: ${el.statMatch.textContent}
Format Score: ${el.statFormat.textContent}

Matched Keywords: ${Array.from(el.matchedKeywords.children).map(c => c.textContent).join(', ')}
Missing Keywords: ${Array.from(el.missingKeywords.children).map(c => c.textContent).join(', ')}

Suggestions:
 ${Array.from(el.suggestionsList.children).map(li => li.textContent).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
      showToast('Report copied to clipboard', 'success');
    });
  }

  function downloadReport() {
    const text = `
ATS Resume Analysis Report
---------------------------
Overall Score: ${el.scoreValue.textContent}
Keyword Match: ${el.statMatch.textContent}
Format Score: ${el.statFormat.textContent}

Matched Keywords: ${Array.from(el.matchedKeywords.children).map(c => c.textContent).join(', ')}
Missing Keywords: ${Array.from(el.missingKeywords.children).map(c => c.textContent).join(', ')}

Suggestions:
 ${Array.from(el.suggestionsList.children).map(li => li.textContent).join('\n')}
    `.trim();
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ats-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Report downloaded', 'success');
  }

  function showToast(msg, type = 'info') {
    // Assuming toast container exists (handled by main.js), otherwise create simple fallback
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed bottom-6 right-6 z-50 space-y-2';
      document.body.appendChild(container);
    }

    const bg = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-slate-700';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    const toast = document.createElement('div');
    toast.className = `${bg} text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium transform translate-x-full transition-transform duration-300 flex items-center gap-2`;
    toast.innerHTML = `<i class="fas ${icon}"></i> ${msg}`;
    
    container.appendChild(toast);
    
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
