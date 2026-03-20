// Preload theme class as early as possible to prevent FOUC.
(() => {
  try {
    const key = 'colorpallates-theme';
    const savedTheme = localStorage.getItem(key);
    const systemPrefersDark =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    if (shouldUseDark) document.documentElement.classList.add('dark');
  } catch {
    // Ignore (e.g., storage blocked)
  }
})();
