import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('prototypes/tela-03-talhoes-gis.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'/\* ── Topbar ──.*?(?=(/\* ── |@media))', html, re.DOTALL)
if m:
    print(m.group(0))
