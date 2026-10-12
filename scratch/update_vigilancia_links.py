import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

files = [
    'prototypes/tela-01-dashboard.html',
    'prototypes/tela-03-talhoes-gis.html',
    'prototypes/tela-04-safras-planejamento.html',
    'prototypes/tela-05-insumos-estoque.html',
    'prototypes/tela-06-maquinarios.html',
    'prototypes/tela-07-viabilidade.html'
]

target_pattern = r'<a href="#" class="nav-item">(\s*<svg[^>]*>.*?</svg>\s*Vigilância Sanitária\s*<span class="nav-badge">1</span>\s*)</a>'
replacement = r'<a href="tela-08-vigilancia-sanitaria.html" class="nav-item">\1</a>'

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        html = fp.read()
    
    new_html, count = re.subn(target_pattern, replacement, html, flags=re.DOTALL)
    if count > 0:
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(new_html)
        print(f"Updated {f}: {count} replacement(s)")
    else:
        print(f"Could not find exact pattern in {f}, searching...")
        # check what is around Vigilância Sanitária
        m = re.search(r'<a [^>]*>.*?Vigilância Sanitária.*?</a>', html, re.DOTALL)
        if m:
            print(f"Found: {m.group(0)[:100]}")
