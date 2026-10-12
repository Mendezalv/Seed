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
    
    # check if there are responsive rules for sidebar or topbar
    resp_sb = re.findall(r'@media[^{]+\{[^}]*\.sidebar[^}]*\}', html)
    print(f"{f}: {len(resp_sb)} responsive sidebar rules")
