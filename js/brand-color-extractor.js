(function() {
    'use strict';

    const state = {
        colors: [],
        imageLoaded: false
    };

    // DOM Elements
    const uploadZone = document.getElementById('upload-zone');
    const imageInput = document.getElementById('image-input');
    const imagePreview = document.getElementById('image-preview');
    const previewContainer = document.getElementById('preview-container');
    const emptyState = document.getElementById('empty-state');
    const paletteGrid = document.getElementById('palette-grid');
    const paletteList = document.getElementById('palette-list');
    const colorCount = document.getElementById('color-count');
    const downloadBtn = document.getElementById('download-palette-btn');

    // Initialize
    function init() {
        setupEventListeners();
    }

    function setupEventListeners() {
        // Upload Zone Click
        uploadZone.addEventListener('click', () => imageInput.click());

        // File Input Change
        imageInput.addEventListener('change', handleFileSelect);

        // Drag and Drop
        uploadZone.addEventListener('dragover', (e) => {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            uploadZone.classList.add('border-purple-500', 'bg-purple-50', 'dark:bg-purple-900/20');
        });

        uploadZone.addEventListener('dragleave', (e) => {
            e.stopPropagation();
            e.preventDefault();
            uploadZone.classList.remove('border-purple-500', 'bg-purple-50', 'dark:bg-purple-900/20');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.stopPropagation();
            e.preventDefault();
            uploadZone.classList.remove('border-purple-500', 'bg-purple-50', 'dark:bg-purple-900/20');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        });

        // Download Button
        downloadBtn.addEventListener('click', downloadPalette);
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    }

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                imagePreview.src = e.target.result;
                previewContainer.classList.remove('hidden');
                uploadZone.classList.add('hidden');
                state.imageLoaded = true;
                processImage(img);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function processImage(img) {
        // Create temporary canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize for performance (max 200px width)
        const scale = Math.min(1, 200 / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        // Color Counting Map
        const colorMap = {};

        // Sample pixels (skip transparent)
        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const a = pixels[i + 3];

            if (a < 125) continue; // Skip mostly transparent

            // Quantize to reduce color space (round to nearest 16)
            const rQ = Math.round(r / 16) * 16;
            const gQ = Math.round(g / 16) * 16;
            const bQ = Math.round(b / 16) * 16;

            const key = `${rQ},${gQ},${bQ}`;
            
            if (colorMap[key]) {
                colorMap[key].count++;
            } else {
                colorMap[key] = { r: rQ, g: gQ, b: bQ, count: 1 };
            }
        }

        // Sort by frequency
        const sortedColors = Object.values(colorMap).sort((a, b) => b.count - a.count);

        // Filter distinct colors (remove very similar ones)
        const distinctColors = [];
        const threshold = 50; // Euclidean distance threshold

        for (const color of sortedColors) {
            let isDistinct = true;
            for (const distinct of distinctColors) {
                const dist = Math.sqrt(
                    Math.pow(color.r - distinct.r, 2) +
                    Math.pow(color.g - distinct.g, 2) +
                    Math.pow(color.b - distinct.b, 2)
                );
                if (dist < threshold) {
                    isDistinct = false;
                    break;
                }
            }
            if (isDistinct) {
                distinctColors.push(color);
            }
            if (distinctColors.length >= 8) break;
        }

        // Calculate percentages
        const totalPixels = (pixels.length / 4);
        state.colors = distinctColors.map(c => ({
            hex: rgbToHex(c.r, c.g, c.b),
            r: c.r,
            g: c.g,
            b: c.b,
            percentage: ((c.count / totalPixels) * 100).toFixed(2)
        }));

        renderPalette();
    }

    function rgbToHex(r, g, b) {
        const toHex = (c) => {
            const hex = c.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        };
        // Clamp values
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));
        return "#" + toHex(r) + toHex(g) + toHex(b);
    }

    function renderPalette() {
        if (state.colors.length === 0) {
            emptyState.classList.remove('hidden');
            paletteGrid.classList.add('hidden');
            paletteList.classList.add('hidden');
            downloadBtn.disabled = true;
            return;
        }

        emptyState.classList.add('hidden');
        paletteGrid.classList.remove('hidden');
        paletteList.classList.remove('hidden');
        downloadBtn.disabled = false;
        colorCount.textContent = `${state.colors.length} colors`;

        // Render Grid
        paletteGrid.innerHTML = state.colors.map(color => `
            <div class="group relative cursor-pointer" onclick="window.copyColor('${color.hex}')">
                <div class="aspect-square rounded-xl shadow-md transition-transform group-hover:scale-105" style="background-color: ${color.hex};"></div>
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-xl">
                    <i class="fas fa-copy text-white text-xl"></i>
                </div>
                <div class="text-center mt-2">
                    <p class="font-mono text-sm font-semibold">${color.hex.toUpperCase()}</p>
                </div>
            </div>
        `).join('');

        // Render List (with percentages)
        paletteList.innerHTML = state.colors.map(color => `
            <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <div class="w-6 h-6 rounded-md shadow-sm" style="background-color: ${color.hex};"></div>
                <div class="flex-1 font-mono text-sm">${color.hex.toUpperCase()}</div>
                <div class="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div class="h-full bg-purple-500" style="width: ${color.percentage}%;"></div>
                </div>
                <div class="text-xs text-slate-500 w-12 text-right">${color.percentage}%</div>
            </div>
        `).join('');
    }

    function downloadPalette() {
        if (state.colors.length === 0) return;
        
        let content = "/* Brand Palette - Generated by Devpalettes.com */\n\n";
        content += "/* CSS Variables */\n";
        content += ":root {\n";
        state.colors.forEach((color, i) => {
            content += `  --brand-color-${i + 1}: ${color.hex};\n`;
        });
        content += "}\n\n";
        
        content += "/* HEX List */\n";
        state.colors.forEach(color => {
            content += `${color.hex}\n`;
        });

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'brand-palette.css';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Expose copy function globally for onclick handlers
    window.copyColor = function(hex) {
        navigator.clipboard.writeText(hex).then(() => {
            // Simple feedback
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50 animate-bounce';
            toast.textContent = `Copied ${hex}`;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
        });
    };

    init();
})();
