const fs = require('fs');

function add(file, marker, id, block) {
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes(id)) return;
  html = html.replace(marker, `${block}\n${marker}`);
  fs.writeFileSync(file, html);
}

add('help-center/index.html', '</article>', 'help-center-final-topoff', `
        <section id="help-center-final-topoff" class="glass-card p-8 mb-8">
          <h2>Maintenance and Review Expectations</h2>
          <p>Devpalettes pages are intended to be reviewed when the underlying tool changes, when user reports identify unclear instructions, when external standards or browser behavior change, or when a page starts linking to outdated resources. This matters because generators and analyzers are only useful when the surrounding explanation matches the tool that users actually see. A clear update process also helps visitors understand that the site is maintained rather than abandoned.</p>
          <p>If you rely on Devpalettes in a professional workflow, treat the site as a fast assistant for generating and validating ideas, then keep your own final source of truth. Store approved colors, metadata, snippets, and asset settings in your project repository or design system. That habit protects your work if browser storage is cleared and helps teams reuse decisions consistently.</p>
        </section>`);

add('cookie-policy/index.html', '</article>', 'cookie-policy-final-topoff', `
        <section id="cookie-policy-final-topoff" class="glass-card p-8 mb-8">
          <h2>15. Relationship to Other Policies</h2>
          <p>This Cookie Policy should be read together with the Privacy Policy, Terms of Service, and Disclaimer. The Privacy Policy explains broader data practices, the Terms describe acceptable use of the website, and the Disclaimer explains limitations around generated output and external resources. Together, these pages provide the transparency expected from a public tool website that uses browser storage, analytics, and advertising services.</p>
        </section>`);

add('faq/index.html', '</main>', 'faq-final-topoff', `
      <section id="faq-final-topoff" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="glass-card p-8">
          <h2 class="text-2xl font-bold mb-4">Additional Tool-Specific Notes</h2>
          <h3 class="text-xl font-bold mb-2">Color palette and color converter questions</h3>
          <p class="text-slate-600 dark:text-slate-400 mb-4">When using the palette generator, remember that color harmony and accessibility are separate checks. A palette can be visually harmonious but still fail contrast when used for text. After generating a palette, copy the colors into the preview tool or contrast checker and test realistic pairings. For example, a soft pastel background should usually use dark text, while a dark mode palette needs careful separation between surface colors, borders, muted text, and primary actions.</p>
          <p class="text-slate-600 dark:text-slate-400 mb-4">When using the color converter, the numeric conversion is only one part of the workflow. HEX, RGB, and HSL describe the same screen color in different formats, but teams often prefer one format for documentation and another for implementation. HEX is compact, RGB is familiar in many design tools, and HSL is easier to adjust by hue, saturation, and lightness. Convert values, then choose the format that your codebase and design system can maintain consistently.</p>
          <h3 class="text-xl font-bold mb-2">Image, SVG, favicon, and compression questions</h3>
          <p class="text-slate-600 dark:text-slate-400 mb-4">For image-based tools, file size and browser memory matter. Very large images may take longer to process or may fail on low-memory devices. If you only need a color palette, use a reasonably sized image instead of a massive original photo. If you are generating favicons, preview the smallest sizes because a mark that looks good at 180px can become unreadable at 16px. For SVG editing or SVG-to-PNG conversion, test the exported result in the environment where it will be used.</p>
          <h3 class="text-xl font-bold mb-2">SEO and metadata questions</h3>
          <p class="text-slate-600 dark:text-slate-400 mb-4">SEO tools are strongest when they support a real publishing process. Generate metadata before publishing, then analyze the live page after publishing. Check that the title, description, canonical, Open Graph tags, and Twitter card tags in the source code match your intended page. If a page was renamed, update internal links, sitemap entries, and canonical tags at the same time so crawlers do not receive mixed signals.</p>
          <h3 class="text-xl font-bold mb-2">Code, formatter, and minifier questions</h3>
          <p class="text-slate-600 dark:text-slate-400 mb-4">Formatters and minifiers should not replace version control or build tools. Use them to inspect, clean, or quickly transform content, but keep original source files safe. After minifying HTML, CSS, or JavaScript, test the result in a browser and compare important behavior. For JSON, always validate before using the output in an application because one missing comma or quote can break downstream code.</p>
          <h3 class="text-xl font-bold mb-2">Privacy and storage questions</h3>
          <p class="text-slate-600 dark:text-slate-400 mb-4">Local browser storage is convenient but device-specific. If you save a palette on your laptop, it will not automatically appear on your phone. If you clear browser data, local saved items may be removed. Use export features for anything important. Consent choices are also stored locally, which means clearing site data can cause the cookie banner to appear again on a future visit.</p>
          <h3 class="text-xl font-bold mb-2">Support and correction questions</h3>
          <p class="text-slate-600 dark:text-slate-400">If you notice inaccurate instructions, an outdated screenshot placeholder, an invalid generated snippet, or a broken link, send the exact page URL and a short description through the Contact page. Devpalettes is easier to maintain when reports identify the source page, expected behavior, and actual behavior. That keeps fixes focused and improves the site for the next visitor who uses the same workflow.</p>
        </div>
      </section>`);
