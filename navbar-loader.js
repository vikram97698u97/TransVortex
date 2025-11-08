(function() {
  async function loadNavbar() {
    try {
      const res = await fetch('navbar.html', { cache: 'no-store' });
      const html = await res.text();

      // Parse the fetched HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Ensure Font Awesome link is present
      const faHref = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      const hasFA = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some(l => l.href.includes('font-awesome') || l.href.includes('/all.min.css'));
      if (!hasFA) {
        const fa = document.createElement('link');
        fa.rel = 'stylesheet';
        fa.href = faHref;
        document.head.appendChild(fa);
      }

      // Extract <style> blocks from <head> and append to current head (dedupe by data-origin)
      const headStyles = doc.querySelectorAll('style');
      headStyles.forEach((styleEl, idx) => {
        const clone = document.createElement('style');
        clone.setAttribute('data-navbar-style', 'true');
        clone.textContent = styleEl.textContent;
        // Avoid injecting duplicates
        const already = Array.from(document.head.querySelectorAll('style[data-navbar-style="true"]'))
          .some(s => s.textContent.trim() === clone.textContent.trim());
        if (!already) document.head.appendChild(clone);
      });

      // Extract body elements: toggle button and sidebar
      const toggleBtn = doc.querySelector('.sidebar-toggle');
      const sidebar = doc.querySelector('#sidebar');
      if (!sidebar) return;

      // Inject toggle button (if not present)
      if (toggleBtn && !document.querySelector('.sidebar-toggle')) {
        document.body.insertBefore(toggleBtn.cloneNode(true), document.body.firstChild);
      }

      // Inject sidebar at top (if not present)
      if (!document.getElementById('sidebar')) {
        document.body.insertBefore(sidebar.cloneNode(true), document.body.firstChild);
      }

      // Ensure logo image source and provide a fallback
      async function ensureLogo() {
        const logo = document.querySelector('#sidebar .logo');
        if (!logo) return;

        // **NEW**: Attempt to load company logo from Firebase profile
        try {
          const user = window.auth?.currentUser;
          if (user) {
            const profileSnap = await window.db.ref(`users/${user.uid}/profile`).once('value');
            const profile = profileSnap.val() || {};
            if (profile.companyLogoUrl) {
              logo.src = profile.companyLogoUrl;
              return; // Exit if company logo is set
            }
          }
        } catch (e) {
          console.warn("Could not fetch company logo for navbar:", e);
        }

        // Fallback to default logos
        logo.src = 'logo.jpg';
        logo.onerror = () => { logo.src = 'logo1.jpg'; logo.onerror = null; };
      }
      ensureLogo();

      // **FIX**: Load user profile into navbar, ensuring auth is ready.
      async function loadNavbarProfile() {
        // Wait for auth to be available on the window object
        if (!window.auth) {
          setTimeout(loadNavbarProfile, 100); // Retry after 100ms
          return;
        }
        
        window.auth.onAuthStateChanged(async (user) => {
          if (!user) return;

          try {
            const profileNameEl = document.getElementById('profileName');
            const profileRoleEl = document.getElementById('profileRole');
            const profileAvatarEl = document.getElementById('profileAvatar');

            if (!profileNameEl || !profileRoleEl || !profileAvatarEl) return;

            // Fetch user data from Realtime Database
            const userRef = window.db.ref(`users/${user.uid}`);
            const snapshot = await userRef.once('value');
            const userData = snapshot.val() || {};
            const profile = userData.profile || {};

            // Set Name
            const ownerName = profile.ownerName || user.displayName || 'User';
            profileNameEl.textContent = ownerName;

            // Set Role
            const selectedBranch = localStorage.getItem('selectedBranch') || 'Main';
            const transportName = profile.transportName || selectedBranch;
            profileRoleEl.textContent = transportName;

            // Set Avatar
            if (profile.photoURL) {
              profileAvatarEl.innerHTML = `<img src="${profile.photoURL}" alt="${ownerName}" />`;
            } else {
              const initial = ownerName.charAt(0).toUpperCase();
              profileAvatarEl.innerHTML = `<span>${initial}</span>`;
            }
          } catch (e) {
            console.warn("Could not load user profile for navbar:", e);
          }
        });
      }
      loadNavbarProfile();

      // Ensure main-content wrapper exists: wrap existing non-sidebar children
      if (!document.querySelector('.main-content')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'main-content';

        // Collect elements that are not the sidebar or toggle
        const toMove = [];
        Array.from(document.body.children).forEach(ch => {
          if (ch.id === 'sidebar' || ch.classList.contains('sidebar-toggle')) return;
          toMove.push(ch);
        });
        toMove.forEach(el => wrapper.appendChild(el));
        document.body.appendChild(wrapper);
      }

      // Implement toggleSidebar if missing
      if (typeof window.toggleSidebar !== 'function') {
        window.toggleSidebar = function(forceClose = false) {
            // Query live DOM elements (in case originals were cloned into document)
            const sidebarEl = document.getElementById('sidebar') || document.querySelector('#sidebar');
            const overlayEl = document.querySelector('.sidebar-overlay');
            const toggleBtnIcon = document.querySelector('.sidebar-toggle i') || document.querySelector('.sidebar-toggle');

            if (!sidebarEl || !overlayEl || !toggleBtnIcon) return;

            const isOpening = !sidebarEl.classList.contains('expanded') && !forceClose;

            if (isOpening) {
                sidebarEl.classList.add('expanded');
                overlayEl.classList.add('active');
                if (toggleBtnIcon.tagName === 'I') {
                    toggleBtnIcon.className = 'fas fa-times';
                } else {
                    const i = toggleBtnIcon.querySelector && toggleBtnIcon.querySelector('i');
                    if (i) i.className = 'fas fa-times';
                }
            } else {
                sidebarEl.classList.remove('expanded');
                overlayEl.classList.remove('active');
                if (toggleBtnIcon.tagName === 'I') {
                    toggleBtnIcon.className = 'fas fa-bars';
                } else {
                    const i = toggleBtnIcon.querySelector && toggleBtnIcon.querySelector('i');
                    if (i) i.className = 'fas fa-bars';
                }
            }
        };
      }

      // Attach handler to the injected toggle button
      const liveToggleBtn = document.querySelector('.sidebar-toggle');
      if (liveToggleBtn) {
        liveToggleBtn.onclick = () => window.toggleSidebar();
      }

      // **NEW**: Add overlay and attach click handler to close sidebar
      if (!document.querySelector('.sidebar-overlay')) {
          const overlay = document.createElement('div');
          overlay.className = 'sidebar-overlay';
          document.body.appendChild(overlay);
          overlay.onclick = () => window.toggleSidebar(true); // Force close
      }


      // Set active nav item
      // **FIX**: This logic is now more complex to handle dropdowns and active sub-items.
      const currentPage = window.location.pathname.split('/').pop() || 'home.html';
      const navLinks = document.querySelectorAll('#sidebar a');

      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
          link.classList.add('active'); // Active class on the link itself
          // If it's a sub-item, open its parent dropdown
          const parentSubNav = link.closest('.sub-nav');
          if (parentSubNav) {
            const dropdownToggle = parentSubNav.previousElementSibling;
            if (dropdownToggle && dropdownToggle.classList.contains('dropdown-toggle')) {
              dropdownToggle.classList.add('active');
              parentSubNav.style.maxHeight = parentSubNav.scrollHeight + "px";
            }
          }
        } else {
          link.classList.remove('active');
        }
      });

      // **FIX**: Dropdown toggle functionality moved here from navbar.html
      const dropdownToggles = document.querySelectorAll('#sidebar .dropdown-toggle');
      dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function () {
          const isMobile = window.innerWidth <= 768;
          const subNav = this.nextElementSibling;

          // On mobile, close other dropdowns first
          if (isMobile && !this.classList.contains('active')) {
            dropdownToggles.forEach(otherToggle => {
              if (otherToggle !== this) {
                otherToggle.classList.remove('active');
                const otherSubNav = otherToggle.nextElementSibling;
                if (otherSubNav && otherSubNav.classList.contains('sub-nav')) {
                  otherSubNav.style.maxHeight = null; // Also reset for desktop if resized
                }
              }
            });
          }

          this.classList.toggle('active');
          
          if (subNav && subNav.classList.contains('sub-nav')) {
            subNav.style.maxHeight = subNav.style.maxHeight ? null : subNav.scrollHeight + "px"; // This works for both desktop and mobile overlay
          }
        });
      });
      // Simple toast for branch notices if not present
      if (!document.getElementById('branchToast')) {
        const toast = document.createElement('div');
        toast.id = 'branchToast';
        document.body.appendChild(toast);
      }

      window.showBranchNotice = function(message) {
        let toast = document.getElementById('branchToast');
        if (!toast) {
          toast = document.createElement('div');
          toast.id = 'branchToast';
          document.body.appendChild(toast);
        }
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.background = '#ffc107';
        toast.style.color = '#212529';
        toast.style.padding = '12px 18px';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        toast.style.zIndex = '9999';
        toast.textContent = message;
        toast.style.display = 'block';
        clearTimeout(window.__branchToastTimer);
        window.__branchToastTimer = setTimeout(() => { toast.style.display = 'none'; }, 3000);
      };
      
      // Provide a global logout handler (works with Firebase compat if present)
      if (typeof window.logout !== 'function') {
        window.logout = function () {
          try {
            // Clear stored user data from localStorage
            localStorage.removeItem('userName');
            
            if (window.firebase && typeof firebase.auth === 'function') {
              firebase.auth().signOut()
                .then(() => { 
                  // Ensure localStorage is cleared before redirecting
                  localStorage.removeItem('userName');
                  window.location.href = 'index.html'; 
                })
                .catch(err => { 
                  // Still clear localStorage even if there's an error
                  localStorage.removeItem('userName');
                  alert('Error logging out: ' + (err && err.message ? err.message : err)); 
                  window.location.href = 'index.html'; // Redirect even on error
                });
            } else {
              // Fallback: no Firebase on page, just clear and redirect
              localStorage.removeItem('userName');
              window.location.href = 'index.html';
            }
          } catch (e) {
            // Ensure localStorage is cleared even if there's an error
            localStorage.removeItem('userName');
            window.location.href = 'index.html';
          }
        };
      }

      // Ensure body uses flex layout so sidebar + content align
      const ensureFlex = () => {
        const s = getComputedStyle(document.body);
        if (s.display !== 'flex') {
          document.body.style.display = 'flex';
          document.body.style.minHeight = '100vh';
        }
      };
      ensureFlex();

      // **FIX**: Manually find, clone, and append scripts from the navbar's body
      // to ensure they are executed correctly after the navbar is injected.
      const scripts = doc.body.querySelectorAll('script');
      scripts.forEach(script => {
        if (script.src.includes('navbar-loader.js')) return; // Don't re-inject self

        const newScript = document.createElement('script');
        newScript.src = script.src;
        if (script.type === 'module') newScript.type = 'module';
        if (script.defer) newScript.defer = true;
        document.body.appendChild(newScript);
      });
    } catch (e) {
      // Fail silently to not block page content
      console.warn('Navbar loader failed:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNavbar);
  } else {
    loadNavbar();
  }
})();

document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const sidebar = document.querySelector('.sidebar');
    const profileDropdownToggle = document.getElementById('profileDropdownToggle');
    const profileDropdownMenu = document.getElementById('profileDropdownMenu');

    if (mobileMenuButton && sidebar) {
        mobileMenuButton.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }

    if (profileDropdownToggle && profileDropdownMenu) {
        profileDropdownToggle.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent document click from closing immediately
            profileDropdownMenu.classList.toggle('show');
        });

        document.addEventListener('click', function(event) {
            if (!profileDropdownMenu.contains(event.target) && !profileDropdownToggle.contains(event.target)) {
                profileDropdownMenu.classList.remove('show');
            }
        });
    }
});
