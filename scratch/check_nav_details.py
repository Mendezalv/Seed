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

data = {}

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        html = fp.read()
    
    m = re.search(r'<aside class="sidebar".*?</aside>', html, re.DOTALL)
    if not m:
        continue
    sidebar_html = m.group(0)
    # Find all nav items
    items = re.findall(r'<a [^>]*class="nav-item[^"]*"[^>]*>(.*?)</a>', sidebar_html, re.DOTALL)
    data[f] = []
    for item in items:
        # extract svg
        svg_m = re.search(r'<svg[^>]*>(.*?)</svg>', item, re.DOTALL)
        svg_content = " ".join(svg_m.group(0).split()) if svg_m else "NO_SVG"
        # extract label
        label = re.sub(r'<svg.*?</svg>', '', item, flags=re.DOTALL)
        label = re.sub(r'<span class="nav-badge.*?</span>', '', label, flags=re.DOTALL)
        label = " ".join(label.split()).strip()
        data[f].append((label, svg_content))

print("=== CHECKING NAV LABELS AND ICONS ===")
base_file = 'prototypes/tela-01-dashboard.html'
for idx in range(8):
    base_label, base_svg = data[base_file][idx]
    print(f"\nItem {idx+1}: '{base_label}'")
    for f in files:
        lbl, svg = data[f][idx]
        lbl_match = (lbl == base_label)
        # normalize spaces/quotes in svg
        svg_match = (re.sub(r'\s+', ' ', svg) == re.sub(r'\s+', ' ', base_svg))
        if not lbl_match or not svg_match:
            print(f"  MISMATCH in {f}:")
            if not lbl_match:
                print(f"    Label: expected '{base_label}', got '{lbl}'")
            if not svg_match:
                print(f"    SVG diff: base={base_svg[:60]}... got={svg[:60]}...")
                # print actual diff in svg
                if "path" in svg and "path" in base_svg:
                    base_path = re.findall(r'd="([^"]+)"', base_svg)
                    this_path = re.findall(r'd="([^"]+)"', svg)
                    print(f"    base paths: {base_path}")
                    print(f"    this paths: {this_path}")
        else:
            print(f"  OK in {f}")
