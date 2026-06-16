/* ============================================
   DevPalettes - CSS Effects Library
   198 Unique Effects | 27 Categories | Pure CSS
   ============================================ */

const CATEGORIES = [
  "Text Effects","Button Effects","Loader Effects","Card Effects",
  "Background Effects","Border Effects","Shadow Effects","Input Effects",
  "Toggle Effects","Tooltip Effects","Navigation Effects","Progress Effects",
  "Badge Effects","Avatar Effects","Image Effects","Timeline Effects",
  "Accordion Effects","Social Effects","Chart Effects","Slider Effects",
  "Scroll Effects","Layout Effects","Section Effects","Animation Effects",
  "Transform Effects","Special Effects","SVG Effects"
];

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function toReact(html, name) {
  const safeName = name.replace(/[^a-zA-Z0-9]/g, '');
  const jsx = html.replace(/class=/g, 'className=').replace(/for=/g, 'htmlFor=').replace(/<br>/g, '<br/>').replace(/onclick="[^"]*"/g, '');
  return `export default function ${safeName}() {\n  return (\n    ${jsx}\n  );\n}`;
}

function generateEffectsData() {
  const E = [];
  let id = 1;
  function add(n, c, d, t, css, html, js) { 
    E.push({ id: id++, name: n, category: c, difficulty: d, tags: t, css, html, js: js || "", react: toReact(html, n) }); 
  }

  // ═══════════════════════════════════════════
  // TEXT EFFECTS (1-24)
  // ═══════════════════════════════════════════
  add("Gradient Text", "Text Effects", "Beginner", ["text","gradient"],
    `.fx-gradient-text{font-size:1.6rem;font-weight:800;background:linear-gradient(135deg,#f59e0b,#ef4444,#ec4899,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}`,
    `<span class="fx-gradient-text">Gradient Text</span>`
  );
  add("Neon Glow Text", "Text Effects", "Beginner", ["text","neon","glow"],
    `.fx-neon-glow{font-size:1.5rem;font-weight:700;color:#0ff;text-shadow:0 0 7px #0ff,0 0 10px #0ff,0 0 21px #0ff,0 0 42px #0ea5e9,0 0 82px #0ea5e9}`,
    `<span class="fx-neon-glow">Neon Glow</span>`
  );
  add("Typewriter Effect", "Text Effects", "Intermediate", ["text","typewriter","animation"],
    `.fx-typewriter{font-size:1.1rem;font-weight:600;color:#10b981;overflow:hidden;border-right:.15em solid #10b981;white-space:nowrap;animation:fxType 3s steps(14) infinite,fxBlink .5s step-end infinite alternate}@keyframes fxType{0%,100%{width:0}50%,80%{width:100%}}@keyframes fxBlink{50%{border-color:transparent}}`,
    `<div class="fx-typewriter">Typewriter Effect...</div>`
  );
  add("Retro Striped Text", "Text Effects", "Intermediate", ["text","retro","striped"],
    `.fx-retro-striped{font-size:1.6rem;font-weight:900;background:repeating-linear-gradient(0deg,#f59e0b 0px,#f59e0b 8px,#000 8px,#000 16px);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}`,
    `<span class="fx-retro-striped">RETRO</span>`
  );
  add("Glitch Text", "Text Effects", "Advanced", ["text","glitch"],
    `.fx-glitch{font-size:1.6rem;font-weight:800;color:#fff;position:relative}.fx-glitch::before,.fx-glitch::after{content:attr(data-text);position:absolute;top:0;left:0;width:100%;height:100%}.fx-glitch::before{color:#ef4444;animation:fxGlitch1 2s infinite;clip-path:inset(0 0 60% 0)}.fx-glitch::after{color:#3b82f6;animation:fxGlitch2 2s infinite;clip-path:inset(40% 0 0 0)}@keyframes fxGlitch1{0%,100%{transform:translate(0)}20%{transform:translate(-3px,2px)}40%{transform:translate(3px,-2px)}60%{transform:translate(-2px,1px)}}@keyframes fxGlitch2{0%,100%{transform:translate(0)}20%{transform:translate(3px,-1px)}40%{transform:translate(-3px,2px)}60%{transform:translate(2px,-1px)}}`,
    `<span class="fx-glitch" data-text="GLITCH">GLITCH</span>`
  );
  add("Calligraphy Text", "Text Effects", "Beginner", ["text","calligraphy","elegant"],
    `.fx-calligraphy{font-size:1.8rem;font-weight:300;font-style:italic;color:#f59e0b;text-shadow:1px 1px 0 #78350f,2px 2px 0 #92400e;letter-spacing:.05em}`,
    `<span class="fx-calligraphy">Calligraphy</span>`
  );
  add("Letterpress Text", "Text Effects", "Intermediate", ["text","letterpress","inset"],
    `.fx-letterpress{font-size:1.6rem;font-weight:800;color:#1e293b;text-shadow:0 1px 0 rgba(255,255,255,.1),0 -1px 0 rgba(0,0,0,.7);background:#334155;padding:.5rem 1rem;border-radius:.5rem}`,
    `<span class="fx-letterpress">Letterpress</span>`
  );
  add("Typewriter Reveal", "Text Effects", "Intermediate", ["text","typewriter","reveal"],
    `.fx-type-reveal{font-size:1.2rem;font-weight:600;color:#e2e8f0;overflow:hidden;white-space:nowrap;width:0;animation:fxTypeReveal 3s steps(20) forwards infinite alternate}@keyframes fxTypeReveal{0%{width:0}50%{width:100%}100%{width:100%}}`,
    `<div class="fx-type-reveal">Typewriter Reveal Animation</div>`
  );
  add("Gradient Text Reveal", "Text Effects", "Intermediate", ["text","gradient","reveal"],
    `.fx-grad-reveal{font-size:1.5rem;font-weight:800;background:linear-gradient(90deg,#10b981 50%,#334155 50%);background-size:200% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:fxGradReveal 2s ease infinite alternate}@keyframes fxGradReveal{0%{background-position:100% 0}100%{background-position:0 0}}`,
    `<span class="fx-grad-reveal">Reveal</span>`
  );
  add("Split Color Text", "Text Effects", "Intermediate", ["text","split","color"],
    `.fx-split-color{font-size:1.6rem;font-weight:800;position:relative;color:#3b82f6;display:inline-block}.fx-split-color::after{content:attr(data-text);position:absolute;top:0;left:0;width:50%;height:100%;color:#ef4444;overflow:hidden}`,
    `<span class="fx-split-color" data-text="SPLIT">SPLIT</span>`
  );
  add("Outline Text Fill", "Text Effects", "Intermediate", ["text","outline","fill"],
    `.fx-outline-fill{font-size:1.6rem;font-weight:800;-webkit-text-stroke:2px #06b6d4;-webkit-text-fill-color:transparent;transition:all .5s}.fx-outline-fill:hover{-webkit-text-fill-color:#06b6d4;text-shadow:0 0 20px #06b6d466}`,
    `<span class="fx-outline-fill">OUTLINE</span>`
  );
  add("Text Mask Image", "Text Effects", "Advanced", ["text","mask","image"],
    `.fx-text-mask{font-size:2rem;font-weight:900;background:url(https://picsum.photos/seed/grad42/400/200.jpg) center/cover;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}`,
    `<span class="fx-text-mask">MASK</span>`
  );
  add("Stacked Text Shadow", "Text Effects", "Beginner", ["text","shadow","stacked"],
    `.fx-stacked-shadow{font-size:1.6rem;font-weight:800;color:#8b5cf6;text-shadow:1px 1px 0 #7c3aed,2px 2px 0 #6d28d9,3px 3px 0 #5b21b6,4px 4px 0 #4c1d95,5px 5px 10px rgba(0,0,0,.5)}`,
    `<span class="fx-stacked-shadow">STACKED</span>`
  );
  add("3D Text", "Text Effects", "Advanced", ["text","3d"],
    `.fx-3d-text{font-size:1.8rem;font-weight:900;color:#ef4444;text-shadow:1px 1px #b91c1c,2px 2px #991b1b,3px 3px #7f1d1d,4px 4px #450a0a,5px 5px 5px rgba(0,0,0,.5);transform:translate(-3px,-3px);transition:all .3s}.fx-3d-text:hover{transform:translate(0,0);text-shadow:0 0 10px #ef444466}`,
    `<span class="fx-3d-text">3D TEXT</span>`
  );
  add("Color Shift Text", "Text Effects", "Beginner", ["text","color","shift"],
    `.fx-color-shift{font-size:1.4rem;font-weight:700;animation:fxColorShift 3s infinite}@keyframes fxColorShift{0%{color:#ef4444}25%{color:#f59e0b}50%{color:#10b981}75%{color:#3b82f6}100%{color:#ef4444}}`,
    `<span class="fx-color-shift">Color Shift</span>`
  );
  add("Fire Text", "Text Effects", "Advanced", ["text","fire"],
    `.fx-fire-text{font-size:1.8rem;font-weight:900;color:#fff;text-shadow:0 0 4px #fff,0 -5px 4px #ff3,2px -10px 6px #fd2,-2px -15px 11px #f80,2px -25px 18px #f20;animation:fxFire .1s infinite alternate}@keyframes fxFire{0%{text-shadow:0 0 4px #fff,0 -5px 4px #ff3,2px -10px 6px #fd2,-2px -15px 11px #f80,2px -25px 18px #f20}100%{text-shadow:0 0 4px #fff,1px -6px 4px #ff3,-1px -11px 6px #fd2,3px -16px 11px #f80,-3px -26px 18px #f20}}`,
    `<span class="fx-fire-text">FIRE</span>`
  );
  add("Heavy Glitch", "Text Effects", "Advanced", ["text","glitch","heavy"],
    `.fx-heavy-glitch{font-size:1.6rem;font-weight:800;color:#fff;position:relative;animation:fxHGlitch .3s infinite}@keyframes fxHGlitch{0%{transform:translate(0)}20%{transform:translate(-5px,3px)}40%{transform:translate(5px,-3px)}60%{transform:translate(-3px,5px)}80%{transform:translate(3px,-5px)}100%{transform:translate(0)}}`,
    `<span class="fx-heavy-glitch">HEAVY GLITCH</span>`
  );
  add("Neon Sign", "Text Effects", "Intermediate", ["text","neon","sign"],
    `.fx-neon-sign{font-size:1.6rem;font-weight:800;color:#ff6b9d;text-shadow:0 0 7px #ff6b9d,0 0 10px #ff6b9d,0 0 21px #ff6b9d,0 0 42px #c31432;animation:fxNeonSign 1.5s infinite alternate}@keyframes fxNeonSign{from{opacity:1}to{opacity:.7}}`,
    `<span class="fx-neon-sign">OPEN</span>`
  );
  add("Matrix Rain", "Text Effects", "Advanced", ["text","matrix","rain"],
    `.fx-matrix{font-size:1rem;font-family:monospace;color:#10b981;overflow:hidden;height:80px;position:relative;width:100%;background:#000;border-radius:8px;padding:5px}.fx-matrix::after{content:'01001 1010 011 1101 001 1110 0101 101 0011 1100 010 1011 110 0100 1010 011';position:absolute;top:0;left:0;animation:fxMatrix 4s linear infinite;word-break:break-all}@keyframes fxMatrix{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}`,
    `<div class="fx-matrix"></div>`
  );
  add("Duotone Text", "Text Effects", "Intermediate", ["text","duotone"],
    `.fx-duotone{font-size:1.6rem;font-weight:900;position:relative;color:#3b82f6;display:inline-block}.fx-duotone::after{content:attr(data-text);position:absolute;top:3px;left:3px;color:#ef4444;z-index:-1;opacity:.6}`,
    `<span class="fx-duotone" data-text="DUOTONE">DUOTONE</span>`
  );
  add("Rainbow Underline Text", "Text Effects", "Beginner", ["text","rainbow","underline"],
    `.fx-rainbow-ul{font-size:1.2rem;font-weight:700;background:linear-gradient(90deg,#ef4444,#f59e0b,#10b981,#3b82f6,#8b5cf6);background-size:100% 3px;background-repeat:no-repeat;background-position:0 100%;padding-bottom:4px;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;box-decoration-break:clone}`,
    `<span class="fx-rainbow-ul">Rainbow Underline</span>`
  );

  // ═══════════════════════════════════════════
  // BUTTON EFFECTS (25-43)
  // ═══════════════════════════════════════════
  add("Ripple Button", "Button Effects", "Intermediate", ["button","ripple"],
    `.fx-ripple-btn{padding:10px 28px;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;position:relative;overflow:hidden}.fx-ripple-btn::after{content:'';position:absolute;width:100%;height:100%;top:0;left:0;background:radial-gradient(circle,rgba(255,255,255,.3) 10%,transparent 10.01%);transform:scale(10);opacity:0;transition:transform .5s,opacity .5s}.fx-ripple-btn:active::after{transform:scale(0);opacity:.3;transition:0s}`,
    `<button class="fx-ripple-btn">Click Me</button>`
  );
  add("Gradient Border Button", "Button Effects", "Intermediate", ["button","gradient","border"],
    `.fx-grad-border-btn{position:relative;padding:10px 28px;background:#151921;color:#fff;border:none;border-radius:10px;font-weight:600;cursor:pointer;z-index:1}.fx-grad-border-btn::before{content:'';position:absolute;top:-2px;left:-2px;right:-2px;bottom:-2px;background:linear-gradient(135deg,#f59e0b,#ef4444,#8b5cf6,#3b82f6);z-index:-2;border-radius:12px}.fx-grad-border-btn::after{content:'';position:absolute;inset:0;background:#151921;z-index:-1;border-radius:10px}`,
    `<button class="fx-grad-border-btn">Gradient</button>`
  );
  add("Shine Sweep Button", "Button Effects", "Intermediate", ["button","shine","sweep"],
    `.fx-shine-btn{padding:10px 28px;background:#10b981;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;position:relative;overflow:hidden}.fx-shine-btn::after{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:linear-gradient(transparent,rgba(255,255,255,.2),transparent);transform:rotate(45deg) translateX(-100%);transition:transform .6s}.fx-shine-btn:hover::after{transform:rotate(45deg) translateX(100%)}`,
    `<button class="fx-shine-btn">Shine</button>`
  );
  add("Fill Up Button", "Button Effects", "Beginner", ["button","fill","hover"],
    `.fx-fillup-btn{position:relative;padding:10px 28px;border:2px solid #ec4899;background:transparent;color:#ec4899;border-radius:8px;font-weight:600;cursor:pointer;overflow:hidden;z-index:1;transition:color .3s}.fx-fillup-btn::before{content:'';position:absolute;top:0;left:0;width:100%;height:100%;background:#ec4899;transform:translateY(100%);transition:transform .3s;z-index:-1}.fx-fillup-btn:hover{color:#fff}.fx-fillup-btn:hover::before{transform:translateY(0)}`,
    `<button class="fx-fillup-btn">Fill Up</button>`
  );
  add("Pulse Glow Button", "Button Effects", "Beginner", ["button","pulse","glow"],
    `.fx-pulse-glow-btn{padding:10px 28px;background:#8b5cf6;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;animation:fxPulseGlow 2s infinite}@keyframes fxPulseGlow{0%{box-shadow:0 0 0 0 #8b5cf688}70%{box-shadow:0 0 0 15px #8b5cf600}100%{box-shadow:0 0 0 0 #8b5cf600}}`,
    `<button class="fx-pulse-glow-btn">Pulse</button>`
  );
  add("Glassmorphism Button", "Button Effects", "Intermediate", ["button","glass","blur"],
    `.fx-glass-btn{padding:10px 28px;background:rgba(255,255,255,.1);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.2);color:#e2e8f0;border-radius:10px;font-weight:600;cursor:pointer;transition:background .3s,border-color .3s}.fx-glass-btn:hover{background:rgba(255,255,255,.2);border-color:rgba(255,255,255,.4)}`,
    `<button class="fx-glass-btn">Glass</button>`
  );
  add("3D Game Button", "Button Effects", "Advanced", ["button","3d","game"],
    `.fx-game-btn{padding:12px 32px;background:linear-gradient(180deg,#f59e0b,#d97706);color:#000;border:none;border-radius:6px;font-weight:800;font-size:.9rem;cursor:pointer;border-bottom:4px solid #92400e;transition:all .1s;text-transform:uppercase;letter-spacing:.05em}.fx-game-btn:hover{transform:translateY(-1px);border-bottom-width:5px}.fx-game-btn:active{transform:translateY(2px);border-bottom-width:2px}`,
    `<button class="fx-game-btn">START</button>`
  );
  add("Sliding Underline Button", "Button Effects", "Intermediate", ["button","underline","slide"],
    `.fx-slide-ul-btn{padding:8px 0;background:transparent;border:none;color:#06b6d4;font-weight:600;cursor:pointer;position:relative}.fx-slide-ul-btn::after{content:'';position:absolute;width:0;height:2px;bottom:0;left:0;background:#06b6d4;transition:width .3s}.fx-slide-ul-btn:hover::after{width:100%}`,
    `<button class="fx-slide-ul-btn">Hover Me</button>`
  );
  add("Scale & Glow Button", "Button Effects", "Intermediate", ["button","scale","glow"],
    `.fx-scale-glow{padding:10px 28px;background:#ef4444;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;transition:transform .3s,box-shadow .3s}.fx-scale-glow:hover{transform:scale(1.05);box-shadow:0 0 20px #ef444488}`,
    `<button class="fx-scale-glow">Scale</button>`
  );
  add("Color Splash Button", "Button Effects", "Advanced", ["button","splash","color"],
    `.fx-splash-btn{padding:10px 28px;background:#1e293b;color:#e2e8f0;border:2px solid #3b82f6;border-radius:8px;font-weight:600;cursor:pointer;position:relative;overflow:hidden;z-index:1;transition:color .3s}.fx-splash-btn::before{content:'';position:absolute;top:50%;left:50%;width:0;height:0;background:#3b82f6;border-radius:50%;transform:translate(-50%,-50%);transition:width .4s,height .4s;z-index:-1}.fx-splash-btn:hover{color:#fff}.fx-splash-btn:hover::before{width:300px;height:300px}`,
    `<button class="fx-splash-btn">Splash</button>`
  );
  add("Share Button Expand", "Button Effects", "Intermediate", ["button","share","expand"],
    `.fx-share-expand{display:flex;gap:8px}.fx-share-expand .btn{width:36px;height:36px;border-radius:50%;border:none;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .2s;font-size:.8rem}.fx-share-expand .btn:hover{transform:scale(1.2)}.fx-share-expand .fb{background:#1877F2}.fx-share-expand .tw{background:#1DA1F2}.fx-share-expand .ig{background:#E4405F}`,
    `<div class="fx-share-expand"><button class="btn fb">f</button><button class="btn tw">𝕏</button><button class="btn ig">◉</button></div>`
  );
  add("Like Button Animation", "Button Effects", "Intermediate", ["button","like","heart"],
    `.fx-like-btn{background:none;border:none;font-size:1.5rem;cursor:pointer;transition:transform .2s;color:#64748b}.fx-like-btn:hover,.fx-like-btn.liked{color:#ef4444;transform:scale(1.2)}`,
    `<button class="fx-like-btn liked" onclick="this.classList.toggle('liked')">♥</button>`, 
    `document.querySelector('.fx-like-btn').addEventListener('click',function(){this.classList.toggle('liked')})`
  );
  add("Follow Button", "Button Effects", "Intermediate", ["button","follow","toggle"],
    `.fx-follow-btn{padding:8px 20px;background:#3b82f6;color:#fff;border:none;border-radius:20px;font-weight:600;font-size:.8rem;cursor:pointer;transition:all .3s}.fx-follow-btn.following{background:transparent;border:2px solid #3b82f6;color:#3b82f6}`,
    `<button class="fx-follow-btn" onclick="this.classList.toggle('following');this.textContent=this.classList.contains('following')?'Following':'Follow'">Follow</button>`,
    `document.querySelector('.fx-follow-btn').addEventListener('click',function(){this.classList.toggle('following');this.textContent=this.classList.contains('following')?'Following':'Follow'})`
  );
  add("Diagonal Slide Button", "Button Effects", "Intermediate", ["button","slide","diagonal"],
    `.fx-diag-slide{position:relative;padding:10px 24px;border:2px solid #ef4444;background:transparent;color:#ef4444;cursor:pointer;font-weight:600;overflow:hidden;z-index:1;transition:color .3s;border-radius:8px}.fx-diag-slide::before{content:'';position:absolute;top:0;left:0;width:150%;height:100%;background:#ef4444;transform:translateX(-100%) skewX(-20deg);transition:transform .3s;z-index:-1}.fx-diag-slide:hover{color:#fff}.fx-diag-slide:hover::before{transform:translateX(-10%) skewX(-20deg)}`,
    `<button class="fx-diag-slide">Diagonal</button>`
  );

  // ═══════════════════════════════════════════
  // LOADER EFFECTS (44-53)
  // ═══════════════════════════════════════════
  add("Pulse Loader", "Loader Effects", "Beginner", ["loader","pulse"],
    `.fx-pulse-loader{width:12px;height:12px;background:#10b981;border-radius:50%;animation:fxPulseLoad 1s infinite}.fx-pulse-wrap{display:flex;gap:8px;align-items:center}.fx-pulse-wrap .d2{animation-delay:.2s}.fx-pulse-wrap .d3{animation-delay:.4s}@keyframes fxPulseLoad{0%,100%{transform:scale(.5);opacity:.5}50%{transform:scale(1.2);opacity:1}}`,
    `<div class="fx-pulse-wrap"><div class="fx-pulse-loader"></div><div class="fx-pulse-loader d2"></div><div class="fx-pulse-loader d3"></div></div>`
  );
  add("Wave Loader", "Loader Effects", "Intermediate", ["loader","wave"],
    `.fx-wave-wrap{display:flex;gap:4px;align-items:flex-end;height:40px}.fx-wave-wrap span{width:6px;background:#3b82f6;border-radius:3px;animation:fxWave 1s ease-in-out infinite}.fx-wave-wrap span:nth-child(2){animation-delay:.1s}.fx-wave-wrap span:nth-child(3){animation-delay:.2s}.fx-wave-wrap span:nth-child(4){animation-delay:.3s}.fx-wave-wrap span:nth-child(5){animation-delay:.4s}@keyframes fxWave{0%,100%{height:10px}50%{height:35px}}`,
    `<div class="fx-wave-wrap"><span></span><span></span><span></span><span></span><span></span></div>`
  );
  add("Dual Ring Spinner", "Loader Effects", "Beginner", ["loader","spinner","ring"],
    `.fx-dual-ring{width:44px;height:44px;border:4px solid #8b5cf633;border-top-color:#8b5cf6;border-bottom-color:#8b5cf6;border-radius:50%;animation:fxDualRing .8s linear infinite}@keyframes fxDualRing{to{transform:rotate(360deg)}}`,
    `<div class="fx-dual-ring"></div>`
  );
  add("Orbit Loader", "Loader Effects", "Advanced", ["loader","orbit"],
    `.fx-orbit-wrap{width:50px;height:50px;position:relative;animation:fxOrbit 2s linear infinite}.fx-orbit-wrap::before{content:'';position:absolute;width:10px;height:10px;background:#ef4444;border-radius:50%;top:0;left:50%;transform:translateX(-50%)}.fx-orbit-wrap::after{content:'';position:absolute;inset:0;border:2px solid #ef444433;border-top-color:#ef4444;border-radius:50%}@keyframes fxOrbit{to{transform:rotate(360deg)}}`,
    `<div class="fx-orbit-wrap"></div>`
  );
  add("Spinning Coin", "Loader Effects", "Intermediate", ["loader","coin","3d"],
    `.fx-coin{width:40px;height:40px;background:linear-gradient(135deg,#f59e0b,#eab308);border-radius:50%;border:3px solid #92400e;animation:fxCoin 1s linear infinite;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:.9rem;color:#78350f}@keyframes fxCoin{0%{transform:rotateY(0)}100%{transform:rotateY(360deg)}}`,
    `<div class="fx-coin">$</div>`
  );
  add("Retro 8-Bit Progress Bar", "Loader Effects", "Intermediate", ["loader","retro","8bit"],
    `.fx-8bit-bar{width:120px;height:16px;background:#000;border:2px solid #10b981;position:relative;overflow:hidden}.fx-8bit-bar::after{content:'';position:absolute;top:0;left:0;height:100%;width:40%;background:repeating-linear-gradient(90deg,#10b981 0,#10b981 8px,transparent 8px,transparent 10px);animation:fx8Bit 1s steps(10) infinite}@keyframes fx8Bit{0%{left:-40%}100%{left:100%}}`,
    `<div class="fx-8bit-bar"></div>`
  );
  add("RPG Health Bar", "Loader Effects", "Intermediate", ["loader","rpg","health"],
    `.fx-rpg-hp{width:120px;height:14px;background:#1e293b;border:2px solid #334155;border-radius:2px;overflow:hidden;position:relative}.fx-rpg-hp::after{content:'';position:absolute;top:0;left:0;height:100%;width:75%;background:linear-gradient(180deg,#ef4444,#b91c1c);animation:fxRPG 2s infinite alternate}@keyframes fxRPG{0%{width:20%}50%{width:90%}100%{width:75%}}`,
    `<div class="fx-rpg-hp"></div>`
  );
  add("Dot Chase Loader", "Loader Effects", "Intermediate", ["loader","dot","chase"],
    `.fx-chase-wrap{width:40px;height:40px;position:relative;animation:fxChaseRot 2s linear infinite}.fx-chase-dot{width:10px;height:10px;background:#f59e0b;border-radius:50%;position:absolute;animation:fxChaseScale 2s infinite}.fx-chase-dot:nth-child(1){top:0;left:50%;transform:translateX(-50%)}.fx-chase-dot:nth-child(2){top:50%;right:0;transform:translateY(-50%);animation-delay:.3s}.fx-chase-dot:nth-child(3){bottom:0;left:50%;transform:translateX(-50%);animation-delay:.6s}.fx-chase-dot:nth-child(4){top:50%;left:0;transform:translateY(-50%);animation-delay:.9s}@keyframes fxChaseRot{to{transform:rotate(360deg)}}@keyframes fxChaseScale{0%,100%{transform:scale(.3)}50%{transform:scale(1)}}`,
    `<div class="fx-chase-wrap"><div class="fx-chase-dot"></div><div class="fx-chase-dot"></div><div class="fx-chase-dot"></div><div class="fx-chase-dot"></div></div>`
  );

  // ═══════════════════════════════════════════
  // CARD EFFECTS (54-70)
  // ═══════════════════════════════════════════
  add("Skeleton Shimmer", "Card Effects", "Beginner", ["card","skeleton","shimmer"],
    `.fx-skeleton{width:100%;padding:1rem;background:#1e293b;border-radius:10px}.fx-skeleton .line{height:12px;background:linear-gradient(90deg,#334155 25%,#475569 50%,#334155 75%);background-size:200% 100%;animation:fxShimmer 1.5s infinite;border-radius:4px;margin-bottom:8px}.fx-skeleton .line:last-child{width:60%;margin-bottom:0}@keyframes fxShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`,
    `<div class="fx-skeleton"><div class="line"></div><div class="line"></div><div class="line"></div></div>`
  );
  add("Glassmorphism Card", "Card Effects", "Intermediate", ["card","glass","blur"],
    `.fx-glass-card{background:rgba(255,255,255,.08);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.15);border-radius:16px;padding:1.5rem;color:#e2e8f0;text-align:center}.fx-glass-card h4{font-weight:700;margin-bottom:.3rem}`,
    `<div class="fx-glass-card"><h4>Glass Card</h4><p style="font-size:.75rem;opacity:.7">Frosted glass effect</p></div>`
  );
  add("3D Flip Card", "Card Effects", "Advanced", ["card","3d","flip"],
    `.fx-flip-wrap{perspective:600px;width:140px;height:80px}.fx-flip-card{width:100%;height:100%;position:relative;transform-style:preserve-3d;transition:transform .6s}.fx-flip-wrap:hover .fx-flip-card{transform:rotateY(180deg)}.fx-flip-front,.fx-flip-back{position:absolute;inset:0;backface-visibility:hidden;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem}.fx-flip-front{background:#3b82f6;color:#fff}.fx-flip-back{background:#ef4444;color:#fff;transform:rotateY(180deg)}`,
    `<div class="fx-flip-wrap"><div class="fx-flip-card"><div class="fx-flip-front">Front</div><div class="fx-flip-back">Back</div></div></div>`
  );
  add("Gradient Border Card", "Card Effects", "Intermediate", ["card","gradient","border"],
    `.fx-grad-border-card{position:relative;background:#151921;border-radius:14px;padding:1.5rem;color:#e2e8f0;text-align:center;z-index:1}.fx-grad-border-card::before{content:'';position:absolute;top:-2px;left:-2px;right:-2px;bottom:-2px;background:linear-gradient(135deg,#f59e0b,#ef4444,#8b5cf6,#06b6d4);z-index:-2;border-radius:16px}.fx-grad-border-card::after{content:'';position:absolute;inset:0;background:#151921;z-index:-1;border-radius:14px}`,
    `<div class="fx-grad-border-card"><h4 style="font-weight:700;margin-bottom:.25rem">Gradient Border</h4><p style="font-size:.7rem;opacity:.6">Animated border</p></div>`
  );
  add("Floating Card", "Card Effects", "Beginner", ["card","float","hover"],
    `.fx-float-card{background:#1e293b;border:1px solid #334155;border-radius:12px;padding:1.25rem;color:#e2e8f0;text-align:center;transition:transform .3s,box-shadow .3s;cursor:pointer}.fx-float-card:hover{transform:translateY(-8px);box-shadow:0 20px 40px rgba(0,0,0,.3)}`,
    `<div class="fx-float-card"><h4 style="font-weight:700">Floating</h4><p style="font-size:.7rem;opacity:.6">Hover me up</p></div>`
  );
  add("Expandable Card", "Card Effects", "Intermediate", ["card","expand","hover"],
    `.fx-expand-card{background:#1e293b;border:1px solid #334155;border-radius:12px;padding:1rem;color:#e2e8f0;cursor:pointer;transition:padding .3s,max-height .3s;max-height:60px;overflow:hidden}.fx-expand-card:hover{padding:1.25rem;max-height:200px}`,
    `<div class="fx-expand-card"><h4 style="font-weight:700;font-size:.85rem">Expandable</h4><p style="font-size:.7rem;opacity:.6;margin-top:.5rem">Hidden content revealed on hover. This card expands smoothly.</p></div>`
  );
  add("Social Card", "Card Effects", "Intermediate", ["card","social","profile"],
    `.fx-social-card{background:#1e293b;border:1px solid #334155;border-radius:12px;padding:1rem;text-align:center;color:#e2e8f0}.fx-social-card .avatar{width:48px;height:48px;background:linear-gradient(135deg,#ec4899,#8b5cf6);border-radius:50%;margin:0 auto .5rem}.fx-social-card .name{font-weight:700;font-size:.85rem}.fx-social-card .handle{font-size:.7rem;color:#64748b}`,
    `<div class="fx-social-card"><div class="avatar"></div><div class="name">Jane Doe</div><div class="handle">@janedoe</div></div>`
  );
  add("Pricing Card Highlight", "Card Effects", "Intermediate", ["card","pricing","highlight"],
    `.fx-pricing{background:#1e293b;border:2px solid #10b981;border-radius:14px;padding:1.25rem;text-align:center;color:#e2e8f0;position:relative;transform:scale(1.05)}.fx-pricing .price{font-size:1.8rem;font-weight:800;color:#10b981}.fx-pricing .label{font-size:.65rem;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin-bottom:.25rem}.fx-pricing .badge{position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:#10b981;color:#fff;font-size:.6rem;font-weight:700;padding:2px 10px;border-radius:9999px}`,
    `<div class="fx-pricing"><span class="badge">POPULAR</span><div class="label">Pro Plan</div><div class="price">$29</div><div style="font-size:.7rem;opacity:.6">per month</div></div>`
  );
  add("Responsive Card Container", "Card Effects", "Beginner", ["card","responsive","container"],
    `.fx-resp-container{display:grid;grid-template-columns:repeat(auto-fit,minmax(60px,1fr));gap:6px}.fx-resp-container>div{background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:6px;padding:.4rem;text-align:center;font-size:.55rem;color:#fff;font-weight:600;aspect-ratio:1;display:flex;align-items:center;justify-content:center}`,
    `<div class="fx-resp-container"><div>A</div><div>B</div><div>C</div><div>D</div></div>`
  );
  add("Image Zoom Overlay", "Card Effects", "Intermediate", ["card","image","zoom"],
    `.fx-zoom-card{width:120px;height:80px;background:url(https://picsum.photos/seed/zoom/200/200.jpg) center/cover;border-radius:10px;overflow:hidden;cursor:pointer}.fx-zoom-card::after{content:'Zoom';width:100%;height:100%;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:.8rem;opacity:0;transition:opacity .3s}.fx-zoom-card:hover::after{opacity:1}`,
    `<div class="fx-zoom-card"></div>`
  );
  add("Image Tilt 3D", "Card Effects", "Advanced", ["card","3d","tilt"],
    `.fx-tilt-card{width:120px;height:80px;background:linear-gradient(135deg,#06b6d4,#3b82f6);border-radius:10px;transition:transform .3s;cursor:pointer;transform-style:preserve-3d;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:.8rem}.fx-tilt-card:hover{transform:perspective(500px) rotateY(15deg) rotateX(5deg)}`,
    `<div class="fx-tilt-card">Tilt Me</div>`
  );
  add("Image Reveal Slider", "Card Effects", "Intermediate", ["card","reveal","slider"],
    `.fx-reveal-slider{width:120px;height:80px;position:relative;background:#ef4444;border-radius:10px;overflow:hidden}.fx-reveal-slider::before{content:'';position:absolute;inset:0;background:#3b82f6;transform:translateX(-100%);transition:transform .4s}.fx-reveal-slider:hover::before{transform:translateX(0)}.fx-reveal-slider span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:.7rem;z-index:2}`,
    `<div class="fx-reveal-slider"><span>Reveal</span></div>`
  );
  add("Circular Image Clip", "Card Effects", "Beginner", ["card","image","clip"],
    `.fx-circle-clip{width:80px;height:80px;background:url(https://picsum.photos/seed/circle22/200/200.jpg) center/cover;border-radius:50%;border:3px solid #8b5cf6;transition:transform .3s}.fx-circle-clip:hover{transform:scale(1.1)}`,
    `<div class="fx-circle-clip"></div>`
  );
  add("Discount Badge", "Card Effects", "Beginner", ["card","badge","discount"],
    `.fx-discount{position:relative;width:100px;height:60px;background:#1e293b;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#e2e8f0;font-weight:700;font-size:.8rem}.fx-discount::before{content:'-20%';position:absolute;top:-8px;right:-8px;background:#ef4444;color:#fff;font-size:.6rem;padding:2px 6px;border-radius:4px;font-weight:700}`,
    `<div class="fx-discount">$49</div>`
  );
  add("Expandable Panel", "Card Effects", "Intermediate", ["card","panel","expand"],
    `.fx-panel{background:#1e293b;border:1px solid #334155;border-radius:8px;overflow:hidden}.fx-panel-head{padding:8px 12px;font-weight:700;font-size:.8rem;color:#e2e8f0;cursor:pointer;display:flex;justify-content:space-between}.fx-panel-body{padding:0 12px;max-height:0;overflow:hidden;transition:max-height .3s,padding .3s;font-size:.7rem;color:#94a3b8}.fx-panel:hover .fx-panel-body{max-height:100px;padding:8px 12px}`,
    `<div class="fx-panel"><div class="fx-panel-head">Details ▾</div><div class="fx-panel-body">Hidden panel content revealed on hover smoothly.</div></div>`
  );

  // ═══════════════════════════════════════════
  // BACKGROUND EFFECTS (71-81)
  // ═══════════════════════════════════════════
  add("Animated Gradient", "Background Effects", "Beginner", ["background","gradient","animated"],
    `.fx-anim-gradient{width:100%;height:80px;background:linear-gradient(-45deg,#10b981,#3b82f6,#8b5cf6,#ec4899);background-size:400% 400%;animation:fxAnimGrad 8s ease infinite;border-radius:10px}@keyframes fxAnimGrad{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}`,
    `<div class="fx-anim-gradient"></div>`
  );
  add("Aurora Background", "Background Effects", "Intermediate", ["background","aurora"],
    `.fx-aurora{width:100%;height:80px;background:linear-gradient(-45deg,#0c0f14,#064e3b,#0c4a6e,#312e81);background-size:400% 400%;animation:fxAurora 12s ease infinite;border-radius:10px;position:relative;overflow:hidden}.fx-aurora::after{content:'';position:absolute;inset:0;background:radial-gradient(circle at 30% 50%,rgba(16,185,129,.3),transparent 50%),radial-gradient(circle at 70% 50%,rgba(59,130,246,.3),transparent 50%)}@keyframes fxAurora{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}`,
    `<div class="fx-aurora"></div>`
  );
  add("Dot Pattern", "Background Effects", "Beginner", ["background","pattern","dots"],
    `.fx-dot-pattern{width:100%;height:80px;background-image:radial-gradient(#64748b 1px,transparent 1px);background-size:12px 12px;border-radius:10px}`,
    `<div class="fx-dot-pattern"></div>`
  );
  add("Mesh Gradient", "Background Effects", "Advanced", ["background","mesh","gradient"],
    `.fx-mesh{width:100%;height:80px;background-color:#1e1b4b;background-image:radial-gradient(at 40% 20%,#8b5cf6 0,transparent 50%),radial-gradient(at 80% 0%,#3b82f6 0,transparent 50%),radial-gradient(at 0% 50%,#ec4899 0,transparent 50%),radial-gradient(at 60% 80%,#10b981 0,transparent 50%);border-radius:10px}`,
    `<div class="fx-mesh"></div>`
  );
  add("Animated Stripes", "Background Effects", "Intermediate", ["background","stripes","animated"],
    `.fx-anim-stripes{width:100%;height:80px;background:repeating-linear-gradient(45deg,#3b82f6,#3b82f6 10px,#2563eb 10px,#2563eb 20px);background-size:28px 28px;animation:fxStripes 1s linear infinite;border-radius:10px}@keyframes fxStripes{to{background-position:28px 0}}`,
    `<div class="fx-anim-stripes"></div>`
  );
  add("Geometric Background Pattern", "Background Effects", "Intermediate", ["background","geometric","pattern"],
    `.fx-geo-pattern{width:100%;height:80px;background-color:#0f172a;background-image:linear-gradient(30deg,#1e293b 12%,transparent 12.5%,transparent 87%,#1e293b 87.5%,#1e293b),linear-gradient(150deg,#1e293b 12%,transparent 12.5%,transparent 87%,#1e293b 87.5%,#1e293b);background-size:40px 70px;border-radius:10px}`,
    `<div class="fx-geo-pattern"></div>`
  );
  add("Decorative Gradient Frame", "Background Effects", "Intermediate", ["background","frame","gradient"],
    `.fx-grad-frame{width:100%;height:80px;background:linear-gradient(#0f172a,#0f172a) padding-box,linear-gradient(135deg,#f59e0b,#ef4444,#8b5cf6) border-box;border:4px solid transparent;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#e2e8f0;font-size:.8rem;font-weight:600}`,
    `<div class="fx-grad-frame">Framed Content</div>`
  );
  add("Floating Particles", "Background Effects", "Advanced", ["background","particles","float"],
    `.fx-particles{width:100%;height:80px;background:#0f172a;border-radius:10px;position:relative;overflow:hidden}.fx-particles::before,.fx-particles::after{content:'';position:absolute;width:6px;height:6px;background:#10b981;border-radius:50%;top:20%;left:20%;animation:fxFloat 4s infinite}.fx-particles::after{width:4px;height:4px;background:#3b82f6;top:60%;left:70%;animation-delay:1s;animation-duration:3s}@keyframes fxFloat{0%,100%{transform:translate(0,0)}25%{transform:translate(10px,-15px)}50%{transform:translate(-5px,-25px)}75%{transform:translate(15px,-10px)}}`,
    `<div class="fx-particles"></div>`
  );
  add("Morphing Blob", "Background Effects", "Advanced", ["background","blob","morph"],
    `.fx-blob{width:80px;height:80px;background:linear-gradient(135deg,#ec4899,#8b5cf6);border-radius:60% 40% 30% 70%/60% 30% 70% 40%;animation:fxBlob 8s ease infinite}@keyframes fxBlob{0%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%}100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}}`,
    `<div class="fx-blob"></div>`
  );
  add("Wavy Section Divider", "Background Effects", "Intermediate", ["background","wavy","divider"],
    `.fx-wavy{width:100%;height:60px;background:linear-gradient(135deg,#10b981,#06b6d4);border-radius:10px;position:relative;overflow:hidden}.fx-wavy::after{content:'';position:absolute;bottom:0;left:0;width:200%;height:30px;background:#0c0f14;border-radius:50% 50% 0 0;transform:translateX(-25%)}`,
    `<div class="fx-wavy"></div>`
  );

  // ═══════════════════════════════════════════
  // BORDER EFFECTS (82-91)
  // ═══════════════════════════════════════════
  add("Animated Border", "Border Effects", "Intermediate", ["border","animated"],
    `.fx-anim-border{width:60px;height:60px;border:3px solid transparent;border-radius:10px;background:conic-gradient(from 0deg,#10b981,#3b82f6,#8b5cf6,#ef4444,#10b981) border-box;-webkit-mask:linear-gradient(#fff 0 0) padding-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:fxAnimBord 3s linear infinite}@keyframes fxAnimBord{to{transform:rotate(360deg)}}`,
    `<div class="fx-anim-border"></div>`
  );
  add("Marching Ants", "Border Effects", "Intermediate", ["border","dash","animated"],
    `.fx-marching-ants{width:80px;height:50px;border:2px dashed #f59e0b;border-radius:8px;animation:fxMarch .5s linear infinite}@keyframes fxMarch{to{stroke-dashoffset:-16}}`,
    `<div class="fx-marching-ants"></div>`
  );
  add("Rainbow Border", "Border Effects", "Intermediate", ["border","rainbow"],
    `.fx-rainbow-border{position:relative;width:80px;height:50px;background:#151921;border-radius:10px;z-index:1}.fx-rainbow-border::before{content:'';position:absolute;top:-3px;left:-3px;right:-3px;bottom:-3px;background:linear-gradient(90deg,#ef4444,#f59e0b,#10b981,#3b82f6,#8b5cf6,#ec4899,#ef4444);background-size:300% 100%;z-index:-2;border-radius:13px;animation:fxRainbow 3s linear infinite}.fx-rainbow-border::after{content:'';position:absolute;inset:0;background:#151921;z-index:-1;border-radius:10px}@keyframes fxRainbow{to{background-position:300% 0}}`,
    `<div class="fx-rainbow-border" style="display:flex;align-items:center;justify-content:center;color:#e2e8f0;font-size:.7rem;font-weight:600">Rainbow</div>`
  );
  add("Glow Border", "Border Effects", "Beginner", ["border","glow"],
    `.fx-glow-border{width:80px;height:50px;border:2px solid #10b981;border-radius:10px;box-shadow:0 0 5px #10b98166,inset 0 0 5px #10b98133;animation:fxGlowBord 2s ease infinite alternate;display:flex;align-items:center;justify-content:center;color:#10b981;font-size:.7rem;font-weight:600}@keyframes fxGlowBord{from{box-shadow:0 0 5px #10b98166,inset 0 0 5px #10b98133}to{box-shadow:0 0 15px #10b981aa,inset 0 0 10px #10b98155}}`,
    `<div class="fx-glow-border">Glow</div>`
  );
  add("Glowing Border", "Border Effects", "Intermediate", ["border","glowing","pulse"],
    `.fx-glowing-border{width:80px;height:50px;border:2px solid #8b5cf6;border-radius:10px;animation:fxGlowingB 2s ease infinite;display:flex;align-items:center;justify-content:center;color:#c4b5fd;font-size:.7rem;font-weight:600}@keyframes fxGlowingB{0%,100%{box-shadow:0 0 5px #8b5cf644,0 0 10px #8b5cf622}50%{box-shadow:0 0 20px #8b5cf688,0 0 40px #8b5cf644}}`,
    `<div class="fx-glowing-border">Glowing</div>`
  );
  add("Animated Gradient Border", "Border Effects", "Advanced", ["border","gradient","animated"],
    `.fx-anim-grad-border{position:relative;width:80px;height:50px;background:#151921;border-radius:10px;z-index:1;display:flex;align-items:center;justify-content:center;color:#e2e8f0;font-size:.65rem;font-weight:600}.fx-anim-grad-border::before{content:'';position:absolute;top:-3px;left:-3px;right:-3px;bottom:-3px;background:conic-gradient(from var(--angle,0deg),#10b981,#3b82f6,#8b5cf6,#ef4444,#10b981);z-index:-2;border-radius:13px;animation:fxAGB 3s linear infinite}@keyframes fxAGB{to{--angle:360deg}}@property --angle{syntax:'<angle>';initial-value:0deg;inherits:false}.fx-anim-grad-border::after{content:'';position:absolute;inset:0;background:#151921;z-index:-1;border-radius:10px}`,
    `<div class="fx-anim-grad-border">Gradient</div>`
  );
  add("Rotating Color Border", "Border Effects", "Advanced", ["border","rotating","color"],
    `.fx-rot-color-border{position:relative;width:80px;height:50px;background:#0f172a;border-radius:50%;z-index:1;display:flex;align-items:center;justify-content:center;font-size:.6rem;font-weight:600;color:#e2e8f0}.fx-rot-color-border::before{content:'';position:absolute;top:-4px;left:-4px;right:-4px;bottom:-4px;background:conic-gradient(#ef4444,#f59e0b,#10b981,#3b82f6,#8b5cf6,#ef4444);z-index:-2;border-radius:50%;animation:fxRotCB 2s linear infinite}.fx-rot-color-border::after{content:'';position:absolute;inset:0;background:#0f172a;z-index:-1;border-radius:50%}@keyframes fxRotCB{to{transform:rotate(360deg)}}`,
    `<div class="fx-rot-color-border">Spin</div>`
  );
  add("Glowing Dot Divider", "Border Effects", "Beginner", ["border","divider","dot"],
    `.fx-glow-dot{display:flex;gap:8px;align-items:center}.fx-glow-dot span{width:8px;height:8px;background:#06b6d4;border-radius:50%;animation:fxGlowDot 1.5s ease infinite;box-shadow:0 0 6px #06b6d4}.fx-glow-dot span:nth-child(2){animation-delay:.3s}.fx-glow-dot span:nth-child(3){animation-delay:.6s}@keyframes fxGlowDot{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}`,
    `<div class="fx-glow-dot"><span></span><span></span><span></span></div>`
  );
  add("Corner Ornament", "Border Effects", "Intermediate", ["border","corner","ornament"],
    `.fx-corner{width:80px;height:50px;position:relative;display:flex;align-items:center;justify-content:center;color:#e2e8f0;font-size:.7rem}.fx-corner::before,.fx-corner::after{content:'';position:absolute;width:15px;height:15px;border:2px solid #f59e0b}.fx-corner::before{top:0;left:0;border-right:none;border-bottom:none}.fx-corner::after{bottom:0;right:0;border-left:none;border-top:none}`,
    `<div class="fx-corner">Ornament</div>`
  );

  // ═══════════════════════════════════════════
  // SHADOW EFFECTS (92-95)
  // ═══════════════════════════════════════════
  add("Layered Shadow", "Shadow Effects", "Intermediate", ["shadow","layered"],
    `.fx-layered-shadow{width:60px;height:60px;background:#fff;border-radius:8px;box-shadow:1px 1px 0 #94a3b8,2px 2px 0 #94a3b8,3px 3px 0 #94a3b8,4px 4px 0 #94a3b8,5px 5px 0 #94a3b8,6px 6px 15px rgba(0,0,0,.2)}`,
    `<div class="fx-layered-shadow"></div>`
  );
  add("Color Shadow", "Shadow Effects", "Beginner", ["shadow","color"],
    `.fx-color-shadow{width:60px;height:60px;background:#8b5cf6;border-radius:10px;box-shadow:0 10px 30px -5px #8b5cf688}`,
    `<div class="fx-color-shadow"></div>`
  );
  add("Neon Shadow", "Shadow Effects", "Intermediate", ["shadow","neon"],
    `.fx-neon-shadow{width:60px;height:60px;background:#0f172a;border:2px solid #06b6d4;border-radius:8px;box-shadow:0 0 5px #06b6d4,0 0 15px #06b6d466,0 0 30px #06b6d433,0 0 45px #06b6d419}`,
    `<div class="fx-neon-shadow"></div>`
  );
  add("Dynamic Shadow", "Shadow Effects", "Intermediate", ["shadow","dynamic","hover"],
    `.fx-dynamic-shadow{width:60px;height:60px;background:#10b981;border-radius:10px;transition:box-shadow .3s,transform .3s}.fx-dynamic-shadow:hover{transform:translateY(-4px);box-shadow:0 14px 28px rgba(16,185,129,.4),0 10px 10px rgba(16,185,129,.2)}`,
    `<div class="fx-dynamic-shadow"></div>`
  );

  // ═══════════════════════════════════════════
  // INPUT EFFECTS (96-102)
  // ═══════════════════════════════════════════
  add("Floating Label", "Input Effects", "Intermediate", ["input","floating","label"],
    `.fx-float-label{position:relative}.fx-float-label input{border:2px solid #475569;background:transparent;padding:12px 10px 4px;outline:none;border-radius:8px;width:160px;color:#e2e8f0;font-size:.8rem;transition:border-color .3s}.fx-float-label label{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#64748b;font-size:.75rem;transition:all .2s;pointer-events:none}.fx-float-label input:focus{border-color:#10b981}.fx-float-label input:focus+label,.fx-float-label input:not(:placeholder-shown)+label{top:6px;transform:translateY(0);font-size:.55rem;color:#10b981}`,
    `<div class="fx-float-label"><input type="text" placeholder=" "><label>Email</label></div>`
  );
  add("Underline Input", "Input Effects", "Beginner", ["input","underline"],
    `.fx-underline-input{border:none;border-bottom:2px solid #475569;background:transparent;padding:8px 0;outline:none;width:160px;color:#e2e8f0;font-size:.85rem;transition:border-color .3s}.fx-underline-input:focus{border-bottom-color:#3b82f6}`,
    `<input type="text" class="fx-underline-input" placeholder="Underline...">`
  );
  add("Glow Input", "Input Effects", "Beginner", ["input","glow"],
    `.fx-glow-input{border:2px solid #475569;background:transparent;padding:8px 12px;outline:none;border-radius:8px;width:160px;color:#e2e8f0;font-size:.85rem;transition:border-color .3s,box-shadow .3s}.fx-glow-input:focus{border-color:#ec4899;box-shadow:0 0 0 3px #ec489944}`,
    `<input type="text" class="fx-glow-input" placeholder="Glow...">`
  );
  add("Shake Validation", "Input Effects", "Intermediate", ["input","shake","validation"],
    `.fx-shake-input{border:2px solid #ef4444;background:transparent;padding:8px 12px;outline:none;border-radius:8px;width:140px;color:#ef4444;font-size:.85rem;animation:fxShake .4s ease}@keyframes fxShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}`,
    `<input type="text" class="fx-shake-input" value="Invalid!">`
  );
  add("Floating Label Input", "Input Effects", "Intermediate", ["input","floating","label"],
    `.fx-fli-wrap{position:relative;width:160px}.fx-fli-wrap input{width:100%;border:2px solid #334155;background:#1e293b;padding:14px 10px 6px;outline:none;border-radius:8px;color:#e2e8f0;font-size:.8rem;transition:border-color .3s}.fx-fli-wrap label{position:absolute;left:10px;top:10px;color:#64748b;font-size:.75rem;transition:all .2s;pointer-events:none}.fx-fli-wrap input:focus{border-color:#f59e0b}.fx-fli-wrap input:focus+label{top:2px;font-size:.5rem;color:#f59e0b}`,
    `<div class="fx-fli-wrap"><input type="text" placeholder=" "><label>Username</label></div>`
  );
  add("Animated Search Bar", "Input Effects", "Intermediate", ["input","search","animated"],
    `.fx-search-bar{position:relative;width:40px;height:40px;background:#1e293b;border:2px solid #334155;border-radius:20px;transition:width .3s;overflow:hidden}.fx-search-bar:focus-within{width:180px;border-color:#3b82f6}.fx-search-bar input{width:100%;height:100%;border:none;background:transparent;padding:0 12px 0 36px;color:#e2e8f0;font-size:.8rem;outline:none}.fx-search-bar::before{content:'🔍';position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:.8rem}`,
    `<div class="fx-search-bar"><input type="text" placeholder="Search..."></div>`
  );
  add("Password Strength Meter", "Input Effects", "Advanced", ["input","password","strength"],
    `.fx-pw-meter{width:160px}.fx-pw-meter input{width:100%;border:2px solid #334155;background:#1e293b;padding:8px 10px;outline:none;border-radius:8px;color:#e2e8f0;font-size:.8rem}.fx-pw-meter .bar-wrap{height:4px;background:#334155;border-radius:2px;margin-top:4px;overflow:hidden}.fx-pw-meter .bar{height:100%;width:65%;background:linear-gradient(90deg,#ef4444,#f59e0b,#10b981);border-radius:2px;transition:width .3s}`,
    `<div class="fx-pw-meter"><input type="text" placeholder="Password" value="mypass123"><div class="bar-wrap"><div class="bar"></div></div></div>`
  );

  // ═══════════════════════════════════════════
  // TOGGLE EFFECTS (103-106)
  // ═══════════════════════════════════════════
  add("iOS Toggle Switch", "Toggle Effects", "Intermediate", ["toggle","ios","switch"],
    `.fx-ios-toggle{width:48px;height:28px;background:#475569;border-radius:14px;position:relative;cursor:pointer;transition:background .3s}.fx-ios-toggle::after{content:'';position:absolute;top:2px;left:2px;width:24px;height:24px;background:#fff;border-radius:50%;transition:transform .3s}.fx-ios-toggle.on{background:#10b981}.fx-ios-toggle.on::after{transform:translateX(20px)}`,
    `<div class="fx-ios-toggle on" onclick="this.classList.toggle('on')"></div>`,`document.querySelector('.fx-ios-toggle').addEventListener('click',function(){this.classList.toggle('on')})`
  );
  add("Morphing Checkbox", "Toggle Effects", "Advanced", ["toggle","morph","checkbox"],
    `.fx-morph-check{width:28px;height:28px;background:#1e293b;border:2px solid #475569;border-radius:6px;cursor:pointer;position:relative;transition:all .3s}.fx-morph-check.checked{background:#10b981;border-color:#10b981;border-radius:50%}.fx-morph-check.checked::after{content:'✓';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.8rem;font-weight:700}`,
    `<div class="fx-morph-check checked" onclick="this.classList.toggle('checked')"></div>`,`document.querySelector('.fx-morph-check').addEventListener('click',function(){this.classList.toggle('checked')})`
  );
  add("Day/Night Toggle", "Toggle Effects", "Advanced", ["toggle","day","night"],
    `.fx-dn-toggle{width:56px;height:28px;background:linear-gradient(135deg,#fbbf24,#f59e0b);border-radius:14px;position:relative;cursor:pointer;transition:background .5s;overflow:hidden}.fx-dn-toggle.night{background:linear-gradient(135deg,#1e1b4b,#312e81)}.fx-dn-toggle::after{content:'☀️';position:absolute;top:2px;left:2px;width:24px;height:24px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:.7rem;transition:transform .3s}.fx-dn-toggle.night::after{content:'🌙';transform:translateX(28px)}`,
    `<div class="fx-dn-toggle night" onclick="this.classList.toggle('night')"></div>`,`document.querySelector('.fx-dn-toggle').addEventListener('click',function(){this.classList.toggle('night')})`
  );
  add("Toggle Switch Modern", "Toggle Effects", "Intermediate", ["toggle","modern","switch"],
    `.fx-modern-toggle{width:44px;height:24px;background:linear-gradient(135deg,#ef4444,#ec4899);border-radius:12px;position:relative;cursor:pointer;transition:all .3s}.fx-modern-toggle::after{content:'';position:absolute;top:2px;left:22px;width:20px;height:20px;background:#fff;border-radius:50%;transition:left .3s;box-shadow:0 2px 4px rgba(0,0,0,.2)}.fx-modern-toggle.off{background:#475569}.fx-modern-toggle.off::after{left:2px}`,
    `<div class="fx-modern-toggle" onclick="this.classList.toggle('off')"></div>`,`document.querySelector('.fx-modern-toggle').addEventListener('click',function(){this.classList.toggle('off')})`
  );

  // ═══════════════════════════════════════════
  // TOOLTIP EFFECTS (107-109)
  // ═══════════════════════════════════════════
  add("Top Tooltip", "Tooltip Effects", "Beginner", ["tooltip","top"],
    `.fx-tip-top{position:relative;background:#3b82f6;color:#fff;padding:8px 16px;border-radius:6px;font-size:.75rem;font-weight:600;cursor:pointer}.fx-tip-top::after{content:'Tooltip on top!';position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:#1e293b;color:#e2e8f0;padding:4px 10px;border-radius:4px;font-size:.65rem;white-space:nowrap;opacity:0;transition:opacity .2s;pointer-events:none}.fx-tip-top:hover::after{opacity:1}`,
    `<div class="fx-tip-top">Hover me</div>`
  );
  add("Bottom Tooltip", "Tooltip Effects", "Beginner", ["tooltip","bottom"],
    `.fx-tip-bottom{position:relative;background:#8b5cf6;color:#fff;padding:8px 16px;border-radius:6px;font-size:.75rem;font-weight:600;cursor:pointer}.fx-tip-bottom::after{content:'Tooltip below!';position:absolute;top:calc(100% + 8px);left:50%;transform:translateX(-50%);background:#1e293b;color:#e2e8f0;padding:4px 10px;border-radius:4px;font-size:.65rem;white-space:nowrap;opacity:0;transition:opacity .2s;pointer-events:none}.fx-tip-bottom:hover::after{opacity:1}`,
    `<div class="fx-tip-bottom">Hover me</div>`
  );
  add("Left Tooltip", "Tooltip Effects", "Beginner", ["tooltip","left"],
    `.fx-tip-left{position:relative;background:#10b981;color:#fff;padding:8px 16px;border-radius:6px;font-size:.75rem;font-weight:600;cursor:pointer}.fx-tip-left::after{content:'Left tip!';position:absolute;right:calc(100% + 8px);top:50%;transform:translateY(-50%);background:#1e293b;color:#e2e8f0;padding:4px 10px;border-radius:4px;font-size:.65rem;white-space:nowrap;opacity:0;transition:opacity .2s;pointer-events:none}.fx-tip-left:hover::after{opacity:1}`,
    `<div class="fx-tip-left">Hover</div>`
  );

  // ═══════════════════════════════════════════
  // NAVIGATION & LAYOUT (110-128)
  // ═══════════════════════════════════════════
  add("Hamburger Menu Animation", "Navigation Effects", "Intermediate", ["nav","hamburger","menu"],
    `.fx-hamburger{width:30px;height:20px;position:relative;cursor:pointer}.fx-hamburger span{position:absolute;width:100%;height:3px;background:#e2e8f0;border-radius:2px;transition:all .3s}.fx-hamburger span:nth-child(1){top:0}.fx-hamburger span:nth-child(2){top:8px}.fx-hamburger span:nth-child(3){bottom:0}.fx-hamburger:hover span:nth-child(1){top:8px;transform:rotate(45deg)}.fx-hamburger:hover span:nth-child(2){opacity:0}.fx-hamburger:hover span:nth-child(3){bottom:8px;transform:rotate(-45deg)}`,
    `<div class="fx-hamburger"><span></span><span></span><span></span></div>`
  );
  add("Breadcrumb Trail", "Navigation Effects", "Beginner", ["nav","breadcrumb"],
    `.fx-breadcrumb{display:flex;align-items:center;gap:8px;font-size:.75rem}.fx-breadcrumb a{color:#3b82f6;text-decoration:none}.fx-breadcrumb span{color:#64748b}`,
    `<div class="fx-breadcrumb"><a href="#">Home</a><span>/</span><a href="#">Products</a><span>/</span><span style="color:#e2e8f0">Details</span></div>`
  );
  add("Animated Tab Bar", "Navigation Effects", "Intermediate", ["nav","tab","animated"],
    `.fx-tab-bar{display:flex;border-bottom:2px solid #334155;position:relative}.fx-tab-bar span{padding:8px 16px;font-size:.75rem;color:#64748b;cursor:pointer;transition:color .3s}.fx-tab-bar span.active{color:#10b981}.fx-tab-bar::after{content:'';position:absolute;bottom:-2px;left:0;width:30%;height:2px;background:#10b981;transition:left .3s}`,
    `<div class="fx-tab-bar"><span class="active">Tab 1</span><span>Tab 2</span><span>Tab 3</span></div>`
  );
  add("Sidebar Slide-In", "Navigation Effects", "Intermediate", ["nav","sidebar","slide"],
    `.fx-sidebar-wrap{width:120px;height:80px;background:#0f172a;border-radius:8px;position:relative;overflow:hidden}.fx-sidebar{position:absolute;top:0;left:0;width:40px;height:100%;background:#1e293b;transform:translateX(-100%);transition:transform .3s;display:flex;align-items:center;justify-content:center;color:#10b981;font-size:.7rem}.fx-sidebar-wrap:hover .fx-sidebar{transform:translateX(0)}`,
    `<div class="fx-sidebar-wrap"><div class="fx-sidebar">Nav</div></div>`
  );
  add("Sticky Header with Shadow", "Navigation Effects", "Intermediate", ["nav","sticky","shadow"],
    `.fx-sticky-head{width:120px;height:40px;background:#1e293b;border-radius:8px 8px 0 0;display:flex;align-items:center;padding:0 10px;transition:box-shadow .3s;font-size:.75rem;font-weight:700;color:#e2e8f0}.fx-sticky-head:hover{box-shadow:0 4px 12px rgba(0,0,0,.5)}`,
    `<div class="fx-sticky-head">Header</div><div style="width:120px;height:40px;background:#0f172a;border-radius:0 0 8px 8px"></div>`
  );
  add("Masonry Grid", "Layout Effects", "Intermediate", ["layout","masonry","grid"],
    `.fx-masonry{columns:2;column-gap:6px;width:120px}.fx-masonry div{break-inside:avoid;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:4px;margin-bottom:6px;color:#fff;display:flex;align-items:center;justify-content:center;font-size:.6rem;font-weight:700}`,
    `<div class="fx-masonry"><div style="height:30px">1</div><div style="height:50px">2</div><div style="height:40px">3</div><div style="height:60px">4</div></div>`
  );
  add("Holy Grail Layout", "Layout Effects", "Intermediate", ["layout","holygrail"],
    `.fx-holy-grail{display:grid;grid-template-areas:"hd hd hd" "sd mn mn" "ft ft ft";grid-template-columns:30px 1fr 1fr;grid-template-rows:20px 1fr 20px;width:120px;height:80px;gap:2px;font-size:.5rem;color:#fff;font-weight:600}.fx-hg-hd{grid-area:hd;background:#3b82f6;display:flex;align-items:center;justify-content:center}.fx-hg-sd{grid-area:sd;background:#8b5cf6;display:flex;align-items:center;justify-content:center}.fx-hg-mn{grid-area:mn;background:#1e293b;display:flex;align-items:center;justify-content:center}.fx-hg-ft{grid-area:ft;background:#3b82f6;display:flex;align-items:center;justify-content:center}`,
    `<div class="fx-holy-grail"><div class="fx-hg-hd">H</div><div class="fx-hg-sd">S</div><div class="fx-hg-mn">M</div><div class="fx-hg-ft">F</div></div>`
  );
  add("Centered Overlay", "Layout Effects", "Intermediate", ["layout","overlay","center"],
    `.fx-overlay-wrap{width:120px;height:80px;background:#1e293b;border-radius:8px;position:relative}.fx-overlay-box{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.7);opacity:0;transition:opacity .3s;border-radius:8px;color:#fff;font-size:.7rem;font-weight:700}.fx-overlay-wrap:hover .fx-overlay-box{opacity:1}`,
    `<div class="fx-overlay-wrap"><div class="fx-overlay-box">Overlay</div></div>`
  );
  add("Responsive Sidebar", "Layout Effects", "Intermediate", ["layout","sidebar","responsive"],
    `.fx-resp-side{display:flex;width:120px;height:80px;border-radius:8px;overflow:hidden}.fx-resp-side .side{width:30px;background:#1e293b;transition:width .3s}.fx-resp-side:hover .side{width:50px}.fx-resp-side .main{flex:1;background:#334155;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.6rem}`,
    `<div class="fx-resp-side"><div class="side"></div><div class="main">Main</div></div>`
  );
  add("Equal Height Columns", "Layout Effects", "Beginner", ["layout","columns","equal"],
    `.fx-eq-cols{display:flex;gap:4px;width:120px;height:80px}.fx-eq-cols div{flex:1;background:linear-gradient(180deg,#10b981,#06b6d4);border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.7rem;font-weight:700}`,
    `<div class="fx-eq-cols"><div>A</div><div>B</div><div>C</div></div>`
  );
  add("Container-Based Grid", "Layout Effects", "Beginner", ["layout","grid","container"],
    `.fx-container-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(30px,1fr));gap:4px;width:120px}.fx-container-grid div{height:30px;background:#8b5cf6;border-radius:4px}`,
    `<div class="fx-container-grid"><div></div><div></div><div></div><div></div><div></div><div></div></div>`
  );
  add("Adaptive Sidebar", "Layout Effects", "Intermediate", ["layout","adaptive","sidebar"],
    `.fx-adapt-side{display:flex;width:120px;height:80px;border-radius:8px;overflow:hidden}.fx-adapt-side .side{width:60px;background:#1e293b;transition:width .3s}.fx-adapt-side:hover .side{width:30px}.fx-adapt-side .main{flex:1;background:#0f172a;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.6rem}`,
    `<div class="fx-adapt-side"><div class="side"></div><div class="main">Main</div></div>`
  );
  add("Container Font Scale", "Layout Effects", "Beginner", ["layout","font","scale"],
    `.fx-font-scale{width:120px;height:60px;background:#1e293b;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#e2e8f0;font-size:.8rem;font-weight:700;transition:font-size .3s}.fx-font-scale:hover{font-size:1.2rem}`,
    `<div class="fx-font-scale">Scale</div>`
  );
  add("Container Theme", "Layout Effects", "Intermediate", ["layout","theme","dark"],
    `.fx-container-theme{width:120px;height:60px;background:#f1f5f9;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#0f172a;font-size:.8rem;font-weight:700;transition:all .3s;cursor:pointer}.fx-container-theme:hover{background:#0f172a;color:#f1f5f9}`,
    `<div class="fx-container-theme">Hover Theme</div>`
  );
  add("Masonry Column Layout", "Layout Effects", "Intermediate", ["layout","masonry","column"],
    `.fx-masonry-col{column-count:3;column-gap:4px;width:120px}.fx-masonry-col div{break-inside:avoid;margin-bottom:4px;background:#3b82f6;border-radius:3px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.5rem;font-weight:700}`,
    `<div class="fx-masonry-col"><div style="height:20px">A</div><div style="height:35px">B</div><div style="height:25px">C</div><div style="height:30px">D</div><div style="height:20px">E</div><div style="height:40px">F</div></div>`
  );
  add("Holy Grail CSS Grid", "Layout Effects", "Advanced", ["layout","holygrail","grid"],
    `.fx-hg-grid{display:grid;grid-template-columns:1fr 3fr 1fr;grid-template-rows:auto 1fr auto;gap:2px;width:120px;height:80px;font-size:.5rem;color:#fff;font-weight:600}.fx-hg-grid div{display:flex;align-items:center;justify-content:center}.fx-hg-grid .hd{grid-column:1/-1;background:#3b82f6;height:15px}.fx-hg-grid .ft{grid-column:1/-1;background:#3b82f6;height:15px}.fx-hg-grid .sd1{background:#8b5cf6}.fx-hg-grid .mn{background:#1e293b}.fx-hg-grid .sd2{background:#8b5cf6}`,
    `<div class="fx-hg-grid"><div class="hd">H</div><div class="sd1">S</div><div class="mn">M</div><div class="sd2">S</div><div class="ft">F</div></div>`
  );
  add("Responsive Grid Switch", "Layout Effects", "Intermediate", ["layout","grid","responsive"],
    `.fx-grid-switch{display:grid;grid-template-columns:1fr;gap:4px;width:80px;transition:all .3s}.fx-grid-switch:hover{grid-template-columns:1fr 1fr}.fx-grid-switch div{height:20px;background:#10b981;border-radius:3px}`,
    `<div class="fx-grid-switch"><div></div><div></div><div></div><div></div></div>`
  );

  // ═══════════════════════════════════════════
  // PROGRESS & TIMELINE (129-140)
  // ═══════════════════════════════════════════
  add("Animated Progress Bar", "Progress Effects", "Beginner", ["progress","bar","animated"],
    `.fx-anim-progress{width:120px;height:8px;background:#334155;border-radius:4px;overflow:hidden}.fx-anim-progress::after{content:'';display:block;height:100%;width:70%;background:linear-gradient(90deg,#10b981,#3b82f6);border-radius:4px;animation:fxProgress 2s infinite}@keyframes fxProgress{0%{width:0}50%{width:100%}100%{width:0}}`,
    `<div class="fx-anim-progress"></div>`
  );
  add("Circular Progress", "Progress Effects", "Intermediate", ["progress","circular"],
    `.fx-circ-progress{width:50px;height:50px;border-radius:50%;background:conic-gradient(#3b82f6 70%,#334155 0);display:flex;align-items:center;justify-content:center}.fx-circ-progress::after{content:'70%';width:38px;height:38px;background:#0f172a;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#3b82f6;font-size:.7rem;font-weight:700}`,
    `<div class="fx-circ-progress"></div>`
  );
  add("Striped Progress Bar", "Progress Effects", "Beginner", ["progress","striped"],
    `.fx-striped-progress{width:120px;height:10px;background:#334155;border-radius:5px;overflow:hidden;position:relative}.fx-striped-progress::after{content:'';position:absolute;inset:0;width:70%;background:repeating-linear-gradient(45deg,#8b5cf6,#8b5cf6 5px,#7c3aed 5px,#7c3aed 10px);border-radius:5px}`,
    `<div class="fx-striped-progress"></div>`
  );
  add("Gradient Glow Progress", "Progress Effects", "Intermediate", ["progress","gradient","glow"],
    `.fx-glow-progress{width:120px;height:10px;background:#334155;border-radius:5px;overflow:hidden;position:relative}.fx-glow-progress::after{content:'';position:absolute;inset:0;width:60%;background:linear-gradient(90deg,#f59e0b,#ef4444);border-radius:5px;box-shadow:0 0 10px #ef444488}`,
    `<div class="fx-glow-progress"></div>`
  );
  add("Vertical Timeline", "Timeline Effects", "Intermediate", ["timeline","vertical"],
    `.fx-timeline{position:relative;padding-left:15px;border-left:2px solid #334155}.fx-timeline div{position:relative;padding-bottom:10px;font-size:.7rem;color:#e2e8f0}.fx-timeline div::before{content:'';position:absolute;left:-19px;top:2px;width:8px;height:8px;background:#10b981;border-radius:50%}`,
    `<div class="fx-timeline"><div>Step 1</div><div>Step 2</div><div>Step 3</div></div>`
  );
  add("Step Progress", "Timeline Effects", "Intermediate", ["timeline","step","progress"],
    `.fx-step-prog{display:flex;align-items:center;gap:4px}.fx-step-prog span{width:20px;height:20px;border-radius:50%;background:#334155;display:flex;align-items:center;justify-content:center;font-size:.6rem;color:#fff;font-weight:700}.fx-step-prog span.done{background:#10b981}.fx-step-prog span.active{background:#3b82f6;box-shadow:0 0 0 3px #3b82f644}`,
    `<div class="fx-step-prog"><span class="done">1</span><span class="done">2</span><span class="active">3</span><span>4</span></div>`
  );
  add("Milestone Bar", "Timeline Effects", "Intermediate", ["timeline","milestone"],
    `.fx-milestone{width:120px;height:6px;background:#334155;border-radius:3px;position:relative;margin-top:10px}.fx-milestone::after{content:'🎯';position:absolute;top:-8px;left:65%;transform:translateX(-50%);font-size:.8rem}`,
    `<div class="fx-milestone"></div>`
  );
  add("Process Flow", "Timeline Effects", "Intermediate", ["timeline","process","flow"],
    `.fx-process{display:flex;align-items:center;gap:4px;font-size:.6rem;font-weight:600}.fx-process div{padding:4px 8px;background:#1e293b;border:1px solid #334155;border-radius:4px;color:#e2e8f0}.fx-process div.active{background:#3b82f6;border-color:#3b82f6;color:#fff}.fx-process span{color:#64748b}`,
    `<div class="fx-process"><div class="active">A</div><span>→</span><div>B</div><span>→</span><div>C</div></div>`
  );
  add("Countdown Timer", "Timeline Effects", "Advanced", ["timeline","countdown","timer"],
    `.fx-countdown{display:flex;gap:8px}.fx-cd-box{width:30px;height:30px;background:#1e293b;border:1px solid #334155;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#e2e8f0;font-size:.8rem;font-weight:700}`,
    `<div class="fx-countdown"><div class="fx-cd-box">0</div><div class="fx-cd-box">5</div><span style="color:#64748b;font-weight:700">:</span><div class="fx-cd-box">3</div><div class="fx-cd-box">2</div></div>`
  );
  add("Animated Counter", "Timeline Effects", "Intermediate", ["timeline","counter","animated"],
    `.fx-anim-counter{font-size:1.8rem;font-weight:800;color:#3b82f6;animation:fxCounter 2s infinite alternate}@keyframes fxCounter{0%{content:'0';opacity:.5}50%{opacity:1}100%{content:'100'}}`,
    `<div class="fx-anim-counter">1,482</div>`
  );
  add("CSS-Only Accordion", "Accordion Effects", "Advanced", ["accordion","css-only"],
    `.fx-accordion details{width:160px;background:#1e293b;border:1px solid #334155;border-radius:6px;overflow:hidden;margin-bottom:4px}.fx-accordion summary{padding:6px 10px;font-size:.75rem;font-weight:600;color:#e2e8f0;cursor:pointer;list-style:none}.fx-accordion summary::-webkit-details-marker{display:none}.fx-accordion p{padding:0 10px 6px;font-size:.7rem;color:#94a3b8}`,
    `<div class="fx-accordion"><details open><summary>Section 1</summary><p>Content for section 1</p></details><details><summary>Section 2</summary><p>Content for section 2</p></details></div>`
  );
  add("Tab Accordion", "Accordion Effects", "Intermediate", ["accordion","tab"],
    `.fx-tab-acc{display:flex;flex-direction:column;width:160px;gap:2px}.fx-tab-acc label{padding:6px 10px;background:#1e293b;border-radius:4px;font-size:.7rem;font-weight:600;color:#94a3b8;cursor:pointer;transition:all .2s}.fx-tab-acc label:hover{background:#334155;color:#e2e8f0}`,
    `<div class="fx-tab-acc"><label>Tab 1</label><label>Tab 2</label><label>Tab 3</label></div>`
  );

  // ═══════════════════════════════════════════
  // BADGES & AVATARS (141-150)
  // ═══════════════════════════════════════════
  add("Pulse Notification Badge", "Badge Effects", "Beginner", ["badge","pulse","notification"],
    `.fx-pulse-badge{position:relative;width:40px;height:40px;background:#1e293b;border-radius:8px}.fx-pulse-badge::after{content:'3';position:absolute;top:-4px;right:-4px;width:16px;height:16px;background:#ef4444;border-radius:50%;color:#fff;font-size:.6rem;font-weight:700;display:flex;align-items:center;justify-content:center;animation:fxBadgePulse 1.5s infinite}@keyframes fxBadgePulse{0%{box-shadow:0 0 0 0 #ef444488}70%{box-shadow:0 0 0 6px #ef444400}100%{box-shadow:0 0 0 0 #ef444400}}`,
    `<div class="fx-pulse-badge"></div>`
  );
  add("Toast Notification", "Badge Effects", "Intermediate", ["badge","toast","notification"],
    `.fx-toast{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#1e293b;border:1px solid #334155;border-radius:8px;font-size:.7rem;color:#e2e8f0;box-shadow:0 4px 12px rgba(0,0,0,.3)}.fx-toast .dot{width:8px;height:8px;background:#10b981;border-radius:50%}`,
    `<div class="fx-toast"><div class="dot"></div>Item added to cart</div>`
  );
  add("Ribbon Badge", "Badge Effects", "Intermediate", ["badge","ribbon"],
    `.fx-ribbon{position:relative;width:80px;height:60px;background:#1e293b;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#e2e8f0;font-size:.7rem}.fx-ribbon::before{content:'SALE';position:absolute;top:8px;right:-5px;background:#ef4444;color:#fff;font-size:.5rem;font-weight:700;padding:2px 8px 2px 6px;border-radius:2px}`,
    `<div class="fx-ribbon">Item</div>`
  );
  add("Animated Counter Badge", "Badge Effects", "Intermediate", ["badge","counter","animated"],
    `.fx-anim-counter-badge{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;background:#3b82f6;border-radius:50%;color:#fff;font-size:.8rem;font-weight:800;animation:fxACBounce .5s ease}@keyframes fxACBounce{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}}`,
    `<div class="fx-anim-counter-badge">5</div>`
  );
  add("Tag Chip", "Badge Effects", "Beginner", ["badge","tag","chip"],
    `.fx-tag-chip{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:#1e293b;border:1px solid #334155;border-radius:20px;font-size:.7rem;color:#e2e8f0;cursor:pointer;transition:all .2s}.fx-tag-chip:hover{border-color:#10b981;color:#10b981}`,
    `<div class="fx-tag-chip">✕ Tag</div>`
  );
  add("Price Strikethrough", "Badge Effects", "Beginner", ["badge","price","strikethrough"],
    `.fx-price-strike{display:flex;gap:8px;align-items:center}.fx-price-strike .old{font-size:.9rem;color:#64748b;text-decoration:line-through}.fx-price-strike .new{font-size:1.2rem;font-weight:800;color:#10b981}`,
    `<div class="fx-price-strike"><span class="old">$49</span><span class="new">$29</span></div>`
  );
  add("Avatar Group Overlap", "Avatar Effects", "Intermediate", ["avatar","group","overlap"],
    `.fx-avatar-group{display:flex}.fx-avatar-group div{width:30px;height:30px;border-radius:50%;border:2px solid #0f172a;margin-left:-8px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:.6rem;color:#fff;font-weight:700}.fx-avatar-group div:first-child{margin-left:0}`,
    `<div class="fx-avatar-group"><div>A</div><div>B</div><div>C</div><div>+2</div></div>`
  );
  add("Animated Avatar Ring", "Avatar Effects", "Intermediate", ["avatar","ring","animated"],
    `.fx-avatar-ring{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#f59e0b);padding:3px;animation:fxRingPulse 2s infinite}.fx-avatar-ring::after{content:'';display:block;width:100%;height:100%;background:#0f172a;border-radius:50%}@keyframes fxRingPulse{0%,100%{box-shadow:0 0 0 0 #ec489966}50%{box-shadow:0 0 0 6px #ec489900}}`,
    `<div class="fx-avatar-ring"></div>`
  );
  add("Status Avatar", "Avatar Effects", "Beginner", ["avatar","status"],
    `.fx-status-av{position:relative;width:36px;height:36px;background:#334155;border-radius:50%}.fx-status-av::after{content:'';position:absolute;bottom:0;right:0;width:10px;height:10px;background:#10b981;border:2px solid #0f172a;border-radius:50%}`,
    `<div class="fx-status-av"></div>`
  );
  add("Avatar Hover Card", "Avatar Effects", "Intermediate", ["avatar","hover","card"],
    `.fx-av-hover{position:relative;width:40px;height:40px;background:linear-gradient(135deg,#06b6d4,#3b82f6);border-radius:50%;cursor:pointer;transition:border-radius .3s}.fx-av-hover:hover{border-radius:8px}`,
    `<div class="fx-av-hover"></div>`
  );

  // ═══════════════════════════════════════════
  // CHARTS & SLIDERS (151-159)
  // ═══════════════════════════════════════════
  add("Animated Bar Chart", "Chart Effects", "Intermediate", ["chart","bar","animated"],
    `.fx-bar-chart{display:flex;align-items:flex-end;gap:4px;height:60px}.fx-bar-chart div{width:12px;background:linear-gradient(180deg,#3b82f6,#1e3a8a);border-radius:2px 2px 0 0;animation:fxBarGrow 1s ease forwards;transform-origin:bottom}@keyframes fxBarGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}}.fx-bar-chart div:nth-child(2){animation-delay:.1s}.fx-bar-chart div:nth-child(3){animation-delay:.2s}.fx-bar-chart div:nth-child(4){animation-delay:.3s}`,
    `<div class="fx-bar-chart"><div style="height:60%"></div><div style="height:80%"></div><div style="height:40%"></div><div style="height:90%"></div></div>`
  );
  add("Donut Chart", "Chart Effects", "Intermediate", ["chart","donut"],
    `.fx-donut{width:60px;height:60px;border-radius:50%;background:conic-gradient(#10b981 0% 40%,#3b82f6 40% 70%,#8b5cf6 70% 100%);display:flex;align-items:center;justify-content:center}.fx-donut::after{content:'';width:40px;height:40px;background:#0f172a;border-radius:50%}`,
    `<div class="fx-donut"></div>`
  );
  add("Sparkline", "Chart Effects", "Advanced", ["chart","sparkline"],
    `.fx-sparkline{width:100px;height:30px;background:linear-gradient(transparent 50%,#10b98111 50%);position:relative}.fx-sparkline::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,transparent 40%,#10b981 40%,#10b981 45%,transparent 45%,transparent 60%,#10b981 60%,#10b981 80%,transparent 80%);clip-path:polygon(0 80%,20% 20%,40% 50%,60% 10%,80% 60%,100% 30%,100% 100%,0 100%)}`,
    `<div class="fx-sparkline"></div>`
  );
  add("Stat Counter", "Chart Effects", "Beginner", ["chart","stat","counter"],
    `.fx-stat{background:#1e293b;border-radius:8px;padding:8px 12px;text-align:center}.fx-stat .num{font-size:1.2rem;font-weight:800;color:#10b981}.fx-stat .label{font-size:.6rem;color:#64748b}`,
    `<div class="fx-stat"><div class="num">1,482</div><div class="label">Users</div></div>`
  );
  add("Comparison Bars", "Chart Effects", "Intermediate", ["chart","comparison","bars"],
    `.fx-comp-bars{display:flex;flex-direction:column;gap:6px;width:120px}.fx-comp-bar{display:flex;align-items:center;gap:6px}.fx-comp-bar .val{font-size:.6rem;width:20px;color:#94a3b8}.fx-comp-bar .track{flex:1;height:6px;background:#334155;border-radius:3px;overflow:hidden}.fx-comp-bar .fill{height:100%;border-radius:3px}.fx-comp-bar:nth-child(1) .fill{width:80%;background:#3b82f6}.fx-comp-bar:nth-child(2) .fill{width:60%;background:#8b5cf6}.fx-comp-bar:nth-child(3) .fill{width:40%;background:#ec4899}`,
    `<div class="fx-comp-bars"><div class="fx-comp-bar"><span class="val">80%</span><div class="track"><div class="fill"></div></div></div><div class="fx-comp-bar"><span class="val">60%</span><div class="track"><div class="fill"></div></div></div><div class="fx-comp-bar"><span class="val">40%</span><div class="track"><div class="fill"></div></div></div></div>`
  );
  add("Custom Range Slider", "Slider Effects", "Intermediate", ["slider","range","custom"],
    `.fx-range-slider{-webkit-appearance:none;width:120px;height:6px;background:#334155;border-radius:3px;outline:none}.fx-range-slider::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;background:#3b82f6;border-radius:50%;cursor:pointer;box-shadow:0 0 0 3px #3b82f633}`,
    `<input type="range" class="fx-range-slider" min="0" max="100" value="70">`
  );
  add("Image Comparison Slider", "Slider Effects", "Advanced", ["slider","image","comparison"],
    `.fx-img-comp{width:120px;height:60px;position:relative;border-radius:8px;overflow:hidden;background:linear-gradient(135deg,#1e293b,#334155)}.fx-img-comp::before{content:'Before';position:absolute;top:50%;left:20%;transform:translate(-50%,-50%);color:#94a3b8;font-size:.6rem;font-weight:700;z-index:1}.fx-img-comp::after{content:'After';position:absolute;top:50%;left:70%;transform:translate(-50%,-50%);color:#fff;font-size:.6rem;font-weight:700;z-index:1}.fx-img-comp .clip{position:absolute;inset:0;background:linear-gradient(135deg,#3b82f6,#8b5cf6);clip-path:inset(0 0 0 50%)}`,
    `<div class="fx-img-comp"><div class="clip"></div></div>`
  );
  add("Carousel Indicators", "Slider Effects", "Beginner", ["slider","carousel","indicators"],
    `.fx-carousel-ind{display:flex;gap:6px;align-items:center}.fx-carousel-ind span{width:8px;height:8px;border-radius:50%;background:#475569;transition:all .3s;cursor:pointer}.fx-carousel-ind span.active{width:24px;border-radius:4px;background:#3b82f6}`,
    `<div class="fx-carousel-ind"><span class="active"></span><span></span><span></span><span></span></div>`
  );
  add("Volume Slider", "Slider Effects", "Intermediate", ["slider","volume"],
    `.fx-volume{display:flex;align-items:center;gap:8px;font-size:.8rem;color:#e2e8f0}.fx-volume input[type=range]{-webkit-appearance:none;width:80px;height:4px;background:#334155;border-radius:2px;outline:none}.fx-volume input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;background:#10b981;border-radius:50%;cursor:pointer}`,
    `<div class="fx-volume">🔊 <input type="range" min="0" max="100" value="60"></div>`
  );
  add("Rating Stars", "Slider Effects", "Intermediate", ["slider","rating","stars"],
    `.fx-rating{display:flex;gap:2px;cursor:pointer;font-size:1.2rem}.fx-rating span{color:#475569;transition:color .2s}.fx-rating span.lit{color:#f59e0b}`,
    `<div class="fx-rating"><span class="lit">★</span><span class="lit">★</span><span class="lit">★</span><span class="lit">★</span><span>★</span></div>`
  );

  // ═══════════════════════════════════════════
  // SCROLL & SECTION EFFECTS (161-176)
  // ═══════════════════════════════════════════
  add("Scroll Fade In", "Scroll Effects", "Beginner", ["scroll","fade","in"],
    `.fx-scroll-fade{opacity:0;transform:translateY(20px);animation:fxScrollFade 1s forwards;animation-delay:.2s;background:#1e293b;padding:1rem;border-radius:8px;color:#e2e8f0;font-size:.8rem;text-align:center}@keyframes fxScrollFade{to{opacity:1;transform:translateY(0)}}`,
    `<div class="fx-scroll-fade">Fade In</div>`
  );
  add("Scroll Slide Up", "Scroll Effects", "Beginner", ["scroll","slide","up"],
    `.fx-scroll-slide{transform:translateY(40px);opacity:0;animation:fxScrollSlide .8s forwards;background:#3b82f6;padding:1rem;border-radius:8px;color:#fff;font-size:.8rem;text-align:center}@keyframes fxScrollSlide{to{transform:translateY(0);opacity:1}}`,
    `<div class="fx-scroll-slide">Slide Up</div>`
  );
  add("Scroll Scale In", "Scroll Effects", "Intermediate", ["scroll","scale","in"],
    `.fx-scroll-scale{transform:scale(0.8);opacity:0;animation:fxScrollScale .6s forwards;background:#8b5cf6;padding:1rem;border-radius:8px;color:#fff;font-size:.8rem;text-align:center}@keyframes fxScrollScale{to{transform:scale(1);opacity:1}}`,
    `<div class="fx-scroll-scale">Scale In</div>`
  );
  add("Scroll Rotate In", "Scroll Effects", "Intermediate", ["scroll","rotate","in"],
    `.fx-scroll-rotate{transform:rotate(-10deg) translateY(20px);opacity:0;animation:fxScrollRotate .8s forwards;background:#ec4899;padding:1rem;border-radius:8px;color:#fff;font-size:.8rem;text-align:center}@keyframes fxScrollRotate{to{transform:rotate(0) translateY(0);opacity:1}}`,
    `<div class="fx-scroll-rotate">Rotate In</div>`
  );
  add("Scroll Stagger Grid", "Scroll Effects", "Advanced", ["scroll","stagger","grid"],
    `.fx-stagger-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}.fx-stagger-grid div{background:#10b981;border-radius:4px;height:30px;transform:translateY(20px);opacity:0;animation:fxStagger .5s forwards;font-size:.6rem;color:#fff;display:flex;align-items:center;justify-content:center}.fx-stagger-grid div:nth-child(1){animation-delay:.1s}.fx-stagger-grid div:nth-child(2){animation-delay:.2s}.fx-stagger-grid div:nth-child(3){animation-delay:.3s}.fx-stagger-grid div:nth-child(4){animation-delay:.4s}@keyframes fxStagger{to{transform:translateY(0);opacity:1}}`,
    `<div class="fx-stagger-grid"><div>1</div><div>2</div><div>3</div><div>4</div></div>`
  );
  add("Scroll Indicator Bar", "Scroll Effects", "Intermediate", ["scroll","indicator","bar"],
    `.fx-scroll-bar{width:100%;height:4px;background:#334155;border-radius:2px;overflow:hidden}.fx-scroll-bar::after{content:'';display:block;height:100%;width:60%;background:linear-gradient(90deg,#10b981,#06b6d4);border-radius:2px;animation:fxScrollBar 2s infinite alternate}@keyframes fxScrollBar{0%{width:20%}100%{width:100%}}`,
    `<div class="fx-scroll-bar"></div>`
  );
  add("Scroll Reveal Animation", "Scroll Effects", "Intermediate", ["scroll","reveal","animation"],
    `.fx-scroll-reveal{position:relative;overflow:hidden;padding:1rem;background:#1e293b;border-radius:8px;color:#e2e8f0;font-size:.8rem;text-align:center}.fx-scroll-reveal::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,#0f172a 30%,#0f172a 70%,transparent);animation:fxRevealWipe 2s infinite alternate}@keyframes fxRevealWipe{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}`,
    `<div class="fx-scroll-reveal">Reveal Text</div>`
  );
  add("Horizontal Scroll Gallery", "Scroll Effects", "Intermediate", ["scroll","horizontal","gallery"],
    `.fx-h-scroll{display:flex;gap:6px;overflow-x:auto;width:100%;padding-bottom:4px;scrollbar-width:none}.fx-h-scroll::-webkit-scrollbar{display:none}.fx-h-scroll div{min-width:40px;height:40px;background:#334155;border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:.6rem;color:#fff;font-weight:700}`,
    `<div class="fx-h-scroll"><div>A</div><div>B</div><div>C</div><div>D</div><div>E</div><div>F</div></div>`
  );
  add("Scroll Snap Carousel", "Scroll Effects", "Advanced", ["scroll","snap","carousel"],
    `.fx-snap-carousel{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:4px;width:100%;scrollbar-width:none}.fx-snap-carousel::-webkit-scrollbar{display:none}.fx-snap-carousel div{scroll-snap-align:start;min-width:80%;height:50px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.7rem;font-weight:700}`,
    `<div class="fx-snap-carousel"><div>Slide 1</div><div>Slide 2</div><div>Slide 3</div></div>`
  );
  add("Parallax Scroll Layers", "Scroll Effects", "Advanced", ["scroll","parallax","layers"],
    `.fx-parallax{position:relative;width:100%;height:80px;background:linear-gradient(180deg,#0f172a,#1e293b);border-radius:8px;overflow:hidden}.fx-parallax::before,.fx-parallax::after{content:'';position:absolute;border-radius:50%}.fx-parallax::before{width:40px;height:40px;background:#3b82f688;top:20%;left:20%;animation:fxPrlx 4s infinite alternate}.fx-parallax::after{width:25px;height:25px;background:#8b5cf688;top:50%;left:60%;animation:fxPrlx 6s infinite alternate-reverse}@keyframes fxPrlx{0%{transform:translateY(0)}100%{transform:translateY(-20px)}}`,
    `<div class="fx-parallax"></div>`
  );
  add("Scroll Progress Bar", "Scroll Effects", "Intermediate", ["scroll","progress"],
    `.fx-scroll-progress{width:100%;height:6px;background:#334155;border-radius:3px;overflow:hidden}.fx-scroll-progress::after{content:'';display:block;height:100%;width:40%;background:linear-gradient(90deg,#f59e0b,#ef4444);border-radius:3px;animation:fxScrollProg 3s infinite}@keyframes fxScrollProg{0%{width:0;margin-left:0}50%{width:100%;margin-left:0}100%{width:0;margin-left:100%}}`,
    `<div class="fx-scroll-progress"></div>`
  );
  add("Centered Hero Section", "Section Effects", "Intermediate", ["section","hero","centered"],
    `.fx-hero{width:100%;padding:1.5rem;background:linear-gradient(135deg,#1e293b,#0f172a);border-radius:12px;text-align:center;border:1px solid #334155}.fx-hero h4{font-size:1rem;font-weight:800;background:linear-gradient(90deg,#10b981,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:.25rem}.fx-hero p{font-size:.6rem;color:#94a3b8}`,
    `<div class="fx-hero"><h4>Welcome Back</h4><p>Start building amazing things today.</p></div>`
  );
  add("Page Curtain", "Section Effects", "Advanced", ["section","curtain","reveal"],
    `.fx-curtain{position:relative;width:100%;height:80px;overflow:hidden}.fx-curtain .content{position:absolute;inset:0;background:#1e293b;display:flex;align-items:center;justify-content:center;color:#e2e8f0;font-size:.8rem;font-weight:700;z-index:1}.fx-curtain .curtain-left,.fx-curtain .curtain-right{position:absolute;top:0;height:100%;width:50%;background:#3b82f6;z-index:2;transition:transform .6s}.fx-curtain .curtain-left{left:0;transform-origin:left}.fx-curtain .curtain-right{right:0;transform-origin:right}.fx-curtain:hover .curtain-left{transform:translateX(-100%)}.fx-curtain:hover .curtain-right{transform:translateX(100%)}`,
    `<div class="fx-curtain"><div class="content">Revealed!</div><div class="curtain-left"></div><div class="curtain-right"></div></div>`
  );
  add("Parallax Depth Layers", "Section Effects", "Advanced", ["section","parallax","depth"],
    `.fx-depth{position:relative;width:100%;height:80px;overflow:hidden;border-radius:8px}.fx-depth div{position:absolute;border-radius:8px}.fx-depth .back{inset:0;background:#1e293b}.fx-depth .mid{inset:15%;background:#334155;transform:translateZ(0);animation:fxDepthMid 4s infinite alternate}.fx-depth .front{inset:30%;background:#475569;animation:fxDepthFront 3s infinite alternate}@keyframes fxDepthMid{0%{transform:translate(0)}100%{transform:translate(5px,-5px)}}@keyframes fxDepthFront{0%{transform:translate(0)}100%{transform:translate(-5px,5px)}}`,
    `<div class="fx-depth"><div class="back"></div><div class="mid"></div><div class="front"></div></div>`
  );
  add("CSS Confetti Animation", "Section Effects", "Advanced", ["section","confetti","animation"],
    `.fx-confetti{width:100%;height:80px;background:#0f172a;border-radius:8px;position:relative;overflow:hidden}.fx-confetti::before{content:'';position:absolute;width:6px;height:6px;top:10%;left:20%;background:#ef4444;border-radius:2px;animation:fxConfettiFall 2s infinite}.fx-confetti::after{content:'';position:absolute;width:6px;height:6px;top:10%;left:70%;background:#f59e0b;border-radius:2px;animation:fxConfettiFall 2.5s infinite .5s}@keyframes fxConfettiFall{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(80px) rotate(360deg);opacity:0}}`,
    `<div class="fx-confetti"></div>`
  );
  add("Disco Ball", "Section Effects", "Intermediate", ["section","disco","ball"],
    `.fx-disco{width:50px;height:50px;background:radial-gradient(circle at 30% 30%,#fff,#94a3b8,#475569);border-radius:50%;position:relative;animation:fxDiscoSpin 3s linear infinite;box-shadow:0 0 20px #fff3}@keyframes fxDiscoSpin{0%{box-shadow:10px 0 20px #ef4444,-10px 0 20px #3b82f6}25%{box-shadow:0 10px 20px #f59e0b,0 -10px 20px #8b5cf6}50%{box-shadow:-10px 0 20px #3b82f6,10px 0 20px #ef4444}75%{box-shadow:0 -10px 20px #8b5cf6,0 10px 20px #f59e0b}100%{box-shadow:10px 0 20px #ef4444,-10px 0 20px #3b82f6}}`,
    `<div class="fx-disco"></div>`
  );

  // ═══════════════════════════════════════════
  // ANIMATION & TRANSFORM EFFECTS (177-184)
  // ═══════════════════════════════════════════
  add("Bounce In", "Animation Effects", "Beginner", ["animation","bounce","in"],
    `.fx-bounce-in{width:50px;height:50px;background:#3b82f6;border-radius:10px;animation:fxBounceIn 1s ease;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.7rem;font-weight:700}@keyframes fxBounceIn{0%{transform:scale(0)}50%{transform:scale(1.2)}70%{transform:scale(0.9)}100%{transform:scale(1)}}`,
    `<div class="fx-bounce-in">Hi</div>`
  );
  add("Elastic Scale", "Animation Effects", "Intermediate", ["animation","elastic","scale"],
    `.fx-elastic{width:50px;height:50px;background:#10b981;border-radius:50%;animation:fxElastic 1.5s ease infinite}@keyframes fxElastic{0%{transform:scale(1)}25%{transform:scale(1.3)}50%{transform:scale(0.8)}75%{transform:scale(1.1)}100%{transform:scale(1)}}`,
    `<div class="fx-elastic"></div>`
  );
  add("Swing Pendulum", "Animation Effects", "Intermediate", ["animation","swing","pendulum"],
    `.fx-swing{width:10px;height:40px;background:#475569;margin:0 auto;border-radius:5px;transform-origin:top center;animation:fxSwing 1.5s ease-in-out infinite}.fx-swing::after{content:'';position:absolute;bottom:-10px;left:50%;transform:translateX(-50%);width:20px;height:20px;background:#f59e0b;border-radius:50%}@keyframes fxSwing{0%{transform:rotate(20deg)}50%{transform:rotate(-20deg)}100%{transform:rotate(20deg)}}`,
    `<div class="fx-swing"></div>`
  );
  add("Float Animation", "Animation Effects", "Beginner", ["animation","float"],
    `.fx-float-anim{width:50px;height:50px;background:linear-gradient(135deg,#ec4899,#8b5cf6);border-radius:10px;animation:fxFloatAnim 3s ease-in-out infinite;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.8rem;font-weight:700}@keyframes fxFloatAnim{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`,
    `<div class="fx-float-anim">⬆</div>`
  );
  add("Shake Effect", "Animation Effects", "Intermediate", ["animation","shake"],
    `.fx-shake-box{width:50px;height:50px;background:#ef4444;border-radius:8px;animation:fxShakeBox .5s ease infinite;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.7rem;font-weight:700}@keyframes fxShakeBox{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}`,
    `<div class="fx-shake-box">⚠</div>`
  );
  add("Rotate & Scale", "Transform Effects", "Intermediate", ["transform","rotate","scale"],
    `.fx-rot-scale{width:50px;height:50px;background:#06b6d4;border-radius:8px;transition:transform .3s;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.7rem;font-weight:700}.fx-rot-scale:hover{transform:rotate(45deg) scale(1.2)}`,
    `<div class="fx-rot-scale">Hover</div>`
  );
  add("Focus Reveal", "Transform Effects", "Advanced", ["transform","focus","reveal"],
    `.fx-focus-reveal{width:80px;height:50px;background:#1e293b;border:2px solid #334155;border-radius:8px;overflow:hidden;position:relative;transition:border-color .3s;cursor:text}.fx-focus-reveal span{position:absolute;inset:0;background:#10b981;transform:scaleY(0);transform-origin:bottom;transition:transform .3s;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.7rem;font-weight:700}.fx-focus-reveal:focus-within{border-color:#10b981}.fx-focus-reveal:focus-within span{transform:scaleY(1)}`,
    `<div class="fx-focus-reveal" tabindex="0"><span>Revealed!</span></div>`
  );
  add("Newspaper Columns", "Layout Effects", "Beginner", ["layout","newspaper","columns"],
    `.fx-newspaper{column-count:2;column-gap:8px;column-rule:1px solid #334155;font-size:.6rem;color:#94a3b8;max-width:140px}.fx-newspaper h5{font-size:.7rem;color:#e2e8f0;margin:0 0 4px 0;break-after:avoid}`,
    `<div class="fx-newspaper"><h5>Headline</h5>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.<h5>Update</h5>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.</div>`
  );

  // ═══════════════════════════════════════════
  // SPECIAL & SVG EFFECTS (185-198)
  // ═══════════════════════════════════════════
  add("Morphing Shape", "Special Effects", "Advanced", ["special","morphing","shape"],
    `.fx-morph-shape{width:60px;height:60px;background:linear-gradient(135deg,#f59e0b,#ef4444);animation:fxMorphShape 4s linear infinite}@keyframes fxMorphShape{0%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}25%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%}50%{border-radius:50% 50% 30% 70%/40% 70% 50% 60%}75%{border-radius:40% 60% 50% 50%/60% 30% 60% 40%}100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}}`,
    `<div class="fx-morph-shape"></div>`
  );
  add("Pixel Art Heart", "Special Effects", "Advanced", ["special","pixel","art","heart"],
    `.fx-pixel-heart{position:relative;width:60px;height:60px}.fx-pixel-heart::before{content:'';position:absolute;width:100%;height:100%;background:repeating-linear-gradient(0deg,transparent,transparent 9px,#ef4444 9px,#ef4444 18px),repeating-linear-gradient(90deg,transparent,transparent 9px,#ef4444 9px,#ef4444 18px);-webkit-mask-box-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 90 L15 50 A20 20 0 0 1 50 30 A20 20 0 0 1 85 50 Z'/%3E%3C/svg%3E") 30% fill/8px 8px 8px 8px;animation:fxPHeart 1s infinite alternate}@keyframes fxPHeart{0%{transform:scale(1)}100%{transform:scale(1.1)}}`,
    `<div class="fx-pixel-heart"></div>`
  );
  add("Duotone Image", "Special Effects", "Intermediate", ["special","duotone","image"],
    `.fx-duotone-img{width:80px;height:60px;background:url(https://picsum.photos/seed/duo/200/200.jpg) center/cover;border-radius:8px;filter:grayscale(100%) contrast(1.2);mix-blend-mode:multiply;background-blend-mode:multiply;background-color:#3b82f6;overflow:hidden;position:relative}.fx-duotone-img::after{content:'';position:absolute;inset:0;background:#3b82f66b}`,
    `<div class="fx-duotone-img"></div>`
  );
  add("Collapsible Sidebar", "Navigation Effects", "Intermediate", ["nav","collapsible","sidebar"],
    `.fx-col-sidebar{display:flex;width:120px;height:60px;border-radius:8px;overflow:hidden}.fx-col-sidebar .side{width:40px;background:#1e293b;transition:width .3s;overflow:hidden;white-space:nowrap;font-size:.6rem;color:#e2e8f0;display:flex;align-items:center;justify-content:center}.fx-col-sidebar:hover .side{width:80px}.fx-col-sidebar .main{flex:1;background:#0f172a;display:flex;align-items:center;justify-content:center;font-size:.6rem;color:#64748b}`,
    `<div class="fx-col-sidebar"><div class="side">☰ Nav</div><div class="main">Content</div></div>`
  );
  add("Multi-Select Chips", "Input Effects", "Intermediate", ["input","multi-select","chips"],
    `.fx-multi-chips{display:flex;flex-wrap:wrap;gap:4px;max-width:160px}.fx-multi-chips span{padding:4px 8px;background:#334155;border-radius:4px;font-size:.6rem;color:#e2e8f0;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:4px}.fx-multi-chips span.active{background:#3b82f6;color:#fff}`,
    `<div class="fx-multi-chips"><span class="active">✕ CSS</span><span class="active">✕ HTML</span><span>React</span></div>`
  );
  add("Dropdown Menu", "Navigation Effects", "Intermediate", ["nav","dropdown","menu"],
    `.fx-dropdown{position:relative;display:inline-block}.fx-dropdown-btn{padding:6px 14px;background:#3b82f6;color:#fff;border:none;border-radius:4px;font-size:.7rem;font-weight:600;cursor:pointer}.fx-dropdown-menu{position:absolute;top:calc(100% + 4px);left:0;background:#1e293b;border:1px solid #334155;border-radius:6px;overflow:hidden;width:100px;opacity:0;transform:translateY(-5px);transition:all .2s;pointer-events:none;z-index:10}.fx-dropdown-menu div{padding:6px 10px;font-size:.7rem;color:#e2e8f0;cursor:pointer;transition:background .1s}.fx-dropdown-menu div:hover{background:#334155}.fx-dropdown:hover .fx-dropdown-menu{opacity:1;transform:translateY(0);pointer-events:auto}`,
    `<div class="fx-dropdown"><button class="fx-dropdown-btn">Menu ▾</button><div class="fx-dropdown-menu"><div>Profile</div><div>Settings</div><div>Logout</div></div></div>`
  );
  add("SVG Turbulence Displacement", "SVG Effects", "Advanced", ["svg","turbulence","displacement"],
    `<svg width="0" height="0" style="position:absolute"><filter id="fx-turb"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="8"/></filter></svg><style>.fx-svg-turb{padding:10px 20px;background:#8b5cf6;color:#fff;border-radius:8px;font-weight:700;font-size:.8rem;filter:url(#fx-turb);animation:fxTurb 2s infinite alternate}@keyframes fxTurb{0%{filter:url(#fx-turb) hue-rotate(0deg)}100%{filter:url(#fx-turb) hue-rotate(90deg)}}</style>`,
    `<div class="fx-svg-turb">Distort</div>`
  );
  add("SVG Glow Filter", "SVG Effects", "Intermediate", ["svg","glow","filter"],
    `<svg width="0" height="0" style="position:absolute"><filter id="fx-glow"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></svg><style>.fx-svg-glow{width:60px;height:60px;background:#10b981;border-radius:10px;filter:url(#fx-glow);display:flex;align-items:center;justify-content:center;color:#fff;font-size:.7rem;font-weight:700}</style>`,
    `<div class="fx-svg-glow">Glow</div>`
  );
  add("SVG Duotone Filter", "SVG Effects", "Advanced", ["svg","duotone","filter"],
    `<svg width="0" height="0" style="position:absolute"><filter id="fx-duo"><feColorMatrix type="matrix" values="0.5 0 0 0 0.1  0.5 0 0 0 0.2  0.5 0 0 0 0.5  0 0 0 1 0"/></filter></svg><style>.fx-svg-duotone{width:80px;height:60px;background:url(https://picsum.photos/seed/duotone/200/200.jpg) center/cover;border-radius:8px;filter:url(#fx-duo)}</style>`,
    `<div class="fx-svg-duotone"></div>`
  );
  add("SVG Grain Texture", "SVG Effects", "Intermediate", ["svg","grain","texture"],
    `<svg width="0" height="0" style="position:absolute"><filter id="fx-grain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter></svg><style>.fx-svg-grain{width:80px;height:60px;background:#1e293b;border-radius:8px;position:relative;overflow:hidden}.fx-svg-grain::after{content:'';position:absolute;inset:0;filter:url(#fx-grain);opacity:0.15;pointer-events:none}</style>`,
    `<div class="fx-svg-grain" style="display:flex;align-items:center;justify-content:center;color:#e2e8f0;font-size:.7rem;font-weight:700">Grain</div>`
  );
  add("SVG Morphing Blob", "SVG Effects", "Advanced", ["svg","morphing","blob"],
    `<style>.fx-svg-morph{width:80px;height:80px;fill:#8b5cf6;animation:fxSvgMorph 4s linear infinite}@keyframes fxSvgMorph{0%{d:path("M30 10 C50 0 60 20 60 40 C60 60 50 70 30 70 C10 70 0 60 0 40 C0 20 10 0 30 10")}50%{d:path("M30 0 C50 10 70 20 70 40 C70 60 50 80 30 80 C10 80 -10 60 -10 40 C-10 20 10 -10 30 0")}100%{d:path("M30 10 C50 0 60 20 60 40 C60 60 50 70 30 70 C10 70 0 60 0 40 C0 20 10 0 30 10")}}</style>`,
    `<svg class="fx-svg-morph" viewBox="-10 -10 80 80"><path d="M30 10 C50 0 60 20 60 40 C60 60 50 70 30 70 C10 70 0 60 0 40 C0 20 10 0 30 10"/></svg>`
  );
  add("Strikethrough Animation", "Text Effects", "Beginner", ["text","strikethrough","animation"],
    `.fx-strike-anim{font-size:1.1rem;font-weight:700;color:#ef4444;position:relative;display:inline-block}.fx-strike-anim::after{content:'';position:absolute;left:0;top:50%;width:0;height:2px;background:#ef4444;transition:width .3s}.fx-strike-anim:hover::after{width:100%}`,
    `<span class="fx-strike-anim">Hover Strike</span>`
  );
  add("Pulse Ring", "Animation Effects", "Beginner", ["animation","pulse","ring"],
    `.fx-pulse-ring{width:30px;height:30px;background:#3b82f6;border-radius:50%;position:relative}.fx-pulse-ring::before,.fx-pulse-ring::after{content:'';position:absolute;inset:-4px;border:2px solid #3b82f6;border-radius:50%;animation:fxPulseRingAnim 2s infinite}.fx-pulse-ring::after{animation-delay:1s}@keyframes fxPulseRingAnim{0%{transform:scale(1);opacity:1}100%{transform:scale(1.8);opacity:0}}`,
    `<div class="fx-pulse-ring"></div>`
  );
  add("Typing Cursor", "Text Effects", "Beginner", ["text","typing","cursor"],
    `.fx-typing-cursor{font-size:1.2rem;font-weight:600;color:#10b981}.fx-typing-cursor::after{content:'|';animation:fxTypeCursor 1s step-end infinite}@keyframes fxTypeCursor{0%,100%{opacity:1}50%{opacity:0}}`,
    `<span class="fx-typing-cursor">Typing</span>`
  );

  return E;
}


// ========================================================================
// APPLICATION LOGIC
// ========================================================================
const CssEffectsApp = {
  effects: [],
  filteredEffects: [],
  activeCategory: "All Effects",
  activeDifficulty: "all",
  searchQuery: "",

  init() {
    this.effects = generateEffectsData();
    this.filteredEffects = [...this.effects];
    this.renderCategoryFilters();
    this.bindEvents();
    this.renderEffects();
    this.injectStyles();
  },

  injectStyles() {
    const css = this.effects.map(e => e.css).join('\n');
    const el = document.getElementById('effect-styles-injection');
    if (el) el.innerHTML = '<style>' + css + '</style>';
  },

  renderCategoryFilters() {
    const container = document.getElementById('categoryFilters');
    if (!container) return;
    const cats = ["All Effects", ...CATEGORIES];
    container.innerHTML = cats.map(c =>
      '<button class="filter-pill ' + (c === this.activeCategory ? 'active' : '') + '" data-cat="' + c + '" type="button">' + c + '</button>'
    ).join('');
  },

  bindEvents() {
    const self = this;

    // Category filter
    const catContainer = document.getElementById('categoryFilters');
    if (catContainer) {
      catContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('filter-pill')) {
          self.activeCategory = e.target.dataset.cat;
          self.updateFilters();
        }
      });
    }

    // Difficulty filter
    const diffContainer = document.getElementById('difficultyFilters');
    if (diffContainer) {
      diffContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('filter-pill')) {
          self.activeDifficulty = e.target.dataset.diff;
          self.updateFilters();
        }
      });
    }

    // Search
    const searchInput = document.getElementById('effectsSearch');
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        self.searchQuery = e.target.value.toLowerCase();
        self.updateFilters();
      });
    }

    // Random
    const randomBtn = document.getElementById('randomEffectBtn');
    if (randomBtn) {
      randomBtn.addEventListener('click', function() {
        var randEffect = self.effects[Math.floor(Math.random() * self.effects.length)];
        self.activeCategory = "All Effects";
        self.activeDifficulty = "all";
        self.searchQuery = "";
        if (searchInput) searchInput.value = "";
        self.updateFilters();

        setTimeout(function() {
          var el = document.getElementById('effect-' + randEffect.id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('highlight-pulse');
            setTimeout(function() { el.classList.remove('highlight-pulse'); }, 1000);
          }
        }, 100);
      });
    }

    // Keyboard shortcut
    document.addEventListener('keydown', function(e) {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (searchInput) searchInput.focus();
      }
    });

    // Reset
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        self.activeCategory = "All Effects";
        self.activeDifficulty = "all";
        self.searchQuery = "";
        if (searchInput) searchInput.value = "";
        self.updateFilters();
      });
    }

    // Grid: Tab switching and copy
    const grid = document.getElementById('effectsGrid');
    if (grid) {
      grid.addEventListener('click', function(e) {
        var card = e.target.closest('.effect-card');
        if (!card) return;

        // Tab switch
        if (e.target.classList.contains('effect-tab-btn')) {
          var tab = e.target.dataset.tab;
          var id = card.dataset.id;

          var tablist = e.target.closest('[role="tablist"]');
          if (tablist) {
            tablist.querySelectorAll('.effect-tab-btn').forEach(function(b) {
              b.classList.remove('active');
            });
          }
          e.target.classList.add('active');

          var codeBlock = card.querySelector('.effect-code-block');
          var effect = self.effects.find(function(ef) { return ef.id == id; });
          if (effect && codeBlock) {
            codeBlock.textContent = effect[tab] || "/* Not available */";
          }
        }

        // Copy button
        if (e.target.closest('.copy-effect-btn')) {
          var codeBlock = card.querySelector('.effect-code-block');
          if (codeBlock) {
            navigator.clipboard.writeText(codeBlock.textContent).then(function() {
              var btn = e.target.closest('.copy-effect-btn');
              var icon = btn.querySelector('i');
              if (icon) {
                icon.className = 'fas fa-check';
                setTimeout(function() { icon.className = 'fas fa-copy'; }, 1500);
              }
              if (window.Devpalettes && window.Devpalettes.Toast) {
                window.Devpalettes.Toast.show('Code copied!', 'success');
              } else {
                var tc = document.getElementById('toast-container');
                if(tc) {
                  var t = document.createElement('div');
                  t.className = 'toast';
                  t.textContent = 'Code copied!';
                  tc.appendChild(t);
                  setTimeout(function(){ t.remove(); }, 2000);
                }
              }
            });
          }
        }
      });
    }
  },

  updateFilters() {
    var self = this;

    var catContainer = document.getElementById('categoryFilters');
    if (catContainer) {
      catContainer.querySelectorAll('.filter-pill').forEach(function(p) {
        p.classList.toggle('active', p.dataset.cat === self.activeCategory);
      });
    }
    var diffContainer = document.getElementById('difficultyFilters');
    if (diffContainer) {
      diffContainer.querySelectorAll('.filter-pill').forEach(function(p) {
        p.classList.toggle('active', p.dataset.diff === self.activeDifficulty);
      });
    }

    this.filteredEffects = this.effects.filter(function(e) {
      var matchCat = self.activeCategory === "All Effects" || e.category === self.activeCategory;
      var matchDiff = self.activeDifficulty === "all" || e.difficulty === self.activeDifficulty;
      var matchSearch = !self.searchQuery ||
                       e.name.toLowerCase().includes(self.searchQuery) ||
                       e.tags.some(function(t) { return t.includes(self.searchQuery); }) ||
                       e.category.toLowerCase().includes(self.searchQuery);
      return matchCat && matchDiff && matchSearch;
    });

    var countEl = document.getElementById('effectCount');
    if (countEl) countEl.textContent = 'Showing ' + this.filteredEffects.length + ' effects';

    var resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
      resetBtn.style.display = (this.activeCategory === "All Effects" && this.activeDifficulty === "all" && !this.searchQuery) ? 'none' : 'inline';
    }

    this.renderEffects();
  },

  renderEffects() {
    var grid = document.getElementById('effectsGrid');
    var noRes = document.getElementById('noResults');
    if (!grid) return;

    if (this.filteredEffects.length === 0) {
      grid.innerHTML = '';
      if (noRes) noRes.classList.remove('hidden');
      return;
    }
    if (noRes) noRes.classList.add('hidden');

    grid.innerHTML = this.filteredEffects.map(function(effect) {
      var diffClass = effect.difficulty === 'Beginner' ? 'diff-beginner' : effect.difficulty === 'Intermediate' ? 'diff-intermediate' : 'diff-advanced';
      var safeName = escHtml(effect.name);

      return '<div id="effect-' + effect.id + '" class="effect-card glass-card overflow-hidden flex flex-col transition-all hover:shadow-lg" data-id="' + effect.id + '" role="listitem">' +
        '<div class="preview-box border-b border-slate-200 dark:border-slate-700/50" role="region" aria-label="Live preview of ' + safeName + '">' +
          effect.html +
        '</div>' +
        '<div class="p-4 flex-1 flex flex-col">' +
          '<div class="flex justify-between items-start mb-2">' +
            '<h3 class="font-bold text-sm text-slate-800 dark:text-slate-100">' + safeName + '</h3>' +
            '<span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ' + diffClass + ' whitespace-nowrap">' + effect.difficulty + '</span>' +
          '</div>' +
          '<div class="flex flex-wrap gap-1 mb-3">' +
            effect.tags.slice(0, 3).map(function(t) { return '<span class="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">#' + t + '</span>'; }).join('') +
          '</div>' +
          '<div class="mt-auto rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/50">' +
            '<div class="tab-bar flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/50 px-2">' +
              '<div class="flex" role="tablist" aria-label="Code format tabs">' +
                '<button class="effect-tab-btn active" data-tab="html" role="tab" type="button">HTML</button>' +
                '<button class="effect-tab-btn" data-tab="css" role="tab" type="button">CSS</button>' +
                (effect.js ? '<button class="effect-tab-btn" data-tab="js" role="tab" type="button">JS</button>' : '') +
                '<button class="effect-tab-btn" data-tab="react" role="tab" type="button">React</button>' +
              '</div>' +
              '<button class="copy-effect-btn text-slate-400 hover:text-emerald-500 p-1 text-xs transition-colors" aria-label="Copy code" type="button">' +
                '<i class="fas fa-copy" aria-hidden="true"></i>' +
              '</button>' +
            '</div>' +
            '<pre class="effect-code-block" role="tabpanel">' + escHtml(effect.html) + '</pre>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() { CssEffectsApp.init(); });
