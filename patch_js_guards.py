"""
Add permission guards to LR report and Invoice JS function bodies.
"""

def inject_fn_guard(content, fn_signature, permission, fn_name):
    """Insert permission check at start of a function body."""
    idx = content.find(fn_signature)
    if idx == -1:
        print(f"  ! '{fn_name}' not found")
        return content
    
    brace_idx = content.find('{', idx)
    if brace_idx == -1:
        print(f"  ! no {{ found for '{fn_name}'")
        return content
    
    # Check not already patched
    check_zone = content[brace_idx:brace_idx+300]
    if 'hasPermission' in check_zone:
        print(f"  -- '{fn_name}' already guarded")
        return content
    
    guard = f'\n    if (window.AuthManager && !window.AuthManager.hasPermission("{permission}")) {{ alert("You do not have permission to perform this action."); return; }}'
    content = content[:brace_idx+1] + guard + content[brace_idx+1:]
    print(f"  + Guarded '{fn_name}' with {permission}")
    return content

# ─── lr-report.js ────────────────────────────────────────────────────────────
with open('lr-report.js', 'r', encoding='utf-8') as f:
    lr_js = f.read()

original_lr = lr_js
lr_js = inject_fn_guard(lr_js, 'window.deleteLR = function', 'delete_records', 'deleteLR')
lr_js = inject_fn_guard(lr_js, 'window.editLR = function', 'edit_records', 'editLR')

if lr_js != original_lr:
    with open('lr-report.js', 'w', encoding='utf-8') as f:
        f.write(lr_js)
    print("lr-report.js patched")
else:
    print("lr-report.js: no changes")

# ─── shared-invoice.js ────────────────────────────────────────────────────────
import re
with open('shared-invoice.js', 'r', encoding='utf-8') as f:
    inv_js = f.read()

fns = re.findall(r'(window\.\w*(?:delete|edit|Delete|Edit)\w*\s*=)', inv_js)
print("shared-invoice.js edit/delete fns:", fns[:10])

original_inv = inv_js
# Common patterns
for sig, perm, name in [
    ('window.deleteInvoice =', 'delete_records', 'deleteInvoice'),
    ('window.editInvoice =', 'edit_records', 'editInvoice'),
    ('window.deleteClient =', 'delete_records', 'deleteClient'),
]:
    inv_js = inject_fn_guard(inv_js, sig, perm, name)

if inv_js != original_inv:
    with open('shared-invoice.js', 'w', encoding='utf-8') as f:
        f.write(inv_js)
    print("shared-invoice.js patched")
else:
    print("shared-invoice.js: no changes")

print("Done!")
