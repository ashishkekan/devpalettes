// AI Palette Generator Logic
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('ai-input');
    const btn = document.getElementById('ai-generate-btn');
    const outputDiv = document.getElementById('ai-palette-output');
    const saveBtn = document.getElementById('save-ai-palette');
    const copyBtn = document.getElementById('copy-ai-palette');

    // Simulated AI Database
    const keywords = {
        'sunset': ['#FF6B6B', '#FFA07A', '#FFD93D', '#6BCB77', '#4D96FF'],
        'ocean': ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#023E8A'],
        'forest': ['#2D5A27', '#5AAB61', '#B5D99C', '#F7F7F7', '#1A3C1A'],
        'cyberpunk': ['#0D0221', '#0F4C75', '#3282B8', '#BBE1FA', '#FF2E63'],
        'retro': ['#F38181', '#FCE38A', '#EAFFD0', '#95E1D3', '#AA96DA'],
        'minimalist': ['#FAFAFA', '#E3E3E3', '#212121', '#333333', '#000000'],
        'default': ['#10b981', '#0ea5e9', '#8b5cf6', '#f97316', '#ef4444']
    };

    let currentPalette = [];

    function generate() {
        const text = input.value.toLowerCase();
        
        // Simple NLP: find matching keyword
        let palette = keywords.default;
        
        Object.keys(keywords).forEach(key => {
            if (text.includes(key)) {
                palette = keywords[key];
            }
        });

        // If no direct match, generate random
        if (palette === keywords.default && text.length > 0) {
            palette = Array(5).fill(0).map(() => Devpalettes.ColorUtils.randomHex());
        }

        currentPalette = palette;
        renderPalette(palette);
    }

    function renderPalette(palette) {
        outputDiv.innerHTML = '';
        palette.forEach(color => {
            const div = document.createElement('div');
            div.className = 'h-40 flex items-end justify-center p-2';
            div.style.backgroundColor = color;
            
            const textColor = Devpalettes.ColorUtils.getContrastColor(color);
            div.innerHTML = `<span class="font-mono text-xs font-semibold" style="color: ${textColor}">${color}</span>`;
            outputDiv.appendChild(div);
        });
    }

    btn.addEventListener('click', generate);
    
    copyBtn.addEventListener('click', () => {
        const css = currentPalette.map((c, i) => `--color-${i+1}: ${c};`).join('\n');
        Devpalettes.Clipboard.copy(`:root {\n ${css}\n}`, 'CSS Variables copied!');
    });
});
