with open('admin-payments.html', 'r', encoding='utf-8') as f:
    content = f.read()

import re
matches = [m.start() for m in re.finditer("push|update|set|remove|db", content)]
print(f"Total write/db keywords in admin-payments.html: {len(matches)}")
# Let's search for form submission or where payments are listed
matches_form = [m.start() for m in re.finditer("Form", content)]
for m in matches_form:
    line_no = content[:m].count('\n') + 1
    print(f"Form found on line {line_no}")
    with open('admin-payments.html', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    for i in range(max(0, line_no - 4), min(len(lines), line_no + 10)):
        safe_line = lines[i].strip().encode('ascii', errors='replace').decode('ascii')
        print(f"Line {i+1}: {safe_line}")
    print("="*40)
