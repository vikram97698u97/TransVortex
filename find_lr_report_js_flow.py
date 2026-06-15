import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('lr-report.js', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'tripadvanceaccountid' in line.lower() or 'moneyflow' in line.lower():
            print(f"{i+1}: {line.strip()}")
