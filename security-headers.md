# Security header recommendations (GitHub Pages + custom domain)

GitHub Pages does not let you set custom HTTP response headers per-path from this repository. To enable modern security headers, set them at your DNS/edge layer (recommended: Cloudflare) or via a reverse proxy.

## Recommended headers

Use these as a baseline and tighten over time after testing:

### Strict-Transport-Security (HSTS)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

Only enable this if HTTPS works reliably for the apex + `www` and you do not need HTTP for anything. After enabling, consider submitting your domain to the HSTS preload list.

### Content-Security-Policy (CSP)

Devpalettes loads assets from Google Fonts, Font Awesome (cdnjs), and Google services (Analytics/AdSense). A practical starter CSP:

```
Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://www.googlesyndication.com; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://pagead2.googlesyndication.com; upgrade-insecure-requests
```

Notes:
- This CSP keeps `'unsafe-inline'` because many pages include inline scripts. If you want to remove `'unsafe-inline'`, you’ll need to migrate inline scripts to external files and use nonces/hashes.
- Test in Report-Only first to avoid breaking production.

### X-Content-Type-Options

```
X-Content-Type-Options: nosniff
```

### Referrer-Policy

```
Referrer-Policy: strict-origin-when-cross-origin
```

### Permissions-Policy

```
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
```

Adjust based on any real feature needs.

### Cross-Origin-Opener-Policy / Cross-Origin-Resource-Policy (optional)

Only enable after testing because some third-party widgets/scripts can break:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-site
```

## Cloudflare setup (suggested)

If you use Cloudflare in front of GitHub Pages:
- Add the headers above in **Rules → Transform Rules → HTTP Response Header Modification**
- Start CSP with **Report-Only** and review the reports
- Enable **Always Use HTTPS** and consider **HSTS**

