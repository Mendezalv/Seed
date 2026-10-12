import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

files = [
    'prototypes/tela-01-dashboard.html',
    'prototypes/tela-03-talhoes-gis.html',
    'prototypes/tela-04-safras-planejamento.html',
    'prototypes/tela-05-insumos-estoque.html',
    'prototypes/tela-06-maquinarios.html',
    'prototypes/tela-07-viabilidade.html',
    'prototypes/tela-08-vigilancia-sanitaria.html'
]

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        html = fp.read()
    
    m = re.search(r'<aside class="sidebar".*?</aside>', html, re.DOTALL)
    if m:
        sidebar_html = m.group(0)
        items = re.findall(r'<a ([^>]*)class="nav-item([^"]*)"([^>]*)>(.*?)</a>', sidebar_html, re.DOTALL)
        print(f'=== {f} ===')
        brand_m = re.search(r'<div class="sidebar-brand".*?</div>\s*</div>', sidebar_html, re.DOTALL)
        if brand_m:
            print('Brand:', " ".join(brand_m.group(0).split())[:120])
        print(f'Nav items count: {len(items)}')
        for pre, active_cls, post, inner in items:
            href_m = re.search(r'href="([^"]*)"', pre + post)
            href = href_m.group(1) if href_m else ''
            no_svg = re.sub(r'<svg.*?</svg>', '', inner, flags=re.DOTALL)
            text_match = re.search(r'([A-Za-zÀ-ÿ &]+)', no_svg)
            title = text_match.group(1).strip() if text_match else 'UNKNOWN'
            is_active = 'active' in active_cls
            has_badge = 'nav-badge' in inner
            print(f'  - {title} [href="{href}"] (active={is_active}, badge={has_badge})')
