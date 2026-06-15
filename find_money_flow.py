import os
import re

terms = ['logGlobalTransaction', 'moneyFlow', 'accounts', 'galla', 'money-flow']

for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith('.js') or file.endswith('.html'):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                found = []
                for term in terms:
                    if term in content:
                        found.append(term)
                if found:
                    print(f"{path}: matched {found}")
            except Exception as e:
                pass
