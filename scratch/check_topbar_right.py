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
    
    tb_r = re.search(r'<div class="topbar-right">(.*?)</div>\s*</header>', html, re.DOTALL)
    if tb_r:
        print(f"=== {f} Topbar Right ===")
        # buttons in topbar-right
        btns = re.findall(r'<button [^>]*class="([^"]*)"[^>]*>(.*?)</button>', tb_r.group(1), re.DOTALL)
        print(f"Buttons count: {len(btns)}")
        for cls, content in btns:
            title = re.search(r'title="([^"]*)"', content)
            print(f"  class='{cls}', title='{title.group(1) if title else ''}'")
