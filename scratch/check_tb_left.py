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
    tb_m = re.search(r'<header class="topbar">(.*?)</header>', html, re.DOTALL)
    has_tb_left = '<div class="topbar-left">' in tb_m.group(1) if tb_m else False
    print(f"{f}: has topbar-left = {has_tb_left}")
