import re

def patch():
    with open('tyre.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add Activity Log Tab Button
    old_tabs = """    <div class="tab-header">
      <button class="tab-button active" onclick="openTab(event, 'Management')"><i class="fas fa-list-check"></i>
        Management</button>
      <button class="tab-button" onclick="openTab(event, 'Analytics')"><i class="fas fa-chart-pie"></i>
        Analytics</button>
      <button class="tab-button" onclick="openTab(event, 'Stock')"><i class="fas fa-warehouse"></i>
        Tyre Stock</button>
    </div>"""
    
    new_tabs = """    <div class="tab-header">
      <button class="tab-button active" onclick="openTab(event, 'Management')"><i class="fas fa-list-check"></i>
        Management</button>
      <button class="tab-button" onclick="openTab(event, 'Analytics')"><i class="fas fa-chart-pie"></i>
        Analytics</button>
      <button class="tab-button" onclick="openTab(event, 'Stock')"><i class="fas fa-warehouse"></i>
        Tyre Stock</button>
      <button class="tab-button" onclick="openTab(event, 'ActivityLog')"><i class="fas fa-history"></i>
        Activity Log</button>
    </div>"""

    content = content.replace(old_tabs, new_tabs)

    # 2. Add Activity Log Pane
    old_pane_end = """    </div>

  </div>

  <div id="changeTyreModal\""""
    new_pane = """    </div>

    <div id="ActivityLog" class="tab-content">
      <div class="form-section">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
          <h3><i class="fas fa-history"></i> Global Tyre Activity Log</h3>
          <button class="btn btn-sm btn-outline-secondary" onclick="loadGlobalActivityLog()"><i class="fas fa-sync"></i> Refresh</button>
        </div>
        <div class="search-section">
          <input type="text" id="searchActivityLogInput" class="search-input" placeholder="Search by vehicle, tyre number or action..." oninput="filterGlobalActivityLog()">
        </div>
        <div class="table-responsive">
          <table class="table table-bordered table-striped" style="margin-top: 15px; width: 100%;">
            <thead class="thead-dark" style="text-align: left;">
              <tr>
                <th>Date & Time</th>
                <th>Vehicle</th>
                <th>Tyre No</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="activityLogTableBody">
              <tr><td colspan="4" class="text-center py-4">Click "Activity Log" tab to load movements...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>

  <div id="changeTyreModal\""""

    content = content.replace(old_pane_end, new_pane)

    # 3. Patch `window.openTab` logic (the first definition inside `<script type="module">` is missing logic; actually let's update the second definition)
    old_open_tab = """    // Tab switching logic
    window.openTab = function (evt, tabName) {
      var i, tabcontent, tablinks;
      tabcontent = document.getElementsByClassName("tab-content");
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }
      tablinks = document.getElementsByClassName("tab-button");
      for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
      }
      document.getElementById(tabName).style.display = "block";
      evt.currentTarget.className += " active";
    };"""
    
    new_open_tab = """    // Tab switching logic
    window.openTab = function (evt, tabName) {
      var i, tabcontent, tablinks;
      tabcontent = document.getElementsByClassName("tab-content");
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }
      tablinks = document.getElementsByClassName("tab-button");
      for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
      }
      document.getElementById(tabName).style.display = "block";
      evt.currentTarget.className += " active";
      
      if (tabName === 'Analytics' && analyticsRows.length > 0) {
        renderAnalyticsCharts();
      } else if (tabName === 'ActivityLog') {
        loadGlobalActivityLog();
      }
    };"""

    content = content.replace(old_open_tab, new_open_tab)

    # 4. Add the loadGlobalActivityLog logic at the end before </body>
    script_injection = """
    let allGlobalMovements = [];
    window.loadGlobalActivityLog = async function() {
      const tbody = document.getElementById('activityLogTableBody');
      tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
      try {
        const snap = await get(ref(db, `users/${coreAccountId}/tyre_movements`));
        if(snap.exists()) {
          allGlobalMovements = Object.values(snap.val()).sort((a,b) => b.timestamp - a.timestamp);
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
      const query = (document.getElementById('searchActivityLogInput').value || '').toLowerCase();
      const tbody = document.getElementById('activityLogTableBody');
      const filtered = allGlobalMovements.filter(m => 
        (m.vehicleNumber && m.vehicleNumber.toLowerCase().includes(query)) ||
        (m.tyreNumber && m.tyreNumber.toLowerCase().includes(query)) ||
        (m.action && m.action.toLowerCase().includes(query))
      );
      
      if(filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No matching activities.</td></tr>';
        return;
      }
      
      // Limit to latest 100 for performance
      let html = '';
      filtered.slice(0, 100).forEach(m => {
        const dt = new Date(m.timestamp).toLocaleString();
        html += `
          <tr>
            <td>${dt}</td>
            <td><strong>${m.vehicleNumber}</strong></td>
            <td>${m.tyreNumber}</td>
            <td>${m.action}</td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    };
  </script>
</body>
"""
    content = content.replace("  </script>\n</body>", script_injection)

    with open('tyre.html', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Tyre.html patched successfully.")

patch()
