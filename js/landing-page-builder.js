/**
 * Landing Page Builder Logic
 * Handles state management, UI rendering, and HTML generation.
 */

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

// Initialization
function init() {
    renderSectionList();
    if (sections.length > 0) {
        selectSection(sections[0].id);
    }
    renderPreview();
}

// --- State Management ---

function addSection() {
    const typeSelect = document.getElementById('new-section-type');
    const type = typeSelect.value;
    const id = 'sec_' + Date.now();
    
    let data = {};
    
    // Default Data based on type
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
        data = { copyright: '© 2024 Your Company', bgColor: '#1e293b', textColor: '#94a3b8', align: 'center' };
    }

    sections.push({ id, type, data });
    renderSectionList();
    selectSection(id);
    renderPreview();
    showToast('Section added', 'success');
}

function deleteActiveSection() {
    if (!activeSectionId) return;
    
    if (confirm('Are you sure you want to delete this section?')) {
        sections = sections.filter(s => s.id !== activeSectionId);
        activeSectionId = null;
        propertiesPanelEl.classList.add('hidden');
        renderSectionList();
        renderPreview();
    }
}

function resetBuilder() {
    if(confirm('Reset to default template? All changes will be lost.')) {
        sections = JSON.parse(JSON.stringify(defaultSections));
        activeSectionId = null;
        propertiesPanelEl.classList.add('hidden');
        renderSectionList();
        if (sections.length > 0) {
            selectSection(sections[0].id);
        }
        renderPreview();
        showToast('Reset to default', 'success');
    }
}

// --- Rendering UI ---

function renderSectionList() {
    sectionsListEl.innerHTML = '';
    
    sections.forEach((section, index) => {
        const item = document.createElement('div');
        item.className = `p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${section.id === activeSectionId ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500/50'}`;
        item.onclick = () => selectSection(section.id);
        
        item.innerHTML = `
            <div class="flex items-center gap-3">
                <i class="fas ${icons[section.type]} text-slate-400 w-5 text-center"></i>
                <span class="text-sm font-medium">${labels[section.type]}</span>
            </div>
            <span class="text-xs text-slate-400">#${index + 1}</span>
        `;
        sectionsListEl.appendChild(item);
    });
}

function selectSection(id) {
    activeSectionId = id;
    const section = sections.find(s => s.id === id);
    
    // Highlight list item
    renderSectionList();
    
    // Show properties
    propertiesPanelEl.classList.remove('hidden');
    propTitleEl.innerHTML = `<i class="fas ${icons[section.type]} mr-2"></i> ${labels[section.type]}`;
    
    // Render Controls
    renderControls(section);
}

function renderControls(section) {
    controlsContainerEl.innerHTML = '';
    const d = section.data;
    
    // Helper to create inputs
    const createInput = (label, key, type='text', value=d[key]) => {
        const div = document.createElement('div');
        div.innerHTML = `
            <label class="block text-xs font-semibold text-slate-500 mb-1">${label}</label>
            <input type="${type}" value="${value}" data-key="${key}" 
                class="w-full bg-slate-100 dark:bg-slate-800 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white">
        `;
        div.querySelector('input').addEventListener('input', (e) => {
            d[key] = e.target.value;
            renderPreview();
        });
        return div;
    };
    
    const createSelect = (label, key, options) => {
        const div = document.createElement('div');
        let optsHtml = options.map(o => `<option value="${o.value}" ${d[key] === o.value ? 'selected' : ''}>${o.label}</option>`).join('');
        div.innerHTML = `
            <label class="block text-xs font-semibold text-slate-500 mb-1">${label}</label>
            <select data-key="${key}" class="w-full bg-slate-100 dark:bg-slate-800 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white">
                ${optsHtml}
            </select>
        `;
        div.querySelector('select').addEventListener('change', (e) => {
            d[key] = e.target.value;
            renderPreview();
        });
        return div;
    };

    // Generate fields based on type
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
    const { type, data } = section;
    const style = `background-color: ${data.bgColor}; color: ${data.textColor}; padding: 4rem 1rem;`;
    const containerStyle = `max-width: 1000px; margin: 0 auto; text-align: ${data.align || 'left'};`;
    
    if (type === 'hero') {
        return `
        <section style="${style}">
            <div style="${containerStyle}">
                <h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem; line-height: 1.2;">${data.heading}</h1>
                <p style="font-size: 1.125rem; margin-bottom: 2rem; opacity: 0.8;">${data.subheading}</p>
                <button style="background-color: #10b981; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; border: none; font-weight: bold; cursor: pointer;">${data.btnText}</button>
            </div>
        </section>`;
    }
    
    if (type === 'features') {
        let cards = '';
        for(let i=0; i<data.count; i++) {
            cards += `
            <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 0.5rem; backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.1);">
                <div style="font-size: 2rem; margin-bottom: 1rem;">⚡</div>
                <h3 style="font-weight: bold; margin-bottom: 0.5rem;">Feature ${i+1}</h3>
                <p style="font-size: 0.875rem; opacity: 0.8;">This is a placeholder description for feature ${i+1}.</p>
            </div>`;
        }
        return `
        <section style="${style}">
            <div style="${containerStyle}">
                <h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 2rem; text-align: center;">${data.title}</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                    ${cards}
                </div>
            </div>
        </section>`;
    }

    if (type === 'testimonials') {
        let items = '';
        for(let i=0; i<data.count; i++) {
            items += `
            <div style="background: rgba(255,255,255,0.5); padding: 2rem; border-radius: 0.5rem; position: relative;">
                <div style="font-size: 2rem; color: #10b981; position: absolute; top: 1rem; left: 1rem; opacity: 0.3;">“</div>
                <p style="font-style: italic; margin-bottom: 1rem; position: relative; z-index: 1;">"This tool saved me hours of coding. The interface is incredibly intuitive."</p>
                <p style="font-weight: bold; text-align: right;">— User ${i+1}</p>
            </div>`;
        }
        return `
        <section style="${style}">
            <div style="${containerStyle}">
                <h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 2rem; text-align: center;">${data.title}</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
                    ${items}
                </div>
            </div>
        </section>`;
    }

    if (type === 'pricing') {
        return `
        <section style="${style}">
            <div style="${containerStyle}">
                <h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 2rem; text-align: center;">${data.title}</h2>
                <div style="display: flex; flex-wrap: justify-center; gap: 1.5rem;">
                    <div style="flex: 1; min-width: 250px; border: 1px solid rgba(0,0,0,0.1); border-radius: 0.5rem; padding: 2rem; text-align: center;">
                        <h3 style="font-size: 1.25rem; font-weight: bold;">Basic</h3>
                        <div style="font-size: 2rem; font-weight: bold; margin: 1rem 0;">$0</div>
                        <ul style="list-style: none; padding: 0; margin-bottom: 2rem; text-align: left;">
                            <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0,0,0,0.05);">✓ 1 Project</li>
                            <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0,0,0,0.05);">✓ Community Support</li>
                        </ul>
                        <button style="width: 100%; padding: 0.75rem; border: 1px solid currentColor; background: transparent; border-radius: 0.25rem; cursor: pointer;">Choose Plan</button>
                    </div>
                    <div style="flex: 1; min-width: 250px; border: 2px solid #10b981; border-radius: 0.5rem; padding: 2rem; text-align: center; position: relative;">
                        <div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #10b981; color: white; padding: 2px 12px; border-radius: 99px; font-size: 0.75rem; font-weight: bold;">POPULAR</div>
                        <h3 style="font-size: 1.25rem; font-weight: bold;">Pro</h3>
                        <div style="font-size: 2rem; font-weight: bold; margin: 1rem 0;">$29</div>
                        <ul style="list-style: none; padding: 0; margin-bottom: 2rem; text-align: left;">
                            <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0,0,0,0.05);">✓ 5 Projects</li>
                            <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0,0,0,0.05);">✓ Priority Support</li>
                            <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0,0,0,0.05);">✓ Analytics</li>
                        </ul>
                        <button style="width: 100%; padding: 0.75rem; background: #10b981; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-weight: bold;">Choose Plan</button>
                    </div>
                    <div style="flex: 1; min-width: 250px; border: 1px solid rgba(0,0,0,0.1); border-radius: 0.5rem; padding: 2rem; text-align: center;">
                        <h3 style="font-size: 1.25rem; font-weight: bold;">Enterprise</h3>
                        <div style="font-size: 2rem; font-weight: bold; margin: 1rem 0;">$99</div>
                        <ul style="list-style: none; padding: 0; margin-bottom: 2rem; text-align: left;">
                            <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0,0,0,0.05);">✓ Unlimited Projects</li>
                            <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0,0,0,0.05);">✓ 24/7 Support</li>
                        </ul>
                        <button style="width: 100%; padding: 0.75rem; border: 1px solid currentColor; background: transparent; border-radius: 0.25rem; cursor: pointer;">Choose Plan</button>
                    </div>
                </div>
            </div>
        </section>`;
    }

    if (type === 'cta') {
        return `
        <section style="${style}">
            <div style="${containerStyle}">
                <h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 1.5rem;">${data.text}</h2>
                <button style="background-color: #10b981; color: white; padding: 1rem 2rem; border-radius: 0.5rem; border: none; font-weight: bold; font-size: 1.125rem; cursor: pointer;">${data.btnText}</button>
            </div>
        </section>`;
    }

    if (type === 'footer') {
        return `
        <footer style="${style} margin-top: auto;">
            <div style="${containerStyle}">
                <p style="font-size: 0.875rem; opacity: 0.7;">${data.copyright}</p>
            </div>
        </footer>`;
    }

    return '';
}

function renderPreview() {
    const html = sections.map(getSectionHTML).join('\n');
    previewEl.innerHTML = html;
    
    // Also update code output
    codeOutputEl.textContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Landing Page</title>
    <!-- Add Tailwind CSS or your own stylesheet here -->
    <script src="https://cdn.tailwindcss.com"><\/script>
</head>
<body style="margin: 0; font-family: sans-serif;">
 ${html}
</body>
</html>`.trim();
}

// --- Utilities ---

function togglePreviewMode() {
    isMobileView = !isMobileView;
    const btn = document.getElementById('preview-mode-btn');
    
    if (isMobileView) {
        previewEl.classList.add('mobile-frame');
        btn.classList.add('text-emerald-500');
        btn.innerHTML = '<i class="fas fa-desktop mr-1"></i> Desktop View';
    } else {
        previewEl.classList.remove('mobile-frame');
        btn.classList.remove('text-emerald-500');
        btn.innerHTML = '<i class="fas fa-mobile-alt mr-1"></i> Mobile View';
    }
}

function copyCode() {
    const code = codeOutputEl.textContent;
    navigator.clipboard.writeText(code).then(() => {
        showToast('HTML code copied!', 'success');
    }).catch(() => {
        showToast('Failed to copy', 'error');
    });
}

function showToast(message, type = 'info') {
    // Check if main.js toast exists
    if (window.Devpalettes && window.Devpalettes.Toast) {
        window.Devpalettes.Toast.show(message, type);
        return;
    }
    
    // Fallback
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-slate-700';
    toast.className = `${bgColor} text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-medium fixed bottom-6 right-6 z-50 transform transition-all duration-300 translate-y-20`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => toast.classList.remove('translate-y-20'));
    
    // Remove
    setTimeout(() => {
        toast.classList.add('translate-y-20');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', init);
