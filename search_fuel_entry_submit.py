with open('lr-report.js', 'r', encoding='utf-8') as f:
    content = f.read()

import re
matches = [m.start() for m in re.finditer("fuelEntryForm", content)]
for m in matches:
    line_no = content[:m].count('\n') + 1
    print(f"fuelEntryForm found on line {line_no}")
    with open('lr-report.js', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    for i in range(max(0, line_no - 5), min(len(lines), line_no + 35)):
        safe_line = lines[i].strip().encode('ascii', errors='replace').decode('ascii')
        print(f"Line {i+1}: {safe_line}")
    print("="*40)
