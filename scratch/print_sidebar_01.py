import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('prototypes/tela-01-dashboard.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'<aside class="sidebar".*?</aside>', html, re.DOTALL)
if m:
    print(m.group(0))
