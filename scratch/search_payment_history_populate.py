import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('add.html', 'r', encoding='utf-8', errors='ignore') as f:
    for i, line in enumerate(f):
        if 'modalPaymentHistoryTable' in line:
            safe_line = line.strip().encode('ascii', errors='replace').decode('ascii')
            print(f"{i+1}: {safe_line[:120]}")
