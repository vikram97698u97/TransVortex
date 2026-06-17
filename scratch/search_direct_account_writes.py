import sys
sys.stdout.reconfigure(encoding='utf-8')

import os
for root, dirs, files in os.walk('.'):
    if any(p in root for p in ['.git', 'node_modules', '.qodo', '.github']):
        continue
    for file in files:
        if file.endswith('.js') or file.endswith('.html'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                for i, line in enumerate(f):
                    if 'money_transactions' in line and ('update(' in line or 'set(' in line or 'remove(' in line):
                        safe_line = line.strip().encode('ascii', errors='replace').decode('ascii')
                        print(f"{path}:{i+1}: {safe_line[:120]}")
