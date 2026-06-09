/**
 * Landing Page Builder Logic
 * Handles state management, UI rendering, and HTML generation.
 */
(function() {
  'use strict';

  // Initial State (Default Template)
  const defaultSections = [
      {
          id: 'sec_1',
          type: 'hero',
          data: {
              heading: 'Build Beautiful Pages Fast',
              subheading: 'Create stunning landing pages in minutes with our visual builder. No coding skills required.',
              btnText: 'Get Started Free',
              bgColor: '#f0f9ff',
              textColor: '#0f172a',
              align: 'center'
          }
      },
      {
          id: 'sec_2',
          type: 'features',
          data: {
              title: 'Why Choose Us?',
              count: 3,
              bgColor: '#ffffff',
              textColor: '#334155'
          }
      },
      {
          id: 'sec_3',
          type: 'cta',
          data: {
              text: 'Ready to launch your project?',
              btnText: 'Start Building Now',
              bgColor: '#0f172a',
              textColor: '#ffffff',
              align: 'center'
          }
      }
  ];

  let sections = JSON.parse(JSON.stringify(defaultSections));
  let activeSectionId = null;
  let isMobileView = false;

  // DOM Elements
  const sectionsListEl = document.getElementById('sections-list');
  const controlsContainerEl = document.getElementById('controls-container');
  const propertiesPanelEl = document.getElementById('properties-panel');
  const previewEl = document.getElementById('landing-preview');
  const codeOutputEl = document.getElementById('code-output');
  const previewWrapperEl = document.getElementById('preview-wrapper');
  const propTitleEl = document.getElementById('prop-panel-title');
  const srAnnouncer = document.getElementById('sr-announcer');

  // Icons Mapping
  const icons = {
      hero: 'fa-home',
      features: 'fa-th-large',
      testimonials: 'fa-quote-right',
      pricing: 'fa-tags',
      cta: 'fa-bullhorn',
      footer: 'fa-globe'
  };

  // Labels
  const labels = {
      hero: 'Hero Section',
      features: 'Features Grid',
      testimonials: 'Testimonials',
      pricing: 'Pricing Table',
      cta: 'Call to Action',
      footer: 'Simple Footer'
  };

  // ── Screen Reader Announcements ──
  function announce(message) {
      if (srAnnouncer) {
          srAnnouncer.textContent = message;
      }
  }

  // Initialization
  function init() {
      renderSectionList();
      if (sections.length > 0) {
          selectSection(sections[0].id);
      }
      renderPreview();
      bindStaticEvents();
      initFaqToggles();
      initCopyLink();
  }

  // ── Bind Static Event Listeners (replaces inline handlers) ──
  function bindStaticEvents() {
      var addBtn = document.getElementById('add-section-btn');
      if (addBtn) addBtn.addEventListener('click', addSection);

      var resetBtn = document.getElementById('reset-btn');
      if (resetBtn) resetBtn.addEventListener('click', resetBuilder);

      var deleteBtn = document.getElementById('delete-section-btn');
      if (deleteBtn) deleteBtn.addEventListener('click', deleteActiveSection);

      var previewModeBtn = document.getElementById('preview-mode-btn');
      if (previewModeBtn) previewModeBtn.addEventListener('click', togglePreviewMode);

      var copyCodeBtn = document.getElementById('copy-code-btn');
      if (copyCodeBtn) copyCodeBtn.addEventListener('click', copyCode);
  }

  // --- State Management ---

  function addSection() {
      const typeSelect = document.getElementById('new-section-type');
      const type = typeSelect.value;
      const id = 'sec_' + Date.now();
      
      let data = {};
      
      if (type === 'hero') {
          data = { heading: 'Your Headline', subheading: 'Your subheadline goes here.', btnText: 'Click Me', bgColor: '#f8fafc', textColor: '#1e293b', align: 'center' };
      } else if (type === 'features') {
          data = { title: 'Key Features', count: 3, bgColor: '#ffffff', textColor: '#475569' };
      } else if (type === 'testimonials') {
          data = { title: 'What People Say', count: 2, bgColor: '#f1f5f9', textColor: '#334155' };
      } else if (type === 'pricing') {
          data = { title: 'Pricing Plans', bgColor: '#ffffff', textColor: '#0f172a' };
      } else if (type === 'cta') {
          data = { text: 'Ready to start?', btnText: 'Get Started', bgColor: '#0f172a', textColor: '#ffffff', align: 'center' };
      } else if (type === 'footer') {
          data = { copyright: '\u00A9 2024 Your Company', bgColor: '#1e293b', textColor: '#94a3b8', align: 'center' };
      }

      sections.push({ id: id, type: type, data: data });
      renderSectionList();
      selectSection(id);
      renderPreview();
      showToast('Section added', 'success');
      announce(labels[type] + ' section added');
  }

  function deleteActiveSection() {
      if (!activeSectionId) return;
      
      // Accessible custom confirmation
      showDeleteConfirm(function() {
          var section = sections.find(function(s) { return s.id === activeSectionId; });
          var sectionLabel = section ? labels[section.type] : 'Section';
          sections = sections.filter(function(s) { return s.id !== activeSectionId; });
          activeSectionId = null;
          propertiesPanelEl.classList.add('hidden');
          renderSectionList();
          renderPreview();
          announce(sectionLabel + ' section deleted');
      });
  }

  // ── Accessible Delete Confirmation ──
  function showDeleteConfirm(onConfirm) {
      var overlay = document.createElement('div');
      overlay.className = 'delete-confirm-overlay';
      overlay.setAttribute('role', 'alertdialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'delete-confirm-title');

      overlay.innerHTML = '<div class="delete-confirm-box">' +
          '<h3 id="delete-confirm-title" class="font-bold text-lg mb-2">Delete Section?</h3>' +
          '<p class="text-sm text-slate-500 dark:text-slate-400 mb-6">This action cannot be undone. The section and all its content will be removed.</p>' +
          '<div class="flex gap-3 justify-center">' +
          '<button id="confirm-delete-yes" type="button" class="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">Delete</button>' +
          '<button id="confirm-delete-no" type="button" class="px-5 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>' +
          '</div></div>';

      document.body.appendChild(overlay);

      var yesBtn = document.getElementById('confirm-delete-yes');
      var noBtn = document.getElementById('confirm-delete-no');

      yesBtn.focus();

      function cleanup() {
          overlay.remove();
      }

      yesBtn.addEventListener('click', function() {
          cleanup();
          onConfirm();
      });

      noBtn.addEventListener('click', cleanup);

      overlay.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') {
              cleanup();
          }
          // Trap focus
          if (e.key === 'Tab') {
              if (e.shiftKey && document.activeElement === yesBtn) {
                  e.preventDefault();
                  noBtn.focus();
              } else if (!e.shiftKey && document.activeElement === noBtn) {
                  e.preventDefault();
                  yesBtn.focus();
              }
          }
      });
  }

  function resetBuilder() {
      showResetConfirm(function() {
          sections = JSON.parse(JSON.stringify(defaultSections));
          activeSectionId = null;
          propertiesPanelEl.classList.add('hidden');
          renderSectionList();
          if (sections.length > 0) {
              selectSection(sections[0].id);
          }
          renderPreview();
          showToast('Reset to default', 'success');
          announce('Builder reset to default template');
      });
  }

  function showResetConfirm(onConfirm) {
      var overlay = document.createElement('div');
      overlay.className = 'delete-confirm-overlay';
      overlay.setAttribute('role', 'alertdialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'reset-confirm-title');

      overlay.innerHTML = '<div class="delete-confirm-box">' +
          '<h3 id="reset-confirm-title" class="font-bold text-lg mb-2">Reset to Default?</h3>' +
          '<p class="text-sm text-slate-500 dark:text-slate-400 mb-6">All changes will be lost. The builder will revert to the default template.</p>' +
          '<div class="flex gap-3 justify-center">' +
          '<button id="confirm-reset-yes" type="button" class="px-5 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors">Reset</button>' +
          '<button id="confirm-reset-no" type="button" class="px-5 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>' +
          '</div></div>';

      document.body.appendChild(overlay);

      var yesBtn = document.getElementById('confirm-reset-yes');
      var noBtn = document.getElementById('confirm-reset-no');

      yesBtn.focus();

      function cleanup() { overlay.remove(); }

      yesBtn.addEventListener('click', function() { cleanup(); onConfirm(); });
      noBtn.addEventListener('click', cleanup);
      overlay.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') cleanup();
      });
  }

  // --- Rendering UI ---

  function renderSectionList() {
      sectionsListEl.innerHTML = '';
      
      sections.forEach(function(section, index) {
          var item = document.createElement('div');
          item.className = 'p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ' + 
              (section.id === activeSectionId ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500/50');
          item.setAttribute('role', 'option');
          item.setAttribute('aria-selected', section.id === activeSectionId ? 'true' : 'false');
          item.setAttribute('tabindex', '0');
          item.setAttribute('aria-label', labels[section.type] + ', section ' + (index + 1));
          
          item.innerHTML = '<div class="flex items-center gap-3">' +
              '<i class="fas ' + icons[section.type] + ' text-slate-400 w-5 text-center" aria-hidden="true"></i>' +
              '<span class="text-sm font-medium">' + labels[section.type] + '</span>' +
              '</div>' +
              '<span class="text-xs text-slate-400">#' + (index + 1) + '</span>';

          item.addEventListener('click', function() { selectSection(section.id); });
          item.addEventListener('keydown', function(e) {
              if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  selectSection(section.id);
              }
          });
          
          sectionsListEl.appendChild(item);
      });
  }

  function selectSection(id) {
      activeSectionId = id;
      var section = sections.find(function(s) { return s.id === id; });
      
      renderSectionList();
      
      propertiesPanelEl.classList.remove('hidden');
      propTitleEl.innerHTML = '<i class="fas ' + icons[section.type] + ' mr-2" aria-hidden="true"></i> ' + labels[section.type];
      
      renderControls(section);
      announce(labels[section.type] + ' section selected');
  }

  // Counter for unique IDs on dynamically created inputs
  var controlIdCounter = 0;

  function renderControls(section) {
      controlsContainerEl.innerHTML = '';
      var d = section.data;
      
      var createInput = function(label, key, type, value) {
          type = type || 'text';
          value = (value !== undefined) ? value : d[key];
          controlIdCounter++;
          var inputId = 'ctrl_' + key + '_' + controlIdCounter;
          var div = document.createElement('div');
          
          if (type === 'color') {
              div.innerHTML = '<label for="' + inputId + '" class="block text-xs font-semibold text-slate-500 mb-1">' + label + '</label>' +
                  '<div class="flex items-center gap-2">' +
                  '<input type="color" id="' + inputId + '" value="' + value + '" class="w-10 h-10 rounded cursor-pointer bg-transparent border-0 shrink-0">' +
                  '<span class="text-xs text-slate-400 font-mono" id="' + inputId + '_label">' + value + '</span>' +
                  '</div>';
              var colorInput = div.querySelector('#' + inputId);
              colorInput.addEventListener('input', function(e) {
                  d[key] = e.target.value;
                  var valLabel = div.querySelector('#' + inputId + '_label');
                  if (valLabel) valLabel.textContent = e.target.value;
                  renderPreview();
              });
          } else {
              div.innerHTML = '<label for="' + inputId + '" class="block text-xs font-semibold text-slate-500 mb-1">' + label + '</label>' +
                  '<input type="' + type + '" id="' + inputId + '" value="' + value + '" class="w-full bg-slate-100 dark:bg-slate-800 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white">';
              var textInput = div.querySelector('#' + inputId);
              textInput.addEventListener('input', function(e) {
                  d[key] = type === 'number' ? parseInt(e.target.value, 10) || 1 : e.target.value;
                  renderPreview();
              });
          }
          return div;
      };
      
      var createSelect = function(label, key, options) {
          controlIdCounter++;
          var selectId = 'ctrl_' + key + '_' + controlIdCounter;
          var div = document.createElement('div');
          var optsHtml = options.map(function(o) { return '<option value="' + o.value + '"' + (d[key] === o.value ? ' selected' : '') + '>' + o.label + '</option>'; }).join('');
          div.innerHTML = '<label for="' + selectId + '" class="block text-xs font-semibold text-slate-500 mb-1">' + label + '</label>' +
              '<select id="' + selectId + '" class="w-full bg-slate-100 dark:bg-slate-800 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white">' +
              optsHtml + '</select>';
          div.querySelector('#' + selectId).addEventListener('change', function(e) {
              d[key] = e.target.value;
              renderPreview();
          });
          return div;
      };

      if (section.type === 'hero' || section.type === 'cta') {
          controlsContainerEl.appendChild(createInput('Heading / Text', section.type === 'hero' ? 'heading' : 'text'));
          if (section.type === 'hero') controlsContainerEl.appendChild(createInput('Subheading', 'subheading'));
          controlsContainerEl.appendChild(createInput('Button Text', 'btnText'));
          controlsContainerEl.appendChild(createSelect('Alignment', 'align', [
              { value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }
          ]));
          controlsContainerEl.appendChild(createInput('Background Color', 'bgColor', 'color'));
          controlsContainerEl.appendChild(createInput('Text Color', 'textColor', 'color'));
      }
      else if (section.type === 'features' || section.type === 'testimonials') {
          controlsContainerEl.appendChild(createInput('Section Title', 'title'));
          controlsContainerEl.appendChild(createInput('Number of Items (1-4)', 'count', 'number', d.count));
          controlsContainerEl.appendChild(createInput('Background Color', 'bgColor', 'color'));
          controlsContainerEl.appendChild(createInput('Text Color', 'textColor', 'color'));
      }
      else if (section.type === 'pricing') {
          controlsContainerEl.appendChild(createInput('Section Title', 'title'));
          controlsContainerEl.appendChild(createInput('Background Color', 'bgColor', 'color'));
          controlsContainerEl.appendChild(createInput('Text Color', 'textColor', 'color'));
      }
      else if (section.type === 'footer') {
          controlsContainerEl.appendChild(createInput('Copyright Text', 'copyright'));
          controlsContainerEl.appendChild(createSelect('Alignment', 'align', [
              { value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }
          ]));
          controlsContainerEl.appendChild(createInput('Background Color', 'bgColor', 'color'));
          controlsContainerEl.appendChild(createInput('Text Color', 'textColor', 'color'));
      }
  }

  // --- Preview & HTML Generation ---

  function getSectionHTML(section) {
      var type = section.type;
      var data = section.data;
      var style = 'background-color: ' + data.bgColor + '; color: ' + data.textColor + '; padding: 4rem 1rem;';
      var containerStyle = 'max-width: 1000px; margin: 0 auto; text-align: ' + (data.align || 'left') + ';';
      
      if (type === 'hero') {
          return '<section style="' + style + '">' +
              '<div style="' + containerStyle + '">' +
              '<h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem; line-height: 1.2;">' + data.heading + '</h1>' +
              '<p style="font-size: 1.125rem; margin-bottom: 2rem; opacity: 0.8;">' + data.subheading + '</p>' +
              '<button style="background-color: #10b981; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; border: none; font-weight: bold; cursor: pointer;">' + data.btnText + '</button>' +
              '</div></section>';
      }
      
      if (type === 'features') {
          var cards = '';
          for(var i=0; i<data.count; i++) {
              cards += '<div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 0.5rem; backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.1);">' +
                  '<div style="font-size: 2rem; margin-bottom: 1rem;">\u26A1</div>' +
                  '<h3 style="font-weight: bold; margin-bottom: 0.5rem;">Feature ' + (i+1) + '</h3>' +
                  '<p style="font-size: 0.875rem; opacity: 0.8;">This is a placeholder description for feature ' + (i+1) + '.</p>' +
                  '</div>';
          }
          return '<section style="' + style + '">' +
              '<div style="' + containerStyle + '">' +
              '<h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 2rem; text-align: center;">' + data.title + '</h2>' +
              '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">' +
              cards + '</div></div></section>';
      }

      if (type === 'testimonials') {
          var items = '';
          for(var j=0; j<data.count; j++) {
              items += '<div style="background: rgba(255,255,255,0.5); padding: 2rem; border-radius: 0.5rem; position: relative;">' +
                  '<div style="font-size: 2rem; color: #10b981; position: absolute; top: 1rem; left: 1rem; opacity: 0.3;">\u201C</div>' +
                  '<p style="font-style: italic; margin-bottom: 1rem; position: relative; z-index: 1;">"This tool saved me hours of coding. The interface is incredibly intuitive."</p>' +
                  '<p style="font-weight: bold; text-align: right;">\u2014 User ' + (j+1) + '</p>' +
                  '</div>';
          }
          return '<section style="' + style + '">' +
              '<div style="' + containerStyle + '">' +
              '<h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 2rem; text-align: center;">' + data.title + '</h2>' +
              '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">' +
              items + '</div></div></section>';
      }

      if (type === 'pricing') {
          return '<section style="' + style + '">' +
              '<div style="' + containerStyle + '">' +
              '<h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 2rem; text-align: center;">' + data.title + '</h2>' +
              '<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1.5rem;">' +
              '<div style="flex: 1; min-width: 250px; border: 1px solid rgba(0,0,0,0.1); border-radius: 0.5rem; padding: 2rem; text-align: center;">' +
              '<h3 style="font-size: 1.25rem; font-weight: bold;">Basic</h3>' +
              '<div style="font-size: 2rem; font-weight: bold; margin: 1rem 0;">$0</div>' +
              '<ul style="list-style: none; padding: 0; margin-bottom: 2rem; text-align: left;">' +
              '<li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0,0,0,0.05);">\u2713 1 Project</li>' +
              '<li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0,0,0,0.05);">\u2713 Community Support</li>' +
              '</ul>' +
              '<button style="width: 100%; padding: 0.75rem; border: 1px solid currentColor; background: transparent; border-radius: 0.25rem; cursor: pointer;">Choose Plan</button>' +
              '</div>' +
              '<div style="flex: 1; min-width: 250px; border: 2px solid #10b981; border-radius: 0.5rem; padding: 2rem; text-align: center; position: relative;">' +
              '<div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #10b981; color: white; padding: 2px 12px; border-radius: 99px; font-size: 0.75rem; font-weight: bold;">POPULAR</div>' +
              '<h3 style="font-size: 1.25rem; font-weight: bold;">Pro</h3>' +
              '<div style="font-size: 2rem; font-weight: bold; margin: 1rem 0;">$29</div>' +
              '<ul style="list-style: none; padding: 0; margin-bottom: 2rem; text-align: left;">' +
              '<li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0,0,0,0.05);">\u2713 5 Projects</li>' +
              '<li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0,0,0,0.05);">\u2713 Priority Support</li>' +
              '<li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0,0,0,0.05);">\u2713 Analytics</li>' +
              '</ul>' +
              '<button style="width: 100%; padding: 0.75rem; background: #10b981; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-weight: bold;">Choose Plan</button>' +
              '</div>' +
              '<div style="flex: 1; min-width: 250px; border: 1px solid rgba(0,0,0,0.1); border-radius: 0.5rem; padding: 2rem; text-align: center;">' +
              '<h3 style="font-size: 1.25rem; font-weight: bold;">Enterprise</h3>' +
              '<div style="font-size: 2rem; font-weight: bold; margin: 1rem 0;">$99</div>' +
              '<ul style="list-style: none; padding: 0; margin-bottom: 2rem; text-align: left;">' +
              '<li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0,0,0,0.05);">\u2713 Unlimited Projects</li>' +
              '<li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0,0,0,0.05);">\u2713 24/7 Support</li>' +
              '</ul>' +
              '<button style="width: 100%; padding: 0.75rem; border: 1px solid currentColor; background: transparent; border-radius: 0.25rem; cursor: pointer;">Choose Plan</button>' +
              '</div>' +
              '</div></div></section>';
      }

      if (type === 'cta') {
          return '<section style="' + style + '">' +
              '<div style="' + containerStyle + '">' +
              '<h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 1.5rem;">' + data.text + '</h2>' +
              '<button style="background-color: #10b981; color: white; padding: 1rem 2rem; border-radius: 0.5rem; border: none; font-weight: bold; font-size: 1.125rem; cursor: pointer;">' + data.btnText + '</button>' +
              '</div></section>';
      }

      if (type === 'footer') {
          return '<footer style="' + style + ' margin-top: auto;">' +
              '<div style="' + containerStyle + '">' +
              '<p style="font-size: 0.875rem; opacity: 0.7;">' + data.copyright + '</p>' +
              '</div></footer>';
      }

      return '';
  }

  function renderPreview() {
      var html = sections.map(getSectionHTML).join('\n');
      previewEl.innerHTML = html;
      
      codeOutputEl.textContent = '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>My Landing Page</title>\n    <script src="https://cdn.tailwindcss.com"><\/script>\n</head>\n<body style="margin: 0; font-family: sans-serif;">\n ' + html + '\n</body>\n</html>';
  }

  // --- Utilities ---

  function togglePreviewMode() {
      isMobileView = !isMobileView;
      var btn = document.getElementById('preview-mode-btn');
      
      if (isMobileView) {
          previewEl.classList.add('mobile-frame');
          btn.classList.add('text-emerald-500');
          btn.innerHTML = '<i class="fas fa-desktop mr-1" aria-hidden="true"></i> Desktop View';
          announce('Switched to mobile preview');
      } else {
          previewEl.classList.remove('mobile-frame');
          btn.classList.remove('text-emerald-500');
          btn.innerHTML = '<i class="fas fa-mobile-alt mr-1" aria-hidden="true"></i> Mobile View';
          announce('Switched to desktop preview');
      }
  }

  function copyCode() {
      var code = codeOutputEl.textContent;
      navigator.clipboard.writeText(code).then(function() {
          showToast('HTML code copied!', 'success');
          announce('HTML code copied to clipboard');
      }).catch(function() {
          showToast('Failed to copy', 'error');
          announce('Failed to copy HTML code');
      });
  }

  function showToast(message, type) {
      type = type || 'info';
      if (window.Devpalettes && window.Devpalettes.Toast) {
          window.Devpalettes.Toast.show(message, type);
          return;
      }
      
      var toast = document.createElement('div');
      var bgColor = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-slate-700';
      toast.className = bgColor + ' text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-medium fixed bottom-6 right-6 z-50 transform transition-all duration-300 translate-y-20';
      toast.textContent = message;
      toast.setAttribute('role', 'alert');
      document.body.appendChild(toast);
      
      requestAnimationFrame(function() { toast.classList.remove('translate-y-20'); });
      
      setTimeout(function() {
          toast.classList.add('translate-y-20');
          setTimeout(function() { toast.remove(); }, 300);
      }, 3000);
  }

  // ── Copy Link Button ──
  function initCopyLink() {
      var copyLinkBtn = document.getElementById('copy-link-btn');
      if (copyLinkBtn) {
          copyLinkBtn.addEventListener('click', function() {
              var pageUrl = window.location.href;
              navigator.clipboard.writeText(pageUrl).then(function() {
                  showToast('Link copied!', 'success');
                  announce('Page link copied to clipboard');
              }).catch(function() {
                  showToast('Failed to copy link', 'error');
              });
          });
      }
  }

  // ─── FAQ Toggle ───
  function initFaqToggles() {
      var faqToggles = document.querySelectorAll('.faq-toggle');
      if (faqToggles.length === 0) return;

      faqToggles.forEach(function(toggle) {
          toggle.addEventListener('click', function(e) {
              e.preventDefault();
              var content = this.nextElementSibling;
              var icon = this.querySelector('i');
              if (!content) return;

              var isHidden = content.classList.contains('hidden');

              if (isHidden) {
                  content.classList.remove('hidden');
                  content.style.maxHeight = content.scrollHeight + 'px';
                  icon.style.transform = 'rotate(180deg)';
                  this.setAttribute('aria-expanded', 'true');
              } else {
                  content.style.maxHeight = '0px';
                  icon.style.transform = 'rotate(0deg)';
                  this.setAttribute('aria-expanded', 'false');
                  setTimeout(function() {
                      content.classList.add('hidden');
                      content.style.maxHeight = '';
                  }, 300);
              }
          });
      });
  }

  // Initialize on Load
  document.addEventListener('DOMContentLoaded', init);

})();
