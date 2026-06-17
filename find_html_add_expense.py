with open('lr-report.html', 'r', encoding='utf-8') as f:
    content = f.read()

import re
matches = re.findall(r'.*addExpenseRow.*', content)
print("Matches in HTML:")
for m in matches:
    print(m.strip())
