const fs = require('fs');

function insertBefore(file, marker, block) {
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes(block.trim().slice(0, 80))) return;
  html = html.replace(marker, `${block}\n${marker}`);
  fs.writeFileSync(file, html);
}

insertBefore('help-center/index.html', '</article>', `
        <section class="glass-card p-8 mb-8">
          <h2>Recommended Workflows by Role</h2>
          <h3>For frontend developers</h3>
          <p>Start with the tool that matches the code you need to ship. If you are styling a component, create the visual effect with the button, card, shadow, border, animation, filter, or layout generator. Copy the output into a temporary file first, then rename selectors and variables so they match your project. After the component looks correct, run the colors through the contrast checker and test the layout at several viewport widths. Developers should avoid pasting generated CSS into production without reviewing specificity, responsive behavior, and dependency assumptions.</p>
          <h3>For UI and brand designers</h3>
          <p>Begin with a palette source. That source might be a brand color, a logo, a product screenshot, a mood board image, or a blank creative direction. Use the palette generator for discovery, the color wheel for relationships, and the image extractor for asset matching. Once you have candidate colors, preview them on real interface surfaces such as buttons, cards, navigation bars, alerts, and charts. This helps avoid a common design problem: a palette that looks attractive as swatches but fails when used in actual product hierarchy.</p>
          <h3>For SEO specialists and content teams</h3>
          <p>Use metadata tools in a publishing workflow. Draft the title, description, canonical URL, and social preview before a page goes live. Then analyze the finished page after deployment to confirm that the source code contains the same values. For campaign URLs, use the UTM builder and document naming conventions for source, medium, campaign, term, and content values. Consistent naming keeps analytics reports readable and prevents duplicate campaign buckets.</p>
          <h3>For students and learners</h3>
          <p>Use Devpalettes as a visual learning environment. Adjust one control at a time and observe how the generated code changes. This is especially helpful for CSS Grid, Flexbox, gradients, shadows, transforms, and filters because the connection between a property and its visual effect becomes easier to understand when feedback is immediate.</p>
        </section>
        <section class="glass-card p-8 mb-8">
          <h2>Data Handling by Tool Type</h2>
          <p>Text tools process typed or pasted text in the browser and are intended for non-sensitive formatting, comparison, encoding, or cleanup. Image and file tools may use browser APIs such as canvas, file readers, and download links to produce output locally. Color tools store lightweight values such as palettes and settings only when a feature explicitly needs to remember them. SEO tools may request a URL or metadata input so they can analyze or generate tags, but users should avoid entering private staging URLs or confidential information into any public web tool unless they understand the implications.</p>
          <p>Because browser storage belongs to the browser profile, Devpalettes cannot recover locally saved palettes or snippets after they are deleted. Export important results into your own files, project repository, design system, or documentation. Treat Devpalettes as a tool for creation and validation, not as the sole long-term storage location for production assets.</p>
        </section>
        <section class="glass-card p-8 mb-8">
          <h2>Accessibility and Quality Checklist</h2>
          <ul>
            <li>Check contrast before using generated colors for text, labels, icons, and buttons.</li>
            <li>Do not use color alone to communicate warnings, success, error, or status.</li>
            <li>Review motion effects and disable or reduce them when they distract from content.</li>
            <li>Confirm that copy buttons, downloads, form fields, and interactive controls remain usable on mobile screens.</li>
            <li>Keep generated snippets understandable by replacing generic class names with project-specific names.</li>
            <li>Validate SEO metadata on the deployed page, not only in the generator.</li>
            <li>Keep legal, privacy, and cookie pages linked from the footer so users and reviewers can find them quickly.</li>
          </ul>
          <p>This checklist is useful before publishing any page that uses generated output. It reduces accidental issues such as poor contrast, broken metadata, inaccessible controls, unclear copy, or fragile CSS.</p>
        </section>
        <section class="glass-card p-8 mb-8">
          <h2>When to Contact Support</h2>
          <p>Contact support when a tool produces invalid output, a link is broken, a page has missing metadata, an export fails, or a browser-specific bug prevents normal use. Include the page URL, the exact input, the output you expected, the output you received, your browser version, and whether extensions were enabled. Reports with reproducible steps are easier to diagnose and usually lead to faster fixes.</p>
          <p>For editorial corrections, include the page URL and the sentence or section that needs attention. For privacy questions, mention the storage or cookie behavior you are asking about. For partnership or business requests, describe the proposal and the relevant contact details. Devpalettes aims to keep communication direct and practical so the site can improve without requiring users to navigate a complicated ticket system.</p>
        </section>`);

insertBefore('faq/index.html', '</div>\n  </main>', `
      <section class="glass-card p-8 mt-10">
        <h2 class="text-2xl font-bold mb-4">Expanded Guidance for Common Questions</h2>
        <p class="text-slate-600 dark:text-slate-400 mb-4">The short answers above cover the most frequent questions, but many workflows benefit from additional context. Devpalettes is intentionally built around practical browser tools, so the safest way to use generated output is to preview it, copy it, test it in your own environment, and then document the final choice. This approach works whether you are choosing a color palette, creating CSS, preparing SEO metadata, compressing an asset, or formatting developer text.</p>
        <p class="text-slate-600 dark:text-slate-400 mb-4">For color work, do not stop at attractive swatches. Test the palette in real UI states: default, hover, focus, disabled, success, warning, and error. Check contrast for body text and small interface labels. If the design uses chart colors or status colors, verify that shape, text, or icon labels support the meaning so users with color vision differences are not excluded.</p>
        <p class="text-slate-600 dark:text-slate-400 mb-4">For CSS generators, the copied code should be treated as a production starting point rather than a permanent naming system. Rename selectors, convert repeated colors into CSS variables, remove unused properties, and check how the effect behaves in your actual layout. Gradients, shadows, glass effects, filters, and transforms can look polished in isolation but may reduce readability when placed behind text or near interactive controls.</p>
        <p class="text-slate-600 dark:text-slate-400 mb-4">For SEO tools, accuracy matters more than volume. Each public page should have a unique title, a useful meta description, a canonical URL that matches the final route, and social tags that describe the actual page. Avoid pointing canonical tags to old slugs, redirects, or unrelated pages. If you generate a robots.txt file or sitemap, validate it before uploading and resubmit the final sitemap in Google Search Console after important changes.</p>
        <p class="text-slate-600 dark:text-slate-400 mb-4">For privacy, remember that browser-based storage is local to the browser profile. It is convenient for preferences and saved palettes, but it is not a replacement for backups. Export important values into your project, save generated snippets in version control, and avoid relying on private browsing sessions for long-term work. Clearing site data removes localStorage, cookies, and consent choices for the site.</p>
        <p class="text-slate-600 dark:text-slate-400 mb-4">For browser compatibility, use current versions of Chrome, Edge, Firefox, or Safari. Some features depend on APIs such as clipboard access, canvas rendering, file reading, compression, and downloads. If a feature fails, test with extensions disabled and confirm the page is loaded over HTTPS. Corporate browsers or locked-down devices may restrict copying, downloads, or local storage even when the tool itself is working correctly.</p>
        <p class="text-slate-600 dark:text-slate-400 mb-4">For exports and downloads, check the output before sharing it. PNG, SVG, favicon, PDF, CSS, JSON, and HTML outputs can depend on the values entered by the user. If the generated file will be used in a client project or production build, open it separately, verify the dimensions or syntax, and keep the source values in your project documentation.</p>
        <p class="text-slate-600 dark:text-slate-400">For support, the fastest reports include the exact page URL, browser, device, input, expected result, actual result, and screenshots when relevant. Devpalettes is maintained as a practical tool collection, so clear reports directly improve the pages and help other users avoid the same issue.</p>
      </section>`);

insertBefore('cookie-policy/index.html', '</article>', `
        <section class="glass-card p-8 mb-8">
          <h2>9. Examples of Storage Used by Devpalettes</h2>
          <p>Examples of necessary local storage may include a dark or light theme preference, the choice you made in the consent banner, colors saved from the palette generator, recently edited gradient settings, code snippets saved locally, and temporary editor content. These values make the tools more convenient because the page can remember a preference after refresh without requiring a user account.</p>
          <p>Examples of analytics storage may include identifiers used by Google Analytics to distinguish one visit from another, understand page flow, measure tool popularity, and identify technical issues. Analytics data is used in aggregate to improve the site. It should not be used to collect sensitive personal content, passwords, or payment details.</p>
          <p>Examples of advertising storage may include cookies used by Google services to deliver ads, limit repeated ads, measure ad performance, prevent abuse, and apply consent choices. Advertising technologies may interact with Google systems outside Devpalettes, which is why this policy links users to Google-level ad personalization controls as well as browser-level cookie controls.</p>
        </section>
        <section class="glass-card p-8 mb-8">
          <h2>10. Browser Controls</h2>
          <p>Most browsers let you view and delete site data for a specific domain. In Chrome and Edge, open site settings or privacy settings and search for devpalettes.com. In Firefox, use privacy and security settings to manage cookies and site data. In Safari, use privacy settings to manage website data. The exact labels may change over time, but the browser controls usually allow clearing cookies, localStorage, cache, and other stored data for one site.</p>
          <p>Blocking all cookies may affect analytics and advertising features, and clearing all site data will reset local tool preferences. If a tool stops remembering values, check whether the browser is set to clear data after every session or whether an extension is removing localStorage. Private browsing modes commonly discard storage when the private window closes.</p>
        </section>
        <section class="glass-card p-8 mb-8">
          <h2>11. Consent Signals and Limitations</h2>
          <p>Consent tools communicate a visitor's choice to the site and supported third-party services. Devpalettes uses consent-aware behavior so non-essential analytics and advertising storage can be limited where applicable. However, technical limitations may apply. Browser settings, network blockers, regional requirements, third-party scripts, and cached states can affect exactly how a service behaves in a specific environment.</p>
          <p>If you want the strongest opt-out position, reject non-essential cookies, clear existing site data, block third-party cookies in the browser, disable ad personalization in Google settings, and use browser privacy protections. These controls work together: the site-level banner stores your preference for Devpalettes, while browser and Google controls apply more broadly.</p>
        </section>
        <section class="glass-card p-8 mb-8">
          <h2>12. Data We Do Not Request</h2>
          <p>Devpalettes does not require account registration, passwords, payment card details, or private profile information to use the free tools. Contact forms may request enough information to respond to an inquiry, but tool usage itself is designed to avoid user accounts. Visitors should avoid entering confidential, regulated, or private third-party data into any online utility unless they have confirmed that the workflow meets their own security requirements.</p>
        </section>
        <section class="glass-card p-8 mb-8">
          <h2>13. Updates to This Policy</h2>
          <p>This Cookie Policy may be updated when tools change, Google services change, consent behavior changes, or legal requirements evolve. The updated date at the top of the page should reflect meaningful revisions. Continued use of the site after an update means the current policy applies to the visit. Material changes should be written clearly so users can understand what changed without needing to compare legal text line by line.</p>
        </section>`);

insertBefore('disclaimer/index.html', '<div id="footer-container"></div>', `
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="glass-card p-8">
      <h2>Additional Tool Accuracy Notes</h2>
      <p>Devpalettes tools are intended to help with practical design, development, SEO, and content workflows. Generated output should be reviewed before it is used in production. CSS snippets may need class renaming, browser testing, and accessibility checks. Metadata output should be verified on the deployed page. File compression and conversion tools should be tested with the final file before distribution.</p>
      <p>Browser-based tools can behave differently depending on browser version, operating system, device memory, extensions, privacy settings, and file size. If a tool output is critical for a client, commercial release, accessibility compliance, or legal publication, verify it independently and keep a copy of the original source material.</p>
      <h2>Editorial and Correction Policy</h2>
      <p>Devpalettes aims to keep tool descriptions, guides, and policies accurate. If a page contains outdated instructions, broken links, unclear language, or incorrect technical claims, visitors can request a correction through the Contact page. Corrections are prioritized when they affect user safety, privacy, accessibility, search indexing, or generated output quality.</p>
      <h2>No Endorsement of External Sites</h2>
      <p>External links are provided for context, documentation, or related resources. A link does not mean Devpalettes controls, endorses, or guarantees the third-party site. Users should review external privacy policies, terms, and documentation before relying on them for professional decisions.</p>
    </div>
  </section>`);

insertBefore('sitemap.html', '<div id="footer-container"></div>', `
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="glass-card p-8">
      <h2>How to Use This Sitemap</h2>
      <p>This HTML sitemap helps visitors and search engines discover the main public areas of Devpalettes. Use the tools directory when you want a categorized view of every generator, formatter, analyzer, converter, and reference page. Use the blog section when you want longer guides, examples, and tutorials. Use the policy and support links when you need privacy, cookie, terms, disclaimer, help, FAQ, or contact information.</p>
      <p>The XML sitemap at <a href="/sitemap.xml">/sitemap.xml</a> is intended for search engines and includes canonical public URLs. This HTML sitemap is intended for people who prefer a plain navigation overview. Redirect-only pages, duplicate legacy slugs, and non-indexable compatibility routes should not be treated as primary destinations.</p>
      <h2>Navigation Quality Notes</h2>
      <p>Devpalettes keeps important pages reachable through visible navigation, footer links, related tool sections, and contextual links inside guides. If you find a broken link or cannot locate a tool, use the Contact page to report the issue with the source page URL and the link text. Clean internal linking improves user experience and helps search engines understand which pages are canonical.</p>
    </div>
  </section>`);

insertBefore('help-center/index.html', '</article>', `
        <section class="glass-card p-8 mb-8">
          <h2>Publishing Checklist Before You Rely on a Generated Result</h2>
          <p>Before using any generated result in a live website, take a few minutes to verify it in context. Copy the output into a local file or staging environment, refresh the page, and confirm that the result still works when surrounding CSS, JavaScript, images, and browser defaults are present. A snippet that looks correct in a focused generator can behave differently inside a larger project with resets, framework utilities, component libraries, and inherited styles.</p>
          <p>For visual output, check normal, hover, focus, active, and disabled states. For text and metadata output, check spelling, length, uniqueness, and whether the output accurately describes the page. For file conversion and compression output, open the final file separately and compare it against the source. For SEO files such as robots.txt and sitemap.xml, validate syntax and confirm that important pages are not accidentally blocked, duplicated, or canonicalized to the wrong route.</p>
          <p>When a generated result becomes part of a production project, store the final source of truth in your own system. That might be a CSS variables file, Tailwind configuration, design token document, README, brand guide, or SEO checklist. Browser tools are excellent for fast creation and validation, but project documentation is what keeps teams aligned over time.</p>
        </section>`);

insertBefore('faq/index.html', '</div>\n  </main>', `
      <section class="glass-card p-8 mt-10">
        <h2 class="text-2xl font-bold mb-4">More Detailed Answers</h2>
        <h3 class="text-xl font-bold mb-2">How should I decide between similar tools?</h3>
        <p class="text-slate-600 dark:text-slate-400 mb-4">Choose the tool based on your starting point. If you already have a color value, start with the converter, color wheel, contrast checker, or framework palette generator. If you have a visual asset, start with an image or brand extractor. If you have a layout problem, use Flexbox, Grid, aspect ratio, or REM/PX tools. If you have a publishing problem, use the SEO metadata, sitemap, robots, Open Graph, or social preview tools.</p>
        <h3 class="text-xl font-bold mb-2">How do I keep generated CSS maintainable?</h3>
        <p class="text-slate-600 dark:text-slate-400 mb-4">After copying generated CSS, replace generic selectors with meaningful project names, move repeated colors into variables, and group related properties together. Keep comments only where they explain a decision. If you use a framework, translate the output into that framework's conventions rather than leaving one-off styles scattered through a project. This makes future edits easier and helps teammates understand why a style exists.</p>
        <h3 class="text-xl font-bold mb-2">How do I avoid accessibility mistakes?</h3>
        <p class="text-slate-600 dark:text-slate-400 mb-4">Validate contrast early, not after a design is complete. Avoid using pale colors for small text, avoid neon colors for body copy, and avoid relying on red and green alone for status. Use labels, icons, patterns, or text alongside color. Test focus states for keyboard users and make sure animated or decorative effects do not hide content or interfere with reading.</p>
        <h3 class="text-xl font-bold mb-2">Why are outputs sometimes different across browsers?</h3>
        <p class="text-slate-600 dark:text-slate-400 mb-4">Browsers share many standards but still differ in rendering details, color management, file APIs, clipboard permissions, and security settings. Canvas-based tools, file downloads, and CSS effects can be affected by browser version, operating system, hardware acceleration, and privacy extensions. When output matters, test in at least two modern browsers and on the type of device your audience uses most.</p>
        <h3 class="text-xl font-bold mb-2">How do privacy settings affect Devpalettes?</h3>
        <p class="text-slate-600 dark:text-slate-400 mb-4">Strict privacy settings may block third-party cookies, analytics scripts, clipboard access, or persistent localStorage. The core page content should remain available, but some convenience features may reset after every visit or require manual copying. This is expected behavior when browsers or extensions prioritize privacy over persistence.</p>
        <h3 class="text-xl font-bold mb-2">What should I do before submitting a bug report?</h3>
        <p class="text-slate-600 dark:text-slate-400">Refresh the page, try a modern browser, disable extensions temporarily, and reproduce the issue with the smallest possible input. Then send the page URL, browser, device, input, expected output, actual output, and screenshots if useful. Reports with clear reproduction steps are much easier to fix than general statements that something does not work.</p>
      </section>`);

insertBefore('cookie-policy/index.html', '</article>', `
        <section class="glass-card p-8 mb-8">
          <h2>14. Practical Cookie Scenarios</h2>
          <p>If you accept non-essential cookies, Devpalettes may load analytics and advertising features that help measure visits and support free access to the site. If you reject them, the site should still provide core tool functionality, although measurement and ad personalization may be limited. If you clear site data later, your previous consent choice may be removed and the banner may appear again.</p>
          <p>If you use private browsing, your browser may delete cookies and localStorage when the private session ends. If you use a workplace, school, or managed device, administrators may enforce policies that block downloads, clipboard access, local storage, or third-party scripts. In those cases, Devpalettes may not be able to override the browser or organization-level restrictions.</p>
          <p>If a tool appears to forget settings after every page load, check browser privacy settings first. Many privacy extensions automatically clear site storage, which protects privacy but also removes saved palettes, consent choices, and editor state. Export important work before clearing storage or closing a private window.</p>
        </section>`);
