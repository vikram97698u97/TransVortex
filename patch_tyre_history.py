import re

def patch():
    with open('tyre_history.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add Activity Log Tab Button
    old_tabs = """  <ul class="nav nav-tabs mb-3">
    <li class="nav-item">
      <button class="nav-link active" id="tab-disposed" onclick="switchTab('disposed')">
        <i class="fas fa-trash-alt me-2"></i>Disposed / Unsold
      </button>
    </li>
    <li class="nav-item">
      <button class="nav-link" id="tab-sold" onclick="switchTab('sold')">
        <i class="fas fa-rupee-sign me-2"></i>Sold History
      </button>
    </li>
  </ul>"""
    
    new_tabs = """  <ul class="nav nav-tabs mb-3">
    <li class="nav-item">
      <button class="nav-link active" id="tab-disposed" onclick="switchTab('disposed')">
        <i class="fas fa-trash-alt me-2"></i>Disposed / Unsold
      </button>
    </li>
    <li class="nav-item">
      <button class="nav-link" id="tab-sold" onclick="switchTab('sold')">
        <i class="fas fa-rupee-sign me-2"></i>Sold History
      </button>
    </li>
    <li class="nav-item">
      <button class="nav-link" id="tab-activity" onclick="switchTab('activity')">
        <i class="fas fa-list-ul me-2"></i>Global Activity Log
      </button>
    </li>
  </ul>"""

    content = content.replace(old_tabs, new_tabs)

    # 2. Add Container for Disposal History and Activity Log
    old_table_container = """  <div class="card">
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-striped table-hover mb-0" id="historyTable">"""
        
    new_table_container = """  <div id="disposalContainer">
  <div class="card">
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-striped table-hover mb-0" id="historyTable">"""
    
    content = content.replace(old_table_container, new_table_container)
    
    old_table_end = """      </nav>
    </div>
  </div>
  </div>"""

    new_table_end = """      </nav>
    </div>
  </div>
  </div>
  
  <div id="activityContainer" style="display:none;" class="card">
    <div class="card-body p-0">
      <div class="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
        <h5 class="mb-0 text-muted"><i class="fas fa-history me-2"></i>Recent System Movements</h5>
        <button class="btn btn-sm btn-outline-secondary" onclick="loadGlobalActivityLog()"><i class="fas fa-sync"></i> Refresh</button>
      </div>
      <div class="table-responsive">
        <table class="table table-striped table-hover mb-0">
          <thead class="bg-light">
            <tr>
              <th>Date & Time</th>
              <th>Vehicle</th>
              <th>Tyre No</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="activityLogTableBody">
            <tr><td colspan="4" class="text-center py-4">Click "Global Activity Log" to load movements...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  </div>"""

    content = content.replace(old_table_end, new_table_end)

    # 3. Add History Button to Individual Tyres
    old_action_btn = """              <td>
                 <button class="btn btn-sm btn-light border" title="Restore" onclick="restoreTyre('${item.id}')">
                    <i class="fas fa-undo text-primary"></i>
                 </button>
              </td>"""
              
    new_action_btn = """              <td class="d-flex gap-1 justify-content-center">
                 <button class="btn btn-sm btn-light border" title="Restore" onclick="restoreTyre('${item.id}')">
                    <i class="fas fa-undo text-primary"></i>
                 </button>
                 <button class="btn btn-sm btn-info border" title="View History" onclick="showMovements(null, '${item.number}')">
                    <i class="fas fa-history text-white"></i>
                 </button>
              </td>"""
              
    content = content.replace(old_action_btn, new_action_btn)

    # 4. Patch switchTab to handle activity tab
    old_switch_tab = """    // Tab Switching
    window.switchTab = function (tab) {
      currentTab = tab;

      // Update UI
      document.getElementById('tab-disposed').classList.toggle('active', tab === 'disposed');
      document.getElementById('tab-sold').classList.toggle('active', tab === 'sold');"""
      
    new_switch_tab = """    // Tab Switching
    window.switchTab = function (tab) {
      currentTab = tab;

      // Update UI
      document.getElementById('tab-disposed').classList.toggle('active', tab === 'disposed');
      document.getElementById('tab-sold').classList.toggle('active', tab === 'sold');
      document.getElementById('tab-activity').classList.toggle('active', tab === 'activity');
      
      if (tab === 'activity') {
        document.getElementById('disposalContainer').style.display = 'none';
        document.getElementById('activityContainer').style.display = 'block';
        loadGlobalActivityLog();
        return;
      } else {
        document.getElementById('disposalContainer').style.display = 'block';
        document.getElementById('activityContainer').style.display = 'none';
      }"""
      
    content = content.replace(old_switch_tab, new_switch_tab)

    # 5. Inject Activity Log & showMovements scripts
    script_injection = """
    // Activity Log & Movements Ported from tyre.html
    let allGlobalMovements = [];
    window.loadGlobalActivityLog = async function() {
      const tbody = document.getElementById('activityLogTableBody');
      tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
      try {
        const snap = await db.ref(`users/${currentUser.uid}/tyre_movements`).get();
        if(snap.exists()) {
          allGlobalMovements = Object.values(snap.val()).sort((a,b) => b.timestamp - a.timestamp);
          
          let html = '';
          allGlobalMovements.slice(0, 100).forEach(m => {
            const dt = new Date(m.timestamp).toLocaleString();
            html += `
              <tr>
                <td>${dt}</td>
                <td><strong>${m.vehicleNumber || 'Unknown'}</strong></td>
                <td>${m.tyreNumber}</td>
                <td>${m.action}</td>
              </tr>
            `;
          });
          tbody.innerHTML = html;
        } else {
          tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No activities found.</td></tr>';
        }
      } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-danger">Error loading data.</td></tr>';
      }
    };

    window.showMovements = async function(vehicleId, tyreNumber = null) {
      if (!currentUser) return;
      if (!tyreNumber) return; // In history context, we strictly ask for tyreNumber

      let modal = document.getElementById('movementModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'movementModal';
        modal.style.cssText = 'display:none; position:fixed; z-index:9999; left:0; top:0; width:100%; height:100%; overflow:auto; background-color:rgba(0,0,0,0.5); justify-content:center; align-items:center; flex-direction:column;';
        const content = document.createElement('div');
        content.style.cssText = 'background-color:#fff; padding:25px; border-radius:10px; width:90%; max-width:500px; position:relative; max-height:80vh; display:flex; flex-direction:column; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
        const close = document.createElement('span');
        close.innerHTML = '&times;';
        close.style.cssText = 'position:absolute; top:10px; right:15px; font-size:24px; cursor:pointer; color:#999;';
        close.onclick = () => modal.style.display = 'none';
        
        const title = document.createElement('h3');
        title.id = 'movementModalTitle';
        title.style.cssText = 'margin-top:0; color:#2E8B57; border-bottom:1px solid #eee; padding-bottom:10px;';
        
        const listDiv = document.createElement('div');
        listDiv.id = 'movementModalList';
        listDiv.style.cssText = 'overflow-y:auto; flex-grow:1; margin-top:4px;';
        
        content.appendChild(close);
        content.appendChild(title);
        content.appendChild(listDiv);
        modal.appendChild(content);
        document.body.appendChild(modal);
      }

      document.getElementById('movementModalTitle').textContent = `Tyre Lifecycle History - ${tyreNumber}`;
      const listDiv = document.getElementById('movementModalList');
      listDiv.innerHTML = '<p class="text-center py-3"><i class="fas fa-spinner fa-spin"></i> Loading history...</p>';
      modal.style.display = 'flex';

      try {
         const movementRef = db.ref(`users/${currentUser.uid}/tyre_movements`);
         const snap = await movementRef.get();
         if (snap.exists()) {
             const allMovements = Object.values(snap.val());
             const filteredMovements = allMovements.filter(m => m.tyreNumber === tyreNumber);
             
             if (filteredMovements.length === 0) {
                 listDiv.innerHTML = '<p class="text-muted text-center pt-3">No movement history found.</p>';
                 return;
             }

             filteredMovements.sort((a,b) => b.timestamp - a.timestamp);
             
             let html = '<ul style="list-style:none; padding:0; margin:0;">';
             filteredMovements.forEach(m => {
                 const dateStr = new Date(m.timestamp).toLocaleString();
                 html += `
                    <li style="padding:12px; border-bottom:1px solid #eee;">
                       <div style="font-size:0.85em; color:#888; margin-bottom:4px;">${dateStr}</div>
                       <div style="font-size:1em; color:#333; font-weight:500;">${m.action}</div>
                       <div style="font-size:0.9em; color:#666; margin-top:4px;">
                         Vehicle: <strong>${m.vehicleNumber || '-'}</strong>
                       </div>
                    </li>
                 `;
             });
             html += '</ul>';
             listDiv.innerHTML = html;
         } else {
             listDiv.innerHTML = '<p class="text-muted text-center pt-3">No movements recorded yet.</p>';
         }
      } catch (err) {
         listDiv.innerHTML = `<p class="text-danger">Error loading data: ${err.message}</p>`;
      }
    };
  </script>
</body>"""

    # Inject scripts at the end of the file before </body>
    if "  </script>\n</body>" in content:
        content = content.replace("  </script>\n</body>", script_injection)
    else:
        # Fallback if the script end is slightly different
        content = content.replace("</script>\n</body>", script_injection + "\n</html>")

    with open('tyre_history.html', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Tyre_history.html patched successfully.")

patch()
