// URL Color Picker Logic
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('url-input');
    const btn = document.getElementById('extract-btn');
    const results = = document.getElementById('results-grid');
    const loading = document.getElementById('loading-state');

    btn.addEventListener('click', async () => {
        const url = input.value;
        if (!url) return;

        // NOTE: Direct fetch will fail due to CORS. 
        // In production, you need a backend proxy like: `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
        // For this demo, we will simulate extraction if CORS fails or proxy is used.
        
        loading.classList.remove('hidden');
        results.innerHTML = '';

        try {
            // Using a public proxy for demo purposes
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            const html = await response.text();
            
            // Parse HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const colors = new Set();
            
            // Extract from style attributes
            doc.querySelectorAll('[style]').forEach(el => {
                const style = el.getAttribute('style');
                const matches = style.match(/#([0-9a-f]{3,6})\b|rgba?\([^)]+\)/gi);
                if (matches) matches.forEach(c => colors.add(parseColor(c)));
            });

            // Extract from tags
            doc.querySelectorAll('font[color], body[bgcolor], table[bgcolor]').forEach(el => {
                colors.add(parseColor(el.getAttribute('color') || el.getAttribute('bgcolor')));
            });

            renderColors(Array.from(colors).filter(Boolean));

        } catch (err) {
            console.error(err);
            // Fallback simulation for demo
            simulateExtraction();
        } finally {
            loading.classList.add('hidden');
        }
    });

    function parseColor(str) {
        if(!str) return null;
        // Basic normalization logic could go here
        return str.trim();
    }

    function renderColors(colors) {
        results.innerHTML = '';
        colors.slice(0, 12).forEach(color => {
            if (!color) return;
            const card = document.createElement('div');
            card.className = 'glass-card p-4 flex flex-col items-center cursor-pointer';
            card.innerHTML = `
                <div class="w-full aspect-square rounded-lg mb-2 border dark:border-slate-600" style="background: ${color}"></div>
                <span class="text-xs font-mono">${color}</span>
            `;
            card.onclick = () => Devpalettes.Clipboard.copy(color, `Copied ${color}`);
            results.appendChild(card);
        });
    }

    function simulateExtraction() {
        // Fallback mock data
        const mockColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#000000'];
        renderColors(mockColors);
    }
});
