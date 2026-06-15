import sys
sys.stdout.reconfigure(encoding='utf-8')

for path in ['lr-report.js', 'route-details.html']:
    print(f"\n=== MATCHES IN {path} ===")
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        for i, line in enumerate(f):
            if 'fuelLogs' in line and any(term in line for term in ['remove', 'delete', 'update', 'set']):
                safe_line = line.strip().encode('ascii', errors='replace').decode('ascii')
                print(f"{i+1}: {safe_line[:120]}")
