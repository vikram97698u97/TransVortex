import re

def patch_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Table Headers
    old_thead1 = """            <thead class="thead-dark" style="text-align: left;">
              <tr>
                <th>Date & Time</th>
                <th>Vehicle</th>
                <th>Tyre No</th>
                <th>Action</th>
              </tr>
            </thead>"""
    
    new_thead1 = """            <thead class="thead-dark" style="text-align: left;">
              <tr>
                <th style="cursor:pointer;" onclick="sortGlobalActivityLog('date')">Date & Time <i class="fas fa-sort text-muted"></i></th>
                <th style="cursor:pointer;" onclick="sortGlobalActivityLog('vehicle')">Vehicle <i class="fas fa-sort text-muted"></i></th>
                <th style="cursor:pointer;" onclick="sortGlobalActivityLog('tyre')">Tyre No <i class="fas fa-sort text-muted"></i></th>
                <th style="cursor:pointer;" onclick="sortGlobalActivityLog('action')">Action <i class="fas fa-sort text-muted"></i></th>
              </tr>
            </thead>"""

    old_thead2 = """          <thead class="bg-light">
            <tr>
              <th>Date & Time</th>
              <th>Vehicle</th>
              <th>Tyre No</th>
              <th>Action</th>
            </tr>
          </thead>"""
          
    new_thead2 = """          <thead class="bg-light">
            <tr>
              <th style="cursor:pointer;" onclick="sortGlobalActivityLog('date')">Date & Time <i class="fas fa-sort text-muted"></i></th>
              <th style="cursor:pointer;" onclick="sortGlobalActivityLog('vehicle')">Vehicle <i class="fas fa-sort text-muted"></i></th>
              <th style="cursor:pointer;" onclick="sortGlobalActivityLog('tyre')">Tyre No <i class="fas fa-sort text-muted"></i></th>
              <th style="cursor:pointer;" onclick="sortGlobalActivityLog('action')">Action <i class="fas fa-sort text-muted"></i></th>
            </tr>
          </thead>"""

    if old_thead1 in content:
        content = content.replace(old_thead1, new_thead1)
    if old_thead2 in content:
        content = content.replace(old_thead2, new_thead2)

    # 2. Add Sort Function and Modify filterGlobalActivityLog / loadGlobalActivityLog
    
    # Need to target the specific load block
    # Finding the block that defines the filtering and rendering
    # Because tyre.html and tyre_history.html have slightly different implementations previously (tyre.html has filterGlobalActivityLog, tyre_history.html might just render directly in load)
    # Wait, in the previous patch, tyre_history.html's `loadGlobalActivityLog` directly rendered without a search filter wrapper. Let's unify them.
    
    if filename == 'tyre.html':
        # Replace the `let allGlobalMovements = [];` onwards
        old_js = """    let allGlobalMovements = [];
    window.loadGlobalActivityLog = async function() {"""
        
        new_js = """    let allGlobalMovements = [];
    let currentSortActivity = { column: 'date', order: 'desc' };
    
    window.sortGlobalActivityLog = function(column) {
      if (currentSortActivity.column === column) {
        currentSortActivity.order = currentSortActivity.order === 'asc' ? 'desc' : 'asc';
      } else {
        currentSortActivity.column = column;
        currentSortActivity.order = 'asc';
      }
      filterGlobalActivityLog();
    };

    window.loadGlobalActivityLog = async function() {"""
        content = content.replace(old_js, new_js)

        # Replace filterGlobalActivityLog function block
        old_filter = """      if(filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No matching activities.</td></tr>';
        return;
      }
      
      // Limit to latest 100 for performance
      let html = '';
      filtered.slice(0, 100).forEach(m => {"""
      
        new_filter = """      filtered.sort((a, b) => {
        let valA, valB;
        if (currentSortActivity.column === 'date') {
          valA = a.timestamp || 0;
          valB = b.timestamp || 0;
        } else if (currentSortActivity.column === 'vehicle') {
          valA = (a.vehicleNumber || '').toLowerCase();
          valB = (b.vehicleNumber || '').toLowerCase();
        } else if (currentSortActivity.column === 'tyre') {
          valA = (a.tyreNumber || '').toLowerCase();
          valB = (b.tyreNumber || '').toLowerCase();
        } else if (currentSortActivity.column === 'action') {
          valA = (a.action || '').toLowerCase();
          valB = (b.action || '').toLowerCase();
        }
        
        if (valA < valB) return currentSortActivity.order === 'asc' ? -1 : 1;
        if (valA > valB) return currentSortActivity.order === 'asc' ? 1 : -1;
        return 0;
      });

      if(filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No matching activities.</td></tr>';
        return;
      }
      
      // Limit to latest 100 for performance
      let html = '';
      filtered.slice(0, 100).forEach(m => {"""
        content = content.replace(old_filter, new_filter)

    elif filename == 'tyre_history.html':
        # Rewrite the loadGlobalActivityLog function to use filter and sort
        # find where it starts
        old_js_block_match = re.search(r'let allGlobalMovements = \[\];.*?window\.showMovements', content, re.DOTALL)
        if old_js_block_match:
            new_js_block = """let allGlobalMovements = [];
    let currentSortActivity = { column: 'date', order: 'desc' };

    window.sortGlobalActivityLog = function(column) {
      if (currentSortActivity.column === column) {
        currentSortActivity.order = currentSortActivity.order === 'asc' ? 'desc' : 'asc';
      } else {
        currentSortActivity.column = column;
        currentSortActivity.order = 'asc';
      }
      filterGlobalActivityLog();
    };

    window.loadGlobalActivityLog = async function() {
      const tbody = document.getElementById('activityLogTableBody');
      tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
      try {
        const snap = await db.ref(`users/${currentUser.uid}/tyre_movements`).get();
        if(snap.exists()) {
          allGlobalMovements = Object.values(snap.val());
          filterGlobalActivityLog();
        } else {
          tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No activities found.</td></tr>';
        }
      } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-danger">Error loading data.</td></tr>';
      }
    };

    window.filterGlobalActivityLog = function() {
      const query = (document.getElementById('searchActivityLogInput')?.value || '').toLowerCase();
      const tbody = document.getElementById('activityLogTableBody');
      if(!tbody) return;

      let filtered = allGlobalMovements.filter(m => 
        (m.vehicleNumber && m.vehicleNumber.toLowerCase().includes(query)) ||
        (m.tyreNumber && m.tyreNumber.toLowerCase().includes(query)) ||
        (m.action && m.action.toLowerCase().includes(query))
      );
      
      filtered.sort((a, b) => {
        let valA, valB;
        if (currentSortActivity.column === 'date') {
          valA = a.timestamp || 0;
          valB = b.timestamp || 0;
        } else if (currentSortActivity.column === 'vehicle') {
          valA = (a.vehicleNumber || '').toLowerCase();
          valB = (b.vehicleNumber || '').toLowerCase();
        } else if (currentSortActivity.column === 'tyre') {
          valA = (a.tyreNumber || '').toLowerCase();
          valB = (b.tyreNumber || '').toLowerCase();
        } else if (currentSortActivity.column === 'action') {
          valA = (a.action || '').toLowerCase();
          valB = (b.action || '').toLowerCase();
        }
        
        if (valA < valB) return currentSortActivity.order === 'asc' ? -1 : 1;
        if (valA > valB) return currentSortActivity.order === 'asc' ? 1 : -1;
        return 0;
      });

      if(filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No matching activities.</td></tr>';
        return;
      }
      
      let html = '';
      filtered.slice(0, 100).forEach(m => {
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
    };

    window.showMovements"""
            content = content[:old_js_block_match.start()] + new_js_block + content[old_js_block_match.end()-20:]

        # Add search input to tyre_history.html Activity Tab
        old_activity_header = """      <div class="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
        <h5 class="mb-0 text-muted"><i class="fas fa-history me-2"></i>Recent System Movements</h5>
        <button class="btn btn-sm btn-outline-secondary" onclick="loadGlobalActivityLog()"><i class="fas fa-sync"></i> Refresh</button>
      </div>
      <div class="table-responsive">"""
      
        new_activity_header = """      <div class="p-3 bg-light border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 class="mb-0 text-muted"><i class="fas fa-history me-2"></i>Recent System Movements</h5>
        <div class="d-flex gap-2">
           <input type="text" id="searchActivityLogInput" class="form-control form-control-sm" placeholder="Search by vehicle, tyre number or action..." oninput="filterGlobalActivityLog()" style="width: 250px;">
           <button class="btn btn-sm btn-outline-secondary" onclick="loadGlobalActivityLog()"><i class="fas fa-sync"></i></button>
        </div>
      </div>
      <div class="table-responsive">"""
      
        content = content.replace(old_activity_header, new_activity_header)


    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"{filename} patched.")

patch_file('tyre.html')
patch_file('tyre_history.html')
