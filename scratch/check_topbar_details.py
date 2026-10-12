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
    
    # find topbar left or topbar breadcrumbs
    tb_m = re.search(r'<header class="topbar">(.*?)</header>', html, re.DOTALL)
    if tb_m:
        print(f"=== {f} Topbar ===")
        # find breadcrumb tag
        bc_m = re.search(r'<(?:div|nav)\s+class="topbar-breadcrumb[s]?".*?</(?:div|nav)>', tb_m.group(1), re.DOTALL)
        if bc_m:
            print("Breadcrumb HTML:", " ".join(bc_m.group(0).split()))
        else:
            print("Breadcrumb NOT found! Topbar left snippet:")
            print(" ".join(tb_m.group(1)[:150].split()))
