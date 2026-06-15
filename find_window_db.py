import os

for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith('.js') or file.endswith('.html'):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                if 'window.db =' in content or 'window.db=' in content:
                    print(f"window.db set in {path}")
            except Exception as e:
                pass
