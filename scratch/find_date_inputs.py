import glob
import re

for f in sorted(glob.glob('prototypes/*.html')):
    with open(f, encoding='utf-8') as fp:
        c = fp.read()
    matches = re.findall(r'<input[^>]*type=["\']date["\'][^>]*>', c)
    if matches:
        print(f'{f}: {len(matches)} inputs found:')
        for m in matches:
            print('  ', m)
