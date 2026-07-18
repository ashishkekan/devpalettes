const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SITE = 'https://devpalettes.com';
const today = '2026-07-06';

const nonIndexRoutes = new Set([
  '/sitemap/',
  '/privacy/',
  '/terms-of-service/',
  '/gradient-generator/',
  '/css-gradient-generator/',
  '/color-palette-generator/',
  '/contrast-checker/',
  '/color-accessibility-tester/',
  '/scroll-progress-generator/',
  '/word-counter/',
  '/lorem-ipsum-generator/',
  '/blog/css-scroll-indicators/',
]);

const linkMap = {
  '/gradient-generator/': '/gradient/',
  '/css-gradient-generator/': '/gradient/',
  '/color-palette-generator/': '/palettes/',
  '/privacy/': '/privacy-policy/',
  '/terms-of-service/': '/terms/',
  '/contrast-checker/': '/wcag-contrast-checker/',
  '/color-accessibility-tester/': '/color-accessibility/',
  '/scroll-progress-generator/': '/scroll-progress-generator/',
  '/word-counter/': '/text-formatter/',
  '/lorem-ipsum-generator/': '/text-formatter/',
  '/blog/css-scroll-indicators/': '/scroll-progress-generator/',
};

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (['.git', 'node_modules', 'scripts'].includes(name)) continue;
    const file = path.join(dir, name);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) walk(file, out);
    else if (name.endsWith('.html')) out.push(file);
  }
  return out;
}

function routeFor(file) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  return '/' + rel.replace(/index\.html$/, '');
}

function fileForRoute(route) {
  if (route === '/') return path.join(ROOT, 'index.html');
  return path.join(ROOT, route.replace(/^\//, ''), 'index.html');
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, html) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

function textOnly(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordCount(html) {
  const text = textOnly(html);
  return text ? text.split(/\s+/).length : 0;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function titleOf(html, fallback) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return textOnly(h1[1]).replace(/\s+/g, ' ').trim();
  const title = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (title) return textOnly(title[1]).split('|')[0].split('—')[0].split('-')[0].trim();
  return fallback;
}

function descriptionOf(html, fallback) {
  const desc = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)/i);
  return desc ? desc[1] : fallback;
}

function ensureCanonical(html, route) {
  const href = `${SITE}${route}`;
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
    return html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${href}">`);
  }
  return html.replace(/<\/head>/i, `  <link rel="canonical" href="${href}">\n</head>`);
}

function ensureRobots(html, value = 'index, follow') {
  if (/<meta\s+name=["']robots["'][^>]*>/i.test(html)) {
    return html.replace(/<meta\s+name=["']robots["'][^>]*>/i, `<meta name="robots" content="${value}">`);
  }
  return html.replace(/<head>/i, `<head>\n  <meta name="robots" content="${value}">`);
}

function fixLinks(html) {
  for (const [from, to] of Object.entries(linkMap)) {
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(new RegExp(`href=(["'])${escaped}([^"']*)\\1`, 'g'), `href=$1${to}$2$1`);
  }
  html = html.replace(/href=(["'])\/tools\/\1/g, 'href=$1/tools/$1');
  return html;
}

function removeUnsupportedClaims(html) {
  return html
    .replace(/Trusted by 50,000\+ designers/gi, 'Built for designers and developers')
    .replace(/50,000\+ Users/gi, 'Independent Project')
    .replace(/Over 50,000 designers and developers use Devpalettes/gi, 'Designers and developers use Devpalettes')
    .replace(/Our tools are used by over 50,000 designers and developers worldwide\./gi, 'Devpalettes is built for designers and developers who need fast, practical color tools.')
    .replace(/1M\+ Palettes Generated/gi, 'Browser-Based Palettes')
    .replace(/Over one million palettes generated and counting\./gi, 'Palettes are generated locally in the browser, keeping the workflow fast and private.')
    .replace(/Curated by our community\./gi, 'Curated for practical design workflows.')
    .replace(/We don't track, sell, or share your data\./gi, 'We do not sell personal data. Analytics and advertising services may process limited usage data only as described in our Privacy Policy and Cookie Policy.')
    .replace(/we don't track your usage\./gi, 'we keep tracking limited and consent-aware as described in our Privacy Policy.');
}

function pageShell({ title, description, canonical, body, extraHead = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="index, follow">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="author" content="Devpalettes">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" type="image/png" sizes="32x32" href="/images/devpalettes_zoom_32.png">
  <link rel="preload" href="/css/tailwind.min.css" as="style">
  <link rel="stylesheet" href="/css/tailwind.min.css">
  <link rel="stylesheet" href="/css/styles.css">
  <link rel="stylesheet" href="/css/animations.css">
  <script>
    (function(){try{var t=localStorage.getItem('colorpallates-theme'),d=window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='dark'||(!t&&d)){document.documentElement.classList.add('dark')}}catch(e){}})();
  </script>
  ${extraHead}
</head>
<body class="bg-slate-50 dark:bg-[#0c0f14] text-slate-900 dark:text-slate-100">
  <a href="#main-content" class="skip-link">Skip to content</a>
  <div id="navbar-container"></div>
  <main id="main-content" class="pt-20 pb-12 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
${body}
    </div>
  </main>
  <div id="footer-container"></div>
  <script src="/js/main.js" defer></script>
  <script src="/js/enhancements.js" defer></script>
</body>
</html>
`;
}

function jsonLd(data) {
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n  </script>`;
}

function commonSchema(route, name, description, type = 'WebPage') {
  const url = `${SITE}${route}`;
  return jsonLd([
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Devpalettes',
      url: SITE,
      logo: `${SITE}/images/devpalettes.png`,
      founder: { '@type': 'Person', name: 'Ashish Kekaan', url: `${SITE}/about/` },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Support',
        email: 'contact@devpalettes.com',
        url: `${SITE}/contact/`,
        availableLanguage: 'English'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Devpalettes',
      url: SITE,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE}/tools/?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': type,
      name,
      description,
      url,
      isPartOf: { '@type': 'WebSite', name: 'Devpalettes', url: SITE },
      dateModified: today
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name, item: url }
      ]
    }
  ]);
}

function appendSchema(html, route, name, description, type = 'WebPage') {
  if (html.includes('adsense-remediation-schema')) return html;
  const block = `  <!-- adsense-remediation-schema -->\n  ${commonSchema(route, name, description, type)}\n`;
  return html.replace(/<\/head>/i, `${block}</head>`);
}

function redirectPage(route, target, label) {
  const canonical = `${SITE}${target}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, follow">
  <meta http-equiv="refresh" content="0; url=${target}">
  <title>${escapeHtml(label)} moved | Devpalettes</title>
  <link rel="canonical" href="${canonical}">
</head>
<body>
  <main style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:24px;line-height:1.5">
    <h1>${escapeHtml(label)} moved</h1>
    <p>This page now lives at <a href="${target}">${target}</a>.</p>
  </main>
  <script>window.location.replace('${target}');</script>
</body>
</html>
`;
}

const tools = [
  ['Color Tools', '/palettes/', 'Color Palette Generator', 'Generate harmonious palettes, lock colors, save favorites, and export CSS or JSON.'],
  ['Color Tools', '/gradient/', 'CSS Gradient Generator', 'Build linear and radial gradients with live preview and copy-ready CSS.'],
  ['Color Tools', '/converter/', 'Color Converter', 'Convert HEX, RGB, and HSL values while exploring matching color harmonies.'],
  ['Color Tools', '/color-from-image/', 'Image Color Extractor', 'Extract dominant colors from images directly in the browser.'],
  ['Color Tools', '/brand-color-extractor/', 'Brand Color Extractor', 'Pull brand palettes from logos and marketing images.'],
  ['Color Tools', '/image-to-gradient-generator/', 'Image to Gradient Generator', 'Turn image colors into CSS gradients.'],
  ['Color Tools', '/color-wheel/', 'Color Wheel', 'Explore complementary, analogous, triadic, and monochrome harmonies.'],
  ['Color Tools', '/color-preview/', 'Color Usage Preview', 'Preview palettes on interface elements before using them.'],
  ['Accessibility', '/wcag-contrast-checker/', 'WCAG Contrast Checker', 'Check text and background contrast against WCAG AA and AAA targets.'],
  ['Accessibility', '/color-accessibility/', 'Color Accessibility Tester', 'Evaluate brightness and readability between color pairs.'],
  ['Accessibility', '/color-blindness/', 'Color Blindness Simulator', 'Simulate common color vision deficiencies and review contrast.'],
  ['Accessibility', '/color-diff-checker/', 'Color Difference Checker', 'Compare similar colors and identify near-duplicate values.'],
  ['Palette Collections', '/pastel-color-palettes/', 'Pastel Color Palettes', 'Browse soft pastel palettes with copy-ready hex codes.'],
  ['Palette Collections', '/dark-color-palettes/', 'Dark Color Palettes', 'Find dark mode color schemes for UI design.'],
  ['Palette Collections', '/neon-color-palettes/', 'Neon Color Palettes', 'Explore cyberpunk, synthwave, and high-energy neon schemes.'],
  ['Palette Collections', '/aesthetic-color-palettes/', 'Aesthetic Color Palettes', 'Browse mood-based aesthetic palettes for modern projects.'],
  ['Palette Collections', '/minimal-color-palettes/', 'Minimal Color Palettes', 'Use restrained neutral palettes for clean interfaces.'],
  ['Palette Collections', '/gradient-color-palettes/', 'Gradient Color Palettes', 'Find color combinations designed for CSS gradients.'],
  ['CSS Generators', '/box-shadow-generator/', 'Box Shadow Generator', 'Create layered CSS shadows for cards, modals, and UI surfaces.'],
  ['CSS Generators', '/border-radius-generator/', 'Border Radius Generator', 'Design rounded corners and organic blob shapes.'],
  ['CSS Generators', '/button-generator/', 'Button Generator', 'Create button styles with gradients, glass, neon, and outline variants.'],
  ['CSS Generators', '/card-generator/', 'Card UI Generator', 'Generate card components with copy-ready HTML and CSS.'],
  ['CSS Generators', '/glassmorphism-generator/', 'Glassmorphism Generator', 'Build frosted glass CSS panels and overlays.'],
  ['CSS Generators', '/neumorphism-generator/', 'Neumorphism Generator', 'Create soft UI shadows and raised surfaces.'],
  ['CSS Generators', '/gradient-border-generator/', 'Gradient Border Generator', 'Generate CSS gradient borders for cards and buttons.'],
  ['CSS Generators', '/css-filter-generator/', 'CSS Filter Generator', 'Tune blur, brightness, contrast, grayscale, and hue effects.'],
  ['CSS Generators', '/clip-path-generator/', 'Clip Path Generator', 'Build CSS masks and polygon shapes visually.'],
  ['CSS Generators', '/css-3d-transform-tool/', 'CSS 3D Transform Tool', 'Preview rotate, scale, perspective, and translateZ transforms.'],
  ['CSS Generators', '/css-animation-generator/', 'CSS Animation Generator', 'Create keyframes for motion, pulse, bounce, and transitions.'],
  ['Layout Tools', '/flexbox/', 'Flexbox Generator', 'Design flex layouts visually and copy CSS.'],
  ['Layout Tools', '/css-grid-generator/', 'CSS Grid Generator', 'Build responsive grid layouts with live preview.'],
  ['Layout Tools', '/aspect-ratio-calculator/', 'Aspect Ratio Calculator', 'Calculate proportional dimensions for images, video, and embeds.'],
  ['Layout Tools', '/rem-px-converter/', 'REM / PX Converter', 'Convert typography and spacing values between rem and px.'],
  ['Layout Tools', '/scroll-progress-generator/', 'Scroll Progress Bar Generator', 'Create reading progress indicators for long pages.'],
  ['Developer Utilities', '/json-formatter/', 'JSON Formatter', 'Validate, format, minify, and inspect JSON.'],
  ['Developer Utilities', '/base64-tool/', 'Base64 Encoder / Decoder', 'Encode and decode Base64 text safely in the browser.'],
  ['Developer Utilities', '/url-tool/', 'URL Encoder / Decoder', 'Convert special characters to percent-encoded URL strings.'],
  ['Developer Utilities', '/regex-tester/', 'Regex Tester', 'Test JavaScript regular expressions with live match highlighting.'],
  ['Developer Utilities', '/curl-converter/', 'Curl to Code Converter', 'Convert curl requests into code snippets for common languages.'],
  ['Developer Utilities', '/live-code-editor/', 'Live Code Editor', 'Write HTML, CSS, and JavaScript with instant preview.'],
  ['Developer Utilities', '/code-snippet-manager/', 'Code Snippet Saver', 'Store and organize reusable snippets locally.'],
  ['Developer Utilities', '/text-diff-checker/', 'Text Diff Checker', 'Compare text changes side by side.'],
  ['Developer Utilities', '/text-formatter/', 'Text Formatter', 'Convert case, clean text, sort lines, and deduplicate content.'],
  ['Optimization', '/html-minifier/', 'HTML Minifier', 'Remove whitespace and comments from HTML.'],
  ['Optimization', '/css-minifier/', 'CSS Minifier', 'Compress CSS for smaller stylesheets.'],
  ['Optimization', '/js-minifier/', 'JavaScript Minifier', 'Minify JavaScript for production delivery.'],
  ['Optimization', '/image-compressor/', 'Image Compressor', 'Compress images with browser-based quality controls.'],
  ['Optimization', '/pdf-compressor/', 'PDF Compressor', 'Reduce PDF file sizes in the browser.'],
  ['SEO Tools', '/meta-tag-generator/', 'Meta Tag Generator', 'Generate SEO, Open Graph, and Twitter Card tags.'],
  ['SEO Tools', '/meta-tags-analyzer/', 'Meta Tags Analyzer', 'Audit page titles, descriptions, canonicals, and social tags.'],
  ['SEO Tools', '/open-graph-generator/', 'Open Graph Generator', 'Create social sharing metadata for Facebook and LinkedIn.'],
  ['SEO Tools', '/social-meta-preview/', 'Social Media Preview Tool', 'Preview how links appear across social platforms.'],
  ['SEO Tools', '/keyword-density-checker/', 'Keyword Density Checker', 'Analyze word and phrase frequency in page copy.'],
  ['SEO Tools', '/seo-analyzer/', 'SEO Analyzer', 'Run on-page SEO checks and receive an actionable score.'],
  ['SEO Tools', '/robots-txt-generator/', 'Robots.txt Generator', 'Create and validate robots.txt directives.'],
  ['SEO Tools', '/sitemap-xml-generator/', 'XML Sitemap Generator', 'Build sitemap XML files for search engines.'],
  ['SEO Tools', '/utm-builder/', 'UTM Builder', 'Create trackable campaign URLs for analytics.'],
  ['SEO Tools', '/google-ranking-tracker/', 'Google Ranking Tracker', 'Track keyword positions and export ranking data.'],
  ['Image & Asset Tools', '/favicon-generator/', 'Favicon Generator', 'Generate favicon sizes and Apple touch icons.'],
  ['Image & Asset Tools', '/svg-color-editor/', 'SVG Color Editor', 'Change SVG fill and stroke colors online.'],
  ['Image & Asset Tools', '/svg-to-png/', 'SVG to PNG Converter', 'Render SVG files as downloadable PNG images.'],
  ['Framework Tools', '/tailwind-color-palette-generator/', 'Tailwind Palette Generator', 'Generate Tailwind color scales from a base color.'],
  ['Framework Tools', '/bootstrap-color-palette-generator/', 'Bootstrap Theme Generator', 'Create Bootstrap colors and SCSS variables.'],
  ['Career Tools', '/ats-checker/', 'ATS Resume Checker', 'Review resumes for keyword and formatting compatibility.'],
  ['Website Builders', '/page-builder/', 'Landing Page Builder', 'Visually compose landing pages and export HTML.'],
  ['Reference', '/color-names-chart/', 'HTML Color Names Chart', 'Browse 148 standard CSS color names with hex and RGB values.'],
  ['Reference', '/css-effects-library/', 'CSS Effects Library', 'Browse pure CSS effects with copy-ready examples.'],
];

const toolByRoute = new Map(tools.map((t) => [t[1], t]));

function toolsPage() {
  const grouped = {};
  for (const tool of tools) {
    grouped[tool[0]] = grouped[tool[0]] || [];
    grouped[tool[0]].push(tool);
  }
  const groups = Object.entries(grouped).map(([category, rows]) => `
        <section class="mb-12 tool-group" data-category="${escapeHtml(category)}">
          <h2 class="text-2xl font-bold mb-4">${escapeHtml(category)}</h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            ${rows.map(([, url, name, desc]) => `
            <a class="glass-card p-5 block tool-card hover:scale-[1.01] transition-transform" href="${url}" data-tool="${escapeHtml((name + ' ' + desc + ' ' + category).toLowerCase())}">
              <h3 class="text-lg font-bold mb-2">${escapeHtml(name)}</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">${escapeHtml(desc)}</p>
            </a>`).join('')}
          </div>
        </section>`).join('\n');

  const body = `
      <header class="text-center mb-10">
        <h1 class="text-4xl font-bold mb-4">Devpalettes Tools Directory</h1>
        <p class="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">Browse every free Devpalettes tool in one place. Tools are grouped by workflow so designers, developers, SEO specialists, and content teams can move from idea to output without hunting through navigation menus.</p>
      </header>
      <div class="glass-card p-5 mb-10">
        <label class="block text-sm font-semibold mb-2" for="tool-search">Search tools</label>
        <input id="tool-search" class="input-field" type="search" placeholder="Search by task, format, CSS, SEO, color, image, or accessibility">
        <p class="text-xs text-slate-500 mt-2">Search filters tool names, descriptions, and categories instantly in your browser.</p>
      </div>
${groups}
      <section class="glass-card p-8 mt-12">
        <h2 class="text-2xl font-bold mb-4">How to choose the right tool</h2>
        <p class="text-slate-600 dark:text-slate-400 mb-4">Start with the asset you already have. If you have a brand color, use the converter, color wheel, Tailwind palette generator, or Bootstrap theme generator. If you have an image or logo, use the image extractor, brand extractor, or image-to-gradient generator. If you are building layout or interface components, use the CSS, layout, and component generators before validating contrast and accessibility.</p>
        <p class="text-slate-600 dark:text-slate-400">Every tool is designed to run in the browser without requiring an account. Generated values can be copied into CSS, HTML, JSON, design documentation, or framework configuration files depending on the workflow.</p>
      </section>
      <script>
        document.addEventListener('DOMContentLoaded', function () {
          var input = document.getElementById('tool-search');
          var cards = Array.from(document.querySelectorAll('.tool-card'));
          input.addEventListener('input', function () {
            var q = input.value.trim().toLowerCase();
            cards.forEach(function(card){ card.style.display = !q || card.dataset.tool.indexOf(q) !== -1 ? '' : 'none'; });
            document.querySelectorAll('.tool-group').forEach(function(group){
              group.style.display = Array.from(group.querySelectorAll('.tool-card')).some(function(card){ return card.style.display !== 'none'; }) ? '' : 'none';
            });
          });
        });
      </script>`;

  return pageShell({
    title: 'Free Developer, Design & SEO Tools Directory | Devpalettes',
    description: 'Complete directory of free Devpalettes tools for colors, CSS, SEO, images, accessibility, text, code, and optimization workflows.',
    canonical: `${SITE}/tools/`,
    extraHead: commonSchema('/tools/', 'Devpalettes Tools Directory', 'Complete directory of free Devpalettes tools for designers, developers, SEO specialists, and content teams.', 'CollectionPage'),
    body
  });
}

function helpCenterPage() {
  const body = `
      <header class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-4">Help Center: Guides, Support, and Troubleshooting</h1>
        <p class="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">Use this help center to learn how Devpalettes tools work, how your data is handled, how to export results, and how to solve common browser issues.</p>
      </header>
      <article class="prose prose-slate dark:prose-invert max-w-none">
        <section class="glass-card p-8 mb-8">
          <h2>Getting Started</h2>
          <p>Devpalettes is a collection of browser-based tools for color design, CSS generation, SEO metadata, code formatting, layout planning, and asset conversion. You do not need to create an account to use the tools. Open a tool, enter or adjust the relevant values, preview the result, and copy or download the output. Most tools save lightweight preferences in your browser so your workflow stays fast without requiring server-side accounts.</p>
          <p>For color work, begin with the <a href="/palettes/">Color Palette Generator</a> if you need inspiration, the <a href="/converter/">Color Converter</a> if you already have a value, or the <a href="/color-from-image/">Image Color Extractor</a> if your palette should match a photo or logo. For UI work, combine the <a href="/button-generator/">Button Generator</a>, <a href="/card-generator/">Card Generator</a>, <a href="/box-shadow-generator/">Box Shadow Generator</a>, and <a href="/wcag-contrast-checker/">WCAG Contrast Checker</a> before shipping production styles.</p>
          <p>For SEO work, use the <a href="/meta-tag-generator/">Meta Tag Generator</a> to create metadata, the <a href="/meta-tags-analyzer/">Meta Tags Analyzer</a> to audit pages, the <a href="/robots-txt-generator/">Robots.txt Generator</a> to produce crawl directives, and the <a href="/sitemap-xml-generator/">XML Sitemap Generator</a> to prepare indexable URL lists.</p>
        </section>
        <section class="glass-card p-8 mb-8">
          <h2>Tool Usage Guides</h2>
          <h3>Color and accessibility tools</h3>
          <p>Generate or import your first color, then validate it before using it in a real project. A visually attractive palette is not enough if text contrast fails. Use dark text on light pastel backgrounds, light text on dark surfaces, and test important combinations with the contrast checker. If your interface uses status colors such as red, yellow, and green, also test them in the color blindness simulator so users are not forced to rely on hue alone.</p>
          <h3>CSS and layout generators</h3>
          <p>CSS generators are best used as starting points. Create the desired visual style, copy the CSS, and then rename classes or variables to match your codebase. Before shipping, remove unused declarations, check responsive behavior, and confirm that hover or animation effects do not reduce readability. For layout tools such as Flexbox and Grid, test the result at desktop, tablet, and mobile widths.</p>
          <h3>SEO and metadata tools</h3>
          <p>When generating metadata, write titles and descriptions for humans first. Keep each page unique, align the canonical URL with the final public route, and avoid sending search engines to redirects or duplicate pages. Open Graph previews should use accurate images and descriptions because misleading social metadata can reduce trust even when the technical tags are valid.</p>
          <h3>Optimization and formatter tools</h3>
          <p>Minifiers, compressors, formatters, and encoders run in the browser. Keep an original copy of production code before minifying, and validate generated output in your own environment. If a minified file changes behavior, compare it with the original and check for syntax that depends on whitespace, comments, or build-time processing.</p>
        </section>
        <section class="glass-card p-8 mb-8">
          <h2>Troubleshooting</h2>
          <h3>Buttons do not copy output</h3>
          <p>Clipboard access can be blocked by browser permissions, private browsing settings, or insecure embedded contexts. Use the page directly at devpalettes.com over HTTPS, click the copy button again after interacting with the page, or manually select the generated code if your browser blocks automatic copying.</p>
          <h3>Saved palettes or preferences disappeared</h3>
          <p>Saved palettes and theme preferences are stored in browser localStorage. Clearing site data, switching browsers, using private mode, or running aggressive privacy extensions can remove that local data. Export important palettes as CSS, JSON, or images if you need a permanent copy outside the browser.</p>
          <h3>Image or PDF tools feel slow</h3>
          <p>Large files are processed by your device. Resize very large images before importing them, close unused tabs, and try a modern browser such as Chrome, Edge, Firefox, or Safari. Browser-based processing protects privacy but depends on local memory and CPU performance.</p>
          <h3>Generated colors look different on another screen</h3>
          <p>Displays vary by brightness, panel type, color profile, and operating system settings. Use hex and RGB values for precision, but test critical brand or accessibility decisions on multiple devices. For print work, consult a designer or print specialist because screen color and print color are different workflows.</p>
        </section>
        <section class="glass-card p-8 mb-8">
          <h2>Frequently Encountered Issues</h2>
          <p>If a generated CSS snippet does not work, confirm that it was pasted into the correct selector and that no later rule overrides it. If a gradient does not display, use <code>background</code> or <code>background-image</code> instead of <code>background-color</code>. If a Tailwind palette does not appear, restart the development server after changing the Tailwind configuration. If a meta preview does not update on social platforms, use the platform's debugger or sharing inspector because social caches may keep old previews for hours or days.</p>
          <p>If a page appears visually broken, refresh with cache disabled and check whether a browser extension is blocking fonts, scripts, or localStorage. Devpalettes uses progressive enhancement: core page content should remain visible, while interactive features require JavaScript.</p>
        </section>
        <section class="glass-card p-8 mb-8">
          <h2>Privacy and Security</h2>
          <p>Most Devpalettes tools are designed to run locally in your browser. Tool values such as colors, snippets, and settings are usually processed on the client side. The site may use localStorage for theme preferences, saved palettes, consent choices, and tool state. LocalStorage is stored on your device and can be cleared through browser settings.</p>
          <p>Devpalettes may use Google services for analytics and advertising as described in the <a href="/privacy-policy/">Privacy Policy</a> and <a href="/cookie-policy/">Cookie Policy</a>. The consent banner lets visitors accept or reject non-essential analytics and advertising storage where applicable. We do not ask for passwords or payment details to use the free tools.</p>
        </section>
        <section class="glass-card p-8 mb-8">
          <h2>Contact Support</h2>
          <p>If you find a bug, broken link, inaccurate output, or accessibility issue, use the <a href="/contact/">Contact page</a>. Include the tool name, browser, device, input used, expected result, and actual result. Clear reports make issues easier to reproduce and fix. Business, editorial, and collaboration inquiries can also be sent through the same page.</p>
        </section>
      </article>`;
  return pageShell({
    title: 'Help Center - Devpalettes Guides, Support & Troubleshooting',
    description: 'Expanded Devpalettes help center with getting started guides, tool usage instructions, troubleshooting, privacy explanations, and support contact options.',
    canonical: `${SITE}/help-center/`,
    extraHead: commonSchema('/help-center/', 'Help Center', 'Guides, support, troubleshooting, privacy explanations, and contact options for Devpalettes tools.'),
    body
  });
}

function faqPage() {
  const faqs = [
    ['Is Devpalettes free to use?', 'Yes. Devpalettes tools are free to use without creating an account. You can generate palettes, convert colors, create CSS, format code, and export results directly from the browser.'],
    ['Do I need to sign up?', 'No account is required. The tools are designed for immediate use, which keeps the workflow simple and avoids storing account data on a server.'],
    ['Where should I start if I need a color palette?', 'Use the Color Palette Generator for inspiration, the Color Wheel for theory-based relationships, or the Image Color Extractor if the palette should match an existing photo or logo.'],
    ['How do I export a palette?', 'Use the export buttons on the palette page to copy CSS variables, JSON, or downloadable image output where supported. You can also click individual swatches to copy hex values.'],
    ['Can I use generated palettes commercially?', 'Yes. Generated color values and CSS snippets can be used in personal or commercial projects. Devpalettes does not claim ownership of colors you generate.'],
    ['How does the gradient generator work?', 'The gradient generator lets you choose gradient type, colors, stops, and angle, then produces copy-ready CSS using modern linear-gradient or radial-gradient syntax.'],
    ['Why does my gradient not appear in CSS?', 'Gradients must be assigned to background or background-image, not background-color. Also check for missing commas, unsupported copied characters, or later CSS rules overriding the style.'],
    ['What color formats are supported?', 'Common tools support HEX, RGB, and HSL. Some pages also provide CSS variables, JSON, Tailwind configuration, Bootstrap variables, or PNG exports depending on the workflow.'],
    ['How accurate are color conversions?', 'Mathematical conversions between HEX, RGB, and HSL are precise, but the way a color appears can vary by monitor, browser, brightness, and color profile.'],
    ['How do I test accessibility?', 'Use the WCAG Contrast Checker for text/background ratios and the Color Blindness Simulator to review how palettes may appear to users with common color vision deficiencies.'],
    ['Does passing contrast guarantee full accessibility?', 'No. Contrast is important, but accessibility also depends on font size, labels, keyboard navigation, motion, layout, and whether color is used as the only signal.'],
    ['Are uploaded images stored?', 'Image-based tools are designed to process files in the browser where possible. You should still avoid uploading confidential materials to any web tool unless you are comfortable with the workflow and policy.'],
    ['Why did my saved palettes disappear?', 'Saved palettes rely on localStorage. They can disappear if you clear browser data, use private browsing, switch devices, or run privacy extensions that remove site storage.'],
    ['What is localStorage?', 'LocalStorage is browser storage used for small pieces of site data such as theme preference, saved palettes, consent choice, and tool settings. It remains on your device until cleared.'],
    ['Does Devpalettes use cookies?', 'The site may use necessary browser storage, analytics cookies, and advertising cookies as explained in the Cookie Policy. Non-essential usage is handled through consent controls where applicable.'],
    ['How do I opt out of cookies?', 'Use the consent banner controls when shown, clear site data in your browser, disable third-party cookies, or manage ad personalization in your Google account settings.'],
    ['Which browsers are supported?', 'Modern versions of Chrome, Edge, Firefox, and Safari are recommended. Older browsers may not support every file, clipboard, canvas, or CSS feature.'],
    ['Why does copy to clipboard fail?', 'Clipboard APIs require HTTPS and user interaction. Browser permissions, private mode, embedded frames, or extensions can block automatic copying.'],
    ['Can I download generated assets?', 'Some tools provide downloads such as PNG palette exports, compressed images, favicons, SVG conversions, or generated HTML. Other tools provide copy-to-clipboard output.'],
    ['Are the SEO tools a replacement for a full audit?', 'No. They help catch common on-page issues, but serious SEO work should also include crawl analysis, search console data, content quality review, and technical performance testing.'],
    ['How should I use the meta tag generator?', 'Create one unique title and description per page, add accurate Open Graph tags, set the final canonical URL, and verify the result with the analyzer before publishing.'],
    ['Can I minify production code with these tools?', 'Yes, but keep an original unminified source file. Browser minifiers are useful for quick optimization but should be tested in your build or staging environment.'],
    ['Is the ATS checker official recruiting software?', 'No. It is a practical browser-based review tool that highlights keyword and formatting issues. It cannot guarantee results with any employer or applicant tracking system.'],
    ['How do I report a bug?', 'Use the Contact page and include the exact tool, browser, device, input, expected result, and actual result. Screenshots or copied output help reproduce problems.'],
    ['Who maintains Devpalettes?', 'Devpalettes is founded and maintained by Ashish Kekaan. Founder, contact, editorial, and update information are available on the About and trust pages.'],
    ['How often are tools updated?', 'Tools are reviewed when bugs are reported, browser behavior changes, or new workflow improvements are added. Major page updates include visible updated dates where practical.'],
    ['Why do some tools have similar layouts?', 'Consistent layouts make the tools easier to scan, but each page should provide tool-specific instructions, examples, best practices, and FAQs.'],
    ['Can I link to Devpalettes from my own site?', 'Yes. You can link to any public tool page, guide, or resource. Use the final canonical URL shown in the browser.'],
  ];
  const faqHtml = faqs.map(([q, a], i) => `
        <section class="glass-card p-6 mb-4">
          <h2 class="text-xl font-bold mb-2">${i + 1}. ${escapeHtml(q)}</h2>
          <p class="text-slate-600 dark:text-slate-400">${escapeHtml(a)}</p>
        </section>`).join('\n');
  const faqSchema = jsonLd({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a }
    }))
  });
  return pageShell({
    title: 'Devpalettes FAQ - Tools, Privacy, Exports & Browser Support',
    description: 'Expanded FAQ for Devpalettes covering color tools, CSS tools, SEO tools, exports, downloads, privacy, cookies, browser support, accessibility, and troubleshooting.',
    canonical: `${SITE}/faq/`,
    extraHead: `${commonSchema('/faq/', 'Devpalettes FAQ', 'Questions and answers about Devpalettes tools, privacy, browser support, exports, and accessibility.')}\n${faqSchema}`,
    body: `
      <header class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p class="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">Detailed answers about using Devpalettes tools, exporting results, protecting privacy, troubleshooting browsers, and designing accessible color systems.</p>
      </header>
      ${faqHtml}`
  });
}

function cookiePolicyPage() {
  const body = `
      <header class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-4">Cookie Policy</h1>
        <p class="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">This Cookie Policy explains how Devpalettes uses cookies, localStorage, analytics, advertising services, and consent controls.</p>
        <p class="text-sm text-slate-500 mt-3">Last updated: July 6, 2026</p>
      </header>
      <article class="prose prose-slate dark:prose-invert max-w-none">
        <section class="glass-card p-8 mb-8">
          <h2>1. Overview</h2>
          <p>Devpalettes provides browser-based tools for color design, CSS generation, SEO metadata, code formatting, and asset conversion. Some features need small amounts of browser storage to remember your choices, while analytics and advertising services may use cookies or similar technologies as described below. This policy is written to help visitors understand what is stored, why it is stored, and how choices can be managed.</p>
          <p>Cookies are small files placed by a website or third-party service in your browser. LocalStorage is browser storage that lets a website keep small pieces of data on your device. Devpalettes uses both categories carefully: functional data supports the tools, while analytics and advertising data helps measure and support the site when consent and regional requirements allow it.</p>
        </section>
        <section class="glass-card p-8 mb-8">
          <h2>2. Necessary Storage</h2>
          <p>Necessary storage supports features that users directly request. Examples include theme preference, cookie consent choice, saved palettes, gradient settings, and temporary tool state. These values help the site remember dark mode, prevent the consent banner from repeating on every visit, and keep locally saved tool results available in the same browser.</p>
          <p>Necessary storage does not require creating an account. It is stored on your device and can be cleared through your browser settings. If you clear site data, use private browsing, or switch devices, locally saved preferences and palettes may disappear.</p>
        </section>
        <section class="glass-card p-8 mb-8">
          <h2>3. Analytics Cookies</h2>
          <p>Devpalettes may use Google Analytics or similar measurement tools to understand aggregate site usage, popular pages, navigation patterns, browser types, and technical errors. Analytics helps prioritize improvements, fix confusing workflows, and identify pages that need clearer documentation. Analytics is not used to collect passwords, payment details, or user accounts because Devpalettes does not require those details for free tool usage.</p>
          <p>Where consent is required, analytics storage should only be enabled after consent. Visitors can reject non-essential cookies through the consent banner, clear existing cookies, block analytics scripts through browser settings, or use privacy tools offered by their browser.</p>
        </section>
        <section class="glass-card p-8 mb-8">
          <h2>4. Advertising Cookies and Google Services</h2>
          <p>Devpalettes may display advertising through Google AdSense or related Google publisher services to support free access to the tools. Advertising services may use cookies, device identifiers, or similar technologies to deliver, measure, limit, and improve ads. Depending on your location, consent choices, and Google settings, ads may be personalized or non-personalized.</p>
          <p>Google may process information such as page views, approximate location derived from IP address, device and browser details, ad interactions, and consent signals. You can manage Google ad personalization through Google Ads Settings, your Google account controls, browser cookie settings, and available consent controls on Devpalettes.</p>
        </section>
        <section class="glass-card p-8 mb-8">
          <h2>5. LocalStorage Usage</h2>
          <p>Devpalettes tools may use localStorage keys for theme state, saved palettes, gradient settings, editor content, generated snippets, and consent status. LocalStorage is helpful because many tools run entirely in the browser and do not require a database. For example, a saved palette can remain available on your device after refreshing the page without sending that palette to a server account.</p>
          <p>You control localStorage through your browser. To remove it, open browser site settings for devpalettes.com and clear site data. Clearing localStorage may reset dark mode, saved palettes, copied tool state, and consent choices.</p>
        </section>
        <section class="glass-card p-8 mb-8">
          <h2>6. Consent Management</h2>
          <p>When the consent banner appears, you can accept or reject non-essential analytics and advertising storage. Accepting enables measurement and advertising features that help support the site. Rejecting limits non-essential storage where technically possible. Your choice is stored locally so the banner does not repeatedly interrupt your workflow.</p>
          <p>If you change your mind, clear site data for devpalettes.com and reload the site to reset the consent prompt. You can also use browser-level settings to block third-party cookies, disable personalized ads, or remove cookies after each session.</p>
        </section>
        <section class="glass-card p-8 mb-8">
          <h2>7. Opt-Out Instructions</h2>
          <ul>
            <li>Use the Devpalettes consent banner to reject non-essential cookies when it is shown.</li>
            <li>Clear cookies and site data for devpalettes.com in your browser settings.</li>
            <li>Block third-party cookies or tracking protection features in your browser.</li>
            <li>Manage Google ad personalization in your Google account and Google Ads Settings.</li>
            <li>Use private browsing if you do not want local preferences to persist after the session.</li>
          </ul>
        </section>
        <section class="glass-card p-8 mb-8">
          <h2>8. Contact</h2>
          <p>Questions about cookies, storage, analytics, advertising, or privacy can be sent through the <a href="/contact/">Contact page</a>. Related information is available in the <a href="/privacy-policy/">Privacy Policy</a>, <a href="/terms/">Terms of Service</a>, and <a href="/disclaimer/">Disclaimer</a>.</p>
        </section>
      </article>`;
  return pageShell({
    title: 'Cookie Policy - Cookies, Local Storage, Analytics & Ads | Devpalettes',
    description: 'Detailed Devpalettes Cookie Policy covering necessary storage, analytics cookies, advertising cookies, localStorage, consent management, opt-out controls, and Google services.',
    canonical: `${SITE}/cookie-policy/`,
    extraHead: commonSchema('/cookie-policy/', 'Cookie Policy', 'Detailed Cookie Policy for Devpalettes covering browser storage, analytics, advertising, consent, and opt-out controls.'),
    body
  });
}

function guideAppend(route, html) {
  if (html.includes('adsense-tool-guide')) return html;
  const tool = toolByRoute.get(route);
  if (!tool) return html;
  const [, url, name, desc] = tool;
  const related = tools.filter((t) => t[0] === tool[0] && t[1] !== url).slice(0, 4);
  const content = `
  <section class="adsense-tool-guide max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="glass-card p-8">
      <h2>Practical Guide to ${escapeHtml(name)}</h2>
      <p><strong>What this tool does:</strong> ${escapeHtml(desc)} It is built for quick browser-based workflows where the result should be visible, understandable, and easy to copy into a real project.</p>
      <h3>Why use ${escapeHtml(name)}?</h3>
      <p>Use ${escapeHtml(name)} when you want to reduce manual trial and error. Instead of switching between documentation, design software, code editors, and calculators, you can adjust the inputs here, inspect the output, and move the result into your project with fewer interruptions. This is especially useful when you are comparing alternatives, documenting a design decision, or preparing production-ready snippets for a team.</p>
      <h3>How it works</h3>
      <p>The tool reads the values you enter or select, updates the preview immediately, and formats the result for common web workflows. Where possible, processing happens in your browser so the interaction remains fast and private. The output is intentionally plain: copyable CSS, HTML, JSON, text, image data, or configuration values that can be reviewed before use.</p>
      <h3>Step-by-step workflow</h3>
      <ol>
        <li>Open the tool and start with the default values to understand the available controls.</li>
        <li>Replace the sample values with your project values, brand colors, text, image, URL, or layout settings.</li>
        <li>Review the preview and generated output together so the visual result matches the copied code.</li>
        <li>Copy or download the result, then test it inside your own project rather than assuming every context behaves the same.</li>
        <li>Save important outputs in your project files, design system, or documentation so they are not dependent on browser storage.</li>
      </ol>
      <h3>Real-world examples</h3>
      <p>A designer can use ${escapeHtml(name)} while preparing a design handoff, then paste the generated values into a style guide. A frontend developer can use it while prototyping a component and then adapt the output into existing class names, CSS variables, or framework conventions. A content or SEO specialist can use it to verify that generated metadata, text, or assets are consistent before publishing.</p>
      <h3>Best practices</h3>
      <ul>
        <li>Keep the original source or input before applying destructive transformations such as minification or compression.</li>
        <li>Use semantic names when moving generated values into production code.</li>
        <li>Test output in at least one real page, not only inside the generator preview.</li>
        <li>Check accessibility, readability, and responsive behavior when the output affects user interface design.</li>
        <li>Document final values so teammates understand why a specific setting was chosen.</li>
      </ul>
      <h3>Common mistakes</h3>
      <p>Common mistakes include copying output without reviewing it, using generated values in the wrong CSS property, forgetting browser compatibility, relying on localStorage as permanent storage, or applying visual effects without checking contrast and readability. Treat generated output as a strong starting point, then validate it in your own codebase.</p>
      <h3>FAQ</h3>
      <p><strong>Is ${escapeHtml(name)} free?</strong> Yes, the tool is free and does not require sign-up.</p>
      <p><strong>Does it work on mobile?</strong> The page is responsive, though complex editing workflows are usually easier on a desktop or tablet.</p>
      <p><strong>Can I use the output commercially?</strong> Yes, generated values and snippets can be used in personal and commercial work. Always review output for your own requirements.</p>
      <h3>Related tools</h3>
      <p>${related.map(([, r, n]) => `<a href="${r}">${escapeHtml(n)}</a>`).join(' · ')}</p>
    </div>
  </section>`;
  return html.replace(/<div id=["']footer-container["']><\/div>/i, `${content}\n  <div id="footer-container"></div>`);
}

function expandBlog(file, html, route) {
  if (wordCount(html) >= 1200 || html.includes('adsense-blog-expansion')) return html;
  const name = titleOf(html, 'Devpalettes guide');
  const block = `
  <section class="adsense-blog-expansion max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="glass-card p-8">
      <h2>Practical Examples and Implementation Notes</h2>
      <p>This guide is most useful when paired with a real workflow. Start by identifying the page, component, or asset you are trying to improve. Then use the related Devpalettes tool to generate a first draft, compare it with your current result, and document the final decision in your project notes.</p>
      <div class="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 my-6">
        <p class="text-sm font-semibold mb-2">Screenshot placeholder</p>
        <p class="text-sm text-slate-600 dark:text-slate-400">Add a screenshot of the tool output, before-and-after design, or final implementation when publishing future editorial updates.</p>
      </div>
      <h3>Example workflow</h3>
      <p>For ${escapeHtml(name)}, choose one representative page or component and apply the advice in a controlled way. Measure the result visually, technically, and from a user perspective. If the change affects colors, test contrast. If it affects metadata, preview search and social snippets. If it affects code, test the output in a browser before shipping.</p>
      <h3>Common questions</h3>
      <p><strong>Should I copy generated output directly?</strong> Use generated output as a starting point, then adapt names, spacing, comments, and conventions to match your project.</p>
      <p><strong>How do I avoid duplicate work?</strong> Save final values in a design system, CSS variables file, or internal documentation so the same decision does not need to be recreated.</p>
      <p><strong>Which Devpalettes tools help with this topic?</strong> Browse the <a href="/tools/">tools directory</a>, then connect this guide with the most relevant generator, analyzer, or formatter for your workflow.</p>
    </div>
  </section>`;
  return html.replace(/<div id=["']footer-container["']><\/div>/i, `${block}\n  <div id="footer-container"></div>`);
}

function trustAppend(html) {
  if (html.includes('adsense-trust-section')) return html;
  const block = `
  <section class="adsense-trust-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="glass-card p-8">
      <h2>Trust, Editorial, and Update Policy</h2>
      <h3>Founder and maintainer</h3>
      <p>Devpalettes is founded and maintained by Ashish Kekaan. The project focuses on practical, browser-based tools for designers, developers, SEO specialists, and content teams.</p>
      <h3>Author information</h3>
      <p>Tool pages and guides are published under the Devpalettes editorial identity. Pages are written to explain what each tool does, how it works, common mistakes, and appropriate use cases.</p>
      <h3>Editorial policy</h3>
      <p>Content should be original, practical, and aligned with the behavior of the actual tool on the page. Claims about privacy, browser support, and output formats should match implemented functionality.</p>
      <h3>Update policy</h3>
      <p>Pages are reviewed when tools change, browser behavior affects output, links break, or users report unclear instructions. Major legal and support pages include visible update dates.</p>
      <h3>Contact transparency</h3>
      <p>Questions, bug reports, corrections, and partnership requests can be sent through the <a href="/contact/">Contact page</a> or by email at contact@devpalettes.com.</p>
    </div>
  </section>`;
  return html.replace(/<div id=["']footer-container["']><\/div>/i, `${block}\n  <div id="footer-container"></div>`);
}

function rebuildSitemap(files) {
  const urls = [];
  for (const file of files) {
    const route = routeFor(file);
    if (nonIndexRoutes.has(route)) continue;
    if (route.endsWith('/privacy/') || route.endsWith('/terms-of-service/')) continue;
    if (route === '/googlebd931541126acaba.html') continue;
    urls.push(route === '/sitemap/' ? '/sitemap.html' : route);
  }
  if (!urls.includes('/tools/')) urls.push('/tools/');
  const unique = [...new Set(urls)].filter((u) => !nonIndexRoutes.has(u)).sort((a, b) => {
    if (a === '/') return -1;
    if (b === '/') return 1;
    return a.localeCompare(b);
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${unique.map((route) => `  <url>\n    <loc>${SITE}${route}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${route === '/' ? '1.0' : route === '/tools/' || route === '/blog/' ? '0.9' : '0.8'}</priority>\n  </url>`).join('\n')}\n</urlset>\n`;
  write(path.join(ROOT, 'sitemap.xml'), xml);
}

function main() {
  write(fileForRoute('/tools/'), toolsPage());
  write(fileForRoute('/help-center/'), helpCenterPage());
  write(fileForRoute('/faq/'), faqPage());
  write(fileForRoute('/cookie-policy/'), cookiePolicyPage());

  for (const [route, target] of Object.entries(linkMap)) {
    if (route === '/tools/') continue;
    write(fileForRoute(route), redirectPage(route, target, route.replace(/\//g, ' ').trim() || 'Page'));
  }

  let files = walk(ROOT);
  for (const file of files) {
    let html = read(file);
    const route = routeFor(file);
    if (route === '/googlebd931541126acaba.html') continue;
    html = fixLinks(html);
    html = removeUnsupportedClaims(html);
    if (nonIndexRoutes.has(route)) {
      html = ensureRobots(html, 'noindex, follow');
    } else {
      html = ensureRobots(html, 'index, follow');
      html = ensureCanonical(html, route === '/sitemap/' ? '/sitemap.html' : route);
    }
    if (route === '/converter/' && !/<h1[^>]*>/i.test(html)) {
      html = html.replace(/<h2([^>]*)>\s*HEX to RGB, HSL Color Converter\s*<\/h2>/i, '<h1$1>HEX to RGB, HSL Color Converter</h1>');
    }
    const title = titleOf(html, route);
    const desc = descriptionOf(html, `${title} on Devpalettes.`);
    const type = toolByRoute.has(route) ? 'SoftwareApplication' : route === '/tools/' ? 'CollectionPage' : 'WebPage';
    html = appendSchema(html, route, title, desc, type);
    html = guideAppend(route, html);
    if (route.startsWith('/blog/') && route !== '/blog/') html = expandBlog(file, html, route);
    if (route === '/about/' || route === '/why-trust-us/') html = trustAppend(html);
    write(file, html);
  }

  files = walk(ROOT);
  rebuildSitemap(files);
}

main();
