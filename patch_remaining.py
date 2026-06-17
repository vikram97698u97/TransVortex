"""
Final targeted RBAC permission attribute patches for remaining pages.
"""
import re

def patch_buttons(filename, pattern_perm_list):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    count = 0
    for onclick_pattern, perm in pattern_perm_list:
        btn_re = re.compile(r'(<button\b[^>]*?' + re.escape(onclick_pattern) + r'[^>]*?>)', re.DOTALL)
        def add_perm(m, p=perm):
            tag = m.group(1)
            if f'data-permission="{p}"' not in tag:
                # Insert before closing >
                tag = re.sub(r'>$', f' data-permission="{p}">', tag)
            return tag
        new_content = btn_re.sub(add_perm, content)
        if new_content != content:
            count += 1
            content = new_content
    
    if content != original:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {filename}: {count} change(s)")
    else:
        print(f"No changes for {filename}")

# add.html  
patch_buttons('add.html', [
    ('editVehicleEntry(',  'edit_records'),
    ('deleteVehicleEntry(','delete_records'),
    ('editDriverEntry(',   'edit_records'),
    ('deleteDriverEntry(', 'delete_records'),
])

# lr-report.html - find all button patterns
with open('lr-report.html', 'r', encoding='utf-8') as f:
    lr = f.read()

# Find onclick patterns in lr-report
fns = re.findall(r"onclick=[\"']([^'\"]+)[\"']", lr)
edit_fns = [f for f in fns if any(k in f.lower() for k in ['edit','delete','delet','update'])]
print("LR report edit/delete fns:", sorted(set(edit_fns))[:15])

# invoice.html
with open('invoice.html', 'r', encoding='utf-8') as f:
    inv = f.read()
inv_fns = re.findall(r"onclick=[\"']([^'\"]+)[\"']", inv)
inv_edit = [f for f in inv_fns if any(k in f.lower() for k in ['edit','delete','delet','update'])]
print("Invoice edit/delete fns:", sorted(set(inv_edit))[:15])

# booking.html
patch_buttons('booking.html', [
    ('editClientSidePayment(', 'edit_records'),
    ('deleteClientSidePayment(', 'delete_records'),
])
