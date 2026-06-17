import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('work-management.html', 'r', encoding='utf-8', errors='ignore') as f:
    for i, line in enumerate(f):
        line_lower = line.lower()
        if 'outstanding' in line_lower:
            safe_line = line.strip().encode('ascii', errors='replace').decode('ascii')
            print(f"{i+1}: {safe_line[:120]}")
