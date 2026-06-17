import sys
sys.stdout.reconfigure(encoding='utf-8')

files = ['booking.html', 'transporters.html', 'work-management.html', 'payment-billing.html']

for filename in files:
    print(f"\n=== SEARCHING {filename} ===")
    with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
        for i, line in enumerate(f):
            line_lower = line.lower()
            if any(term in line_lower for term in ['ref(', 'push(', 'update(', 'set(', 'remove(', 'moneyflow', 'recordpayment', 'deletepayment']):
                safe_line = line.strip().encode('ascii', errors='replace').decode('ascii')
                print(f"{i+1}: {safe_line[:120]}")
