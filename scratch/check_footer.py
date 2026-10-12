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

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        html = fp.read()
    
    footer_m = re.search(r'<div class="sidebar-footer".*?</div>\s*</aside>', html, re.DOTALL)
    if footer_m:
        print(f"=== {f} Footer ===")
        print(" ".join(footer_m.group(0).split()))
