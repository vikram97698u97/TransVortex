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
                content = f.read()
            if 'fuelLogs' in content and ('remove' in content or 'delete' in content):
                print(f"Matched in {path}")
