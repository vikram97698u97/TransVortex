import os

terms = ['fuelPayments', 'petrolPumps', 'pumpTransactions', 'fuelLogs']
for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith('.js') or file.endswith('.html'):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                found = [t for t in terms if t in content]
                if found:
                    print(f"{path}: matched {found}")
            except Exception as e:
                pass
