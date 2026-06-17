with open('lr-report.html', 'r', encoding='utf-8') as f:
    content = f.read()

import re
matches = [m.start() for m in re.finditer('id="tripDetailsModal"', content)]
if matches:
    start_pos = matches[0]
    # Let's count lines up to start_pos
    line_no = content[:start_pos].count('\n') + 1
    print(f"tripDetailsModal starts on line {line_no}")
    
    # Print 300 lines starting from line_no
    with open('lr-report.html', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    for i in range(line_no - 1, min(line_no + 300, len(lines))):
        safe_line = lines[i].strip().encode('ascii', errors='replace').decode('ascii')
        print(f"Line {i+1}: {safe_line}")
else:
    print("tripDetailsModal not found")
