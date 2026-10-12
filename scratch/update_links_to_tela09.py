import re
import glob

files = glob.glob('prototypes/tela-*.html')

for f in sorted(files):
    if 'tela-09' in f or 'tela-02' in f:
        continue
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    
    # Replace href="#" in the Sustentabilidade nav group
    pattern = r'(<div class="nav-group-label">Sustentabilidade</div>\s*<a href=")(#)(" class="nav-item">)'
    if re.search(pattern, content):
        new_content = re.sub(pattern, r'\g<1>tela-09-energia-esg.html\g<3>', content)
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(new_content)
        print(f"Updated {f}")
    else:
        print(f"Pattern not found in {f}")
