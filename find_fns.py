import re

content = open('lr-report.html', encoding='utf-8').read()
fns = re.findall(r"onclick=[\"'](.*?)[\"']", content)
edit_fns = [f for f in fns if any(k in f.lower() for k in ['edit','delet','remov','updat'])]
print('LR onclick patterns:')
for f in sorted(set(edit_fns))[:15]:
    print(' ', f)

fn_defs = re.findall(r'(function\s+\w+\(|window\.\w+\s*=\s*(?:async\s+)?function)', content)
edit_defs = [f for f in fn_defs if any(k in f.lower() for k in ['edit','delet','remov','updat'])]
print('LR function defs:')
for f in sorted(set(edit_defs))[:15]:
    print(' ', f)

# Invoice
content2 = open('invoice.html', encoding='utf-8').read()
fns2 = re.findall(r"onclick=[\"'](.*?)[\"']", content2)
edit_fns2 = [f for f in fns2 if any(k in f.lower() for k in ['edit','delet','remov','updat'])]
print('\nInvoice onclick patterns:')
for f in sorted(set(edit_fns2))[:15]:
    print(' ', f)

fn_defs2 = re.findall(r'(function\s+\w+\(|window\.\w+\s*=\s*(?:async\s+)?function)', content2)
edit_defs2 = [f for f in fn_defs2 if any(k in f.lower() for k in ['edit','delet','remov','updat'])]
print('Invoice function defs:')
for f in sorted(set(edit_defs2))[:15]:
    print(' ', f)
