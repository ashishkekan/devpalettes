(function() {
    const box = document.getElementById('preview-box');
    const typeSelect = document.getElementById('anim-type');
    const durationInput = document.getElementById('anim-duration');
    const timingSelect = document.getElementById('anim-timing');
    const iterSelect = document.getElementById('anim-iter');
    const dirSelect = document.getElementById('anim-dir');
    const shapeSelect = document.getElementById('anim-shape');
    const colorInput = document.getElementById('anim-color');
    const codeOutput = document.getElementById('code-output');
    
    const animations = {
        moveRight: `0% { transform: translateX(0); }
100% { transform: translateX(100px); }`,
        moveLeft: `0% { transform: translateX(0); }
100% { transform: translateX(-100px); }`,
        rotate: `0% { transform: rotate(0deg); }
100% { transform: rotate(360deg); }`,
        scaleUp: `0% { transform: scale(1); }
100% { transform: scale(1.5); }`,
        pulse: `0% { transform: scale(1); opacity: 1; }
50% { transform: scale(1.2); opacity: 0.7; }
100% { transform: scale(1); opacity: 1; }`,
        shake: `0%, 100% { transform: translateX(0); }
25% { transform: translateX(-10px); }
75% { transform: translateX(10px); }`,
        bounce: `0%, 100% { transform: translateY(0); }
50% { transform: translateY(-30px); }`,
        flip: `0% { transform: perspective(400px) rotateY(0); }
100% { transform: perspective(400px) rotateY(180deg); }`,
        swing: `20% { transform: rotate(15deg); }
40% { transform: rotate(-10deg); }
60% { transform: rotate(5deg); }
80% { transform: rotate(-5deg); }
100% { transform: rotate(0deg); }`,
        fade: `0%, 100% { opacity: 1; }
50% { opacity: 0; }`
    };
    
    window.updateAll = function() {
        const type = typeSelect.value;
        const dur = durationInput.value;
        const timing = timingSelect.value;
        const iter = iterSelect.value;
        const dir = dirSelect.value;
        const shape = shapeSelect.value;
        const color = colorInput.value;
        
        box.style.borderRadius = shape;
        box.style.backgroundColor = color;
        
        const keyframes = animations[type] || '';
        const animName = `anim_${type}`;
        
        const cssCode = `/* Element Style */
        .animated-box {
        width: 80px;
        height: 80px;
        background-color: ${color};
        border-radius: ${shape};
        animation: ${animName} ${dur}s ${timing} ${iter} ${dir};
        }

        /* Keyframes */
        @keyframes ${animName} {
        ${keyframes}
    }`;
        
        codeOutput.textContent = cssCode;
    };
    
    window.playAnim = function() {
        const type = typeSelect.value;
        const dur = durationInput.value;
        const timing = timingSelect.value;
        const iter = iterSelect.value;
        const dir = dirSelect.value;
        
        const animName = `anim_${type}`;
        
        box.style.animation = 'none';
        void box.offsetWidth;
        
        box.style.animation = `${animName} ${dur}s ${timing} ${iter} ${dir}`;
        
        let styleTag = document.getElementById('dynamic-styles');
        if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'dynamic-styles';
        document.head.appendChild(styleTag);
        }
        
        const keyframes = animations[type];
        styleTag.textContent = `@keyframes ${animName} { ${keyframes} }`;
    };
    
    window.stopAnim = function() {
        box.style.animation = 'none';
    };
    
    window.copyCode = function() {
        const text = codeOutput.textContent;
        navigator.clipboard.writeText(text).then(function() {
            if(window.Devpalettes && window.Devpalettes.Toast) {
            window.Devpalettes.Toast.show('CSS Copied!', 'success');
            } else {
            alert('CSS Copied!');
            }
        });
    };
    
    updateAll();
    
})();
