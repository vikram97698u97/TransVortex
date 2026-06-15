import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('lr-report.html', 'r', encoding='utf-8', errors='ignore') as f:
    for i, line in enumerate(f):
        if 'recent fuel entries' in line.lower() or 'fuelentryform' in line.lower():
            safe_line = line.strip().encode('ascii', errors='replace').decode('ascii')
            print(f"{i+1}: {safe_line[:120]}")
