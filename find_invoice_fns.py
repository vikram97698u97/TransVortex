import re

c = open('shared-invoice.js', encoding='utf-8').read()
fns = re.findall(r'(async\s+function\s+\w+|function\s+\w+)', c)
edit_fns = [f for f in fns if any(k in f.lower() for k in ['edit','delete','delet','remov','update'])]
print('Edit/delete functions in shared-invoice.js:', edit_fns[:20])

c2 = open('invoice.html', encoding='utf-8').read()
fns2 = re.findall(r'onclick="([^"]+)"', c2)
edit2 = [f for f in fns2 if any(k in f.lower() for k in ['edit','delete','delet','remov'])]
print('Invoice button onclicks:', edit2[:15])

# Also search in shared-invoice.js for anything that looks like a delete/edit
matches = re.findall(r'(function\s+\w*(?:delet|remov|edit|update|modif)\w*)', c, re.IGNORECASE)
print('Regex matches shared-invoice:', matches[:15])
