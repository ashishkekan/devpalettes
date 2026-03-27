// SVG Editor Logic
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('svg-upload');
    const preview = document.getElementById('svg-preview-container');
    const colorList = document.getElementById('svg-color-list');
    const downloadBtn = document.getElementById('download-svg-btn');
    
    let svgDoc = null;
    let originalSvgString = '';

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            originalSvgString = e.target.result;
            
            // Parse
            const parser = new DOMParser();
            svgDoc = parser.parseFromString(originalSvgString, 'image/svg+xml');
            
            renderPreview(originalSvgString);
            extractColors();
        };
        reader.readAsText(file);
    });

    function renderPreview(svgString) {
        preview.innerHTML = svgString;
        // Make sure it fits
        const svgEl = preview.querySelector('svg');
        if (svgEl) {
            svgEl.style.width = '100%';
            svgEl.style.height = 'auto';
            svgEl.style.maxHeight = '400px';
        }
    }

    function extractColors() {
        colorList.innerHTML = '';
        const colors = new Set();
        
        // Simple regex scan for fills/strokes
        const matches = originalSvgString.match(/(fill|stroke)="([^"]+)"/g);
        if (matches) {
            matches.forEach(m => {
                const color = m.split('"')[1];
                if (color !== 'none' && color !== 'transparent') {
                    colors.add(color);
                }
            });
        }

        colors.forEach(color => {
            const item = document.createElement('div');
            item.className = 'flex items-center gap-3 glass-card p-3 rounded-lg';
            item.innerHTML = `
                <div class="w-8 h-8 rounded border" style="background: ${color}"></div>
                <span class="font-mono text-sm flex-1">${color}</span>
                <input type="color" value="${color}" class="w-8 h-8 rounded cursor-pointer" data-old="${color}">
            `;
            
            const newColorInput = item.querySelector('input');
            newColorInput.addEventListener('change', (e) => {
                replaceColor(color, e.target.value);
            });
            
            colorList.appendChild(item);
        });
    }

    function replaceColor(oldColor, newColor) {
        const regex = new RegExp(oldColor, 'gi');
        const updatedSvg = preview.innerHTML.replace(regex, newColor);
        originalSvgString = originalSvgString.replace(regex, newColor);
        renderPreview(updatedSvg);
    }

    downloadBtn.addEventListener('click', () => {
        if(!originalSvgString) return;
        const blob = new Blob([originalSvgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'edited.svg';
        a.click();
        URL.revokeObjectURL(url);
    });
});
