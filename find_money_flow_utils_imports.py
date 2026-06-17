import os
import sys
sys.stdout.reconfigure(encoding='utf-8')

for root, dirs, files in os.walk('.'):
    if any(p in root for p in ['.git', 'node_modules', '.qodo', '.github']):
        continue
    for f in files:
        if f.endswith('.html') or f.endswith('.js'):
            fp = os.path.join(root, f)
            with open(fp, 'r', encoding='utf-8', errors='ignore') as file:
                for i, line in enumerate(file):
                    if 'money-flow-utils.js' in line:
                        print(f"{f}:{i+1}: {line.strip()}")
