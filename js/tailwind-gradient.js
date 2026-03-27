// Tailwind Gradient Logic
document.addEventListener('DOMContentLoaded', () => {
    const preview = document.getElementById('tw-preview');
    const output = document.getElementById('tw-output');
    const fromInput = document.getElementById('tw-from');
    const toInput = document.getElementById('tw-to');
    const dirBtns = document.querySelectorAll('.tw-dir-btn');
    const randomBtn = document.getElementById('random-tw-btn');
    const copyBtn = document.getElementById('copy-tw-main-btn');

    let direction = 'to-r';

    function update() {
        const from = fromInput.value;
        const to = toInput.value;
        
        // Map standard hex to closest Tailwind color name if needed, 
        // but for simplicity we use arbitrary values here
        const cls = `bg-gradient-to-${direction} from-[${from}] to-[${to}]`;
        
        // Apply to preview
        preview.className = `w-full aspect-video rounded-2xl shadow-2xl flex items-center justify-center text-white font-bold text-xl transition-all ${cls}`;
        
        output.textContent = `class="${cls}"`;
    }

    dirBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dirBtns.forEach(b => {
                b.classList.remove('bg-emerald-500', 'text-white');
                b.classList.add('bg-slate-200', 'dark:bg-slate-700');
            });
            btn.classList.add('bg-emerald-500', 'text-white');
            btn.classList.remove('bg-slate-200', 'dark:bg-slate-700');
            direction = btn.dataset.val;
            update();
        });
    });

    fromInput.addEventListener('input', update);
    toInput.addEventListener('input', update);

    randomBtn.addEventListener('click', () => {
        fromInput.value = Devpalettes.ColorUtils.randomHex();
        toInput.value = Devpalettes.ColorUtils.randomHex();
        update();
    });

    copyBtn.addEventListener('click', () => {
        Devpalettes.Clipboard.copy(output.textContent, 'Tailwind classes copied!');
    });

    update();
});
