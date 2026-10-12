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

selectors = [
    r'\.sidebar\s*\{([^}]+)\}',
    r'\.sidebar-brand\s*\{([^}]+)\}',
    r'\.sidebar-nav\s*\{([^}]+)\}',
    r'\.nav-group\s*\{([^}]+)\}',
    r'\.nav-group-label\s*\{([^}]+)\}',
    r'\.nav-item\s*\{([^}]+)\}',
    r'\.sidebar-footer\s*\{([^}]+)\}',
    r'\.topbar\s*\{([^}]+)\}',
    r'\.topbar-left\s*\{([^}]+)\}',
    r'\.topbar-breadcrumb.*?\s*\{([^}]+)\}'
]

for sel in selectors:
    print(f"\n==================== SELECTOR: {sel} ====================")
    for f in files:
        with open(f, 'r', encoding='utf-8') as fp:
            html = fp.read()
        m = re.search(sel, html)
        content = " ".join(m.group(1).split()) if m else "NOT FOUND"
        print(f"[{f.split('/')[-1]}]: {content}")
