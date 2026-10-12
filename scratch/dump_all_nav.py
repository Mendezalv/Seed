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
    print(f"\n==================== {f} ====================")
    with open(f, 'r', encoding='utf-8') as fp:
        html = fp.read()
    m = re.search(r'<aside class="sidebar".*?</aside>', html, re.DOTALL)
    if not m:
        continue
    items = re.findall(r'<a ([^>]*)>(.*?)</a>', m.group(0), re.DOTALL)
    for i, (attr, content) in enumerate(items):
        txt = re.sub(r'<svg.*?</svg>', '', content, flags=re.DOTALL)
        txt = re.sub(r'<span class="nav-badge.*?</span>', '', txt, flags=re.DOTALL)
        txt = " ".join(txt.split()).strip()
        svg_m = re.search(r'<svg[^>]*>(.*?)</svg>', content, re.DOTALL)
        path_m = re.findall(r'd="([^"]+)"', svg_m.group(1)) if svg_m else []
        first_few = path_m[0][:50] if path_m else "NO PATH"
        print(f"[{i+1}] '{txt}' -> Path: {first_few}...")
