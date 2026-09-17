"""Validate the shipped static site without third-party Python dependencies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit, unquote
import json
import re
import subprocess
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://devpalettes.com'
errors = []
redirects = json.loads((ROOT / 'scripts/legacy-redirects.json').read_text())

def url_path(path):
    relative = path.relative_to(ROOT).as_posix()
    return '/' + (relative[:-10] if relative.endswith('index.html') else relative)

def check_url(value, context):
    u = urlsplit(value)
    if u.netloc != 'devpalettes.com':
        return
    if '//' in unquote(u.path):
        errors.append(f'{context}: repeated slash in URL {value}')
    dest = ROOT / unquote(u.path).lstrip('/')
    if u.path and dest.is_dir() and not u.path.endswith('/'):
        errors.append(f'{context}: directory URL needs trailing slash: {value}')

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.scripts = []
        self.current = None
        self.canonical = None
        self.refresh = None
        self.robots = ''
        self.links = set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'script':
            self.current = [attrs, '']
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs.get('href')
        if tag == 'meta' and attrs.get('http-equiv', '').lower() == 'refresh':
            self.refresh = attrs.get('content', '')
        if tag == 'meta' and attrs.get('name', '').lower() == 'robots':
            self.robots = attrs.get('content', '').lower()
        values = [attrs[k] for k in ('href', 'src', 'poster') if attrs.get(k)]
        if tag == 'meta' and attrs.get('property', attrs.get('name', '')) in ('og:image', 'twitter:image', 'og:url', 'twitter:url'):
            values.append(attrs.get('content', ''))
        for value in values:
            resolved = urljoin(ORIGIN + '/' + self.path.relative_to(ROOT).as_posix(), value)
            check_url(resolved, self.path.relative_to(ROOT))
            u = urlsplit(resolved)
            if u.netloc == 'devpalettes.com':
                if tag == 'a':
                    self.links.add(u.path or '/')
                dest = ROOT / unquote(u.path).lstrip('/')
                if dest.is_dir():
                    dest /= 'index.html'
                if not dest.is_file():
                    errors.append(f'{self.path.relative_to(ROOT)}: missing {value}')
        if tag == 'script' and 'pagead2.googlesyndication.com' in attrs.get('src', ''):
            errors.append(f'{self.path}: ungated AdSense script')

    def handle_data(self, data):
        if self.current is not None:
            self.current[1] += data

    def handle_endtag(self, tag):
        if tag == 'script' and self.current is not None:
            self.scripts.append(self.current)
            self.current = None

pages = [p for p in ROOT.rglob('*.html') if 'node_modules' not in p.parts and '.git' not in p.parts]
locs = [el.text for el in ET.parse(ROOT / 'sitemap.xml').iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
if len(locs) != len(set(locs)):
    errors.append('Duplicate sitemap URLs')
script_count = 0
parsed = {}
for path in pages:
    page = Page(path)
    page.feed(path.read_text())
    route = url_path(path)
    parsed[route] = page
    if re.fullmatch(r'google[a-f0-9]+\.html', path.name):
        continue  # Search Console verification file
    if route in redirects:
        target = redirects[route]
        if page.canonical != ORIGIN + target or page.refresh != '0; url=' + target:
            errors.append(f'{route}: redirect must go immediately to {target}, with matching canonical')
        if target in redirects or target == route:
            errors.append(f'{route}: redirect chain or loop')
        if ORIGIN + route in locs:
            errors.append(f'{route}: redirect must not appear in sitemap')
        if ORIGIN + target not in locs:
            errors.append(f'{route}: redirect target must be in sitemap')
    else:
        relative = path.relative_to(ROOT).as_posix()
        expected = ORIGIN + route
        if page.canonical != expected:
            errors.append(f'{relative}: canonical should be {expected}')
        if expected not in locs:
            errors.append(f'{relative}: missing from sitemap')
        if page.refresh or 'noindex' in page.robots or 'none' in page.robots.split(','):
            errors.append(f'{relative}: canonical page redirects or blocks indexing')
    for attrs, code in page.scripts:
        kind = attrs.get('type', '')
        if attrs.get('src') or kind == 'text/plain':
            continue
        if kind == 'application/ld+json':
            try:
                json.loads(code)
            except ValueError as exc:
                errors.append(f'{path}: invalid JSON-LD: {exc}')
        elif kind in ('', 'text/javascript', 'module'):
            script_count += 1
            mode = 'module' if kind == 'module' else 'commonjs'
            result = subprocess.run(['node', '--check', f'--input-type={mode}'], input=code, text=True, capture_output=True)
            if result.returncode:
                errors.append(f'{path}: {result.stderr}')
for path in (ROOT / 'js').glob('*.js'):
    script_count += 1
    result = subprocess.run(['node', '--check', str(path)], text=True, capture_output=True)
    if result.returncode:
        errors.append(result.stderr)
for loc in locs:
    check_url(loc, 'sitemap.xml')
    if urlsplit(loc).netloc != 'devpalettes.com' or urlsplit(loc).scheme != 'https':
        errors.append(f'Unexpected sitemap origin: {loc}')
    dest = ROOT / urlsplit(loc).path.lstrip('/')
    if dest.is_dir():
        dest /= 'index.html'
    if not dest.is_file():
        errors.append(f'Sitemap points to missing file: {loc}')
    elif urlsplit(loc).path not in parsed or parsed[urlsplit(loc).path].canonical != loc:
        errors.append(f'Sitemap URL does not match page canonical: {loc}')
for route in redirects:
    if route not in parsed:
        errors.append(f'Missing legacy redirect page: {route}')
# Verify discovery through static anchors, not only JavaScript-generated menus.
reachable, pending = set(), ['/']
while pending:
    route = pending.pop()
    if route in reachable or route not in parsed:
        continue
    reachable.add(route)
    pending.extend(parsed[route].links - reachable)
for loc in locs:
    if urlsplit(loc).path not in reachable:
        errors.append(f'No static navigation path from homepage: {loc}')
if errors:
    print('\n'.join(errors))
    sys.exit(1)
print(f'PASS: {len(pages)} HTML files, {script_count} scripts, JSON-LD, local links/assets, canonicals, {len(locs)} sitemap URLs, {len(redirects)} redirects, static discovery and consent gating.')
