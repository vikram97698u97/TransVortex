with open('payment-billing.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if 'ref(' in line or 'db.ref' in line or 'push(' in line or 'update(' in line or 'set(' in line:
        safe_line = line.strip().encode('ascii', errors='replace').decode('ascii')
        print(f"Line {idx+1}: {safe_line}")
