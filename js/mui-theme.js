// Material UI Theme Logic
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('mui-primary-input');
    const hexInput = document.getElementById('mui-primary-hex');
    const generateBtn = document.getElementById('generate-mui-btn');
    const lightGrid = document.getElementById('mui-light-grid');
    const darkGrid = document.getElementById('mui-dark-grid');
    const codeOutput = document.getElementById('mui-code-output');
    const copyBtn = document.getElementById('copy-mui-code');

    let baseColor = '#1976d2';

    input.addEventListener('input', () => {
        hexInput.value = input.value;
        baseColor = input.value;
    });
    
    hexInput.addEventListener('input', () => {
        if(/^#[0-9A-Fa-f]{6}$/.test(hexInput.value)) {
            input.value = hexInput.value;
            baseColor = hexInput.value;
        }
    });

    function generatePalette(base) {
        const rgb = Devpalettes.ColorUtils.hexToRgb(base);
        const hsl = Devpalettes.ColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        // Material Design shade keys
        const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
        const palette = {};

        shades.forEach(shade => {
            // Simple algorithm: adjust lightness
            let newL = hsl.l;
            if (shade < 500) {
                newL = hsl.l + ((500 - shade) / 500) * (100 - hsl.l);
            } else if (shade > 500) {
                newL = hsl.l - ((shade - 500) / 400) * hsl.l;
            }
            palette[shade] = Devpalettes.ColorUtils.hslToHex(hsl.h, hsl.s, Math.max(0, Math.min(100, newL)));
        });

        return palette;
    }

    function render() {
        const palette = generatePalette(baseColor);
        
        lightGrid.innerHTML = '';
        darkGrid.innerHTML = '';

        Object.entries(palette).forEach(([shade, color]) => {
            // Light Grid Card
            const card = document.createElement('div');
            card.className = 'h-10 flex items-center justify-center text-xs font-mono cursor-pointer';
            card.style.backgroundColor = color;
            card.style.color = parseInt(shade) < 500 ? '#000' : '#fff';
            card.textContent = shade;
            card.onclick = () => Devpalettes.Clipboard.copy(color, `Copied ${color}`);
            lightGrid.appendChild(card);
        });

        // Generate Code
        const obj = `const theme = createTheme({
  palette: {
    primary: {
      main: '${baseColor}',
      light: '${palette[300]}',
      dark: '${palette[700]}',
      contrastText: '${Devpalettes.ColorUtils.getContrastColor(baseColor)}',
    },
  },
});`;
        
        codeOutput.textContent = obj;
    }

    generateBtn.addEventListener('click', render);
    copyBtn.addEventListener('click', () => Devpalettes.Clipboard.copy(codeOutput.textContent, 'Theme code copied!'));
    
    render();
});
