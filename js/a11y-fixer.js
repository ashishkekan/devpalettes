// Accessibility Fixer Logic
document.addEventListener('DOMContentLoaded', () => {
    const fgInput = document.getElementById('a11y-fg');
    const bgInput = document.getElementById('a11y-bg');
    const fgHex = document.getElementById('a11y-fg-hex');
    const bgHex = document.getElementById('a11y-bg-hex');
    const preview = document.getElementById('a11y-preview');
    const score = document.getElementById('contrast-score');
    const badge = document.getElementById('wcag-badge');
    const fixBtn = document.getElementById('fix-colors-btn');

    function luminance(r, g, b) {
        const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    function contrast(hex1, hex2) {
        const rgb1 = Devpalettes.ColorUtils.hexToRgb(hex1);
        const rgb2 = Devpalettes.ColorUtils.hexToRgb(hex2);
        const lum1 = luminance(rgb1.r, rgb1.g, rgb1.b);
        const lum2 = luminance(rgb2.r, rgb2.g, rgb2.b);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
    }

    function update() {
        const fg = fgInput.value;
        const bg = bgInput.value;
        
        preview.style.color = fg;
        preview.style.backgroundColor = bg;
        
        const ratio = contrast(fg, bg);
        const ratioFixed = ratio.toFixed(2);
        score.textContent = `${ratioFixed}:1`;
        
        // WCAG Checks
        const passAA = ratio >= 4.5;
        const passAAA = ratio >= 7;
        
        badge.className = 'mt-2 text-lg font-bold';
        
        if (passAAA) {
            badge.classList.add('text-emerald-500');
            badge.innerHTML = '<i class="fas fa-check-circle"></i> AAA Pass';
        } else if (passAA) {
            badge.classList.add('text-blue-500');
            badge.innerHTML = '<i class="fas fa-check-circle"></i> AA Pass';
        } else {
            badge.classList.add('text-red-500');
            badge.innerHTML = '<i class="fas fa-times-circle"></i> Fail';
        }
    }

    [fgInput, bgInput, fgHex, bgHex].forEach(el => {
        el.addEventListener('input', update);
    });

    fixBtn.addEventListener('click', () => {
        // Simple fix: darken foreground until it passes
        let fg = fgInput.value;
        const bg = bgInput.value;
        
        let attempts = 0;
        while (contrast(fg, bg) < 4.5 && attempts < 50) {
            // Darken
            let rgb = Devpalettes.ColorUtils.hexToRgb(fg);
            let hsl = Devpalettes.ColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
            hsl.l = Math.max(0, hsl.l - 5);
            fg = Devpalettes.ColorUtils.hslToHex(hsl.h, hsl.s, hsl.l);
            attempts++;
        }
        
        fgInput.value = fg;
        fgHex.value = fg;
        update();
        Devpalettes.Toast.show('Colors adjusted for AA compliance');
    });

    update();
});
