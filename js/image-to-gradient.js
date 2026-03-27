// Image to Gradient Generator Logic
document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('image-input');
    const preview = document.getElementById('gradient-preview');
    const cssOutput = document.getElementById('css-output');
    const extractedColorsDiv = document.getElementById('extracted-colors');
    const angleSlider = document.getElementById('angle-slider');
    const angleValue = document.getElementById('angle-value');
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');

    let extractedColors = [];
    let currentImage = null;

    // Upload Handling
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('border-emerald-500');
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('border-emerald-500');
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-emerald-500');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            processImage(file);
        }
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            processImage(e.target.files[0]);
        }
    });

    function processImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                currentImage = img;
                extractColors(img);
                uploadArea.classList.add('hidden');
                preview.classList.remove('hidden');
                preview.style.backgroundImage = `url(${e.target.result})`;
                preview.style.backgroundSize = 'cover';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function extractColors(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const w = canvas.width = img.width;
        const h = canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const data = ctx.getImageData(0, 0, w, h).data;
        const colorCounts = {};
        
        // Sample pixels (skip some for performance)
        for (let i = 0; i < data.length; i += 4 * 20) {
            const r = data[i], g = data[i+1], b = data[i+2];
            // Quantize to reduce similar colors
            const key = `${Math.round(r/10)*10},${Math.round(g/10)*10},${Math.round(b/10)*10}`;
            colorCounts[key] = (colorCounts[key] || 0) + 1;
        }

        // Sort by frequency
        const sorted = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
        
        // Get top 5 unique colors
        extractedColors = [];
        const usedHues = [];
        
        for (let i = 0; i < sorted.length && extractedColors.length < 5; i++) {
            const [rgb] = sorted[i].split(',');
            const hex = rgbToHex(parseInt(rgb.split(',')[0]), parseInt(rgb.split(',')[1]), parseInt(rgb.split(',')[2])); // Simplified parsing
            
            // Simple hex conversion from key
            const parts = sorted[i][0].split(',');
            const hexColor = rgbToHex(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
            
            // Basic uniqueness check (distance)
            if (isUnique(hexColor, extractedColors)) {
                extractedColors.push(hexColor);
            }
        }
        
        renderExtractedColors();
        generateGradient();
    }

    function isUnique(hex, list) {
        if (list.length === 0) return true;
        const rgb1 = hexToRgb(hex);
        for (let c of list) {
            const rgb2 = hexToRgb(c);
            const dist = Math.sqrt(Math.pow(rgb1.r-rgb2.r, 2) + Math.pow(rgb1.g-rgb2.g, 2) + Math.pow(rgb1.b-rgb2.b, 2));
            if (dist < 100) return false; // Threshold
        }
        return true;
    }

    function renderExtractedColors() {
        extractedColorsDiv.innerHTML = '';
        extractedColors.forEach(color => {
            const div = document.createElement('div');
            div.className = 'h-10 rounded cursor-pointer border-2 border-transparent hover:border-white transition-all';
            div.style.backgroundColor = color;
            div.title = color;
            div.onclick = () => Devpalettes.Clipboard.copy(color, `Copied ${color}`);
            extractedColorsDiv.appendChild(div);
        });
    }

    function generateGradient() {
        if (extractedColors.length < 2) return;
        const angle = angleSlider.value;
        const stops = extractedColors.map((c, i) => {
            const percent = Math.round((i / (extractedColors.length - 1)) * 100);
            return `${c} ${percent}%`;
        }).join(', ');

        const css = `linear-gradient(${angle}deg, ${stops})`;
        preview.style.backgroundImage = css;
        cssOutput.textContent = `background: ${css};`;
    }

    angleSlider.addEventListener('input', () => {
        angleValue.textContent = angleSlider.value;
        generateGradient();
    });

    generateBtn.addEventListener('click', generateGradient);
    copyBtn.addEventListener('click', () => {
        Devpalettes.Clipboard.copy(cssOutput.textContent, 'CSS Copied!');
    });

    // Helpers
    function rgbToHex(r, g, b) { return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1); }
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
    }
});
