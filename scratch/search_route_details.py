import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('route-details.html', 'r', encoding='utf-8', errors='ignore') as f:
    for i, line in enumerate(f):
        # We look for database operations, or references to fuelLogs or petrolPumps
        line_lower = line.lower()
        if any(term in line_lower for term in ['ref(', 'push(', 'update(', 'set(', 'remove(', 'fuel', 'moneyflow']):
            safe_line = line.strip().encode('ascii', errors='replace').decode('ascii')
            print(f"{i+1}: {safe_line[:120]}")
