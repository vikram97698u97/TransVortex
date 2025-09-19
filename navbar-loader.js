
// Navbar Loader: injects the new vertical sidebar from navbar.html into any page
// - Extracts styles, toggle button, and sidebar markup
// - Wraps existing page content in .main-content if missing
// - Sets active nav link based on current page
// - Applies branch restriction click-guards (no Firebase dependency)

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
      (function ensureLogo() {
        const logo = document.querySelector('#sidebar .logo');
        if (!logo) return;
        if (!logo.getAttribute('src') || logo.getAttribute('src') === '') {
          logo.setAttribute('src', 'logo.jpg');
        }
        const onErr = function onErr() {
          if (!logo.src.includes('logo1.jpg')) {
            logo.src = 'logo1.jpg';
          }
          logo.removeEventListener('error', onErr);
        };
        logo.addEventListener('error', onErr);
      })();

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
        window.toggleSidebar = function() {
          const sb = document.getElementById('sidebar');
          if (sb) sb.classList.toggle('expanded');
        };
      }

      // Attach handler to the injected toggle button
      const liveToggleBtn = document.querySelector('.sidebar-toggle');
      if (liveToggleBtn) {
        liveToggleBtn.onclick = () => window.toggleSidebar();
      }

      // Set active nav item
      const currentPage = window.location.pathname.split('/').pop() || 'home.html';
      document.querySelectorAll('#sidebar .nav-item').forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage) item.classList.add('active');
        else item.classList.remove('active');
      });

      // Branch restriction guards (no Firebase required here)
      const isMainBranch = (localStorage.getItem('selectedBranch') === 'main');
      document.querySelectorAll('#sidebar [data-branch-restricted="true"]').forEach(el => {
        el.addEventListener('click', function(e) {
          if (!isMainBranch) {
            e.preventDefault();
            showBranchNotice('This feature is only available in Main Branch.');
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
      
      // Provide a global logout handler. This assumes `auth` and `signOut` are available
      // in the global scope or imported in the page that uses this loader.
      window.logout = async function() {
        try {
          // The `auth` and `signOut` variables are expected to be defined on the page
          // that is using this navbar-loader, typically from a script module.
          if (window.auth && typeof window.signOut === 'function') {
            await window.signOut(window.auth);
          } else if (typeof window.firebase !== 'undefined' && typeof window.firebase.auth === 'function') {
            // Fallback for older compat library style
            await firebase.auth().signOut();
          }
          
          // Clear any session-related data from localStorage
          localStorage.removeItem('userName');
          localStorage.removeItem('selectedBranch');
          window.location.href = "index.html";
        } catch (e) {
          alert("Logout error: " + e.message);
        }
      };

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
