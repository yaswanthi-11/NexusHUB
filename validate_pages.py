from pathlib import Path
from html.parser import HTMLParser
import re

class AssetParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.scripts = []
        self.links = []
        self.images = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'script' and 'src' in attrs:
            self.scripts.append(attrs['src'])
        if tag == 'link' and attrs.get('rel') in ('stylesheet', 'icon', 'shortcut icon') and 'href' in attrs:
            self.links.append(attrs['href'])
        if tag == 'img' and 'src' in attrs:
            self.images.append(attrs['src'])


root = Path(__file__).resolve().parent.parent
html_files = sorted(root.rglob('*.html'))
print(f'Found {len(html_files)} HTML pages')

for html_path in html_files:
    rel = html_path.relative_to(root)
    print('\n---')
    print('Page:', rel)
    text = html_path.read_text(encoding='utf-8', errors='replace')
    parser = AssetParser()
    parser.feed(text)

    if parser.scripts:
        print(' scripts:', parser.scripts)
    if parser.links:
        print(' styles:', parser.links)
    if parser.images:
        print(' images:', parser.images)

    for asset_type, assets in [('script', parser.scripts), ('style', parser.links), ('image', parser.images)]:
        for asset in assets:
            if asset.startswith(('http://', 'https://', '/')):
                continue
            asset_path = (html_path.parent / asset).resolve()
            if asset_path.exists():
                print('   exists:', asset)
            else:
                print('   MISSING:', asset, '->', asset_path)

    title_match = re.search(r'<title>(.*?)</title>', text, re.I | re.S)
    if title_match:
        print(' title:', title_match.group(1).strip())
