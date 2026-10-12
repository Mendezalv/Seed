import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

for f in ['prototypes/tela-01-dashboard.html', 'prototypes/tela-06-maquinarios.html']:
    with open(f, 'r', encoding='utf-8') as fp:
        html = fp.read()
    print(f"=== {f} ===")
    m = re.findall(r'@media\s*\([^)]+\)\s*\{[^}]*sidebar[^}]*\}', html, re.DOTALL)
    for r in m:
        print(r)
