import os

search_term = 'renderVendorSelects'
for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith('.js') or file.endswith('.html'):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                if search_term in content:
                    print(f"Found in {path}")
            except Exception as e:
                pass
