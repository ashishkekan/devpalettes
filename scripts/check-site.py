"""Validate the shipped static site without third-party Python dependencies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit, unquote
import json
import subprocess
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://devpalettes.com'
errors = []

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.scripts = []
        self.current = None
        self.canonical = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'script':
            self.current = [attrs, '']
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs.get('href')
        values = [attrs[k] for k in ('href', 'src', 'poster') if attrs.get(k)]
        if tag == 'meta' and attrs.get('property', attrs.get('name', '')) in ('og:image', 'twitter:image', 'og:url', 'twitter:url'):
            values.append(attrs.get('content', ''))
        for value in values:
            u = urlsplit(urljoin(ORIGIN + '/' + self.path.relative_to(ROOT).as_posix(), value))
            if u.netloc == 'devpalettes.com':
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
for path in pages:
    page = Page(path)
    page.feed(path.read_text())
    if path.name.startswith('google'):
        continue  # Search Console verification file
    if path.relative_to(ROOT).as_posix() != 'sitemap/index.html':
        relative = path.relative_to(ROOT).as_posix()
        expected = ORIGIN + '/' + (relative[:-10] if relative.endswith('index.html') else relative)
        if page.canonical != expected:
            errors.append(f'{relative}: canonical should be {expected}')
        if expected not in locs:
            errors.append(f'{relative}: missing from sitemap')
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
    dest = ROOT / urlsplit(loc).path.lstrip('/')
    if dest.is_dir():
        dest /= 'index.html'
    if not dest.is_file():
        errors.append(f'Sitemap points to missing file: {loc}')
if errors:
    print('\n'.join(errors))
    sys.exit(1)
print(f'PASS: {len(pages)} HTML files, {script_count} scripts, JSON-LD, local links/assets, canonicals, {len(locs)} sitemap URLs and consent gating.')
