// Brand Extractor Logic (Similar to Image-to-Gradient but output is palette)
document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('upload-logo-area');
    const fileInput = document.getElementById('logo-input');
    const paletteDiv = document.getElementById('extracted-palette');
    const exportBtn = document.getElementById('export-brand-palette');

    uploadArea.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(file) processImage(file);
    });

    function processImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const colors = extractDominantColors(img);
                renderPalette(colors);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function extractDominantColors(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const colorMap = {};
        
        for(let i=0; i<data.length; i+=4) {
            // Quantize
            const r = Math.round(data[i]/32)*32;
            const g = Math.round(data[i+1]/32)*32;
            const b = Math.round(data[i+2]/32)*32;
            const key = `${r},${g},${b}`;
            colorMap[key] = (colorMap[key] || 0) + 1;
        }
        
        const sorted = Object.entries(colorMap).sort((a,b) => b[1] - a[1]);
        
        const topColors = [];
        for(let i=0; i<sorted.length && topColors.length < 5; i++) {
            const [rgb] = sorted[i];
            const parts = rgb.split(',');
            const hex = Devpalettes.ColorUtils.rgbToHex(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
            
            // Filter whites/neutrals if you want, but for now just return
            topColors.push(hex);
        }
        return topColors;
    }

    function renderPalette(colors) {
        paletteDiv.innerHTML = '';
        colors.forEach(color => {
            const card = document.createElement('div');
            card.className = 'h-32 rounded-xl flex flex-col justify-end p-4 cursor-pointer';
            card.style.backgroundColor = color;
            card.innerHTML = `<span class="font-mono text-xs bg-black/20 px-2 py-1 rounded self-start" style="color: ${Devpalettes.ColorUtils.getContrastColor(color)}">${color}</span>`;
            card.onclick = () => Devpalettes.Clipboard.copy(color, `Copied ${color}`);
            paletteDiv.appendChild(card);
        });
    }
});
