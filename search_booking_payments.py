with open('booking.html', 'r', encoding='utf-8') as f:
    content = f.read()

import re
matches = [m.start() for m in re.finditer("payments", content)]
for m in matches[:10]: # Print first few matches to see where payment forms or methods are
    line_no = content[:m].count('\n') + 1
    print(f"payments found on line {line_no}")
    with open('booking.html', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    for i in range(max(0, line_no - 4), min(len(lines), line_no + 12)):
        safe_line = lines[i].strip().encode('ascii', errors='replace').decode('ascii')
        print(f"Line {i+1}: {safe_line}")
    print("="*40)
