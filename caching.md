# Caching & compression recommendations (GitHub Pages + custom domain)

GitHub Pages serves static files with limited control over `Cache-Control` headers. For stronger caching and Brotli/gzip behavior, use an edge proxy (recommended: Cloudflare) in front of GitHub Pages.

## What to cache aggressively

These assets are safe to cache long-term because they are versioned or rarely change:
- `/css/tailwind.min.css`
- `/css/styles.css` (recommended: add a version query like `?v=3` when you change it)
- `/css/animations.css`
- `/js/main.js` (recommended: add `?v=` when you change it)
- `/images/*` (icons, og images, logos)

## Cloudflare recommended rules

### 1) Enable Brotli + Early Hints

In Cloudflare dashboard:
- **Speed → Optimization → Brotli**: ON
- **Speed → Optimization → Early Hints**: ON

### 2) Cache static assets (Cache Everything)

Create a Cache Rule for static assets:
- If URI path matches: `/*.css` OR `/*.js` OR `/images/*`
- Then:
  - **Cache status**: Cache
  - **Edge TTL**: 1 month (or longer)
  - **Browser TTL**: 1 week (or longer)

### 3) Don’t cache HTML

Create a rule for HTML pages:
- If URI path matches: `/*.html` OR no file extension
- Then:
  - **Cache status**: Bypass

This prevents stale pages after content updates.

## Versioning (important)

When you update CSS/JS, bump a query string in HTML:
- `/css/styles.css?v=3`
- `/js/main.js?v=3`

This is the safest way to get fast caching + instant updates without changing filenames.

