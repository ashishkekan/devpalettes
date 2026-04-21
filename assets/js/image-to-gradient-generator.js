(function() {
    'use strict';

    const state = {
        colors: [],
        angle: 135,
        type: 'linear'
    };

    // DOM Elements
    const uploadZone = document.getElementById('upload-zone');
    const imageInput = document.getElementById('image-input');
    const imagePreview = document.getElementById('image-preview');
    const previewContainer = document.getElementById('preview-container');
    const gradientPreview = document.getElementById('gradient-preview');
    const cssOutput = document.getElementById('css-output');
    const colorSwatches = document.getElementById('color-swatches');
    const angleSlider = document.getElementById('gradient-angle');
    const angleValue = document.getElementById('angle-value');
    const angleControl = document.getElementById('angle-control');
    const typeSelect = document.getElementById('gradient-type');
    const copyBtn = document.getElementById('copy-btn');

    function init() {
        setupEventListeners();
    }

    function setupEventListeners() {
        uploadZone.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', handleFileSelect);
        
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('border-pink-500', 'bg-pink-50', 'dark:bg-pink-900/20');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('border-pink-500', 'bg-pink-50', 'dark:bg-pink-900/20');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('border-pink-500', 'bg-pink-50', 'dark:bg-pink-900/20');
            if (e.dataTransfer.files.length > 0) {
                handleFile(e.dataTransfer.files[0]);
            }
        });

        angleSlider.addEventListener('input', (e) => {
            state.angle = e.target.value;
            angleValue.textContent = state.angle;
            updateGradient();
        });

        typeSelect.addEventListener('change', (e) => {
            state.type = e.target.value;
            if (state.type === 'radial') {
                angleControl.classList.add('opacity-50', 'pointer-events-none');
            } else {
                angleControl.classList.remove('opacity-50', 'pointer-events-none');
            }
            updateGradient();
        });

        copyBtn.addEventListener('click', copyCSS);
    }

    function handleFileSelect(e) {
        if (e.target.files[0]) handleFile(e.target.files[0]);
    }

    function handleFile(file) {
        if (!file.type.startsWith('image/')) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                imagePreview.src = e.target.result;
                previewContainer.classList.remove('hidden');
                uploadZone.classList.add('hidden');
                extractColors(img);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function extractColors(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const scale = Math.min(1, 100 / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const colorMap = {};

        for (let i = 0; i < data.length; i += 4) {
            // Quantize to reduce color count
            const r = Math.round(data[i] / 32) * 32;
            const g = Math.round(data[i+1] / 32) * 32;
            const b = Math.round(data[i+2] / 32) * 32;
            const key = `${r},${g},${b}`;
            colorMap[key] = (colorMap[key] || 0) + 1;
        }

        // Sort by frequency and filter
        const sorted = Object.entries(colorMap)
            .sort((a, b) => b[1] - a[1])
            .map(entry => {
                const [r, g, b] = entry[0].split(',').map(Number);
                return { r, g, b, count: entry[1] };
            });

        // Filter distinct
        const distinct = [];
        const threshold = 80;
        for (const color of sorted) {
            if (distinct.length >= 3) break;
            let isDistinct = true;
            for (const d of distinct) {
                const dist = Math.sqrt(Math.pow(color.r - d.r, 2) + Math.pow(color.g - d.g, 2) + Math.pow(color.b - d.b, 2));
                if (dist < threshold) isDistinct = false;
            }
            if (isDistinct) distinct.push(color);
        }
        
        // Pad if not enough colors
        while (distinct.length < 2) {
            distinct.push({ r: 200, g: 200, b: 200 });
        }

        state.colors = distinct.map(c => rgbToHex(c.r, c.g, c.b));
        renderSwatches();
        updateGradient();
    }

    function rgbToHex(r, g, b) {
        const toHex = (c) => {
            const val = Math.min(255, Math.max(0, c));
            const hex = val.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    function renderSwatches() {
        colorSwatches.innerHTML = state.colors.map(color => `
            <div class="w-12 h-12 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600" style="background-color: ${color};" title="${color}"></div>
        `).join('');
    }

    function updateGradient() {
        if (state.colors.length < 2) return;

        const colorString = state.colors.join(', ');
        let cssCode = '';

        if (state.type === 'linear') {
            cssCode = `background: linear-gradient(${state.angle}deg, ${colorString});`;
            gradientPreview.style.background = `linear-gradient(${state.angle}deg, ${colorString})`;
        } else {
            cssCode = `background: radial-gradient(circle, ${colorString});`;
            gradientPreview.style.background = `radial-gradient(circle, ${colorString})`;
        }

        gradientPreview.innerHTML = '';
        cssOutput.textContent = cssCode;
    }

    function copyCSS() {
        navigator.clipboard.writeText(cssOutput.textContent).then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
            setTimeout(() => copyBtn.innerHTML = originalText, 2000);
        });
    }

    init();
})();
