"""
Phase 3 & 4: Add data-permission attributes to buttons across protected pages,
add page-level finance guards, and update navbar for dynamic hiding.
"""
import re, os

def add_perm_attr(html, patterns):
    """
    patterns: list of (search_string, data_permission_value)
    Adds data-permission="VALUE" to elements matching the pattern.
    """
    for pattern, perm in patterns:
        # Only add if not already present
        if f'data-permission="{perm}"' not in html and pattern in html:
            html = html.replace(pattern, pattern.replace('>', f' data-permission="{perm}">', 1), 1)
    return html

def inject_page_guard(html, page_name, before_tag='</head>'):
    """Injects enforcePageAccess call after auth-manager is loaded."""
    guard_script = f"""
  <script>
    // RBAC Page Guard — auto-run after auth-manager.js
    document.addEventListener('DOMContentLoaded', function() {{
      if (window.AuthManager && window.AuthManager.enforcePageAccess) {{
        window.AuthManager.enforcePageAccess('{page_name}');
      }}
    }});
  </script>
"""
    if 'enforcePageAccess' not in html and before_tag in html:
        html = html.replace(before_tag, guard_script + before_tag, 1)
    return html

def inject_apply_ui_perms(html):
    """Injects AuthManager.applyUIPermissions() after user context is resolved, if not already there."""
    if 'applyUIPermissions' in html:
        return html
    # Find auth-manager.getCurrentUserContext() calls and add applyUIPermissions after
    # Use a marker approach: after the main auth load block
    markers = [
        'loadTeamMembers();',
        'loadVehicles();',
        'loadStockTyres();',
        'loadLRReports',
        'loadTransporters',
        'loadEmployees',
        'loadBookings',
        'loadRoutes',
        'renderTripExpenses',
        'loadWorkOrders',
    ]
    for marker in markers:
        if marker in html:
            html = html.replace(marker, marker + '\n      if (window.AuthManager) window.AuthManager.applyUIPermissions();', 1)
            break
    return html


# ─── FINANCE PAGES: add page-level access guard ───────────────────────────────
finance_pages = ['payment-billing.html', 'admin-payments.html', 'combined_ca.html']
for page in finance_pages:
    if not os.path.exists(page): continue
    with open(page, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'enforcePageAccess' not in content:
        guard = page.replace('.html','').replace('_','_')  # keep as-is
        # Map filenames to PAGE_PERMISSIONS keys
        guard_key = {'payment-billing.html': 'payment-billing',
                     'admin-payments.html':  'admin-payments',
                     'combined_ca.html':     'combined_ca'}.get(page, page.replace('.html',''))
        
        # Find a good injection point - after auth-manager.js script tag
        inject_point = '<script src="auth-manager.js"></script>'
        guard_script = f"""<script src="auth-manager.js"></script>
  <script>
    // 🔐 RBAC Finance Page Guard
    (async function() {{
      if (window.AuthManager) {{
        await window.AuthManager.enforcePageAccess('{guard_key}');
      }}
    }})();
  </script>"""
        
        if inject_point in content:
            content = content.replace(inject_point, guard_script, 1)
        elif '</head>' in content and 'auth-manager' not in content:
            # Insert auth-manager + guard before </head>
            content = content.replace('</head>', f'  <script src="auth-manager.js"></script>\n  <script>\n    (async function() {{ if(window.AuthManager) await window.AuthManager.enforcePageAccess("{guard_key}"); }})();\n  </script>\n</head>', 1)
        
        with open(page, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Finance guard added to {page}")
    else:
        print(f"⏭️  {page} already has enforcePageAccess")


# ─── PROTECTED PAGES: add data-permission to edit/delete/create buttons ───────
page_patterns = {
    'add.html': [
        # Vehicles - edit/delete
        ('onclick="editVehicle(', 'edit_records'),
        ('onclick="deleteVehicle(', 'delete_records'),
        # Drivers - edit/delete
        ('onclick="editDriver(', 'edit_records'),
        ('onclick="deleteDriver(', 'delete_records'),
    ],
    'lr-report.html': [
        ('onclick="editLR(', 'edit_records'),
        ('onclick="editReport(', 'edit_records'),
        ('onclick="deleteLR(', 'delete_records'),
        ('onclick="deleteReport(', 'delete_records'),
    ],
    'invoice.html': [
        ('onclick="editInvoice(', 'edit_records'),
        ('onclick="deleteInvoice(', 'delete_records'),
        ('onclick="createInvoice(', 'create_records'),
    ],
    'booking.html': [
        ('onclick="editBooking(', 'edit_records'),
        ('onclick="deleteBooking(', 'delete_records'),
    ],
    'employees.html': [
        ('onclick="editEmployee(', 'edit_records'),
        ('onclick="deleteEmployee(', 'delete_records'),
        ('onclick="editDriver(', 'edit_records'),
        ('onclick="deleteDriver(', 'delete_records'),
    ],
    'transporters.html': [
        ('onclick="editTransporter(', 'edit_records'),
        ('onclick="deleteTransporter(', 'delete_records'),
    ],
    'trip-expenses.html': [
        ('onclick="editExpense(', 'edit_records'),
        ('onclick="deleteExpense(', 'delete_records'),
    ],
    'work-management.html': [
        ('onclick="editWork(', 'edit_records'),
        ('onclick="deleteWork(', 'delete_records'),
        ('onclick="editOrder(', 'edit_records'),
        ('onclick="deleteOrder(', 'delete_records'),
    ],
}

for page, patterns in page_patterns.items():
    if not os.path.exists(page): 
        print(f"⚠️  {page} not found, skipping")
        continue
    
    with open(page, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    matches = 0
    for pattern, perm in patterns:
        if pattern in content and f'data-permission="{perm}"' not in content[:content.find(pattern)+200]:
            # Add data-permission attribute to the button containing this onclick
            # Find all button tags containing this pattern
            btn_re = re.compile(r'(<button[^>]*?' + re.escape(pattern) + r'[^>]*?>)', re.DOTALL)
            def add_perm(m, p=perm):
                tag = m.group(1)
                if f'data-permission="{p}"' not in tag:
                    return tag.rstrip('>') + f' data-permission="{p}">'
                return tag
            new_content = btn_re.sub(add_perm, content)
            if new_content != content:
                content = new_content
                matches += 1
    
    # Also inject applyUIPermissions call
    content = inject_apply_ui_perms(content)
    
    if content != original:
        with open(page, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Permission attrs added to {page} ({matches} patterns matched)")
    else:
        print(f"ℹ️  No matching patterns found in {page} - will rely on page guard")


# ─── TYRE.HTML: Add specific tyre-action permission guards ───────────────────
with open('tyre.html', 'r', encoding='utf-8') as f:
    tyre = f.read()

original_tyre = tyre

# Find dispose buttons  
tyre_patterns = [
    (r'(<button[^>]*?onclick=["\']event\.stopPropagation\(\);\s*disposeTyre\([^>]*?>)', 'delete_records'),
    (r'(<button[^>]*?onclick=["\']event\.stopPropagation\(\);\s*moveToStock\([^>]*?>)', 'edit_records'),
    (r'(<button[^>]*?onclick=["\']event\.stopPropagation\(\);\s*editTyre\([^>]*?>)', 'edit_records'),
    (r'(<button[^>]*?onclick=["\']event\.stopPropagation\(\);\s*editVehicle\([^>]*?>)', 'edit_records'),
    (r'(<button[^>]*?onclick=["\']event\.stopPropagation\(\);\s*deleteVehicle\([^>]*?>)', 'delete_records'),
]
for pattern, perm in tyre_patterns:
    def add_perm(m, p=perm):
        tag = m.group(1)
        if f'data-permission="{p}"' not in tag:
            return tag.rstrip('>') + f' data-permission="{p}">'
        return tag
    tyre = re.sub(pattern, add_perm, tyre, flags=re.DOTALL)

if tyre != original_tyre:
    with open('tyre.html', 'w', encoding='utf-8') as f:
        f.write(tyre)
    print("✅ Permission attrs added to tyre.html")
else:
    print("ℹ️  tyre.html - no pattern changes")


# ─── NAVBAR.HTML: Dynamic hiding based on role ────────────────────────────────
with open('navbar.html', 'r', encoding='utf-8') as f:
    navbar = f.read()

# The navbar is loaded dynamically via navbar-loader.js
# We need to add a script that hides elements based on role AFTER navbar loads
# The best place is to add an event listener for navbarLoaded or use MutationObserver

navbar_guard_script = """
<!-- 🔐 RBAC Navbar Permission Guard -->
<script>
(function() {
  function applyNavbarPermissions() {
    const ctx = window.AuthManager ? window.AuthManager.getCachedUserContext() : null;
    if (!ctx) return;

    // Hide Team Management for sub-users
    document.querySelectorAll('a[href*="team-management"]').forEach(el => {
      if (ctx.isSubUser) el.closest('li, .nav-item, div')?.style && (el.style.display = 'none');
    });

    // Hide Finance links for non-finance roles
    const financeLinks = ['payment-billing', 'admin-payments', 'combined_ca'];
    if (!ctx.permissions.includes('access_finance')) {
      financeLinks.forEach(page => {
        document.querySelectorAll(`a[href*="${page}"]`).forEach(el => {
          const parent = el.closest('li') || el.closest('.nav-item') || el.parentElement;
          if (parent) parent.style.display = 'none';
        });
      });
    }

    // Hide Tyre for those without access_tyre
    if (!ctx.permissions.includes('access_tyre')) {
      document.querySelectorAll('a[href*="tyre"]').forEach(el => {
        const parent = el.closest('li') || el.closest('.nav-item') || el.parentElement;
        if (parent) parent.style.display = 'none';
      });
    }
  }

  // Run after navbar is injected
  document.addEventListener('navbarLoaded', applyNavbarPermissions);
  // Also run after a short delay as fallback
  setTimeout(applyNavbarPermissions, 800);
  window.addEventListener('load', applyNavbarPermissions);
})();
</script>
"""

if 'applyNavbarPermissions' not in navbar:
    # Inject at end of navbar.html body
    if '</body>' in navbar:
        navbar = navbar.replace('</body>', navbar_guard_script + '\n</body>')
    else:
        navbar += navbar_guard_script
    
    with open('navbar.html', 'w', encoding='utf-8') as f:
        f.write(navbar)
    print("✅ Navbar RBAC guard added to navbar.html")
else:
    print("⏭️  navbar.html already has RBAC guard")

print("\n🎉 All RBAC guards applied successfully!")
