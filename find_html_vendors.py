with open('lr-report.html', 'r', encoding='utf-8') as f:
    content = f.read()

import re
matches = re.findall(r'class="[^"]*expense-vendor[^"]*"', content)
print("Matches in HTML:", matches)
