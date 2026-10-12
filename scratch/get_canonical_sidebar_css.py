import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('prototypes/tela-03-talhoes-gis.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'/\* ── Sidebar ──.*?(?=/\* ── Main Content)', html, re.DOTALL)
if m:
    print(m.group(0))
else:
    m2 = re.search(r'\.sidebar\s*\{.*?(?=\.main-content)', html, re.DOTALL)
    if m2:
        print(m2.group(0))
