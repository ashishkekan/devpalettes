// ShadCN Theme Logic
document.addEventListener('DOMContentLoaded', () => {
    const inputs = {
        bg: document.getElementById('shad-bg'),
        fg: document.getElementById('shad-fg'),
        primary: document.getElementById('shad-primary'),
        accent: document.getElementById('shad-accent'),
    };
    
    const preview = document.getElementById('shad-preview');
    const codeOutput = document.getElementById('shad-code');
    const copyBtn = document.getElementById('copy-shad');

    function generate() {
        const bg = inputs.bg.value;
        const fg = inputs.fg.value;
        const primary = inputs.primary.value;
        const accent = inputs.accent.value;

        // Update Preview
        preview.style.backgroundColor = bg;
        preview.style.color = fg;
        
        // Update buttons inside preview
        const primaryBtn = preview.querySelector('button:first-child');
        primaryBtn.style.backgroundColor = primary;
        
        const secondaryBtn = preview.querySelector('button:last-child');
        secondaryBtn.style.borderColor = accent;
        secondaryBtn.style.color = fg;

        // Generate Code
        const css = `:root {
  --background: ${hexToHSLString(bg)};
  --foreground: ${hexToHSLString(fg)};
  --primary: ${hexToHSLString(primary)};
  --primary-foreground: ${getContrast(primary)};
  --secondary: ${hexToHSLString(accent)};
  --secondary-foreground: ${getContrast(accent)};
  --muted: ${hexToHSLString(bg)};
  --muted-foreground: ${hexToHSLString(fg)};
  --accent: ${hexToHSLString(accent)};
  --accent-foreground: ${getContrast(accent)};
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: ${hexToHSLString(accent)};
  --input: ${hexToHSLString(accent)};
  --ring: ${hexToHSLString(primary)};
  --radius: 0.5rem;
}
 
.dark {
  --background: ${hexToHSLString(fg)};
  --foreground: ${hexToHSLString(bg)};
  /* Add dark mode vars similarly */
}`;
        
        codeOutput.textContent = css;
    }

    function hexToHSLString(hex) {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = "0x" + hex[1] + hex[1];
            g = "0x" + hex[2] + hex[2];
            b = "0x" + hex[3] + hex[3];
        } else if (hex.length === 7) {
            r = "0x" + hex[1] + hex[2];
            g = "0x" + hex[3] + hex[4];
            b = "0x" + hex[5] + hex[6];
        }
        r /= 255; g /= 255; b /= 255;
        let cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin;
        let h = 0, s = 0, l = (cmax + cmin) / 2;
        if (delta !== 0) {
            s = l > 0.5 ? delta / (2 - cmax - cmin) : delta / (cmax + cmin);
            switch (cmax) {
                case r: h = ((g - b) / delta) % 6; break;
                case g: h = (b - r) / delta + 2; break;
                case b: h = (r - g) / delta + 4; break;
            }
        }
        h = Math.round(h * 36);
        s = Math.round(s * 100);
        l = Math.round(l * 100);
        return `${h} ${s}% ${l}%`;
    }

    function getContrast(hex) {
        const rgb = Devpalettes.ColorUtils.hexToRgb(hex);
        const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
        return luminance > 0.5 ? '0 0% 0%' : '0 0% 100%';
    }

    Object.values(inputs).forEach(input => input.addEventListener('input', generate));
    
    generate();
});
