/* ============================================
   Devpalettes - Color Converter
   Accessibility & SEO improvements applied
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.Devpalettes) return;

  const { ColorUtils, Clipboard } = window.Devpalettes;

  // State
  let currentColor = {
    hex: '#10b981',
    rgb: { r: 16, g: 185, b: 129 },
    hsl: { h: 160, s: 84, l: 39 }
  };

  // Elements
  const hexInput = document.getElementById('hex-input');
  const rgbR = document.getElementById('rgb-r');
  const rgbG = document.getElementById('rgb-g');
  const rgbB = document.getElementById('rgb-b');
  const rgbOutput = document.getElementById('rgb-output');
  const hslH = document.getElementById('hsl-h');
  const hslS = document.getElementById('hsl-s');
  const hslL = document.getElementById('hsl-l');
  const hslOutput = document.getElementById('hsl-output');
  const colorPreview = document.getElementById('color-preview');
  const colorPicker = document.getElementById('color-wheel');
  const harmoniesContainer = document.getElementById('harmonies');
  const toastLiveRegion = document.getElementById('toast-live-region');

  // Accessibility: Announce copy to screen readers
  function announceCopy(text) {
    if (toastLiveRegion) {
      toastLiveRegion.textContent = text;
    }
  }

  // Update from HEX
  function updateFromHex(hex, source) {
    if (source === undefined) source = 'input';
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return;

    currentColor.hex = hex;
    var rgb = ColorUtils.hexToRgb(hex);
    currentColor.rgb = rgb;
    currentColor.hsl = ColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);

    updateUI(source);
  }

  // Update from RGB
  function updateFromRGB(source) {
    if (source === undefined) source = 'input';
    var r = parseInt(rgbR.value) || 0;
    var g = parseInt(rgbG.value) || 0;
    var b = parseInt(rgbB.value) || 0;

    currentColor.rgb = {
      r: Math.max(0, Math.min(255, r)),
      g: Math.max(0, Math.min(255, g)),
      b: Math.max(0, Math.min(255, b))
    };

    currentColor.hex = ColorUtils.rgbToHex(currentColor.rgb.r, currentColor.rgb.g, currentColor.rgb.b);
    currentColor.hsl = ColorUtils.rgbToHsl(currentColor.rgb.r, currentColor.rgb.g, currentColor.rgb.b);

    updateUI(source);
  }

  // Update from HSL
  function updateFromHSL(source) {
    if (source === undefined) source = 'input';
    var h = parseInt(hslH.value) || 0;
    var s = parseInt(hslS.value) || 0;
    var l = parseInt(hslL.value) || 0;

    currentColor.hsl = {
      h: Math.max(0, Math.min(360, h)),
      s: Math.max(0, Math.min(100, s)),
      l: Math.max(0, Math.min(100, l))
    };

    var rgb = ColorUtils.hslToRgb(currentColor.hsl.h, currentColor.hsl.s, currentColor.hsl.l);
    currentColor.rgb = rgb;
    currentColor.hex = ColorUtils.rgbToHex(rgb.r, rgb.g, rgb.b);

    updateUI(source);
  }

  // Update UI
  function updateUI(source) {
    if (source !== 'hex') {
      hexInput.value = currentColor.hex;
    }
    if (source !== 'rgb') {
      rgbR.value = currentColor.rgb.r;
      rgbG.value = currentColor.rgb.g;
      rgbB.value = currentColor.rgb.b;
    }
    if (source !== 'hsl') {
      hslH.value = currentColor.hsl.h;
      hslS.value = currentColor.hsl.s;
      hslL.value = currentColor.hsl.l;
    }
    if (source !== 'picker') {
      colorPicker.value = currentColor.hex;
    }

    // Update outputs
    rgbOutput.textContent = 'rgb(' + currentColor.rgb.r + ', ' + currentColor.rgb.g + ', ' + currentColor.rgb.b + ')';
    hslOutput.textContent = 'hsl(' + currentColor.hsl.h + ', ' + currentColor.hsl.s + '%, ' + currentColor.hsl.l + '%)';

    // Update preview
    colorPreview.style.backgroundColor = currentColor.hex;
    // Accessibility: Update preview label
    colorPreview.setAttribute('aria-label', 'Color preview: ' + currentColor.hex);

    // Update harmonies
    renderHarmonies();
  }

  // Calculate color harmonies
  function renderHarmonies() {
    var h = currentColor.hsl.h;
    var s = currentColor.hsl.s;
    var l = currentColor.hsl.l;

    var harmonies = [
      { name: 'Complementary', colors: [currentColor.hex, ColorUtils.hslToHex((h + 180) % 360, s, l)] },
      { name: 'Analogous', colors: [
        currentColor.hex,
        ColorUtils.hslToHex((h + 30) % 360, s, l),
        ColorUtils.hslToHex((h + 330) % 360, s, l)
      ]},
      { name: 'Triadic', colors: [
        currentColor.hex,
        ColorUtils.hslToHex((h + 120) % 360, s, l),
        ColorUtils.hslToHex((h + 240) % 360, s, l)
      ]},
      { name: 'Split Comp', colors: [
        currentColor.hex,
        ColorUtils.hslToHex((h + 150) % 360, s, l),
        ColorUtils.hslToHex((h + 210) % 360, s, l)
      ]},
      { name: 'Tetradic', colors: [
        currentColor.hex,
        ColorUtils.hslToHex((h + 90) % 360, s, l),
        ColorUtils.hslToHex((h + 180) % 360, s, l),
        ColorUtils.hslToHex((h + 270) % 360, s, l)
      ]},
      { name: 'Square', colors: [
        currentColor.hex,
        ColorUtils.hslToHex((h + 90) % 360, s, l),
        ColorUtils.hslToHex((h + 180) % 360, s, l),
        ColorUtils.hslToHex((h + 270) % 360, s, l)
      ]},
      { name: 'Lighter', colors: [
        ColorUtils.hslToHex(h, s, Math.min(100, l + 20)),
        ColorUtils.hslToHex(h, s, Math.min(100, l + 40)),
        ColorUtils.hslToHex(h, s, Math.min(100, l + 60))
      ]},
      { name: 'Darker', colors: [
        ColorUtils.hslToHex(h, s, Math.max(0, l - 20)),
        ColorUtils.hslToHex(h, s, Math.max(0, l - 40)),
        ColorUtils.hslToHex(h, s, Math.max(0, l - 60))
      ]}
    ];

    harmoniesContainer.innerHTML = '';

    harmonies.forEach(function(harmony) {
      var card = document.createElement('div');
      card.className = 'glass-card p-4';

      // Build swatch HTML with accessibility attributes
      var swatchesHtml = harmony.colors.map(function(c, i) {
        return '<div class="flex-1 h-12 cursor-pointer hover:opacity-80 transition-opacity" ' +
               'style="background: ' + c + '" ' +
               'role="button" ' +
               'tabindex="0" ' +
               'aria-label="' + harmony.name + ' color ' + (i + 1) + ': ' + c + '. Press to copy." ' +
               'title="' + c + '" ' +
               'data-color="' + c + '">' +
               '</div>';
      }).join('');

      card.innerHTML =
        '<p class="text-sm font-medium mb-2">' + harmony.name + '</p>' +
        '<div class="flex rounded-lg overflow-hidden">' + swatchesHtml + '</div>';

      // Accessibility: Attach keyboard-accessible copy handlers to swatches
      var swatches = card.querySelectorAll('[data-color]');
      swatches.forEach(function(swatch) {
        var color = swatch.getAttribute('data-color');
        swatch.addEventListener('click', function() {
          Clipboard.copy(color, 'Copied ' + color);
          announceCopy('Copied ' + color);
        });
        swatch.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            Clipboard.copy(color, 'Copied ' + color);
            announceCopy('Copied ' + color);
          }
        });
      });

      harmoniesContainer.appendChild(card);
    });
  }

  // Event listeners
  hexInput.addEventListener('input', function(e) {
    var val = e.target.value;
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      updateFromHex(val, 'hex');
    }
  });

  [rgbR, rgbG, rgbB].forEach(function(input) {
    input.addEventListener('input', function() { updateFromRGB('rgb'); });
  });

  [hslH, hslS, hslL].forEach(function(input) {
    input.addEventListener('input', function() { updateFromHSL('hsl'); });
  });

  colorPicker.addEventListener('input', function(e) {
    updateFromHex(e.target.value, 'picker');
  });

  // Copy buttons — with aria-live announcements
  document.getElementById('copy-hex')?.addEventListener('click', function() {
    Clipboard.copy(currentColor.hex, 'HEX copied!');
    announceCopy('HEX code copied: ' + currentColor.hex);
  });

  document.getElementById('copy-rgb')?.addEventListener('click', function() {
    Clipboard.copy(rgbOutput.textContent, 'RGB copied!');
    announceCopy('RGB value copied: ' + rgbOutput.textContent);
  });

  document.getElementById('copy-hsl')?.addEventListener('click', function() {
    Clipboard.copy(hslOutput.textContent, 'HSL copied!');
    announceCopy('HSL value copied: ' + hslOutput.textContent);
  });

  // Initialize
  updateFromHex('#10b981');
});
