(function() {
    'use strict';

    const preview = document.getElementById('glass-preview');
    const codeOutput = document.getElementById('code-output');
    
    function generateCode(op, blur, brd, rad) {
        const css = `.glass-card {
    background: rgba(255, 255, 255, ${op});
    backdrop-filter: blur(${blur}px);
    -webkit-backdrop-filter: blur(${blur}px);
    border: ${brd}px solid rgba(255, 255, 255, 0.2);
    border-radius: ${rad}px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}`;
        codeOutput.value = css;
    }
    
    window.updateGlass = function() {
        if (!preview || !codeOutput) return;
        
        const op = document.getElementById('gl-op').value / 100;
        const blur = document.getElementById('gl-blur').value;
        const brd = document.getElementById('gl-brd').value;
        const rad = document.getElementById('gl-rad').value;
        
        document.getElementById('v-op').textContent = op.toFixed(2);
        document.getElementById('v-blur').textContent = blur;
        document.getElementById('v-brd').textContent = brd;
        document.getElementById('v-rad').textContent = rad;
        
        // Apply styles (Using white base for glass effect)
        preview.style.background = `rgba(255, 255, 255, ${op})`;
        preview.style.backdropFilter = `blur(${blur}px)`;
        preview.style.WebkitBackdropFilter = `blur(${blur}px)`;
        preview.style.border = `${brd}px solid rgba(255, 255, 255, 0.2)`;
        preview.style.borderRadius = `${rad}px`;
        preview.style.boxShadow = `0 4px 30px rgba(0, 0, 0, 0.1)`;
        
        generateCode(op, blur, brd, rad);
    };
    
    window.copyCode = function() {
        navigator.clipboard.writeText(codeOutput.value);
        if(window.Devpalettes && window.Devpalettes.Toast) {
            window.Devpalettes.Toast.show('CSS Copied!', 'success');
        } else {
            // Fallback if Toast is not available
            alert('CSS Code Copied!');
        }
    };
    
    // Initialize on load
    updateGlass();

})();
