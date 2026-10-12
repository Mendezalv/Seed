import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

files = [
    'prototypes/tela-01-dashboard.html',
    'prototypes/tela-03-talhoes-gis.html',
    'prototypes/tela-04-safras-planejamento.html',
    'prototypes/tela-05-insumos-estoque.html'
]

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        html = fp.read()
    print(f"=== {f} ===")
    m_sb = re.search(r'\.sidebar\s*\{.*?(?=\.main-content)', html, re.DOTALL)
    if m_sb:
        print("Sidebar CSS length:", len(m_sb.group(0)))
    m_tb = re.search(r'\.topbar\s*\{.*?(?=(/\*|@media|\.ticker))', html, re.DOTALL)
    if m_tb:
        print("Topbar CSS snippet:", " ".join(m_tb.group(0).split()[:20]))
