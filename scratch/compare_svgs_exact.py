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

file_svgs = {}
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        html = fp.read()
    m = re.search(r'<aside class="sidebar".*?</aside>', html, re.DOTALL)
    items = re.findall(r'<a ([^>]*)>(.*?)</a>', m.group(0), re.DOTALL)
    file_svgs[f] = []
    for attr, content in items:
        svg_m = re.search(r'<svg[^>]*>(.*?)</svg>', content, re.DOTALL)
        cleaned = " ".join(svg_m.group(0).split()) if svg_m else ""
        file_svgs[f].append(cleaned)

ref = file_svgs['prototypes/tela-01-dashboard.html']

all_matched = True
for item_idx in range(8):
    ref_svg = ref[item_idx]
    print(f"\n--- ITEM {item_idx + 1} ---")
    for f in files:
        cur_svg = file_svgs[f][item_idx]
        if cur_svg == ref_svg:
            print(f"  {f.split('/')[-1]}: MATCH")
        else:
            all_matched = False
            print(f"  {f.split('/')[-1]}: DIFFERENCE DETECTED!")

print("\nALL MATCHED 100%:", all_matched)
