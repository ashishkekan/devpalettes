// Button Generator Logic
document.addEventListener('DOMContentLoaded', () => {
    const liveBtn = document.getElementById('live-button');
    const cssOutput = document.getElementById('btn-css-output');
    const textInput = document.getElementById('btn-text');
    const bgInput = document.getElementById('btn-bg');
    const colorInput = document.getElementById('btn-color');
    const hoverSelect = document.getElementById('hover-effect');
    const radiusSlider = document.getElementById('btn-radius');
    const copyBtn = document.getElementById('copy-btn-css');

    function generate() {
        const text = textInput.value;
        const bg = bgInput.value;
        const color = colorInput.value;
        const radius = radiusSlider.value;
        const effect = hoverSelect.value;

        // Reset styles
        liveBtn.style = '';
        liveBtn.className = 'px-8 py-4 text-xl font-bold transition-all duration-300';
        
        // Apply base styles
        liveBtn.style.backgroundColor = bg;
        liveBtn.style.color = color;
        liveBtn.style.borderRadius = `${radius}px`;
        liveBtn.textContent = text;

        let hoverCSS = '';
        
        switch(effect) {
            case 'scale':
                liveBtn.onmouseover = () => liveBtn.style.transform = 'scale(1.1)';
                liveBtn.onmouseout = () => liveBtn.style.transform = 'scale(1)';
                hoverCSS = `transform: scale(1.1);`;
                break;
            case 'glow':
                liveBtn.onmouseover = () => liveBtn.style.boxShadow = `0 0 20px ${bg}`;
                liveBtn.onmouseout = () => liveBtn.style.boxShadow = 'none';
                hoverCSS = `box-shadow: 0 0 20px ${bg};`;
                break;
            case 'invert':
                liveBtn.onmouseover = () => {
                    liveBtn.style.backgroundColor = color;
                    liveBtn.style.color = bg;
                };
                liveBtn.onmouseout = () => {
                    liveBtn.style.backgroundColor = bg;
                    liveBtn.style.color = color;
                };
                hoverCSS = `background: ${color}; color: ${bg};`;
                break;
            // Add more cases for slide, outline
            default:
                liveBtn.onmouseover = () => {};
                liveBtn.onmouseout = () => {};
        }

        // Generate CSS Code
        const css = `
.btn-custom {
  background-color: ${bg};
  color: ${color};
  border-radius: ${radius}px;
  padding: 1rem 2rem;
  font-weight: bold;
  transition: all 0.3s;
}

.btn-custom:hover {
  ${hoverCSS}
}`;
        cssOutput.textContent = css.trim();
    }

    [textInput, bgInput, colorInput, hoverSelect, radiusSlider].forEach(el => {
        el.addEventListener('input', generate);
        el.addEventListener('change', generate);
    });

    copyBtn.addEventListener('click', () => {
        Devpalettes.Clipboard.copy(cssOutput.textContent, 'CSS Code copied!');
    });

    generate();
});
