(function() {
    'use strict';

    var box = document.getElementById('preview-box');
    var typeSelect = document.getElementById('anim-type');
    var durationInput = document.getElementById('anim-duration');
    var timingSelect = document.getElementById('anim-timing');
    var iterSelect = document.getElementById('anim-iter');
    var dirSelect = document.getElementById('anim-dir');
    var shapeSelect = document.getElementById('anim-shape');
    var colorInput = document.getElementById('anim-color');
    var codeOutput = document.getElementById('code-output');
    var animAnnouncer = document.getElementById('anim-announcer');
    
    var animations = {
        moveRight: '0% { transform: translateX(0); }\n100% { transform: translateX(100px); }',
        moveLeft: '0% { transform: translateX(0); }\n100% { transform: translateX(-100px); }',
        rotate: '0% { transform: rotate(0deg); }\n100% { transform: rotate(360deg); }',
        scaleUp: '0% { transform: scale(1); }\n100% { transform: scale(1.5); }',
        pulse: '0% { transform: scale(1); opacity: 1; }\n50% { transform: scale(1.2); opacity: 0.7; }\n100% { transform: scale(1); opacity: 1; }',
        shake: '0%, 100% { transform: translateX(0); }\n25% { transform: translateX(-10px); }\n75% { transform: translateX(10px); }',
        bounce: '0%, 100% { transform: translateY(0); }\n50% { transform: translateY(-30px); }',
        flip: '0% { transform: perspective(400px) rotateY(0); }\n100% { transform: perspective(400px) rotateY(180deg); }',
        swing: '20% { transform: rotate(15deg); }\n40% { transform: rotate(-10deg); }\n60% { transform: rotate(5deg); }\n80% { transform: rotate(-5deg); }\n100% { transform: rotate(0deg); }',
        fade: '0%, 100% { opacity: 1; }\n50% { opacity: 0; }'
    };
    
    function updateAll() {
        var type = typeSelect.value;
        var dur = durationInput.value;
        var timing = timingSelect.value;
        var iter = iterSelect.value;
        var dir = dirSelect.value;
        var shape = shapeSelect.value;
        var color = colorInput.value;
        
        box.style.borderRadius = shape;
        box.style.backgroundColor = color;
        
        var keyframes = animations[type] || '';
        var animName = 'anim_' + type;
        
        var cssCode = '/* Element Style */\n.animated-box {\n  width: 80px;\n  height: 80px;\n  background-color: ' + color + ';\n  border-radius: ' + shape + ';\n  animation: ' + animName + ' ' + dur + 's ' + timing + ' ' + iter + ' ' + dir + ';\n}\n\n/* Keyframes */\n@keyframes ' + animName + ' {\n  ' + keyframes.split('\n').join('\n  ') + '\n}';
        
        codeOutput.textContent = cssCode;
    }

    function playAnim() {
        var type = typeSelect.value;
        var dur = durationInput.value;
        var timing = timingSelect.value;
        var iter = iterSelect.value;
        var dir = dirSelect.value;
        
        var animName = 'anim_' + type;
        
        box.style.animation = 'none';
        void box.offsetWidth;
        
        box.style.animation = animName + ' ' + dur + 's ' + timing + ' ' + iter + ' ' + dir;
        
        var styleTag = document.getElementById('dynamic-styles');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'dynamic-styles';
            document.head.appendChild(styleTag);
        }
        
        var keyframes = animations[type];
        styleTag.textContent = '@keyframes ' + animName + ' { ' + keyframes + ' }';

        // Announce to screen readers
        if (animAnnouncer) {
            animAnnouncer.textContent = 'Playing ' + typeSelect.options[typeSelect.selectedIndex].text + ' animation, duration ' + dur + ' seconds, ' + timing + ' timing, ' + iter + ' iterations, ' + dir + ' direction';
        }
    }

    function stopAnim() {
        box.style.animation = 'none';
        if (animAnnouncer) {
            animAnnouncer.textContent = 'Animation stopped';
        }
    }

    function copyCode() {
        var text = codeOutput.textContent;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
                showToast('CSS Copied!', 'success');
            }).catch(function() {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            showToast('CSS Copied!', 'success');
        } catch(e) {
            showToast('Copy failed', 'error');
        }
        document.body.removeChild(ta);
    }

    function showToast(message, type) {
        if (window.Devpalettes && window.Devpalettes.Toast) {
            window.Devpalettes.Toast.show(message, type);
        }
    }

    // Bind event listeners (replacing inline handlers)
    function setupListeners() {
        // All select/input change events
        var controls = [typeSelect, durationInput, timingSelect, iterSelect, dirSelect, shapeSelect, colorInput];
        controls.forEach(function(el) {
            el.addEventListener('change', updateAll);
            if (el.type === 'number' || el.type === 'color') {
                el.addEventListener('input', updateAll);
            }
        });

        // Play/Stop/Copy buttons
        document.getElementById('play-btn').addEventListener('click', playAnim);
        document.getElementById('stop-btn').addEventListener('click', stopAnim);
        document.getElementById('copy-btn').addEventListener('click', copyCode);

        // Copy link button
        var copyLinkBtn = document.getElementById('copy-link-btn');
        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', function() {
                var url = window.location.href;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(url).then(function() {
                        showToast('Link copied to clipboard!', 'success');
                    });
                } else {
                    fallbackCopy(url);
                }
            });
        }
    }

    // Initialize
    setupListeners();
    updateAll();
    
})();
