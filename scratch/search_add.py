import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('add.html', 'r', encoding='utf-8', errors='ignore') as f:
    for i, line in enumerate(f):
        line_lower = line.lower()
        if any(term in line_lower for term in ['driverSalaryPayments', 'salary', 'moneyflow', 'recordpayment', 'deletepayment']):
            safe_line = line.strip().encode('ascii', errors='replace').decode('ascii')
            print(f"{i+1}: {safe_line[:120]}")
