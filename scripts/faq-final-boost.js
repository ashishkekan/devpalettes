const fs = require('fs');
const file = 'faq/index.html';
let html = fs.readFileSync(file, 'utf8');
if (!html.includes('faq-target-final-boost')) {
  html = html.replace('</main>', `
      <section id="faq-target-final-boost" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="glass-card p-8">
          <h2 class="text-2xl font-bold mb-4">Scenario-Based FAQ</h2>
          <h3 class="text-xl font-bold mb-2">What should I do if a tool output looks correct here but breaks in my website?</h3>
          <p class="text-slate-600 dark:text-slate-400 mb-4">First, isolate the copied output in a blank test page. If it works there, the issue is probably caused by your project CSS, JavaScript, framework reset, build process, or selector specificity. Check for later rules overriding the generated declarations, missing units, escaped characters, and copied smart quotes. For CSS effects, also check whether the element has the required dimensions, display mode, positioning context, or background layer.</p>
          <h3 class="text-xl font-bold mb-2">How do I make generated design values part of a design system?</h3>
          <p class="text-slate-600 dark:text-slate-400 mb-4">Translate one-off values into named tokens. For example, a copied color should become a variable such as <code>--color-primary</code>, <code>--surface-muted</code>, or <code>--border-subtle</code>. Shadows, radii, spacing, and typography values should use consistent names and scales. Once values are named, document where they should be used and which components depend on them. This prevents every page from having slightly different copied snippets.</p>
          <h3 class="text-xl font-bold mb-2">What is the safest way to use browser-based file tools?</h3>
          <p class="text-slate-600 dark:text-slate-400 mb-4">Use non-sensitive files, keep the original file, and open the exported file before sharing it. Browser-based tools are convenient because they avoid installing software, but the final result still needs review. For compressed images, check visual quality at the actual display size. For SVG and PNG exports, check transparency, dimensions, and edge sharpness. For PDFs, check readability and whether compression affected embedded images.</p>
          <h3 class="text-xl font-bold mb-2">How should I handle generated SEO files?</h3>
          <p class="text-slate-600 dark:text-slate-400 mb-4">Robots.txt and sitemap.xml files can affect how search engines crawl a site, so review them carefully before uploading. Make sure important pages are not blocked, redirect URLs are excluded from sitemaps, canonical pages are included, and duplicate URLs are removed. After publishing, test robots.txt in Search Console and submit the sitemap URL. If you rename a page, update internal links, sitemap entries, and canonical tags together.</p>
          <h3 class="text-xl font-bold mb-2">Can Devpalettes replace professional review?</h3>
          <p class="text-slate-600 dark:text-slate-400 mb-4">Devpalettes can speed up design, development, SEO, and formatting tasks, but it does not replace professional judgment. Accessibility, branding, legal compliance, recruiting outcomes, search performance, and production engineering all depend on context. Use the tools to create and validate drafts, then review important decisions with the standards and people responsible for your project.</p>
          <h3 class="text-xl font-bold mb-2">What should I check before publishing a page that used Devpalettes output?</h3>
          <p class="text-slate-600 dark:text-slate-400">Check the visual result, generated code, metadata, accessibility, mobile layout, browser compatibility, and file exports. Confirm that all internal links work, the canonical URL is correct, the page has a unique H1, and any generated assets are stored in your own project. This final review keeps fast tool usage from turning into avoidable production mistakes.</p>
        </div>
      </section>
</main>`);
  fs.writeFileSync(file, html);
}
