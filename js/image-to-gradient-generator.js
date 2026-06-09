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
        setupFaqToggles();
        setupCopyLink();
    }

    function setupEventListeners() {
        // Click to upload
        uploadZone.addEventListener('click', () => imageInput.click());

        // Keyboard accessibility for upload zone
        uploadZone.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                imageInput.click();
            }
        });

        // Focus styling for upload zone
        uploadZone.addEventListener('focus', () => {
            uploadZone.classList.add('upload-zone-focus');
        });
        uploadZone.addEventListener('blur', () => {
            uploadZone.classList.remove('upload-zone-focus');
        });

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
            angleSlider.setAttribute('aria-valuenow', state.angle);
            angleSlider.setAttribute('aria-valuetext', state.angle + ' degrees');
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
            const r = Math.round(data[i] / 32) * 32;
            const g = Math.round(data[i+1] / 32) * 32;
            const b = Math.round(data[i+2] / 32) * 32;
            const key = `${r},${g},${b}`;
            colorMap[key] = (colorMap[key] || 0) + 1;
        }

        const sorted = Object.entries(colorMap)
            .sort((a, b) => b[1] - a[1])
            .map(entry => {
                const [r, g, b] = entry[0].split(',').map(Number);
                return { r, g, b, count: entry[1] };
            });

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
            <div class="w-12 h-12 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600" style="background-color: ${color};" role="listitem" aria-label="Extracted color ${color}" title="${color}"></div>
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
        gradientPreview.setAttribute('aria-label', 'Generated gradient preview: ' + cssCode);
        cssOutput.textContent = cssCode;
    }

    function copyCSS() {
        const text = cssOutput.textContent;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('CSS code copied to clipboard!', 'success');
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check mr-2" aria-hidden="true"></i>Copied!';
                copyBtn.setAttribute('aria-label', 'CSS code copied');
                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                    copyBtn.setAttribute('aria-label', 'Copy CSS gradient code to clipboard');
                }, 2000);
            }).catch(() => {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showToast('CSS code copied to clipboard!', 'success');
        } catch (e) {
            showToast('Failed to copy', 'error');
        }
        document.body.removeChild(textarea);
    }

    // ─── Toast Helper ───
    function showToast(message, type) {
        var container = document.getElementById('toast-container');
        if (!container) return;
        var toast = document.createElement('div');
        var iconClass = 'fas fa-circle-check text-emerald-500';
        var borderClass = 'border-emerald-500/30';
        if (type === 'error') {
            iconClass = 'fas fa-circle-xmark text-red-400';
            borderClass = 'border-red-400/30';
        } else if (type === 'info') {
            iconClass = 'fas fa-circle-info text-blue-400';
            borderClass = 'border-blue-400/30';
        }
        toast.className = 'flex items-center gap-3 px-5 py-3 rounded-xl border ' + borderClass + ' bg-white dark:bg-slate-800 shadow-lg text-sm transform translate-x-full transition-transform duration-300';
        toast.innerHTML = '<i class="' + iconClass + '" aria-hidden="true"></i><span class="text-slate-700 dark:text-slate-200">' + message + '</span>';
        container.appendChild(toast);

        requestAnimationFrame(function () {
            toast.classList.remove('translate-x-full');
            toast.classList.add('translate-x-0');
        });

        setTimeout(function () {
            toast.classList.remove('translate-x-0');
            toast.classList.add('translate-x-full');
            setTimeout(function () {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 2500);
    }

    // ─── FAQ Toggles with ARIA ───
    function setupFaqToggles() {
        setTimeout(function initFaq() {
            var faqToggles = document.querySelectorAll('.faq-toggle');
            if (faqToggles.length === 0) {
                setTimeout(initFaq, 100);
                return;
            }

            faqToggles.forEach(function (toggle) {
                var clone = toggle.cloneNode(true);
                toggle.parentNode.replaceChild(clone, toggle);
                clone.addEventListener('click', function (e) {
                    e.preventDefault();
                    var content = this.nextElementSibling;
                    var icon = this.querySelector('i');
                    if (!content) return;

                    var isHidden = content.classList.contains('hidden');

                    // Close all others
                    document.querySelectorAll('.faq-toggle').forEach(function (otherToggle) {
                        if (otherToggle !== clone) {
                            var otherContent = otherToggle.nextElementSibling;
                            var otherIcon = otherToggle.querySelector('i');
                            if (otherContent && !otherContent.classList.contains('hidden')) {
                                otherContent.style.maxHeight = '0px';
                                if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
                                otherToggle.setAttribute('aria-expanded', 'false');
                                setTimeout(function () {
                                    otherContent.classList.add('hidden');
                                    otherContent.style.maxHeight = '';
                                }, 300);
                            }
                        }
                    });

                    if (isHidden) {
                        content.classList.remove('hidden');
                        content.style.maxHeight = content.scrollHeight + 'px';
                        if (icon) icon.style.transform = 'rotate(180deg)';
                        this.setAttribute('aria-expanded', 'true');
                    } else {
                        content.style.maxHeight = '0px';
                        if (icon) icon.style.transform = 'rotate(0deg)';
                        this.setAttribute('aria-expanded', 'false');
                        setTimeout(function () {
                            content.classList.add('hidden');
                            content.style.maxHeight = '';
                        }, 300);
                    }
                });
            });
        }, 50);
    }

    // ─── Copy Link Button ───
    function setupCopyLink() {
        setTimeout(function initCopyLink() {
            var copyLinkBtn = document.getElementById('copy-link-btn');
            if (!copyLinkBtn) {
                setTimeout(initCopyLink, 100);
                return;
            }
            copyLinkBtn.addEventListener('click', function () {
                var url = window.location.href;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(url).then(function () {
                        showToast('Page link copied!', 'success');
                    }).catch(function () {
                        showToast('Failed to copy link', 'error');
                    });
                } else {
                    var textarea = document.createElement('textarea');
                    textarea.value = url;
                    textarea.style.position = 'fixed';
                    textarea.style.left = '-9999px';
                    document.body.appendChild(textarea);
                    textarea.select();
                    try {
                        document.execCommand('copy');
                        showToast('Page link copied!', 'success');
                    } catch (e) {
                        showToast('Failed to copy link', 'error');
                    }
                    document.body.removeChild(textarea);
                }
            });
        }, 50);
    }

    init();
})();
