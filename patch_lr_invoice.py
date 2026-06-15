"""
LR report and Invoice pages use inline event handlers in generated HTML.
Add applyUIPermissions() call after the auth state change resolves in both pages.
Also add page-level guards.
"""
import re

def add_guard_and_apply(filename, page_key):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # 1. Add enforcePageAccess call early in the script
    if 'enforcePageAccess' not in content and 'AuthManager' not in content:
        inject = f'\n  <script src="auth-manager.js"></script>\n'
        if '<script src="evm.js">' in content:
            content = content.replace('<script src="evm.js">', inject + '  <script src="evm.js">', 1)
    
    # 2. Find onAuthStateChanged block and inject applyUIPermissions after it resolves
    # Pattern: after the user is validated, call applyUIPermissions
    if 'applyUIPermissions' not in content:
        # Find common patterns after auth is confirmed
        markers = [
            'loadLRData()',
            'loadAllLRs()',
            'loadReports()',
            'initPage()',
            'loadData()',
            'renderTable()',
            'setupPage()',
        ]
        for marker in markers:
            if marker in content:
                content = content.replace(
                    marker,
                    marker + '\n        if (window.AuthManager) window.AuthManager.applyUIPermissions();',
                    1
                )
                print(f"  → Injected applyUIPermissions after '{marker}' in {filename}")
                break
    
    # 3. Add page-level guard script tag before </body>
    guard_tag = f"""
  <script>
    // RBAC Page Guard
    document.addEventListener('DOMContentLoaded', async function() {{
      if (window.AuthManager) {{
        await window.AuthManager.enforcePageAccess('{page_key}');
        window.AuthManager.applyUIPermissions();
      }}
    }});
  </script>"""
    
    if 'enforcePageAccess' not in content and '</body>' in content:
        content = content.replace('</body>', guard_tag + '\n</body>', 1)
    
    if content != original:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {filename}")
    else:
        print(f"No changes for {filename}")

add_guard_and_apply('lr-report.html', 'lr-report')
add_guard_and_apply('invoice.html', 'invoice')

# Also add data-hide-for-roles to LR delete/edit inline rendered buttons
# These pages render buttons inside JS template literals, so we add the guard at JS level
# by wrapping delete/edit actions in permission checks
for filename, guard_fn_maps in [
    ('lr-report.html', [
        ('deleteLR', 'delete_records'),
        ('editLR', 'edit_records'),
        ('deleteReport', 'delete_records'),
        ('editReport', 'edit_records'),
    ]),
    ('invoice.html', [
        ('deleteInvoice', 'delete_records'),
        ('editInvoice', 'edit_records'),
    ]),
]:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Wrap JS delete/edit functions with permission check at the start
    for fn_name, perm in guard_fn_maps:
        # Find function definitions like: function deleteLR(, window.deleteLR = function(, async function deleteLR(
        patterns = [
            (f'function {fn_name}(', f'function {fn_name}('),
            (f'window.{fn_name} = function(', f'window.{fn_name} = function('),
            (f'window.{fn_name} = async function(', f'window.{fn_name} = async function('),
        ]
        for search, _ in patterns:
            if search in content:
                # Find the opening brace of the function
                idx = content.find(search)
                brace_idx = content.find('{', idx)
                if brace_idx != -1:
                    guard_code = f'\n      if (window.AuthManager && !window.AuthManager.hasPermission("{perm}")) {{ alert("You do not have permission to perform this action."); return; }}'
                    # Only add if not already there
                    after_brace = content[brace_idx+1:brace_idx+200]
                    if 'hasPermission' not in after_brace:
                        content = content[:brace_idx+1] + guard_code + content[brace_idx+1:]
                        print(f"  → Wrapped {fn_name} with permission check in {filename}")
                break
    
    if content != original:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Function guards added to {filename}")
    else:
        print(f"No function guard changes for {filename}")

print("Done!")
