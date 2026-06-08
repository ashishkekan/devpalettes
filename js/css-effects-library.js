/* ============================================
   Devpalettes - CSS Effects Library
   198 Effects | 38 Categories | Pure CSS
   ============================================ */

const CATEGORIES = [
  "Text Glow","Text Shadow","Text Fill","Text Stroke","Text Animation",
  "Button Hover","Button Glow","Button Border","Button Slide","Button Pulse",
  "Loader Spin","Loader Bar","Loader Dot","Card Hover","Card Reveal",
  "Input Focus","Input Underline","Box Shadow","Inner Shadow","Long Shadow",
  "Border Gradient","Border Animation","Border Dash","Background Gradient","Background Animated",
  "Background Mesh","Background Pattern","Hover Scale","Hover Rotate","Hover Skew",
  "Transition Fade","Overlay Effects","Clip Path","Filter Effects","Menu Hover",
  "Link Hover","List Styling","Special"
];

const COLORS = [
  { name: "Emerald", hex: "#10b981", dark: "#064e3b" },
  { name: "Blue", hex: "#3b82f6", dark: "#1e3a8a" },
  { name: "Purple", hex: "#8b5cf6", dark: "#4c1d95" },
  { name: "Red", hex: "#ef4444", dark: "#7f1d1d" },
  { name: "Amber", hex: "#f59e0b", dark: "#78350f" },
  { name: "Pink", hex: "#ec4899", dark: "#831843" }
];

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function toReact(html, name) {
  const safeName = name.replace(/[^a-zA-Z0-9]/g, '');
  const jsx = html.replace(/class=/g, 'className=').replace(/for=/g, 'htmlFor=').replace(/<br>/g, '<br/>');
  return `export default function ${safeName}() {\n  return (\n    ${jsx}\n  );\n}`;
}

function generateEffectsData() {
  const effects = [];
  let id = 1;

  function add(name, cat, diff, tags, css, html, js) {
    effects.push({ id: id++, name, category: cat, difficulty: diff, tags, css, html, js: js || "", react: toReact(html, name) });
  }

  // Helper to add variations based on colors
  function addColorVariants(baseName, cat, diff, tags, cssFn, htmlFn, jsFn) {
    COLORS.forEach(c => {
      add(
        `${c.name} ${baseName}`, cat, diff, [...tags, c.name.toLowerCase()],
        cssFn(c), htmlFn(c), jsFn ? jsFn(c) : ""
      );
    });
  }

  // ═══════════════════════════════════════════
  // 1-5: TEXT GLOW
  // ═══════════════════════════════════════════
  addColorVariants("Glow", "Text Glow", "Beginner", ["text","glow"],
    (c) => `.t-glow-${c.name.toLowerCase()} { color: ${c.hex}; text-shadow: 0 0 10px ${c.hex}88, 0 0 20px ${c.hex}44, 0 0 40px ${c.hex}22; font-weight: 700; font-size: 1.4rem; }`,
    (c) => `<span class="t-glow-${c.name.toLowerCase()}">${c.name} Glow</span>`
  );

  // ═══════════════════════════════════════════
  // 6-10: TEXT SHADOW
  // ═══════════════════════════════════════════
  addColorVariants("Retro", "Text Shadow", "Beginner", ["text","shadow","retro"],
    (c) => `.t-retro-${c.name.toLowerCase()} { color: ${c.hex}; text-shadow: 3px 3px 0px ${c.dark}; font-weight: 800; font-size: 1.4rem; }`,
    (c) => `<span class="t-retro-${c.name.toLowerCase()}">${c.name} Retro</span>`
  );

  // ═══════════════════════════════════════════
  // 11-15: TEXT FILL
  // ═══════════════════════════════════════════
  addColorVariants("Gradient Fill", "Text Fill", "Beginner", ["text","gradient","fill"],
    (c) => `.t-fill-${c.name.toLowerCase()} { background: linear-gradient(135deg, ${c.hex}, ${COLORS[(COLORS.indexOf(c)+1)%COLORS.length].hex}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 800; font-size: 1.4rem; }`,
    (c) => `<span class="t-fill-${c.name.toLowerCase()}">${c.name} Fill</span>`
  );

  // ═══════════════════════════════════════════
  // 16-20: TEXT STROKE
  // ═══════════════════════════════════════════
  addColorVariants("Outline", "Text Stroke", "Beginner", ["text","stroke","outline"],
    (c) => `.t-stroke-${c.name.toLowerCase()} { -webkit-text-stroke: 2px ${c.hex}; -webkit-text-fill-color: transparent; font-weight: 800; font-size: 1.4rem; }`,
    (c) => `<span class="t-stroke-${c.name.toLowerCase()}">${c.name} Outline</span>`
  );

  // ═══════════════════════════════════════════
  // 21-25: TEXT ANIMATION
  // ═══════════════════════════════════════════
  addColorVariants("Typewriter", "Text Animation", "Intermediate", ["text","animation","typewriter"],
    (c) => `.t-type-${c.name.toLowerCase()} { overflow: hidden; border-right: .15em solid ${c.hex}; white-space: nowrap; margin: 0 auto; letter-spacing: .1em; animation: tType${c.name} 3s steps(12,end) infinite, tBlink .6s step-end infinite; font-weight: 600; font-size: 1.1rem; color: ${c.hex}; } @keyframes tType${c.name} { 0%,100% { width: 0; } 50%,80% { width: 100%; } } @keyframes tBlink { 50% { border-color: transparent; } }`,
    (c) => `<div class="t-type-${c.name.toLowerCase()}">${c.name} Typing...</div>`
  );

  // ═══════════════════════════════════════════
  // 26-31: BUTTON HOVER
  // ═══════════════════════════════════════════
  addColorVariants("Fill Up", "Button Hover", "Beginner", ["button","hover","fill"],
    (c) => `.b-fill-${c.name.toLowerCase()} { position: relative; padding: 10px 24px; border: 2px solid ${c.hex}; background: transparent; color: ${c.hex}; cursor: pointer; font-weight: 600; overflow: hidden; z-index: 1; transition: color .3s; border-radius: 8px; } .b-fill-${c.name.toLowerCase()}::before { content:''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: ${c.hex}; transform: translateY(100%); transition: transform .3s; z-index: -1; } .b-fill-${c.name.toLowerCase()}:hover { color: #fff; } .b-fill-${c.name.toLowerCase()}:hover::before { transform: translateY(0); }`,
    (c) => `<button class="b-fill-${c.name.toLowerCase()}">${c.name} Fill</button>`
  );
  add("Diagonal Slide", "Button Hover", "Intermediate", ["button","hover","slide"],
    `.b-diag-slide { position: relative; padding: 10px 24px; border: 2px solid #ef4444; background: transparent; color: #fff; cursor: pointer; font-weight: 600; overflow: hidden; z-index: 1; transition: color .3s; border-radius: 8px; } .b-diag-slide::before { content:''; position: absolute; top: 0; left: 0; width: 150%; height: 100%; background: #ef4444; transform: translateX(-100%) skewX(-20deg); transition: transform .3s; z-index: -1; } .b-diag-slide:hover::before { transform: translateX(-10%) skewX(-20deg); }`,
    `<button class="b-diag-slide">Diagonal</button>`
  );

  // ═══════════════════════════════════════════
  // 32-36: BUTTON GLOW
  // ═══════════════════════════════════════════
  addColorVariants("Glow", "Button Glow", "Beginner", ["button","glow"],
    (c) => `.b-glow-${c.name.toLowerCase()} { padding: 10px 24px; background: ${c.hex}; color: #fff; border: none; cursor: pointer; font-weight: 600; border-radius: 8px; transition: box-shadow .3s; } .b-glow-${c.name.toLowerCase()}:hover { box-shadow: 0 0 15px ${c.hex}88, 0 0 30px ${c.hex}44; }`,
    (c) => `<button class="b-glow-${c.name.toLowerCase()}">${c.name} Glow</button>`
  );

  // ═══════════════════════════════════════════
  // 37-41: BUTTON BORDER
  // ═══════════════════════════════════════════
  addColorVariants("Gradient Border", "Button Border", "Intermediate", ["button","border","gradient"],
    (c) => `.b-border-${c.name.toLowerCase()} { position: relative; padding: 10px 24px; background: #151921; color: #fff; border: none; cursor: pointer; font-weight: 600; z-index: 1; border-radius: 10px; } .b-border-${c.name.toLowerCase()}::before { content:''; position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px; background: linear-gradient(135deg, ${c.hex}, ${COLORS[(COLORS.indexOf(c)+2)%COLORS.length].hex}); z-index: -2; border-radius: 12px; } .b-border-${c.name.toLowerCase()}::after { content:''; position: absolute; inset: 0; background: #151921; z-index: -1; border-radius: 10px; }`,
    (c) => `<button class="b-border-${c.name.toLowerCase()}">${c.name} Border</button>`
  );

  // ═══════════════════════════════════════════
  // 42-46: BUTTON SLIDE
  // ═══════════════════════════════════════════
  addColorVariants("Slide In", "Button Slide", "Beginner", ["button","slide"],
    (c) => `.b-slide-${c.name.toLowerCase()} { position: relative; padding: 10px 24px; border: 2px solid ${c.hex}; background: transparent; color: ${c.hex}; cursor: pointer; font-weight: 600; overflow: hidden; z-index: 1; transition: color .3s; border-radius: 8px; } .b-slide-${c.name.toLowerCase()}::before { content:''; position: absolute; top: 0; left: 0; width: 0; height: 100%; background: ${c.hex}; transition: width .3s; z-index: -1; } .b-slide-${c.name.toLowerCase()}:hover { color: #fff; } .b-slide-${c.name.toLowerCase()}:hover::before { width: 100%; }`,
    (c) => `<button class="b-slide-${c.name.toLowerCase()}">${c.name} Slide</button>`
  );

  // ═══════════════════════════════════════════
  // 47-51: BUTTON PULSE
  // ═══════════════════════════════════════════
  addColorVariants("Pulse", "Button Pulse", "Beginner", ["button","pulse"],
    (c) => `.b-pulse-${c.name.toLowerCase()} { padding: 10px 24px; background: ${c.hex}; color: #fff; border: none; cursor: pointer; font-weight: 600; border-radius: 8px; animation: bPulse${c.name} 2s infinite; } @keyframes bPulse${c.name} { 0% { box-shadow: 0 0 0 0 ${c.hex}88; } 70% { box-shadow: 0 0 0 12px ${c.hex}00; } 100% { box-shadow: 0 0 0 0 ${c.hex}00; } }`,
    (c) => `<button class="b-pulse-${c.name.toLowerCase()}">${c.name} Pulse</button>`
  );

  // ═══════════════════════════════════════════
  // 52-57: LOADER SPIN
  // ═══════════════════════════════════════════
  addColorVariants("Spinner", "Loader Spin", "Beginner", ["loader","spin"],
    (c) => `.l-spin-${c.name.toLowerCase()} { width: 40px; height: 40px; border: 4px solid rgba(255,255,255,.1); border-left-color: ${c.hex}; border-radius: 50%; animation: lSpin 1s linear infinite; } @keyframes lSpin { to { transform: rotate(360deg); } }`,
    (c) => `<div class="l-spin-${c.name.toLowerCase()}"></div>`
  );

  // ═══════════════════════════════════════════
  // 58-62: LOADER BAR
  // ═══════════════════════════════════════════
  addColorVariants("Bar", "Loader Bar", "Beginner", ["loader","bar"],
    (c) => `.l-bar-${c.name.toLowerCase()} { width: 100%; height: 4px; background: #334155; border-radius: 2px; overflow: hidden; position: relative; } .l-bar-${c.name.toLowerCase()}::after { content:''; position: absolute; top: 0; left: 0; height: 100%; width: 40%; background: ${c.hex}; animation: lBar 1.2s infinite alternate; border-radius: 2px; } @keyframes lBar { from { left: -40%; } to { left: 100%; } }`,
    (c) => `<div class="l-bar-${c.name.toLowerCase()}"></div>`
  );

  // ═══════════════════════════════════════════
  // 63-67: LOADER DOT
  // ═══════════════════════════════════════════
  addColorVariants("Dots", "Loader Dot", "Beginner", ["loader","dot"],
    (c) => `.l-dot-${c.name.toLowerCase()} { display: flex; gap: 6px; } .l-dot-${c.name.toLowerCase()} span { width: 10px; height: 10px; background: ${c.hex}; border-radius: 50%; animation: lBounceUp .6s infinite alternate; } .l-dot-${c.name.toLowerCase()} span:nth-child(2) { animation-delay: .2s; } .l-dot-${c.name.toLowerCase()} span:nth-child(3) { animation-delay: .4s; } @keyframes lBounceUp { to { transform: translateY(-12px); } }`,
    (c) => `<div class="l-dot-${c.name.toLowerCase()}"><span></span><span></span><span></span></div>`
  );

  // ═══════════════════════════════════════════
  // 68-72: CARD HOVER
  // ═══════════════════════════════════════════
  addColorVariants("Lift", "Card Hover", "Beginner", ["card","hover","lift"],
    (c) => `.c-lift-${c.name.toLowerCase()} { background: #1e293b; padding: 1rem; border-radius: 10px; transition: transform .3s, box-shadow .3s; color: #f1f5f9; text-align: center; border: 1px solid #334155; } .c-lift-${c.name.toLowerCase()}:hover { transform: translateY(-6px); box-shadow: 0 12px 24px ${c.dark}; border-color: ${c.hex}; }`,
    (c) => `<div class="c-lift-${c.name.toLowerCase()}">${c.name} Lift</div>`
  );

  // ═══════════════════════════════════════════
  // 73-77: CARD REVEAL
  // ═══════════════════════════════════════════
  addColorVariants("Slide Up", "Card Reveal", "Intermediate", ["card","reveal","slide"],
    (c) => `.c-reveal-${c.name.toLowerCase()} { position: relative; background: ${c.dark}; border-radius: 10px; overflow: hidden; padding: 1.2rem; color: #fff; text-align: center; } .c-reveal-${c.name.toLowerCase()} .overlay { position: absolute; inset: 0; background: rgba(0,0,0,.85); transform: translateY(100%); transition: transform .3s; display: flex; align-items: center; justify-content: center; font-weight: 600; } .c-reveal-${c.name.toLowerCase()}:hover .overlay { transform: translateY(0); }`,
    (c) => `<div class="c-reveal-${c.name.toLowerCase()}"><div>${c.name}</div><div class="overlay">Revealed!</div></div>`
  );

  // ═══════════════════════════════════════════
  // 78-82: INPUT FOCUS
  // ═══════════════════════════════════════════
  addColorVariants("Focus", "Input Focus", "Beginner", ["input","focus","glow"],
    (c) => `.i-focus-${c.name.toLowerCase()} { border: 2px solid #475569; background: transparent; padding: 8px 12px; outline: none; border-radius: 8px; width: 100%; transition: border-color .3s, box-shadow .3s; color: inherit; } .i-focus-${c.name.toLowerCase()}:focus { border-color: ${c.hex}; box-shadow: 0 0 0 3px ${c.hex}44; }`,
    (c) => `<input type="text" class="i-focus-${c.name.toLowerCase()}" placeholder="${c.name} Focus...">`
  );

  // ═══════════════════════════════════════════
  // 83-87: INPUT UNDERLINE
  // ═══════════════════════════════════════════
  addColorVariants("Underline", "Input Underline", "Beginner", ["input","underline"],
    (c) => `.i-under-${c.name.toLowerCase()} { border: none; border-bottom: 2px solid #475569; background: transparent; padding: 8px 0; outline: none; width: 100%; transition: border-color .3s; color: inherit; } .i-under-${c.name.toLowerCase()}:focus { border-bottom-color: ${c.hex}; }`,
    (c) => `<input type="text" class="i-under-${c.name.toLowerCase()}" placeholder="${c.name} Underline...">`
  );

  // ═══════════════════════════════════════════
  // 88-92: BOX SHADOW
  // ═══════════════════════════════════════════
  addColorVariants("Shadow", "Box Shadow", "Beginner", ["shadow"],
    (c) => `.s-box-${c.name.toLowerCase()} { width: 60px; height: 60px; background: #1e293b; border-radius: 8px; box-shadow: 0 0 5px ${c.hex}, 0 0 15px ${c.hex}88, 0 0 30px ${c.hex}44; }`,
    (c) => `<div class="s-box-${c.name.toLowerCase()}"></div>`
  );

  // ═══════════════════════════════════════════
  // 93-97: INNER SHADOW
  // ═══════════════════════════════════════════
  addColorVariants("Inset", "Inner Shadow", "Intermediate", ["shadow","inner"],
    (c) => `.s-inner-${c.name.toLowerCase()} { width: 60px; height: 60px; background: #1e293b; border-radius: 8px; box-shadow: inset 0 0 15px ${c.hex}66; }`,
    (c) => `<div class="s-inner-${c.name.toLowerCase()}"></div>`
  );

  // ═══════════════════════════════════════════
  // 98-102: LONG SHADOW
  // ═══════════════════════════════════════════
  addColorVariants("Long", "Long Shadow", "Intermediate", ["shadow","long"],
    (c) => `.s-long-${c.name.toLowerCase()} { width: 60px; height: 60px; background: ${c.hex}; border-radius: 4px; box-shadow: 1px 1px ${c.dark}, 2px 2px ${c.dark}, 3px 3px ${c.dark}, 4px 4px ${c.dark}, 5px 5px ${c.dark}; }`,
    (c) => `<div class="s-long-${c.name.toLowerCase()}"></div>`
  );

  // ═══════════════════════════════════════════
  // 103-107: BORDER GRADIENT
  // ═══════════════════════════════════════════
  addColorVariants("Gradient", "Border Gradient", "Intermediate", ["border","gradient"],
    (c) => `.bd-grad-${c.name.toLowerCase()} { position: relative; padding: 10px 20px; background: #151921; color: #fff; border: none; z-index: 1; border-radius: 10px; } .bd-grad-${c.name.toLowerCase()}::before { content:''; position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px; background: linear-gradient(135deg, ${c.hex}, ${COLORS[(COLORS.indexOf(c)+2)%COLORS.length].hex}); z-index: -2; border-radius: 12px; } .bd-grad-${c.name.toLowerCase()}::after { content:''; position: absolute; inset: 0; background: #151921; z-index: -1; border-radius: 10px; }`,
    (c) => `<div class="bd-grad-${c.name.toLowerCase()}">${c.name} Grad</div>`
  );

  // ═══════════════════════════════════════════
  // 108-112: BORDER ANIMATION
  // ═══════════════════════════════════════════
  addColorVariants("Spin", "Border Animation", "Intermediate", ["border","animation","spin"],
    (c) => `.bd-aspin-${c.name.toLowerCase()} { width: 50px; height: 50px; border-radius: 50%; border: 3px solid transparent; border-top-color: ${c.hex}; border-bottom-color: ${c.hex}; animation: lSpin 1s linear infinite; } @keyframes lSpin { to { transform: rotate(360deg); } }`,
    (c) => `<div class="bd-aspin-${c.name.toLowerCase()}"></div>`
  );

  // ═══════════════════════════════════════════
  // 113-117: BORDER DASH
  // ═══════════════════════════════════════════
  addColorVariants("Dash", "Border Dash", "Beginner", ["border","dash"],
    (c) => `.bd-dash-${c.name.toLowerCase()} { padding: 10px 20px; border: 2px dashed ${c.hex}; background: transparent; color: ${c.hex}; font-weight: 600; border-radius: 8px; }`,
    (c) => `<div class="bd-dash-${c.name.toLowerCase()}">${c.name} Dash</div>`
  );

  // ═══════════════════════════════════════════
  // 118-122: BACKGROUND GRADIENT
  // ═══════════════════════════════════════════
  addColorVariants("Gradient", "Background Gradient", "Beginner", ["background","gradient"],
    (c) => `.bg-grad-${c.name.toLowerCase()} { width: 100px; height: 80px; background: linear-gradient(135deg, ${c.hex}, ${COLORS[(COLORS.indexOf(c)+1)%COLORS.length].hex}); border-radius: 10px; }`,
    (c) => `<div class="bg-grad-${c.name.toLowerCase()}"></div>`
  );

  // ═══════════════════════════════════════════
  // 123-127: BACKGROUND ANIMATED
  // ═══════════════════════════════════════════
  addColorVariants("Shift", "Background Animated", "Intermediate", ["background","animated"],
    (c) => `.bg-shift-${c.name.toLowerCase()} { width: 100%; height: 80px; background: linear-gradient(-45deg, #0c0f14, ${c.hex}, ${COLORS[(COLORS.indexOf(c)+1)%COLORS.length].hex}); background-size: 400% 400%; animation: bgAurora 10s ease infinite; border-radius: 10px; } @keyframes bgAurora { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`,
    (c) => `<div class="bg-shift-${c.name.toLowerCase()}"></div>`
  );

  // ═══════════════════════════════════════════
  // 128-132: BACKGROUND MESH
  // ═══════════════════════════════════════════
  addColorVariants("Mesh", "Background Mesh", "Advanced", ["background","mesh"],
    (c) => `.bg-mesh-${c.name.toLowerCase()} { width: 100px; height: 80px; background-color: ${c.dark}; background-image: radial-gradient(at 40% 20%, ${c.hex} 0px, transparent 50%), radial-gradient(at 80% 0%, ${COLORS[(COLORS.indexOf(c)+1)%COLORS.length].hex} 0px, transparent 50%); border-radius: 10px; }`,
    (c) => `<div class="bg-mesh-${c.name.toLowerCase()}"></div>`
  );

  // ═══════════════════════════════════════════
  // 133-137: BACKGROUND PATTERN
  // ═══════════════════════════════════════════
  addColorVariants("Dots", "Background Pattern", "Beginner", ["background","pattern","dots"],
    (c) => `.bg-dots-${c.name.toLowerCase()} { width: 100px; height: 80px; background-image: radial-gradient(${c.hex} 1px, transparent 1px); background-size: 10px 10px; border-radius: 10px; }`,
    (c) => `<div class="bg-dots-${c.name.toLowerCase()}"></div>`
  );

  // ═══════════════════════════════════════════
  // 138-142: HOVER SCALE
  // ═══════════════════════════════════════════
  addColorVariants("Scale", "Hover Scale", "Beginner", ["hover","transform","scale"],
    (c) => `.h-scale-${c.name.toLowerCase()} { background: ${c.hex}; padding: 1rem; border-radius: 8px; color: #fff; text-align: center; transition: transform .3s; cursor: pointer; } .h-scale-${c.name.toLowerCase()}:hover { transform: scale(1.1); }`,
    (c) => `<div class="h-scale-${c.name.toLowerCase()}">Scale</div>`
  );

  // ═══════════════════════════════════════════
  // 143-147: HOVER ROTATE
  // ═══════════════════════════════════════════
  addColorVariants("Rotate", "Hover Rotate", "Beginner", ["hover","transform","rotate"],
    (c) => `.h-rotate-${c.name.toLowerCase()} { background: ${c.hex}; width: 50px; height: 50px; border-radius: 8px; transition: transform .3s; cursor: pointer; } .h-rotate-${c.name.toLowerCase()}:hover { transform: rotate(45deg); }`,
    (c) => `<div class="h-rotate-${c.name.toLowerCase()}"></div>`
  );

  // ═══════════════════════════════════════════
  // 148-152: HOVER SKEW
  // ═══════════════════════════════════════════
  addColorVariants("Skew", "Hover Skew", "Beginner", ["hover","transform","skew"],
    (c) => `.h-skew-${c.name.toLowerCase()} { background: ${c.hex}; padding: 1rem; border-radius: 8px; color: #fff; text-align: center; transition: transform .3s; cursor: pointer; } .h-skew-${c.name.toLowerCase()}:hover { transform: skewX(-10deg); }`,
    (c) => `<div class="h-skew-${c.name.toLowerCase()}">Skew</div>`
  );

  // ═══════════════════════════════════════════
  // 153-157: TRANSITION FADE
  // ═══════════════════════════════════════════
  addColorVariants("Fade", "Transition Fade", "Beginner", ["transition","fade"],
    (c) => `.t-fade-${c.name.toLowerCase()} { background: ${c.hex}; padding: 1rem; border-radius: 8px; color: #fff; text-align: center; opacity: 1; transition: opacity .3s; cursor: pointer; } .t-fade-${c.name.toLowerCase()}:hover { opacity: 0.5; }`,
    (c) => `<div class="t-fade-${c.name.toLowerCase()}">Fade</div>`
  );

  // ═══════════════════════════════════════════
  // 158-162: OVERLAY EFFECTS
  // ═══════════════════════════════════════════
  addColorVariants("Overlay", "Overlay Effects", "Intermediate", ["overlay"],
    (c) => `.o-overlay-${c.name.toLowerCase()} { position: relative; background: ${c.dark}; padding: 1.2rem; border-radius: 10px; color: #fff; text-align: center; overflow: hidden; z-index: 1; } .o-overlay-${c.name.toLowerCase()}::after { content:''; position: absolute; inset: 0; background: ${c.hex}; opacity: 0; transition: opacity .3s; z-index: -1; } .o-overlay-${c.name.toLowerCase()}:hover::after { opacity: 0.5; }`,
    (c) => `<div class="o-overlay-${c.name.toLowerCase()}">Hover Overlay</div>`
  );

  // ═══════════════════════════════════════════
  // 163-167: CLIP PATH
  // ═══════════════════════════════════════════
  addColorVariants("Circle", "Clip Path", "Intermediate", ["clip-path","shape"],
    (c) => `.cp-circle-${c.name.toLowerCase()} { background: ${c.hex}; color: #fff; padding: 1.2rem; clip-path: circle(40%); transition: clip-path .4s; text-align: center; font-weight: 600; } .cp-circle-${c.name.toLowerCase()}:hover { clip-path: circle(75%); }`,
    (c) => `<div class="cp-circle-${c.name.toLowerCase()}">Reveal</div>`
  );

  // ═══════════════════════════════════════════
  // 168-172: FILTER EFFECTS
  // ═══════════════════════════════════════════
  addColorVariants("Blur", "Filter Effects", "Beginner", ["filter","blur"],
    (c) => `.f-blur-${c.name.toLowerCase()} { background: ${c.hex}; padding: 1rem; border-radius: 8px; color: #fff; text-align: center; transition: filter .3s; cursor: pointer; } .f-blur-${c.name.toLowerCase()}:hover { filter: blur(2px); }`,
    (c) => `<div class="f-blur-${c.name.toLowerCase()}">Blur Me</div>`
  );

  // ═══════════════════════════════════════════
  // 173-177: MENU HOVER
  // ═══════════════════════════════════════════
  addColorVariants("Underline", "Menu Hover", "Beginner", ["menu","hover","underline"],
    (c) => `.m-under-${c.name.toLowerCase()} { position: relative; text-decoration: none; color: ${c.hex}; font-weight: 600; } .m-under-${c.name.toLowerCase()}::after { content: ''; position: absolute; width: 100%; height: 2px; bottom: 0; left: 0; background: ${c.hex}; transform: scaleX(0); transform-origin: bottom right; transition: transform 0.25s; } .m-under-${c.name.toLowerCase()}:hover::after { transform: scaleX(1); transform-origin: bottom left; }`,
    (c) => `<a href="#" onclick="event.preventDefault()" class="m-under-${c.name.toLowerCase()}">${c.name} Link</a>`
  );

  // ═══════════════════════════════════════════
  // 178-182: LINK HOVER
  // ═══════════════════════════════════════════
  addColorVariants("Highlight", "Link Hover", "Intermediate", ["link","hover","highlight"],
    (c) => `.l-hl-${c.name.toLowerCase()} { text-decoration: none; color: ${c.hex}; background: linear-gradient(to right, ${c.hex}44, ${c.hex}44) no-repeat right bottom / 0 100%; transition: background-size .3s; } .l-hl-${c.name.toLowerCase()}:hover { background-size: 100% 100%; background-position-x: left; }`,
    (c) => `<a href="#" onclick="event.preventDefault()" class="l-hl-${c.name.toLowerCase()}">${c.name} Highlight</a>`
  );

  // ═══════════════════════════════════════════
  // 183-187: LIST STYLING
  // ═══════════════════════════════════════════
  addColorVariants("Bullet", "List Styling", "Beginner", ["list","styling"],
    (c) => `.ls-bullet-${c.name.toLowerCase()} { list-style: none; padding: 0; margin: 0; } .ls-bullet-${c.name.toLowerCase()} li { position: relative; padding-left: 1.2rem; margin-bottom: 0.3rem; } .ls-bullet-${c.name.toLowerCase()} li::before { content: ''; position: absolute; left: 0; top: 0.5em; width: 6px; height: 6px; background: ${c.hex}; border-radius: 50%; }`,
    (c) => `<ul class="ls-bullet-${c.name.toLowerCase()}"><li>Item One</li><li>Item Two</li><li>Item Three</li></ul>`
  );

  // ═══════════════════════════════════════════
  // 188-192: SPECIAL (Glassmorphism etc.)
  // ═══════════════════════════════════════════
  addColorVariants("Glass", "Special", "Intermediate", ["glass","blur","special"],
    (c) => `.sp-glass-${c.name.toLowerCase()} { background: ${c.hex}22; backdrop-filter: blur(10px); border: 1px solid ${c.hex}44; padding: 1rem; border-radius: 12px; color: ${c.hex}; font-weight: 600; }`,
    (c) => `<div class="sp-glass-${c.name.toLowerCase()}">${c.name} Glass</div>`
  );

  // ═══════════════════════════════════════════
  // 193-198: Additional Unique Effects to hit exactly 198
  // ═══════════════════════════════════════════
  add("Flip Card", "Card Hover", "Advanced", ["card","hover","flip","3d"],
    `.c-flip-wrap { perspective: 600px; width: 100px; height: 60px; } .c-flip { width: 100%; height: 100%; background: #1e293b; border-radius: 10px; transition: transform .6s; transform-style: preserve-3d; color: #f1f5f9; display: flex; align-items: center; justify-content: center; font-weight: 600; } .c-flip-wrap:hover .c-flip { transform: rotateY(180deg); }`,
    `<div class="c-flip-wrap"><div class="c-flip">Flip Me</div></div>`
  );
  add("Neon Border", "Button Border", "Advanced", ["button","border","neon"],
    `.b-neon-border { padding: 10px 24px; background: transparent; color: #06b6d4; border: 2px solid #06b6d4; cursor: pointer; font-weight: 600; border-radius: 8px; animation: bNeonBorder 2s infinite alternate; } @keyframes bNeonBorder { from { box-shadow: 0 0 5px #06b6d4, inset 0 0 5px #06b6d4; } to { box-shadow: 0 0 20px #06b6d4, inset 0 0 10px #06b6d4; } }`,
    `<button class="b-neon-border">Neon</button>`
  );
  add("Ripple Slide", "Button Slide", "Advanced", ["button","slide","ripple"],
    `.b-ripple-slide { padding: 10px 24px; background: #10b981; color: #fff; border: none; cursor: pointer; font-weight: 600; border-radius: 8px; position: relative; overflow: hidden; } .b-ripple-slide::after { content:''; position: absolute; top: 50%; left: 50%; width: 5px; height: 5px; background: rgba(255,255,255,.4); border-radius: 50%; transform: translate(-50%,-50%) scale(0); transition: transform .5s; } .b-ripple-slide:hover::after { transform: translate(-50%,-50%) scale(40); }`,
    `<button class="b-ripple-slide">Ripple</button>`
  );
  add("Scale Reveal", "Card Reveal", "Advanced", ["card","reveal","scale"],
    `.c-scale-reveal { position: relative; background: #f59e0b; border-radius: 10px; overflow: hidden; padding: 1.2rem; color: #fff; text-align: center; } .c-scale-reveal .overlay { position: absolute; inset: 0; background: rgba(0,0,0,.85); transform: scale(0); border-radius: 50%; transition: transform .4s; display: flex; align-items: center; justify-content: center; font-weight: 600; } .c-scale-reveal:hover .overlay { transform: scale(4); }`,
    `<div class="c-scale-reveal"><div>Base</div><div class="overlay">Scaled!</div></div>`
  );
  add("Floating Shadow", "Box Shadow", "Intermediate", ["shadow","float"],
    `.s-float-shadow { width: 60px; height: 60px; background: #fff; border-radius: 8px; transition: transform .3s, box-shadow .3s; } .s-float-shadow:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,.2); }`,
    `<div class="s-float-shadow"></div>`
  );
  add("Neumorphism", "Special", "Intermediate", ["shadow","neumorphism","special"],
    `.sp-neumorphism { background: #e0e5ec; padding: 1.2rem; border-radius: 12px; box-shadow: 9px 9px 16px #b8bec7, -9px -9px 16px #ffffff; color: #333; text-align: center; font-weight: 600; }`,
    `<div class="sp-neumorphism">Neumorphism</div>`
  );

  return effects.slice(0, 198); // Ensure exactly 198
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
    if (el) el.innerHTML = `<style>${css}</style>`;
  },

  renderCategoryFilters() {
    const container = document.getElementById('categoryFilters');
    if (!container) return;
    const cats = ["All Effects", ...CATEGORIES];
    container.innerHTML = cats.map(c => 
      `<button class="filter-pill ${c === this.activeCategory ? 'active' : ''}" data-cat="${c}">${c}</button>`
    ).join('');
  },

  bindEvents() {
    // Category filter
    const catContainer = document.getElementById('categoryFilters');
    if (catContainer) {
      catContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-pill')) {
          this.activeCategory = e.target.dataset.cat;
          this.updateFilters();
        }
      });
    }

    // Difficulty filter
    const diffContainer = document.getElementById('difficultyFilters');
    if (diffContainer) {
      diffContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-pill')) {
          this.activeDifficulty = e.target.dataset.diff;
          this.updateFilters();
        }
      });
    }

    // Search
    const searchInput = document.getElementById('effectsSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.updateFilters();
      });
    }

    // Random
    const randomBtn = document.getElementById('randomEffectBtn');
    if (randomBtn) {
      randomBtn.addEventListener('click', () => {
        const randEffect = this.effects[Math.floor(Math.random() * this.effects.length)];
        this.activeCategory = "All Effects";
        this.activeDifficulty = "all";
        this.searchQuery = "";
        if (searchInput) searchInput.value = "";
        this.updateFilters();
        
        setTimeout(() => {
          const el = document.getElementById(`effect-${randEffect.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('highlight-pulse');
            setTimeout(() => el.classList.remove('highlight-pulse'), 1000);
          }
        }, 100);
      });
    }

    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (searchInput) searchInput.focus();
      }
    });

    // Reset
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.activeCategory = "All Effects";
        this.activeDifficulty = "all";
        this.searchQuery = "";
        if (searchInput) searchInput.value = "";
        this.updateFilters();
      });
    }

    // Code Tabs & Copy Delegation on the Grid
    const grid = document.getElementById('effectsGrid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const card = e.target.closest('.effect-card');
        if (!card) return;

        // Tab switch
        if (e.target.classList.contains('effect-tab-btn')) {
          const tab = e.target.dataset.tab;
          const id = card.dataset.id;
          
          e.target.closest('.tab-bar').querySelectorAll('.effect-tab-btn').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
          
          const codeBlock = card.querySelector('.effect-code-block');
          const effect = this.effects.find(ef => ef.id == id);
          if (effect && codeBlock) {
            codeBlock.textContent = effect[tab] || "/* Not available for this effect */";
          }
        }
        
        // Copy button
        if (e.target.closest('.copy-effect-btn')) {
          const codeBlock = card.querySelector('.effect-code-block');
          if (codeBlock) {
            navigator.clipboard.writeText(codeBlock.textContent).then(() => {
              const btn = e.target.closest('.copy-effect-btn');
              const icon = btn.querySelector('i');
              if (icon) {
                icon.className = 'fas fa-check';
                setTimeout(() => icon.className = 'fas fa-copy', 1500);
              }
              // Use Devpalettes global toast if available
              if (window.Devpalettes && window.Devpalettes.Toast) {
                window.Devpalettes.Toast.show('Code copied to clipboard!', 'success');
              }
            });
          }
        }
      });
    }
  },

  updateFilters() {
    // Update UI Pills
    const catContainer = document.getElementById('categoryFilters');
    if (catContainer) {
      catContainer.querySelectorAll('.filter-pill').forEach(p => {
        p.classList.toggle('active', p.dataset.cat === this.activeCategory);
      });
    }
    const diffContainer = document.getElementById('difficultyFilters');
    if (diffContainer) {
      diffContainer.querySelectorAll('.filter-pill').forEach(p => {
        p.classList.toggle('active', p.dataset.diff === this.activeDifficulty);
      });
    }

    // Filter Logic
    this.filteredEffects = this.effects.filter(e => {
      const matchCat = this.activeCategory === "All Effects" || e.category === this.activeCategory;
      const matchDiff = this.activeDifficulty === "all" || e.difficulty === this.activeDifficulty;
      const matchSearch = !this.searchQuery || 
                         e.name.toLowerCase().includes(this.searchQuery) || 
                         e.tags.some(t => t.includes(this.searchQuery)) ||
                         e.category.toLowerCase().includes(this.searchQuery);
      return matchCat && matchDiff && matchSearch;
    });

    // Update Count & Reset visibility
    const countEl = document.getElementById('effectCount');
    if (countEl) countEl.textContent = `Showing ${this.filteredEffects.length} effects`;
    
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
      resetBtn.classList.toggle('hidden', (this.activeCategory === "All Effects" && this.activeDifficulty === "all" && !this.searchQuery));
    }
    
    this.renderEffects();
  },

  renderEffects() {
    const grid = document.getElementById('effectsGrid');
    const noRes = document.getElementById('noResults');
    if (!grid) return;

    if (this.filteredEffects.length === 0) {
      grid.innerHTML = '';
      if (noRes) noRes.classList.remove('hidden');
      return;
    }
    if (noRes) noRes.classList.add('hidden');

    grid.innerHTML = this.filteredEffects.map(effect => {
      const diffClass = effect.difficulty === 'Beginner' ? 'diff-beginner' : effect.difficulty === 'Intermediate' ? 'diff-intermediate' : 'diff-advanced';
      
      return `
      <div id="effect-${effect.id}" class="effect-card glass-card overflow-hidden flex flex-col transition-all hover:shadow-lg" data-id="${effect.id}">
        <!-- Preview -->
        <div class="preview-box border-b border-slate-200 dark:border-slate-700/50">
          ${effect.html}
        </div>
        
        <!-- Info -->
        <div class="p-4 flex-1 flex flex-col">
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-bold text-sm text-slate-800 dark:text-slate-100">${escHtml(effect.name)}</h3>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${diffClass} whitespace-nowrap">${effect.difficulty}</span>
          </div>
          <div class="flex flex-wrap gap-1 mb-3">
            ${effect.tags.slice(0, 3).map(t => `<span class="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">#${t}</span>`).join('')}
          </div>
          
          <!-- Code Area -->
          <div class="mt-auto rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/50">
            <div class="tab-bar flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/50 px-2">
              <div class="flex">
                <button class="effect-tab-btn active" data-tab="html">HTML</button>
                <button class="effect-tab-btn" data-tab="css">CSS</button>
                ${effect.js ? `<button class="effect-tab-btn" data-tab="js">JS</button>` : ''}
                <button class="effect-tab-btn" data-tab="react">React</button>
              </div>
              <button class="copy-effect-btn text-slate-400 hover:text-emerald-500 p-1 text-xs transition-colors" aria-label="Copy code">
                <i class="fas fa-copy"></i>
              </button>
            </div>
            <pre class="effect-code-block">${escHtml(effect.html)}</pre>
          </div>
        </div>
      </div>`;
    }).join('');
  }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => CssEffectsApp.init());
