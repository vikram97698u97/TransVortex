/**
 * 🔐 AUTH MANAGER — TransVortex Role-Based Access Control (v2.0)
 *
 * Provides:
 *  - getCurrentUserContext()       → full user + role + permissions info
 *  - hasPermission(action)         → boolean check for a specific permission
 *  - canAccessPage(pageName)       → boolean check for page-level access
 *  - applyPageGuard(pageName)      → show "Access Denied" if page is off-limits
 *  - applyUIPermissions()          → auto-hide buttons/elements via data-permission attributes
 *  - getActivityStamp()            → metadata for DB writes
 *  - logActivity(...)              → writes to activityLog
 *  - PERMISSIONS                   → permission constants
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────
  // PERMISSION CONSTANTS
  // ─────────────────────────────────────────────
  const PERMISSIONS = {
    // Core CRUD
    VIEW_ALL:           'view_all',
    CREATE_RECORDS:     'create_records',
    EDIT_RECORDS:       'edit_records',
    DELETE_RECORDS:     'delete_records',
    // Module-specific
    ACCESS_FINANCE:     'access_finance',
    ACCESS_REPORTS:     'access_reports',
    ACCESS_TYRE:        'access_tyre',
    ACCESS_EMPLOYEES:   'access_employees',
    ACCESS_TRANSPORTERS:'access_transporters',
    ACCESS_ROUTES:      'access_routes',
    ACCESS_TRIPS:       'access_trips',
    ACCESS_BOOKINGS:    'access_bookings',
    ACCESS_LR:          'access_lr',
    ACCESS_INVOICES:    'access_invoices',
    ACCESS_VEHICLES:    'access_vehicles',
    // Admin
    MANAGE_TEAM:        'manage_team',
  };

  // ─────────────────────────────────────────────
  // ROLE ➜ DEFAULT PERMISSIONS MAP
  // ─────────────────────────────────────────────
  const ROLE_PERMISSIONS = {
    owner: Object.values(PERMISSIONS), // All permissions

    manager: [
      PERMISSIONS.VIEW_ALL,
      PERMISSIONS.CREATE_RECORDS,
      PERMISSIONS.EDIT_RECORDS,
      PERMISSIONS.DELETE_RECORDS,
      PERMISSIONS.ACCESS_FINANCE,
      PERMISSIONS.ACCESS_REPORTS,
      PERMISSIONS.ACCESS_TYRE,
      PERMISSIONS.ACCESS_EMPLOYEES,
      PERMISSIONS.ACCESS_TRANSPORTERS,
      PERMISSIONS.ACCESS_ROUTES,
      PERMISSIONS.ACCESS_TRIPS,
      PERMISSIONS.ACCESS_BOOKINGS,
      PERMISSIONS.ACCESS_LR,
      PERMISSIONS.ACCESS_INVOICES,
      PERMISSIONS.ACCESS_VEHICLES,
    ],

    employee: [
      PERMISSIONS.VIEW_ALL,
      PERMISSIONS.CREATE_RECORDS,
      PERMISSIONS.ACCESS_TYRE,
      PERMISSIONS.ACCESS_EMPLOYEES,
      PERMISSIONS.ACCESS_TRANSPORTERS,
      PERMISSIONS.ACCESS_ROUTES,
      PERMISSIONS.ACCESS_TRIPS,
      PERMISSIONS.ACCESS_BOOKINGS,
      PERMISSIONS.ACCESS_LR,
      PERMISSIONS.ACCESS_VEHICLES,
    ],

    viewer: [
      PERMISSIONS.VIEW_ALL,
      PERMISSIONS.ACCESS_REPORTS,
      PERMISSIONS.ACCESS_TYRE,
      PERMISSIONS.ACCESS_ROUTES,
      PERMISSIONS.ACCESS_LR,
    ],

    custom: [], // Filled by customPermissions in Firebase profile
  };

  // ─────────────────────────────────────────────
  // PAGE ➜ REQUIRED PERMISSION(S)
  // ─────────────────────────────────────────────
  const PAGE_PERMISSIONS = {
    'home':              null,                            // everyone
    'profile':           null,                            // everyone
    'add':               PERMISSIONS.ACCESS_VEHICLES,
    'lr-report':         PERMISSIONS.ACCESS_LR,
    'invoice':           PERMISSIONS.ACCESS_INVOICES,
    'booking':           PERMISSIONS.ACCESS_BOOKINGS,
    'payment-billing':   PERMISSIONS.ACCESS_FINANCE,
    'admin-payments':    PERMISSIONS.ACCESS_FINANCE,
    'combined_ca':       PERMISSIONS.ACCESS_FINANCE,
    'tyre':              PERMISSIONS.ACCESS_TYRE,
    'tyre_history':      PERMISSIONS.ACCESS_TYRE,
    'employees':         PERMISSIONS.ACCESS_EMPLOYEES,
    'transporters':      PERMISSIONS.ACCESS_TRANSPORTERS,
    'route':             PERMISSIONS.ACCESS_ROUTES,
    'route-details':     PERMISSIONS.ACCESS_ROUTES,
    'trip-expenses':     PERMISSIONS.ACCESS_TRIPS,
    'work-management':   PERMISSIONS.ACCESS_TRIPS,
    'team-management':   PERMISSIONS.MANAGE_TEAM,
  };

  // ─────────────────────────────────────────────
  // MAX TEAM MEMBERS PER ACCOUNT
  // ─────────────────────────────────────────────
  const MAX_TEAM_MEMBERS = 10; // increased from 3

  // ─────────────────────────────────────────────
  // CACHED CONTEXT
  // ─────────────────────────────────────────────
  let _userContext = null;

  /**
   * Resolves the current user's full context from Firebase.
   */
  async function getCurrentUserContext() {
    if (_userContext) return _userContext;

    // Check sessionStorage cache first to avoid redundant database reads and race conditions
    try {
      const raw = sessionStorage.getItem('tv_user_context');
      if (raw) {
        _userContext = JSON.parse(raw);
        return _userContext;
      }
    } catch (_) {}

    const fb = window.firebase;
    if (!fb || !fb.auth || !fb.database) {
      console.warn('[AuthManager] Firebase not available');
      return null;
    }

    const auth = fb.auth();
    const db   = fb.database();

    return new Promise((resolve) => {
      auth.onAuthStateChanged(async (user) => {
        if (!user) { resolve(null); return; }

        try {
          const snap = await db.ref(`users/${user.uid}`).once('value');
          const data = snap.val() || {};

          const role = data.role || 'owner';
          const coreAccountId = data.coreAccountId || user.uid;
          const name = data.name || user.displayName || user.email.split('@')[0];

          // Support custom permissions array stored per user
          const defaultPerms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.viewer;
          const customPerms  = data.customPermissions || null;
          const permissions  = customPerms ? customPerms : defaultPerms;

          _userContext = {
            uid:           user.uid,
            name,
            email:         user.email,
            role,
            coreAccountId,
            isSubUser:     coreAccountId !== user.uid,
            permissions,
            accountType:   data.accountType || 'core',
            status:        data.status || 'active',
          };

          // DIAGNOSTIC LOG
          try {
            fetch('/api/log', {
              method: 'POST',
              body: `[AuthManager] fetched database for uid=${user.uid}, got coreAccountId=${coreAccountId}, snapExists=${snap.exists()}`
            });
          } catch (_) {}

          // Block disabled sub-users
          if (_userContext.isSubUser && data.status === 'disabled') {
            try { await auth.signOut(); } catch (_) {}
            window.location.href = 'login.html?reason=disabled';
            resolve(null);
            return;
          }

          try {
            sessionStorage.setItem('tv_user_context', JSON.stringify(_userContext));
          } catch (_) {}

          resolve(_userContext);
        } catch (err) {
          console.error('[AuthManager] Error fetching user context:', err);
          // DIAGNOSTIC LOG
          try {
            fetch('/api/log', {
              method: 'POST',
              body: `[AuthManager] ERROR fetching database for uid=${user.uid}: ${err.message}`
            });
          } catch (_) {}
          resolve(null);
        }
      });
    });
  }

  function getCachedUserContext() {
    if (_userContext) return _userContext;
    try {
      const raw = sessionStorage.getItem('tv_user_context');
      if (raw) { _userContext = JSON.parse(raw); }
    } catch (_) {}
    return _userContext;
  }

  function clearUserContext() {
    _userContext = null;
    try { sessionStorage.removeItem('tv_user_context'); } catch (_) {}
  }

  function hasPermission(action) {
    const ctx = getCachedUserContext();
    if (!ctx) return false;
    return ctx.permissions.includes(action);
  }

  /**
   * Check if the current user can access a specific named page.
   * @param {string} pageName — key from PAGE_PERMISSIONS (e.g. 'payment-billing')
   */
  function canAccessPage(pageName) {
    const ctx = getCachedUserContext();
    if (!ctx) return false;
    if (ctx.role === 'owner') return true; // Owners can access everything
    const required = PAGE_PERMISSIONS[pageName];
    if (!required) return true; // No restriction means everyone can access
    return ctx.permissions.includes(required);
  }

  /**
   * Apply page-level guard. Call this early in page scripts.
   * If user lacks permission, renders an "Access Restricted" overlay
   * over all page content.
   * @param {string} pageName — key from PAGE_PERMISSIONS
   * @param {string} [containerSelector] — CSS selector of page's main content wrapper
   */
  function applyPageGuard(pageName, containerSelector = 'body') {
    const ctx = getCachedUserContext();
    if (!ctx) return; // Not loaded yet — defer to async version
    if (ctx.role === 'owner') return; // Owners bypass all

    const required = PAGE_PERMISSIONS[pageName];
    if (!required) return; // Public page

    if (!ctx.permissions.includes(required)) {
      // Inject access-denied overlay
      const container = document.querySelector(containerSelector);
      if (container) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(255,255,255,0.97); z-index: 9998;
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; text-align: center; font-family: 'Segoe UI', sans-serif;
        `;
        overlay.innerHTML = `
          <div style="max-width:420px; padding:40px;">
            <div style="font-size:4rem; margin-bottom:16px;">🔒</div>
            <h2 style="font-size:1.5rem; font-weight:700; color:#1a1a2e; margin-bottom:8px;">Access Restricted</h2>
            <p style="color:#6b7280; margin-bottom:24px; line-height:1.6;">
              Your account role (<strong>${ctx.role}</strong>) does not have permission to access this page.
              Please contact your account owner to request access.
            </p>
            <a href="home.html" style="
              background: linear-gradient(135deg, #2E8B57, #43B97F);
              color: white; padding: 12px 28px; border-radius: 10px;
              text-decoration: none; font-weight: 600; display: inline-block;
            ">← Back to Home</a>
          </div>
        `;
        document.body.appendChild(overlay);
      }
    }
  }

  /**
   * Async version of page guard — awaits user context first.
   * Use this at the top of page scripts.
   */
  async function enforcePageAccess(pageName) {
    const ctx = await getCurrentUserContext();
    if (!ctx) return;
    applyPageGuard(pageName);
  }

  function getCoreAccountId() {
    const ctx = getCachedUserContext();
    return ctx ? ctx.coreAccountId : null;
  }

  function getActivityStamp() {
    const ctx = getCachedUserContext();
    if (!ctx) return {};
    return {
      createdBy:     ctx.uid,
      createdByName: ctx.name,
      createdByRole: ctx.role,
      createdAt:     new Date().toISOString(),
    };
  }

  function getModifiedStamp() {
    const ctx = getCachedUserContext();
    if (!ctx) return {};
    return {
      lastModifiedBy:     ctx.uid,
      lastModifiedByName: ctx.name,
      lastModifiedByRole: ctx.role,
      lastModifiedAt:     new Date().toISOString(),
    };
  }

  async function logActivity(action, details, entityType, entityId) {
    const ctx = getCachedUserContext();
    if (!ctx) return;

    const fb = window.firebase;
    if (!fb || !fb.database) return;

    const db = fb.database();
    const logRef = db.ref(`users/${ctx.coreAccountId}/activityLog`).push();

    const entry = {
      userId:     ctx.uid,
      userName:   ctx.name,
      userRole:   ctx.role,
      action,
      details,
      entityType: entityType || 'general',
      entityId:   entityId   || null,
      timestamp:  new Date().toISOString(),
    };

    try {
      await logRef.set(entry);
    } catch (err) {
      console.warn('[AuthManager] Failed to log activity:', err);
    }
  }

  /**
   * Apply permission-based UI guards.
   * Elements with data-permission="..." are hidden if user lacks that permission.
   * Elements with data-hide-for-roles="..." are hidden for those roles.
   * Elements with data-show-for-roles="..." are only shown for those roles.
   */
  function applyUIPermissions() {
    const ctx = getCachedUserContext();
    if (!ctx) return;

    // data-permission="edit_records" → hide if no permission
    document.querySelectorAll('[data-permission]').forEach(el => {
      const required = el.getAttribute('data-permission');
      if (!hasPermission(required)) {
        el.style.display = 'none';
        el.setAttribute('disabled', 'disabled');
      }
    });

    // data-hide-for-roles="employee,viewer"
    document.querySelectorAll('[data-hide-for-roles]').forEach(el => {
      const roles = el.getAttribute('data-hide-for-roles').split(',').map(r => r.trim());
      if (roles.includes(ctx.role)) {
        el.style.display = 'none';
      }
    });

    // data-show-for-roles="owner,manager"
    document.querySelectorAll('[data-show-for-roles]').forEach(el => {
      const roles = el.getAttribute('data-show-for-roles').split(',').map(r => r.trim());
      if (!roles.includes(ctx.role)) {
        el.style.display = 'none';
      }
    });
  }

  // ─────────────────────────────────────────────
  // EXPOSE GLOBALLY
  // ─────────────────────────────────────────────
  window.AuthManager = {
    PERMISSIONS,
    ROLE_PERMISSIONS,
    PAGE_PERMISSIONS,
    MAX_TEAM_MEMBERS,
    getCurrentUserContext,
    getCachedUserContext,
    clearUserContext,
    hasPermission,
    canAccessPage,
    applyPageGuard,
    enforcePageAccess,
    getCoreAccountId,
    getActivityStamp,
    getModifiedStamp,
    logActivity,
    applyUIPermissions,
  };

})();
