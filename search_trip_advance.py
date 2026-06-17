with open('lr-report.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(320, 390):
    if i < len(lines):
        safe_line = lines[i].strip().encode('ascii', errors='replace').decode('ascii')
        print(f"Line {i+1}: {safe_line}")
