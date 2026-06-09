(function() {
    'use strict';

    const preview = document.getElementById('glass-preview');
    const codeOutput = document.getElementById('code-output');
    const copyStatus = document.getElementById('copy-status');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const copyLinkStatus = document.getElementById('copy-link-status');

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
        
        const opSlider = document.getElementById('gl-op');
        const blurSlider = document.getElementById('gl-blur');
        const brdSlider = document.getElementById('gl-brd');
        const radSlider = document.getElementById('gl-rad');

        const op = opSlider.value / 100;
        const blur = blurSlider.value;
        const brd = brdSlider.value;
        const rad = radSlider.value;
        
        document.getElementById('v-op').textContent = op.toFixed(2);
        document.getElementById('v-blur').textContent = blur;
        document.getElementById('v-brd').textContent = brd;
        document.getElementById('v-rad').textContent = rad;

        // Update ARIA values for screen readers
        opSlider.setAttribute('aria-valuenow', opSlider.value);
        opSlider.setAttribute('aria-valuetext', op.toFixed(2));
        blurSlider.setAttribute('aria-valuenow', blurSlider.value);
        blurSlider.setAttribute('aria-valuetext', blur + ' pixels');
        brdSlider.setAttribute('aria-valuenow', brdSlider.value);
        brdSlider.setAttribute('aria-valuetext', brd + ' pixel' + (brd !== '1' ? 's' : ''));
        radSlider.setAttribute('aria-valuenow', radSlider.value);
        radSlider.setAttribute('aria-valuetext', rad + ' pixels');
        
        // Apply styles
        preview.style.background = `rgba(255, 255, 255, ${op})`;
        preview.style.backdropFilter = `blur(${blur}px)`;
        preview.style.WebkitBackdropFilter = `blur(${blur}px)`;
        preview.style.border = `${brd}px solid rgba(255, 255, 255, 0.2)`;
        preview.style.borderRadius = `${rad}px`;
        preview.style.boxShadow = `0 4px 30px rgba(0, 0, 0, 0.1)`;
        
        generateCode(op, blur, brd, rad);
    };
    
    window.copyCode = function() {
        if (!codeOutput) return;
        const text = codeOutput.value;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
                announceCopySuccess(copyStatus, 'CSS code copied to clipboard');
            }).catch(function() {
                fallbackCopy(text);
                announceCopySuccess(copyStatus, 'CSS code copied to clipboard');
            });
        } else {
            fallbackCopy(text);
            announceCopySuccess(copyStatus, 'CSS code copied to clipboard');
        }

        if (window.Devpalettes && window.Devpalettes.Toast) {
            window.Devpalettes.Toast.show('CSS Copied!', 'success');
        }
    };

    function fallbackCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch(e) {}
        document.body.removeChild(ta);
    }

    function announceCopySuccess(region, message) {
        if (!region) return;
        region.textContent = '';
        // Small delay to force screen reader re-announcement
        setTimeout(function() { region.textContent = message; }, 100);
    }

    // Copy link button handler
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', function() {
            var url = window.location.href;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(function() {
                    announceCopySuccess(copyLinkStatus, 'Page link copied to clipboard');
                    if (window.Devpalettes && window.Devpalettes.Toast) {
                        window.Devpalettes.Toast.show('Link Copied!', 'success');
                    }
                }).catch(function() {
                    fallbackCopy(url);
                    announceCopySuccess(copyLinkStatus, 'Page link copied to clipboard');
                });
            } else {
                fallbackCopy(url);
                announceCopySuccess(copyLinkStatus, 'Page link copied to clipboard');
            }
        });
    }
    
    // Initialize on load
    updateGlass();

})();
