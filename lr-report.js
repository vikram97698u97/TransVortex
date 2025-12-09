/**
 * LR Report Management Logic
 * Handles fetching, displaying, editing, and deleting LRs.
 * Implements pagination for performance.
 */

// --- GLOBAL VARIABLES ---
window.currentCoreAccountId = null;
window.allVehicles = [];
window.allClients = [];
window.allDrivers = [];
window.allTransporters = [];
window.allRoutes = [];
window.allPumps = [];
window.allWorkVendors = [];
window.currentUserProfile = null;

// LR Data & Pagination
window.allLRs = []; // Stores LRs for the CURRENT PAGE
window.selectedLRs = [];
window.selectedMarketLRs = [];
window.lrTable = null;
window.marketLrTable = null;

// Pagination State
let currentPage = 1;
const pageSize = 50;
let lastLoadedKey = null;
let paginationStack = []; // Stack of start keys for previous pages (not fully used yet, simple load more for now)

// Current Editing/Trip State
window.currentEditingLRId = null;
window.currentTripLRId = null;
window.currentTripWeight = 0;
window.currentTripTruckNumber = null;

// Auto-Generation Settings
window.autoSettings = {
    lrNo: true,
    invoiceNo: true,
    shipmentNo: true,
    orderNo: true,
    deliveryNo: true
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', function () {
    // Initialize DataTables
    window.lrTable = $('#lrTable').DataTable({
        pageLength: 10,
        order: [[1, 'desc']], // Sort by date descending
        columnDefs: [{ orderable: false, targets: [0, 10, 12, 13] }] // Disable sorting on checkbox and action columns
    });
    window.marketLrTable = $('#marketLrTable').DataTable({
        pageLength: 10,
        order: [[1, 'desc']],
        columnDefs: [{ orderable: false, targets: [0, 9, 11, 12] }]
    });

    // Add "Load More" button to the UI if not exists
    addLoadMoreButton();

    // Auth Listener
    window.auth.onAuthStateChanged(async (user) => {
        if (user) {
            window.currentCoreAccountId = user.uid; // Initial assumption, updated in loadAllVehicles
            await loadAllData();
            loadAutoGenerationSettings();

            // Set default date
            const today = new Date().toISOString().split('T')[0];
            const d = document.getElementById('lrDate');
            if (d) d.value = today;

            // Event Listeners
            const saveBtn = document.getElementById('saveLRBtn');
            if (saveBtn) saveBtn.addEventListener('click', saveLR);

            const updateBtn = document.getElementById('updateLRBtn');
            if (updateBtn) updateBtn.addEventListener('click', updateLR); // Defined later

            const applyFilterBtn = document.getElementById('applyFiltersBtn');
            if (applyFilterBtn) applyFilterBtn.addEventListener('click', () => loadLRData('initial'));

            // Quick Add Button Event Listeners
            const quickAddVehicleBtn = document.getElementById('quickAddVehicleBtn');
            if (quickAddVehicleBtn) quickAddVehicleBtn.addEventListener('click', () => showQuickAddModal('vehicle'));

            const quickAddDriverBtn = document.getElementById('quickAddDriverBtn');
            if (quickAddDriverBtn) quickAddDriverBtn.addEventListener('click', () => showQuickAddModal('driver'));

            const quickAddClientBtn = document.getElementById('quickAddClientBtn');
            if (quickAddClientBtn) quickAddClientBtn.addEventListener('click', () => showQuickAddModal('client'));

            const quickAddTransporterBtn = document.getElementById('quickAddTransporterBtn');
            if (quickAddTransporterBtn) quickAddTransporterBtn.addEventListener('click', () => showQuickAddModal('transporter'));

            const quickAddRouteBtn = document.getElementById('quickAddRouteBtn');
            if (quickAddRouteBtn) quickAddRouteBtn.addEventListener('click', () => showQuickAddModal('route'));

            const quickAddConsigneeBtn = document.getElementById('quickAddConsigneeBtn');
            if (quickAddConsigneeBtn) quickAddConsigneeBtn.addEventListener('click', () => showQuickAddModal('consignee'));

            // Edit Quick Add Button Event Listeners
            const editQuickAddVehicleBtn = document.getElementById('editQuickAddVehicleBtn');
            if (editQuickAddVehicleBtn) editQuickAddVehicleBtn.addEventListener('click', () => showQuickAddModal('vehicle'));

            const editQuickAddDriverBtn = document.getElementById('editQuickAddDriverBtn');
            if (editQuickAddDriverBtn) editQuickAddDriverBtn.addEventListener('click', () => showQuickAddModal('driver'));

            const editQuickAddClientBtn = document.getElementById('editQuickAddClientBtn');
            if (editQuickAddClientBtn) editQuickAddClientBtn.addEventListener('click', () => showQuickAddModal('client'));

            const editQuickAddTransporterBtn = document.getElementById('editQuickAddTransporterBtn');
            if (editQuickAddTransporterBtn) editQuickAddTransporterBtn.addEventListener('click', () => showQuickAddModal('transporter'));

            const editQuickAddRouteBtn = document.getElementById('editQuickAddRouteBtn');
            if (editQuickAddRouteBtn) editQuickAddRouteBtn.addEventListener('click', () => showQuickAddModal('route'));

            const editQuickAddConsigneeBtn = document.getElementById('editQuickAddConsigneeBtn');
            if (editQuickAddConsigneeBtn) editQuickAddConsigneeBtn.addEventListener('click', () => showQuickAddModal('consignee'));

            // Quick Add Save Button Event Listeners
            const saveQuickAddClientBtn = document.getElementById('saveQuickAddClientBtn');
            if (saveQuickAddClientBtn) saveQuickAddClientBtn.addEventListener('click', saveQuickAddClient);

            const saveQuickAddRouteBtn = document.getElementById('saveQuickAddRouteBtn');
            if (saveQuickAddRouteBtn) saveQuickAddRouteBtn.addEventListener('click', saveQuickAddRoute);

            const saveQuickAddTransporterBtn = document.getElementById('saveQuickAddTransporterBtn');
            if (saveQuickAddTransporterBtn) saveQuickAddTransporterBtn.addEventListener('click', saveQuickAddTransporter);

            const saveQuickAddVehicleBtn = document.getElementById('saveQuickAddVehicleBtn');
            if (saveQuickAddVehicleBtn) saveQuickAddVehicleBtn.addEventListener('click', saveQuickAddVehicle);

            const saveQuickAddDriverBtn = document.getElementById('saveQuickAddDriverBtn');
            if (saveQuickAddDriverBtn) saveQuickAddDriverBtn.addEventListener('click', saveQuickAddDriver);

            // Check URL for invoice view
            try {
                const params = new URLSearchParams(window.location.search);
                const invoiceId = params.get('view') || params.get('invoiceId') || params.get('viewInvoice');
                if (invoiceId && window.viewInvoice) {
                    setTimeout(() => window.viewInvoice(invoiceId), 150);
                }
            } catch (e) { /* ignore */ }

        } else {
            window.location.href = "index.html";
        }
    });

    // Tab Listeners
    const addTab = document.querySelector('a[data-bs-toggle="tab"][href="#add"]');
    if (addTab) {
        addTab.addEventListener('shown.bs.tab', () => {
            applyAutoGenerationSettings();
            const d = document.getElementById('lrDate');
            if (d && !d.value) d.value = new Date().toISOString().split('T')[0];
        });
    }

    // Date Change Listener for Auto-Gen
    const addDate = document.getElementById('lrDate');
    if (addDate) {
        addDate.addEventListener('change', () => {
            if (window.autoSettings.lrNo) generateLRNumber(document.getElementById('lrNumber'));
            if (window.autoSettings.invoiceNo) generateRandomNumber(document.getElementById('invoiceNumberInput'), 'INV');
            if (window.autoSettings.shipmentNo) generateRandomNumber(document.getElementById('shipmentNo'), 'SHP');
            if (window.autoSettings.orderNo) generateRandomNumber(document.getElementById('orderNo'), 'ORD');
            if (window.autoSettings.deliveryNo) generateRandomNumber(document.getElementById('deliveryNo'), 'DLV');
        });
    }

    // Vehicle Toggle Listeners
    const vehicleTypeToggle = document.getElementById('vehicleTypeToggle');
    if (vehicleTypeToggle) {
        vehicleTypeToggle.addEventListener('change', () => toggleVehicleInput(vehicleTypeToggle.checked));
        toggleVehicleInput(vehicleTypeToggle.checked); // Initial state
    }

    const editVehicleTypeToggle = document.getElementById('editVehicleTypeToggle');
    if (editVehicleTypeToggle) {
        editVehicleTypeToggle.addEventListener('change', () => toggleEditVehicleInput(editVehicleTypeToggle.checked));
    }

    // Print Settings Toggles (for LR Copy)
    const printLogoToggle = document.getElementById('printLogoToggle');
    if (printLogoToggle) {
        printLogoToggle.onchange = function () {
            document.querySelectorAll('.logo-on-print').forEach(el => el.classList.toggle('hidden-print', !this.checked));
        };
    }
    const printStampToggle = document.getElementById('printStampToggle');
    if (printStampToggle) {
        printStampToggle.onchange = function () {
            document.querySelectorAll('.stamp-on-print').forEach(el => el.classList.toggle('hidden-print', !this.checked));
        };
    }

    // Initialize Select2 for searchable dropdowns
    try {
        $('#truckFilter, #truckNumber, #editTruckNumber').select2({
            theme: 'bootstrap-5',
            placeholder: 'Select or search for a truck',
            width: '100%',
            // Allow dynamically added options for "quick add" functionality
            tags: true 
        });
    } catch (e) {
        console.warn('Select2 initialization failed:', e);
    }
});

function addLoadMoreButton() {
    const container = document.querySelector('.tab-content');
    if (container && !document.getElementById('loadMoreContainer')) {
        const div = document.createElement('div');
        div.id = 'loadMoreContainer';
        div.className = 'text-center mt-3 mb-5';
        div.innerHTML = `<button id="loadMoreBtn" class="btn btn-outline-primary" onclick="loadMoreLRs()">Load More Records</button>`;
        container.after(div);
    }
}

// --- DATA LOADING & PAGINATION ---

window.loadLRData = function (mode = 'initial') {
    if (!window.currentCoreAccountId) return;

    // If initial, reset tables and pagination
    if (mode === 'initial') {
        if (window.lrTable) window.lrTable.clear().draw();
        if (window.marketLrTable) window.marketLrTable.clear().draw();
        window.allLRs = [];
        lastLoadedKey = null;
    }

    const tableBody = document.getElementById('lrTable').querySelector('tbody');
    // Show loading indicator if needed (DataTables handles empty state, but we can add a spinner overlay)

    let query = window.db.ref(`users/${window.currentCoreAccountId}/lrReports`).orderByKey();

    if (mode === 'next' && lastLoadedKey) {
        query = query.endAt(lastLoadedKey).limitToLast(pageSize + 1);
    } else {
        query = query.limitToLast(pageSize);
    }

    query.once('value').then(async (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            if (mode === 'next') alert("No more records.");
            return;
        }

        const keys = Object.keys(data);
        if (mode === 'next' && keys.length > 0) {
            // Remove the anchor key (lastLoadedKey) which is included in the result
            const index = keys.indexOf(lastLoadedKey);
            if (index > -1) keys.splice(index, 1);
        }

        if (keys.length === 0) {
            if (mode === 'next') alert("No more records.");
            return;
        }

        // Fetch clients for name resolution
        const clientsSnap = await window.db.ref(`users/${window.currentCoreAccountId}/clients`).once('value');
        const clients = clientsSnap.val() || {};
        const getClientName = (id) => clients[id]?.clientName || 'N/A';

        const newLRs = [];
        keys.forEach(key => {
            newLRs.push({ id: key, ...data[key] });
        });

        // Sort by date desc (newest first) - Client side sort for the batch
        newLRs.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Update lastLoadedKey (it's the 'oldest' key in this batch, which is the last one after sorting? 
        // No, Firebase keys are time-ordered. limitToLast gives the newest. 
        // So the 'oldest' key in this batch is the one with the 'smallest' key.
        // Since we sort Descending by date, and keys are roughly date-based, 
        // the last item in our sorted array is likely the oldest.
        // But strictly speaking, we want the 'smallest' key from the fetched set.
        keys.sort(); // Ascending keys
        lastLoadedKey = keys[0]; // The oldest key

        // Render
        newLRs.forEach(lr => {
            // Skip invoiced LRs
            if (lr.status === 'invoiced') return;

            addLRToTable(lr, getClientName);
        });

        if (window.lrTable) window.lrTable.draw(false);
        if (window.marketLrTable) window.marketLrTable.draw(false);

        updateInvoiceButtonStates();

    }).catch(err => {
        console.error("Error loading LRs:", err);
    });
};

window.loadMoreLRs = function () {
    loadLRData('next');
};

function addLRToTable(lr, getClientName) {
    const lrId = lr.id;
    const details = lr.tripDetails || {};
    const emptyDetails = lr.emptyTripData || {};

    // Calculate total expenses for status check
    const totalExpenses = (details.tyreExpenses || 0) + (details.tollExpenses || 0) + (details.foodExpenses || 0) + (details.loadingUnloadingExpenses || 0) + (details.policeChallanExpenses || 0) + (details.tacExpenses || 0) + (details.permitExpenses || 0) + (details.brokerageExpenses || 0) + (details.vehicleWorkAmount || 0) + (details.commissionExpenses || 0) + (details.tirpalRopeExpenses || 0) + (details.otherExpenses || 0) + (details.fuelUsedLiters || 0) + (details.advance || 0) + (details.billingAmount || 0) +
        (emptyDetails.tyreExpenses || 0) + (emptyDetails.tollExpenses || 0) + (emptyDetails.foodExpenses || 0) + (emptyDetails.loadingUnloadingExpenses || 0) + (emptyDetails.policeChallanExpenses || 0) + (emptyDetails.tacExpenses || 0) + (emptyDetails.permitExpenses || 0) + (emptyDetails.brokerageExpenses || 0) + (emptyDetails.vehicleWorkAmount || 0) + (emptyDetails.commissionExpenses || 0) + (emptyDetails.tirpalRopeExpenses || 0) + (emptyDetails.otherExpenses || 0);

    const detailsExist = totalExpenses > 0 || (details.genericExpenses && details.genericExpenses.length > 0) || (emptyDetails.genericExpenses && emptyDetails.genericExpenses.length > 0);
    const detailButtonClass = detailsExist ? 'btn-success' : 'btn-warning';
    const detailButtonIcon = detailsExist ? 'fas fa-check' : 'fas fa-plus';
    const detailButtonTitle = detailsExist ? 'View/Edit Trip Details' : 'Add Trip Details';
    const displayStatus = detailsExist ? 'Completed' : 'Active';
    const displayStatusClass = detailsExist ? 'bg-success' : 'bg-info';

    const rowData = [
        `<div class=\"form-check\">\n <input class=\"form-check-input ${lr.lrType === 'market_company' ? 'market-lr-checkbox' : 'lr-checkbox'}\" type=\"checkbox\" value=\"${lrId}\" onchange=\"toggleLRSelection('${lrId}', this.checked, ${lr.lrType === 'market_company'})\">\n </div>`,
        lr.date,
        lr.lrNumber,
        lr.truckNumber,
        lr.lrType === 'market_company' ? (lr.transporterCompany || 'N/A') : getClientName(lr.clientId),
        lr.lrType === 'market_company' ? (lr.item || 'N/A') : (getClientName(lr.consigneeId) || getClientName(lr.clientId)),
        lr.lrType === 'market_company' ? lr.fromLocation : (lr.item || 'N/A'), // Column shift for market table? No, let's stick to standard columns or handle separately.
        // Wait, the tables have different headers.
        // Own: Date, LR No, Truck, Consignor, Consignee, Item, From, To, Weight, Details, Status, Copy, Actions
        // Market: Date, LR No, Truck, Market Company, Item, From, To, Weight, Details, Status, Copy, Actions
        // I need to handle the columns carefully.

        // Let's simplify:
        // Common: Date, LR No, Truck
        // Col 4: Own=Consignor, Market=Market Company
        // Col 5: Own=Consignee, Market=Item
        // Col 6: Own=Item, Market=From
        // This is messy. Let's look at the HTML headers again.
        // Own: [Check, Date, LR, Truck, Consignor, Consignee, Item, From, To, Weight, Details, Status, Copy, Actions]
        // Market: [Check, Date, LR, Truck, Market Company, Item, From, To, Weight, Details, Status, Copy, Actions]
    ];

    // Correct Data Construction
    if (lr.lrType === 'market_company') {
        window.marketLrTable.row.add([
            `<div class=\"form-check\"><input class=\"form-check-input market-lr-checkbox\" type=\"checkbox\" value=\"${lrId}\" onchange=\"toggleLRSelection('${lrId}', this.checked, true)\"></div>`,
            lr.date,
            lr.lrNumber,
            lr.truckNumber,
            lr.transporterCompany || 'N/A',
            lr.item || 'N/A',
            lr.fromLocation,
            lr.toLocation,
            lr.weight,
            `<button class="btn btn-sm ${detailButtonClass}" onclick="showTripDetailsModal('${lrId}', '${lr.lrNumber}', ${lr.weight}, '${lr.truckNumber}', '${lr.driverName || 'N/A'}')" title="${detailButtonTitle}"><i class="${detailButtonIcon}"></i></button>`,
            `<span class="badge ${displayStatusClass}">${displayStatus}</span>`,
            `<button class="btn btn-sm btn-outline-info" onclick="showLRCopy('${lrId}')" title="View LR Copy"><i class="fas fa-print"></i></button>`,
            `<button class="btn btn-sm btn-outline-primary" onclick="editLR('${lrId}')"><i class="fas fa-edit"></i></button> <button class="btn btn-sm btn-outline-danger" onclick="deleteLR('${lrId}')"><i class="fas fa-trash"></i></button>`
        ]);
    } else {
        window.lrTable.row.add([
            `<div class=\"form-check\"><input class=\"form-check-input lr-checkbox\" type=\"checkbox\" value=\"${lrId}\" onchange=\"toggleLRSelection('${lrId}', this.checked, false)\"></div>`,
            lr.date,
            lr.lrNumber,
            lr.truckNumber,
            getClientName(lr.clientId),
            getClientName(lr.consigneeId) || getClientName(lr.clientId),
            lr.item || 'N/A',
            lr.fromLocation,
            lr.toLocation,
            lr.weight,
            `<button class="btn btn-sm ${detailButtonClass}" onclick="showTripDetailsModal('${lrId}', '${lr.lrNumber}', ${lr.weight}, '${lr.truckNumber}', '${lr.driverName || 'N/A'}')" title="${detailButtonTitle}"><i class="${detailButtonIcon}"></i></button>`,
            `<span class="badge ${displayStatusClass}">${displayStatus}</span>`,
            `<button class="btn btn-sm btn-outline-info" onclick="showLRCopy('${lrId}')" title="View LR Copy"><i class="fas fa-print"></i></button>`,
            `<button class="btn btn-sm btn-outline-primary" onclick="editLR('${lrId}')"><i class="fas fa-edit"></i></button> <button class="btn btn-sm btn-outline-danger" onclick="deleteLR('${lrId}')"><i class="fas fa-trash"></i></button>`
        ]);
    }
}

// --- MASTER DATA LOADING ---

async function loadAllData() {
    const user = window.auth.currentUser;
    if (!user) return;
    await loadAllVehicles(user.uid);

    if (!window.currentCoreAccountId) return;

    // Load Clients
    window.db.ref(`users/${window.currentCoreAccountId}/clients`).on('value', (snapshot) => {
        window.allClients = [];
        const clientSelect = document.getElementById('clientId');
        const consigneeSelect = document.getElementById('consigneeId');
        const editClientSelect = document.getElementById('editClientId');
        const editConsigneeSelect = document.getElementById('editConsigneeId');

        if (clientSelect) clientSelect.innerHTML = '<option value="">Select a Client</option>';
        [consigneeSelect, editClientSelect, editConsigneeSelect].forEach(el => { if (el) el.innerHTML = '<option value="">Select...</option>'; });

        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                const c = { id: child.key, name: child.val().clientName, ...child.val() };
                window.allClients.push(c);
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.name;
                if (clientSelect) clientSelect.appendChild(opt.cloneNode(true));
                if (consigneeSelect) consigneeSelect.appendChild(opt.cloneNode(true));
                if (editClientSelect) editClientSelect.appendChild(opt.cloneNode(true));
                if (editConsigneeSelect) editConsigneeSelect.appendChild(opt);
            });
        }
    });

    // Load Routes
    window.db.ref(`users/${window.currentCoreAccountId}/routes`).on('value', (snapshot) => {
        window.allRoutes = [];
        const routeSelect = document.getElementById('routeSelect');
        const editRouteSelect = document.getElementById('editRouteSelect');
        if (routeSelect) routeSelect.innerHTML = '<option value="">Select a Route</option>';
        if (editRouteSelect) editRouteSelect.innerHTML = '<option value="">Select a Route</option>';

        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                const r = { id: child.key, ...child.val() };
                window.allRoutes.push(r);
                const opt = document.createElement('option');
                opt.value = r.id;
                opt.textContent = `${r.from || '-'} --> ${r.to || '-'}`;
                opt.dataset.from = r.from;
                opt.dataset.to = r.to;
                opt.dataset.distance = r.distance;
                if (routeSelect) routeSelect.appendChild(opt.cloneNode(true));
                if (editRouteSelect) editRouteSelect.appendChild(opt);
            });
        }
    });

    // Load Transporters
    window.db.ref(`users/${window.currentCoreAccountId}/transporters`).on('value', (snapshot) => {
        window.allTransporters = [];
        const addSelect = document.getElementById('transporterSelect');
        const editSelect = document.getElementById('editTransporterSelect');
        if (addSelect) addSelect.innerHTML = '<option value="">Select a Transporter</option>';
        if (editSelect) editSelect.innerHTML = '<option value="">Select a Transporter</option>';

        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                const t = { id: child.key, ...child.val() };
                window.allTransporters.push(t);
                populateTransporterDropdowns(t, addSelect, editSelect);
            });
        }
    });

    // Load Employees
    window.db.ref(`users/${window.currentCoreAccountId}/employees`).on('value', (snapshot) => {
        const employeeSelect = document.getElementById('employeeSelect');
        const editEmployeeSelect = document.getElementById('editEmployeeSelect');
        if (employeeSelect) employeeSelect.innerHTML = '<option value="">Select Employee</option>';
        if (editEmployeeSelect) editEmployeeSelect.innerHTML = '<option value="">Select Employee</option>';
        if (snapshot.exists()) {
            snapshot.forEach(child => {
                const e = { id: child.key, ...child.val() };
                const opt = document.createElement('option');
                opt.value = e.id;
                opt.textContent = `${e.name} (${e.designation || 'N/A'})`;
                if (employeeSelect) employeeSelect.appendChild(opt.cloneNode(true));
                if (editEmployeeSelect) editEmployeeSelect.appendChild(opt);
            });
        }
    });

    // Load Work Vendors
    window.db.ref(`users/${window.currentCoreAccountId}/workVendors`).on('value', (snapshot) => {
        window.allWorkVendors = [];
        if (snapshot.exists()) {
            snapshot.forEach(child => window.allWorkVendors.push({ id: child.key, ...child.val() }));
        }
    });

    // Load Pumps (User specific)
    window.db.ref(`users/${user.uid}/petrolPumps`).on('value', (snapshot) => {
        window.allPumps = [];
        if (snapshot.exists()) {
            snapshot.forEach(child => window.allPumps.push({ id: child.key, ...child.val() }));
        }
    });

    // Load Initial LRs
    loadLRData('initial');
}

async function loadAllVehicles(userId) {
    const userProfileRef = window.db.ref(`users/${userId}`);
    const userSnapshot = await userProfileRef.once('value');
    const userData = userSnapshot.val();

    // Store profile for invoice
    const profileSnap = await window.db.ref(`users/${userId}/profile`).once('value');
    window.currentUserProfile = profileSnap.val() || {};

    window.currentCoreAccountId = (userData && userData.coreAccountId) || userId;

    window.db.ref(`users/${window.currentCoreAccountId}/vehicles`).on('value', (snapshot) => {
        window.allVehicles = [];
        const truckSelect = document.getElementById('truckNumber');
        const editTruckSelect = document.getElementById('editTruckNumber');
        if (truckSelect) truckSelect.innerHTML = '<option value="">Select a Truck</option>';
        if (editTruckSelect) editTruckSelect.innerHTML = '<option value="">Select a Truck</option>';

        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                const v = { id: child.key, ...child.val() };
                window.allVehicles.push(v);
                const opt = document.createElement('option');
                opt.value = v.vehicleNumber;
                opt.textContent = v.vehicleNumber;
                if (truckSelect) truckSelect.appendChild(opt.cloneNode(true));
                if (editTruckSelect) editTruckSelect.appendChild(opt);
            });
        }
        updateTruckFilterDropdown();
    });

    window.db.ref(`users/${window.currentCoreAccountId}/drivers`).on('value', (snapshot) => {
        window.allDrivers = [];
        populateDriverDropdowns(snapshot, 'driverSelect', 'editDriverSelect');
    });
}

// --- CRUD OPERATIONS ---

// Custom validation function for LR form
function validateLRFormCustom() {
    const errors = [];
    
    // Ensure auto-generation is applied before validation
    applyAutoGenerationSettings();
    
    // Check required fields
    const lrDate = document.getElementById('lrDate').value;
    if (!lrDate) errors.push('- Date is required');
    
    const lrNumber = document.getElementById('lrNumber').value;
    if (!lrNumber || lrNumber === 'Auto-generated') {
        // Try to generate LR number if it's missing and auto-generation is enabled
        if (window.autoSettings && window.autoSettings.lrNo) {
            generateLRNumber(document.getElementById('lrNumber'));
        } else {
            errors.push('- LR Number is required');
        }
    }
    
    const isMarketVehicle = document.getElementById('vehicleTypeToggle').checked;
    const truckNumber = isMarketVehicle ? document.getElementById('marketTruckNumber').value : document.getElementById('truckNumber').value;
    if (!truckNumber) errors.push('- Truck Number is required');
    
    const driverName = isMarketVehicle ? document.getElementById('marketDriverName').value.trim() : document.getElementById('driverSelect').value;
    // Driver name is now optional
    
    const routeSelect = document.getElementById('routeSelect').value;
    if (!routeSelect) errors.push('- Route is required');
    
    // Validate From and To locations from selected route
    const routeSelectElement = document.getElementById('routeSelect');
    const selectedRoute = routeSelectElement.options[routeSelectElement.selectedIndex];
    const fromLoc = selectedRoute ? (selectedRoute.dataset.from || '') : '';
    const toLoc = selectedRoute ? (selectedRoute.dataset.to || '') : '';
    
    if (!fromLoc || !toLoc) {
        errors.push('- Both From and To locations are required. Please select a valid route.');
    }
    
    const clientId = document.getElementById('clientId').value;
    if (!clientId) errors.push('- Client is required');
    
    const item = document.getElementById('item').value;
    if (!item) errors.push('- Item is required');
    
    // Check numeric fields (now optional)
    const numPackages = document.getElementById('numPackages').value;
    // Number of packages is now optional
    
    const weight = document.getElementById('weight').value;
    // Weight is now optional
    
    if (errors.length > 0) {
        alert('Please fix the following errors:\n' + errors.join('\n'));
        return false;
    }
    
    return true;
}

// Custom validation function for Edit LR form
function validateEditLRFormCustom() {
    const errors = [];
    
    // Ensure auto-generation is applied before validation
    applyEditAutoGenerationSettings();
    
    // Check required fields
    const lrDate = document.getElementById('editLrDate').value;
    if (!lrDate) errors.push('- Date is required');
    
    const lrNumber = document.getElementById('editLrNumber').value;
    if (!lrNumber || lrNumber === 'Auto-generated') {
        // Try to generate LR number if it's missing and auto-generation is enabled
        if (window.autoSettings && window.autoSettings.lrNo) {
            generateLRNumber(document.getElementById('editLrNumber'));
        } else {
            errors.push('- LR Number is required');
        }
    }
    
    const isMarketVehicle = document.getElementById('editVehicleTypeToggle').checked;
    const truckNumber = isMarketVehicle ? document.getElementById('editMarketTruckNumber').value : document.getElementById('editTruckNumber').value;
    if (!truckNumber) errors.push('- Truck Number is required');
    
    const driverName = isMarketVehicle ? document.getElementById('editMarketDriverName').value.trim() : document.getElementById('editDriverSelect').value;
    // Driver name is now optional
    
    const routeSelect = document.getElementById('editRouteSelect').value;
    if (!routeSelect) errors.push('- Route is required');
    
    // Validate From and To locations from selected route
    const routeSelectElement = document.getElementById('editRouteSelect');
    const selectedRoute = routeSelectElement ? routeSelectElement.options[routeSelectElement.selectedIndex] : null;
    const fromLoc = selectedRoute ? (selectedRoute.dataset.from || '') : '';
    const toLoc = selectedRoute ? (selectedRoute.dataset.to || '') : '';
    
    if (!fromLoc || !toLoc) {
        errors.push('- Both From and To locations are required. Please select a valid route.');
    }
    
    const clientId = document.getElementById('editClientId').value;
    if (!clientId) errors.push('- Client is required');
    
    const item = document.getElementById('editItem').value;
    if (!item) errors.push('- Item is required');
    
    // Check numeric fields
    const numPackages = document.getElementById('editNumPackages').value;
    if (!numPackages || parseFloat(numPackages) <= 0) errors.push('- Number of packages must be greater than 0');
    
    const weight = document.getElementById('editWeight').value;
    if (!weight || parseFloat(weight) <= 0) errors.push('- Weight must be greater than 0');
    
    if (errors.length > 0) {
        alert('Please fix the following errors:\n' + errors.join('\n'));
        return false;
    }
    
    return true;
}

async function saveLR() {
    const form = document.getElementById('lrForm');
    
    // Custom validation to handle auto-generated fields
    if (!validateLRFormCustom()) {
        return;
    }

    const routeSelect = document.getElementById('routeSelect');
    const selectedRoute = routeSelect.options[routeSelect.selectedIndex];
    const fromLoc = selectedRoute ? (selectedRoute.dataset.from || '') : '';
    const toLoc = selectedRoute ? (selectedRoute.dataset.to || '') : '';
    const routeDistance = selectedRoute && selectedRoute.dataset && selectedRoute.dataset.distance ? parseFloat(selectedRoute.dataset.distance) || 0 : 0;

    const isMarketVehicle = document.getElementById('vehicleTypeToggle').checked;
    const truckNumber = isMarketVehicle ? document.getElementById('marketTruckNumber').value : document.getElementById('truckNumber').value;
    const driverName = isMarketVehicle ? document.getElementById('marketDriverName').value.trim() : document.getElementById('driverSelect').value;

    const transporterSelect = document.getElementById('transporterSelect');
    const transporterId = transporterSelect.value;
    const transporterName = transporterSelect.value ? transporterSelect.options[transporterSelect.selectedIndex].dataset.name : null;

    const vehicle = window.allVehicles.find(v => (v.vehicleNo || '').toUpperCase() === truckNumber.toUpperCase() && v.driverName === driverName);
    const employeeSelect = document.getElementById('employeeSelect');
    const employeeId = employeeSelect ? employeeSelect.value : null;

    const lrData = {
        date: document.getElementById('lrDate').value,
        lrNumber: document.getElementById('lrNumber').value,
        lrType: transporterId ? 'market_company' : (isMarketVehicle ? 'market' : 'own'),
        transporterId: transporterId,
        transporterCompany: transporterName,
        routeId: document.getElementById('routeSelect').value,
        invoiceNumber: document.getElementById('invoiceNumberInput').value,
        deliveryNo: document.getElementById('deliveryNo').value,
        orderNo: document.getElementById('orderNo').value,
        shipmentNo: document.getElementById('shipmentNo').value,
        truckNumber: truckNumber,
        driverName: driverName,
        truckId: vehicle ? vehicle.id : null,
        clientId: document.getElementById('clientId').value,
        consigneeId: document.getElementById('consigneeId').value || document.getElementById('clientId').value,
        employeeId: employeeId || null,
        fromLocation: fromLoc,
        toLocation: toLoc,
        routeDistanceKm: routeDistance,
        numPackages: parseFloat(document.getElementById('numPackages').value) || 0,
        weightPerPackage: parseFloat(document.getElementById('weightPerPackage').value) || 0,
        weight: parseFloat(document.getElementById('weight').value) || 0,
        item: document.getElementById('item').value,
        tripDetails: {
            billingRate: 0, billingAmount: 0, freightRate: 0, freightAmount: 0,
            advance: 0, shortage: 0, endingKm: 0, totalKm: 0,
            vehicleAverage: 0, fuelUsedLiters: 0, dieselRatePerLiter: 0,
            fuelAlreadyDeducted: false,
            tyreExpenses: 0, tollExpenses: 0, foodExpenses: 0, loadingUnloadingExpenses: 0,
            policeChallanExpenses: 0, tacExpenses: 0, permitExpenses: 0, brokerageExpenses: 0,
            vehicleWorkAmount: 0, commissionExpenses: 0, tirpalRopeExpenses: 0, otherExpenses: 0,
            genericExpenses: [],
            cgstPercentage: 9, cgstAmount: 0, sgstPercentage: 9, sgstAmount: 0,
            totalBillingAmount: 0, totalExpenses: 0, driverPayable: 0, clientBalance: 0,
        },
        createdAt: new Date().toISOString(),
        status: 'active'
    };

    if (!window.currentCoreAccountId) { alert('Error: Core account ID not found.'); return; }

    try {
        await window.db.ref(`users/${window.currentCoreAccountId}/lrReports`).push(lrData);
        alert('LR saved successfully!');
        form.reset();
        document.getElementById('lrDate').value = new Date().toISOString().split('T')[0];
        applyAutoGenerationSettings();
        // Explicitly refresh the data
        setTimeout(() => loadLRData('initial'), 500);
    } catch (error) {
        console.error('Error saving LR:', error);
        alert('Error saving LR.');
    }
}

async function updateLR() {
    const form = document.getElementById('editLrForm');
    
    // Custom validation to handle auto-generated fields
    if (!validateEditLRFormCustom()) {
        return;
    }

    const editRouteSelect = document.getElementById('editRouteSelect');
    const selectedEditRoute = editRouteSelect ? editRouteSelect.options[editRouteSelect.selectedIndex] : null;
    const editFromLoc = selectedEditRoute ? (selectedEditRoute.dataset.from || '') : '';
    const editToLoc = selectedEditRoute ? (selectedEditRoute.dataset.to || '') : '';
    const routeDistance = selectedEditRoute && selectedEditRoute.dataset && selectedEditRoute.dataset.distance ? parseFloat(selectedEditRoute.dataset.distance) || 0 : 0;

    const isMarketVehicle = document.getElementById('editVehicleTypeToggle').checked;
    const truckNumber = isMarketVehicle ? document.getElementById('editMarketTruckNumber').value : document.getElementById('editTruckNumber').value;
    const driverName = isMarketVehicle ? document.getElementById('editMarketDriverName').value : document.getElementById('editDriverSelect').value;
    const employeeId = document.getElementById('editEmployeeSelect') ? document.getElementById('editEmployeeSelect').value : null;
    const transporterSelect = document.getElementById('editTransporterSelect');
    const transporterId = transporterSelect.value;
    const transporterName = transporterSelect.value ? transporterSelect.options[transporterSelect.selectedIndex].dataset.name : null;

    const vehicle = window.allVehicles.find(v => (v.vehicleNo || '').toUpperCase() === truckNumber.toUpperCase() && v.driverName === driverName);

    const lrUpdateData = {
        date: document.getElementById('editLrDate').value,
        lrNumber: document.getElementById('editLrNumber').value,
        lrType: transporterId ? 'market_company' : (isMarketVehicle ? 'market' : 'own'),
        transporterId: transporterId,
        transporterCompany: transporterName,
        routeId: document.getElementById('editRouteSelect').value,
        invoiceNumber: document.getElementById('editInvoiceNumberInput').value,
        deliveryNo: document.getElementById('editDeliveryNo').value,
        orderNo: document.getElementById('editOrderNo').value,
        truckNumber: truckNumber,
        driverName: driverName,
        truckId: vehicle ? vehicle.id : null,
        clientId: document.getElementById('editClientId').value,
        fromLocation: editFromLoc,
        toLocation: editToLoc,
        routeDistanceKm: routeDistance,
        numPackages: parseFloat(document.getElementById('editNumPackages').value) || 0,
        weightPerPackage: parseFloat(document.getElementById('editWeightPerPackage').value) || 0,
        weight: parseFloat(document.getElementById('editWeight').value) || 0,
        consigneeId: document.getElementById('editConsigneeId').value,
        shipmentNo: document.getElementById('editShipmentNo').value,
        item: document.getElementById('editItem').value,
        employeeId: employeeId || null,
        updatedAt: new Date().toISOString()
    };

    if (!window.currentCoreAccountId || !window.currentEditingLRId) return;

    const lrRef = window.db.ref(`users/${window.currentCoreAccountId}/lrReports/${window.currentEditingLRId}`);

    try {
        const snapshot = await lrRef.once('value');
        const existingLR = snapshot.val();
        const existingTripDetails = existingLR.tripDetails || {};

        // Recalculate if weight changed
        if (existingLR.weight !== lrUpdateData.weight && existingTripDetails.billingRate > 0) {
            const newBillingAmount = lrUpdateData.weight * (existingTripDetails.billingRate || 0);
            const newFreightAmount = lrUpdateData.weight * (existingTripDetails.freightRate || 0);
            const cgstP = existingTripDetails.cgstPercentage || 9;
            const sgstP = existingTripDetails.sgstPercentage || 9;
            const newCgst = (newBillingAmount * cgstP) / 100;
            const newSgst = (newBillingAmount * sgstP) / 100;

            lrUpdateData.tripDetails = {
                ...existingTripDetails,
                billingAmount: newBillingAmount,
                freightAmount: newFreightAmount,
                cgstAmount: newCgst,
                sgstAmount: newSgst,
                totalBillingAmount: newBillingAmount + newCgst + newSgst,
                updatedAt: new Date().toISOString()
            };
        }

        await lrRef.update(lrUpdateData);

        // Sync Invoice if needed
        if (existingLR.invoiceId && window.syncInvoiceWithCurrentLR) {
            await window.syncInvoiceWithCurrentLR(existingLR.invoiceId);
        }

        alert('LR updated successfully!');
        bootstrap.Modal.getInstance(document.getElementById('editLRModal')).hide();
        // Explicitly refresh the data
        setTimeout(() => loadLRData('initial'), 500);
    } catch (error) {
        console.error('Error updating LR:', error);
        alert('Error updating LR.');
    }
}

window.deleteLR = function (lrId) {
    if (!window.currentCoreAccountId) return;
    if (confirm('Are you sure you want to delete this LR record?')) {
        window.db.ref(`users/${window.currentCoreAccountId}/lrReports/${lrId}`).remove()
            .then(() => alert('LR deleted successfully!'))
            .catch(e => alert('Error deleting LR.'));
    }
};

window.editLR = function (lrId) {
    window.currentEditingLRId = lrId;
    if (!window.currentCoreAccountId) return;

    window.db.ref(`users/${window.currentCoreAccountId}/lrReports/${lrId}`).once('value').then((snapshot) => {
        const lr = snapshot.val();
        const isMarketVehicle = lr.lrType === 'market';

        document.getElementById('editVehicleTypeToggle').checked = isMarketVehicle;
        toggleEditVehicleInput(isMarketVehicle);

        document.getElementById('editLrDate').value = lr.date;
        document.getElementById('editLrNumber').value = lr.lrNumber || '';
        document.getElementById('editInvoiceNumberInput').value = lr.invoiceNumber || '';
        document.getElementById('editDeliveryNo').value = lr.deliveryNo || '';
        document.getElementById('editOrderNo').value = lr.orderNo || '';
        document.getElementById('editClientId').value = lr.clientId;

        if (isMarketVehicle) {
            document.getElementById('editMarketTruckNumber').value = lr.truckNumber;
            document.getElementById('editMarketDriverName').value = lr.driverName || '';
        } else {
            // Set truck number with proper matching
            const editTruckSelect = document.getElementById('editTruckNumber');
            if (editTruckSelect) {
                // Try to find exact match first
                let found = false;
                for (let i = 0; i < editTruckSelect.options.length; i++) {
                    if (editTruckSelect.options[i].value.toUpperCase() === lr.truckNumber.toUpperCase()) {
                        editTruckSelect.selectedIndex = i;
                        found = true;
                        break;
                    }
                }
                // If not found, add it as an option
                if (!found && lr.truckNumber) {
                    const opt = document.createElement('option');
                    opt.value = lr.truckNumber;
                    opt.textContent = lr.truckNumber;
                    editTruckSelect.appendChild(opt);
                    editTruckSelect.value = lr.truckNumber;
                }
            }
            
            // Set driver with proper matching
            setTimeout(() => { 
                const editDriverSelect = document.getElementById('editDriverSelect');
                if (editDriverSelect && lr.driverName) {
                    let driverFound = false;
                    for (let i = 0; i < editDriverSelect.options.length; i++) {
                        if (editDriverSelect.options[i].text.toLowerCase().includes(lr.driverName.toLowerCase()) ||
                            editDriverSelect.options[i].value === lr.driverName) {
                            editDriverSelect.selectedIndex = i;
                            driverFound = true;
                            break;
                        }
                    }
                    // If not found, add it as an option
                    if (!driverFound) {
                        const opt = document.createElement('option');
                        opt.value = lr.driverName;
                        opt.textContent = lr.driverName;
                        editDriverSelect.appendChild(opt);
                        editDriverSelect.value = lr.driverName;
                    }
                }
            }, 100);
        }

        document.getElementById('editTransporterSelect').value = lr.transporterId || '';
        document.getElementById('editConsigneeId').value = lr.consigneeId || '';
        document.getElementById('editRouteSelect').value = lr.routeId || '';

        const editEmployeeSelect = document.getElementById('editEmployeeSelect');
        if (editEmployeeSelect && lr.employeeId) setTimeout(() => { editEmployeeSelect.value = lr.employeeId || ''; }, 100);

        document.getElementById('editNumPackages').value = lr.numPackages || '';
        document.getElementById('editWeightPerPackage').value = lr.weightPerPackage || '';
        document.getElementById('editWeight').value = lr.weight;
        document.getElementById('editShipmentNo').value = lr.shipmentNo || '';
        document.getElementById('editItem').value = lr.item || '';

        applyEditAutoGenerationSettings();
        new bootstrap.Modal(document.getElementById('editLRModal')).show();
    });
};

// --- TRIP DETAILS & FINANCIALS ---

window.showTripDetailsModal = async function (lrId, lrNumber, weight, truckNumber, driverName) {
    const firstTab = document.querySelector('#tripDetailsTabs button');
    if (firstTab) new bootstrap.Tab(firstTab).show();

    window.currentTripLRId = lrId;
    window.currentTripTruckNumber = truckNumber;

    const editModal = document.getElementById('editLRModal');
    const isEditing = editModal.classList.contains('show');
    window.currentTripWeight = isEditing ? (parseFloat(document.getElementById('editWeight').value) || weight) : weight;

    document.getElementById('modalLrNumber').textContent = lrNumber;
    document.getElementById('fuelEntryTruckNumber').textContent = truckNumber;

    // Fetch Last KM
    let lastKm = 0;
    if (truckNumber && window.currentCoreAccountId) {
        const vSnap = await window.db.ref(`users/${window.currentCoreAccountId}/vehicles`).orderByChild('vehicleNumber').equalTo(truckNumber).once('value');
        if (vSnap.exists()) {
            const vData = Object.values(vSnap.val())[0];
            lastKm = vData.lastEndingKm || 0;
        }
    }

    const snapshot = await window.db.ref(`users/${window.currentCoreAccountId}/lrReports/${lrId}`).once('value');
    const lr = snapshot.val();
    const details = lr.tripDetails || {};
    const isMarketVehicle = lr.lrType === 'market';

    // Toggle Fields
    const ownOnly = ['fuel-tab', 'fuel-entry-tab', 'expenses-tab', 'empty-expenses-tab', 'tripAdvanceField'].map(id => document.getElementById(id));
    ownOnly.forEach(el => { if (el) el.style.display = isMarketVehicle ? 'none' : 'block'; });

    if (isMarketVehicle) document.getElementById('tripAdvance').value = 0;

    document.getElementById('commissionField').style.display = isMarketVehicle ? 'block' : 'none';
    document.getElementById('tripCommission').value = details.commission || '';
    document.getElementById('tripStartingKm').value = details.startingKm || lastKm;

    // Fill Fields
    document.getElementById('tripBillingRate').value = details.billingRate || '';
    document.getElementById('tripBillingAmount').value = details.billingAmount || '';
    document.getElementById('tripFreightRate').value = details.freightRate || '';
    document.getElementById('tripFreightAmount').value = details.freightAmount || '';
    document.getElementById('tripAdvance').value = details.advance || 0;
    document.getElementById('tripShortage').value = details.shortage || 0;
    document.getElementById('tripAdvancePaymentMode').value = details.advancePaymentMode || 'Cash';
    document.getElementById('tripEndingKm').value = details.endingKm || '';
    document.getElementById('tripVehicleAverage').value = details.vehicleAverage || '';
    document.getElementById('tripDieselRatePerLiter').value = details.dieselRatePerLiter || '';

    calculateTotalKm();
    loadCurrentFuelLevel(truckNumber);
    loadRecentFuelEntries(truckNumber);
    document.getElementById('fuelFillDate').value = new Date().toISOString().split('T')[0];

    // Expenses
    const genericContainer = document.getElementById('tripGenericExpensesContainer');
    genericContainer.innerHTML = '';
    (details.genericExpenses || []).forEach(exp => addExpenseRow('tripGenericExpensesContainer', exp));

    const emptyGenericContainer = document.getElementById('emptyTripGenericExpensesContainer');
    emptyGenericContainer.innerHTML = '';
    (lr.emptyTripData?.genericExpenses || []).forEach(exp => addExpenseRow('emptyTripGenericExpensesContainer', exp));

    document.getElementById('tripCgstPercentage').value = details.cgstPercentage || 9;
    document.getElementById('tripSgstPercentage').value = details.sgstPercentage || 9;

    calculateTripTotals();
    new bootstrap.Modal(document.getElementById('tripDetailsModal')).show();
};

// Save Trip Details
const saveTripBtn = document.getElementById('saveTripDetailsBtn');
if (saveTripBtn) {
    saveTripBtn.addEventListener('click', async () => {
        if (!window.currentTripLRId || !window.currentCoreAccountId) return;

        const lrSnap = await window.db.ref(`users/${window.currentCoreAccountId}/lrReports/${window.currentTripLRId}`).once('value');
        const lr = lrSnap.val();
        const isMarketVehicle = lr.lrType === 'market';

        const endingKm = parseFloat(document.getElementById('tripEndingKm').value) || 0;
        const startingKm = parseFloat(document.getElementById('tripStartingKm').value) || 0;
        const fuelUsedLiters = parseFloat(document.getElementById('tripFuelUsedLiters').value) || 0;

        if (!isMarketVehicle && endingKm > 0 && endingKm < startingKm) {
            alert('Ending KM cannot be less than Starting KM.');
            return;
        }

        // Collect Expenses
        const collectExpenses = (containerId) => {
            const exps = [];
            document.querySelectorAll(`#${containerId} .expense-row`).forEach(div => {
                const amount = parseFloat(div.querySelector('.expense-amount').value) || 0;
                if (amount > 0) {
                    const type = div.querySelector('.expense-type').value;
                    const data = { type, note: div.querySelector('.expense-note').value, amount, date: div.querySelector('.expense-date').value };
                    if (type === 'Vehicle Work') {
                        const vs = div.querySelector('.expense-vendor');
                        if (vs) data.vendorId = vs.value;
                    }
                    exps.push(data);
                }
            });
            return exps;
        };

        const genericExpenses = collectExpenses('tripGenericExpensesContainer');
        const emptyGenericExpenses = collectExpenses('emptyTripGenericExpensesContainer');

        // Aggregate
        const aggregate = (exps) => {
            const agg = { tyreExpenses: 0, tollExpenses: 0, foodExpenses: 0, loadingUnloadingExpenses: 0, policeChallanExpenses: 0, tacExpenses: 0, permitExpenses: 0, brokerageExpenses: 0, vehicleWorkAmount: 0, commissionExpenses: 0, tirpalRopeExpenses: 0, otherExpenses: 0 };
            exps.forEach(e => {
                const key = e.type.toLowerCase().replace(/[^a-z]/g, '') + (e.type === 'Vehicle Work' ? 'Amount' : 'Expenses');
                // Mapping is tricky, let's use switch like original
                switch (e.type) {
                    case 'Tyre': agg.tyreExpenses += e.amount; break;
                    case 'Toll': agg.tollExpenses += e.amount; break;
                    case 'Food': agg.foodExpenses += e.amount; break;
                    case 'Loading/Unloading': agg.loadingUnloadingExpenses += e.amount; break;
                    case 'Police Challan': agg.policeChallanExpenses += e.amount; break;
                    case 'TAC': agg.tacExpenses += e.amount; break;
                    case 'Permit': agg.permitExpenses += e.amount; break;
                    case 'Brokerage': agg.brokerageExpenses += e.amount; break;
                    case 'Vehicle Work': agg.vehicleWorkAmount += e.amount; break;
                    case 'Commission': agg.commissionExpenses += e.amount; break;
                    case 'Tirpal & Rope': agg.tirpalRopeExpenses += e.amount; break;
                    case 'Other': agg.otherExpenses += e.amount; break;
                }
            });
            return agg;
        };

        const tripAgg = aggregate(genericExpenses);
        const emptyAgg = aggregate(emptyGenericExpenses);

        calculateTripTotals();

        const tripDetails = {
            billingRate: parseFloat(document.getElementById('tripBillingRate').value) || 0,
            billingAmount: parseFloat(document.getElementById('tripBillingAmount').value) || 0,
            freightRate: parseFloat(document.getElementById('tripFreightRate').value) || 0,
            freightAmount: parseFloat(document.getElementById('tripFreightAmount').value) || 0,
            advance: parseFloat(document.getElementById('tripAdvance').value) || 0,
            shortage: parseFloat(document.getElementById('tripShortage').value) || 0,
            advancePaymentMode: document.getElementById('tripAdvancePaymentMode').value,
            commission: parseFloat(document.getElementById('tripCommission').value) || 0,
            startingKm, endingKm,
            totalKm: parseFloat(document.getElementById('tripTotalKm').value) || 0,
            vehicleAverage: parseFloat(document.getElementById('tripVehicleAverage').value) || 0,
            fuelUsedLiters,
            dieselRatePerLiter: parseFloat(document.getElementById('tripDieselRatePerLiter').value) || 0,
            ...tripAgg,
            genericExpenses,
            cgstPercentage: parseFloat(document.getElementById('tripCgstPercentage').value) || 9,
            sgstPercentage: parseFloat(document.getElementById('tripSgstPercentage').value) || 9,
            totalBillingAmount: parseFloat(document.getElementById('tripTotalBillingAmount').value) || 0,
            totalExpenses: parseFloat(document.getElementById('tripTotalExpenses').value) || 0,
            driverPayable: parseFloat(document.getElementById('tripDriverPayable').value) || 0,
            clientBalance: parseFloat(document.getElementById('tripClientBalance').value) || 0,
            updatedAt: new Date().toISOString()
        };

        const emptyTripData = {
            emptyTrip: emptyGenericExpenses.length > 0,
            ...emptyAgg,
            genericExpenses: emptyGenericExpenses,
            updatedAt: new Date().toISOString()
        };

        try {
            const lrRef = window.db.ref(`users/${window.currentCoreAccountId}/lrReports/${window.currentTripLRId}`);
            const currentTripDetails = lr.tripDetails || {};
            const fuelAlreadyDeducted = currentTripDetails.fuelAlreadyDeducted || false;

            await lrRef.update({ tripDetails, emptyTripData, emptyTrip: emptyTripData.emptyTrip });

            // Fuel Deduction
            if (!isMarketVehicle && endingKm > 0 && fuelUsedLiters > 0 && !fuelAlreadyDeducted) {
                const vSnap = await window.db.ref(`users/${window.currentCoreAccountId}/vehicles`).orderByChild('vehicleNumber').equalTo(window.currentTripTruckNumber).once('value');
                if (vSnap.exists()) {
                    const vId = Object.keys(vSnap.val())[0];
                    const vRef = window.db.ref(`users/${window.currentCoreAccountId}/vehicles/${vId}`);
                    const curFuel = parseFloat((await vRef.child('currentFuel').once('value')).val()) || 0;
                    const after = Math.max(curFuel - fuelUsedLiters, 0);

                    await vRef.update({ currentFuel: after, lastEndingKm: endingKm });
                    await lrRef.child('tripDetails/fuelAlreadyDeducted').set(true);

                    await window.db.ref(`users/${window.currentCoreAccountId}/fuelLogs`).push({
                        timestamp: new Date().toISOString(),
                        source: 'lr-detail-usage',
                        lrNumber: document.getElementById('modalLrNumber').textContent,
                        usedLiters: fuelUsedLiters,
                        beforeLiters: curFuel,
                        afterLiters: after,
                        truckNumber: window.currentTripTruckNumber,
                        userId: window.auth.currentUser.uid,
                        coreAccountId: window.currentCoreAccountId,
                        fuelAlreadyDeducted: true
                    });
                }
            }

            // Vehicle Work Payment
            const wpRef = window.db.ref(`users/${window.currentCoreAccountId}/workPayments`);
            const existingWpSnap = await wpRef.orderByChild('lrId').equalTo(window.currentTripLRId).once('value');

            if (existingWpSnap.exists()) {
                const pid = Object.keys(existingWpSnap.val())[0];
                if (tripDetails.vehicleWorkAmount > 0) {
                    await wpRef.child(pid).update({ amount: tripDetails.vehicleWorkAmount });
                } else {
                    await wpRef.child(pid).remove();
                }
            } else if (tripDetails.vehicleWorkAmount > 0) {
                await wpRef.push({
                    amount: tripDetails.vehicleWorkAmount,
                    date: lr.date,
                    notes: `Work for LR No: ${lr.lrNumber} (Trip Expense)`,
                    userId: window.auth.currentUser.uid,
                    createdAt: new Date().toISOString(),
                    lrId: window.currentTripLRId,
                    lrNumber: lr.lrNumber,
                    truckNumber: lr.truckNumber
                });
            }

            alert('Trip details saved successfully!');
            bootstrap.Modal.getInstance(document.getElementById('tripDetailsModal')).hide();
            // Refresh
        } catch (e) {
            console.error(e);
            alert('Error saving trip details.');
        }
    });
}

// --- HELPER FUNCTIONS ---

window.toggleVehicleInput = function (isMarket) {
    const own = document.getElementById('ownVehicleFields');
    const market = document.getElementById('marketVehicleFields');
    const ownD = document.getElementById('ownDriverField');
    const marketD = document.getElementById('marketDriverField');
    const trans = document.getElementById('transporterField');

    if (own) own.style.display = isMarket ? 'none' : 'block';
    if (market) market.style.display = isMarket ? 'block' : 'none';
    if (ownD) ownD.style.display = isMarket ? 'none' : 'block';
    if (marketD) marketD.style.display = isMarket ? 'block' : 'none';
    if (trans) trans.style.display = isMarket ? 'none' : 'block';

    const tNum = document.getElementById('truckNumber');
    const mtNum = document.getElementById('marketTruckNumber');
    if (tNum) tNum.required = !isMarket;
    if (mtNum) mtNum.required = isMarket;

    // Re-populate transporter dropdown if needed (handled by loadAllData)
};

window.toggleEditVehicleInput = function (isMarket) {
    const own = document.getElementById('editOwnVehicleFields');
    const market = document.getElementById('editMarketVehicleFields');
    const ownD = document.getElementById('editOwnDriverField');
    const marketD = document.getElementById('editMarketDriverField');

    if (own) own.style.display = isMarket ? 'none' : 'block';
    if (market) market.style.display = isMarket ? 'block' : 'none';
    if (ownD) ownD.style.display = isMarket ? 'none' : 'block';
    if (marketD) marketD.style.display = isMarket ? 'block' : 'none';

    const tNum = document.getElementById('editTruckNumber');
    const mtNum = document.getElementById('editMarketTruckNumber');
    if (tNum) tNum.required = !isMarket;
    if (mtNum) mtNum.required = isMarket;
};

window.addExpenseRow = function (containerId, data = {}) {
    const container = document.getElementById(containerId);
    const div = document.createElement('div');
    div.className = 'row g-3 mb-2 expense-row align-items-center';

    let vendorOpts = '<option value="">Select Vendor</option>';
    window.allWorkVendors.forEach(v => vendorOpts += `<option value="${v.id}" ${data.vendorId === v.id ? 'selected' : ''}>${v.name}</option>`);

    div.innerHTML = `
        <div class="col-md-2">
          <select class="form-select expense-type" onchange="window.toggleVendorDropdown(this)">
            <option value="Tyre">Tyre</option><option value="Toll">Toll</option><option value="Food">Food</option>
            <option value="Loading/Unloading">Loading/Unloading</option><option value="Police Challan">Police Challan</option>
            <option value="TAC">TAC</option><option value="Permit">Permit</option><option value="Brokerage">Brokerage</option>
            <option value="Vehicle Work">Vehicle Work</option><option value="Commission">Commission</option>
            <option value="Tirpal & Rope">Tirpal & Rope</option><option value="Other">Other</option>
          </select>
        </div>
        <div class="col-md-2"><input type="number" step="0.01" class="form-control expense-amount" placeholder="Amount" value="${data.amount || ''}" oninput="calculateTripTotals()"></div>
        <div class="col-md-3 vendor-select-container" style="display: none;"><select class="form-select expense-vendor">${vendorOpts}</select></div>
        <div class="col-md-2"><input type="date" class="form-control expense-date" value="${data.date || new Date().toISOString().split('T')[0]}"></div>
        <div class="col-md-2"><input type="text" class="form-control expense-note" placeholder="Remarks" value="${data.note || ''}"></div>
        <div class="col-md-1 text-center"><button type="button" class="btn btn-sm btn-outline-danger" onclick="this.closest('.expense-row').remove(); calculateTripTotals();"><i class="fas fa-trash"></i></button></div>
    `;
    if (data.type) div.querySelector('.expense-type').value = data.type;
    container.appendChild(div);
    window.toggleVendorDropdown(div.querySelector('.expense-type'));
};

window.toggleVendorDropdown = function (el) {
    const row = el.closest('.expense-row');
    const v = row.querySelector('.vendor-select-container');
    v.style.display = el.value === 'Vehicle Work' ? 'block' : 'none';
};

window.calculateTripTotals = function () {
    const billingAmount = parseFloat(document.getElementById('tripBillingAmount').value) || 0;
    const freightAmount = parseFloat(document.getElementById('tripFreightAmount').value) || 0;
    const advance = parseFloat(document.getElementById('tripAdvance').value) || 0;
    const shortage = parseFloat(document.getElementById('tripShortage').value) || 0;
    const billingRate = window.currentTripWeight > 0 ? (billingAmount / window.currentTripWeight) : 0;

    let genericE = 0;
    document.querySelectorAll('#tripGenericExpensesContainer .expense-amount').forEach(i => genericE += parseFloat(i.value) || 0);
    document.getElementById('tripTotalExpensesDisplay').textContent = `₹${genericE.toFixed(2)}`;

    let emptyGenericE = 0;
    document.querySelectorAll('#emptyTripGenericExpensesContainer .expense-amount').forEach(i => emptyGenericE += parseFloat(i.value) || 0);
    document.getElementById('emptyTripTotalExpensesDisplay').textContent = `₹${emptyGenericE.toFixed(2)}`;

    const cgst = (billingAmount * (parseFloat(document.getElementById('tripCgstPercentage').value) || 9)) / 100;
    const sgst = (billingAmount * (parseFloat(document.getElementById('tripSgstPercentage').value) || 9)) / 100;

    document.getElementById('tripTotalBillingAmount').value = (billingAmount + cgst + sgst).toFixed(2);
    document.getElementById('tripTotalExpenses').value = (genericE + emptyGenericE + advance).toFixed(2);
    document.getElementById('tripDriverPayable').value = (freightAmount - advance).toFixed(2);

    const shortageDeduction = (shortage / 1000) * billingRate;
    document.getElementById('tripClientBalance').value = (billingAmount - advance - shortageDeduction).toFixed(2);
};

// Calculations
window.calculateTotalKm = function () {
    const s = parseFloat(document.getElementById('tripStartingKm').value) || 0;
    const e = parseFloat(document.getElementById('tripEndingKm').value) || 0;
    document.getElementById('tripTotalKm').value = Math.max(0, e - s).toFixed(2);
    window.calculateFuelUsed();
};

window.calculateFuelUsed = function () {
    const km = parseFloat(document.getElementById('tripTotalKm').value) || 0;
    const avg = parseFloat(document.getElementById('tripVehicleAverage').value) || 0;
    document.getElementById('tripFuelUsedLiters').value = (avg > 0 ? km / avg : 0).toFixed(2);
    window.calculateFuelAmount();
};

window.calculateFuelAmount = function () {
    window.calculateTripTotals(); // Trigger total recalc
};

window.calculateTripBillingAmount = function () {
    document.getElementById('tripBillingAmount').value = ((window.currentTripWeight || 0) * (parseFloat(document.getElementById('tripBillingRate').value) || 0)).toFixed(2);
    window.calculateTripTotals();
};

window.calculateTripBillingRate = function () {
    if (window.currentTripWeight > 0) document.getElementById('tripBillingRate').value = ((parseFloat(document.getElementById('tripBillingAmount').value) || 0) / window.currentTripWeight).toFixed(2);
    window.calculateTripTotals();
};

window.calculateTripFreightAmount = function () {
    document.getElementById('tripFreightAmount').value = ((window.currentTripWeight || 0) * (parseFloat(document.getElementById('tripFreightRate').value) || 0)).toFixed(2);
    window.calculateTripTotals();
};

window.calculateTripFreightRate = function () {
    if (window.currentTripWeight > 0) document.getElementById('tripFreightRate').value = ((parseFloat(document.getElementById('tripFreightAmount').value) || 0) / window.currentTripWeight).toFixed(2);
    window.calculateTripTotals();
};

// Fuel Entry
window.loadFuelPumps = function () {
    const s = document.getElementById('fuelPumpSelect');
    if (s.options.length > 1) return;
    s.innerHTML = '<option value="">Select a Pump</option>';
    window.allPumps.forEach(p => s.innerHTML += `<option value="${p.id}">${p.name}</option>`);
};

window.calculateFuelTotalAmount = function () {
    document.getElementById('fuelAmount').value = ((parseFloat(document.getElementById('fuelLiters').value) || 0) * (parseFloat(document.getElementById('fuelPerLiter').value) || 0)).toFixed(2);
};

async function loadCurrentFuelLevel(truckNumber) {
    const el = document.getElementById('currentFuelLevel');
    if (!el) return;
    el.textContent = '...';
    const v = window.allVehicles.find(v => (v.vehicleNo || '').toUpperCase() === truckNumber.toUpperCase());
    if (v && window.currentCoreAccountId) {
        const cur = parseFloat((await window.db.ref(`users/${window.currentCoreAccountId}/vehicles/${v.id}/currentFuel`).once('value')).val()) || 0;
        el.textContent = `${cur.toFixed(2)} Liters`;
    } else el.textContent = 'N/A';
}

async function loadRecentFuelEntries(truckNumber) {
    const body = document.getElementById('recentFuelEntriesBody');
    body.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
    const snap = await window.db.ref(`users/${window.currentCoreAccountId}/fuelLogs`).orderByChild('truckNumber').equalTo(truckNumber).once('value');
    body.innerHTML = '';
    const entries = [];
    snap.forEach(c => entries.push(c.val()));
    entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    entries.forEach(e => {
        if (e.source === 'pump-fillup' || e.source === 'manual') {
            const pname = window.allPumps.find(p => p.id === e.pumpId)?.name || 'N/A';
            body.innerHTML += `<tr><td>${e.date}</td><td>${pname}</td><td class="text-end">${e.filledLiters}</td><td class="text-end">${e.totalAmount}</td><td>${e.remarks || '-'}</td></tr>`;
        }
    });
    if (!body.innerHTML) body.innerHTML = '<tr><td colspan="6">No recent entries.</td></tr>';
}

const fuelForm = document.getElementById('fuelEntryForm');
if (fuelForm) {
    fuelForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const liters = parseFloat(document.getElementById('fuelLiters').value);
        const rate = parseFloat(document.getElementById('fuelPerLiter').value);
        const amount = parseFloat(document.getElementById('fuelAmount').value);
        const pumpId = document.getElementById('fuelPumpSelect').value;
        const fillDate = document.getElementById('fuelFillDate').value;
        const kmReading = document.getElementById('fuelTripKm').value;
        const remarks = document.getElementById('fuelRemarks').value;

        const v = window.allVehicles.find(v => (v.vehicleNo || '').toUpperCase() === window.currentTripTruckNumber.toUpperCase());
        if (!v) return alert('Vehicle not found');

        try {
            const vRef = window.db.ref(`users/${window.currentCoreAccountId}/vehicles/${v.id}`);
            const before = parseFloat((await vRef.child('currentFuel').once('value')).val()) || 0;
            const after = before + liters;

            const logKey = window.db.ref(`users/${window.currentCoreAccountId}/fuelLogs`).push().key;
            const updates = {};
            updates[`users/${window.currentCoreAccountId}/vehicles/${v.id}/currentFuel`] = after;
            updates[`users/${window.currentCoreAccountId}/fuelLogs/${logKey}`] = {
                timestamp: new Date().toISOString(), date: fillDate, source: 'pump-fillup',
                truckNumber: window.currentTripTruckNumber, vehicleId: v.id, filledLiters: liters,
                perLiter: rate, totalAmount: amount, pumpId, kmReading, remarks,
                userId: window.auth.currentUser.uid, coreAccountId: window.currentCoreAccountId,
                lrNumber: document.getElementById('modalLrNumber').textContent,
                beforeLiters: before, afterLiters: after
            };
            updates[`users/${window.auth.currentUser.uid}/petrolPumps/${pumpId}/transactions/${logKey}`] = true;

            await window.db.ref().update(updates);
            alert('Fuel recorded.');
            e.target.reset();
            loadCurrentFuelLevel(window.currentTripTruckNumber);
            loadRecentFuelEntries(window.currentTripTruckNumber);
        } catch (err) { alert('Error saving fuel.'); }
    });
}

// --- SELECTION & INVOICE ---

window.toggleLRSelection = function (lrId, checked, isMarket) {
    const list = isMarket ? window.selectedMarketLRs : window.selectedLRs;
    if (checked) { if (!list.includes(lrId)) list.push(lrId); }
    else { const idx = list.indexOf(lrId); if (idx > -1) list.splice(idx, 1); }
    updateInvoiceButtonStates();
    updateSelectAllCheckboxes();
};

window.updateInvoiceButtonStates = function () {
    const o = document.getElementById('generateInvoiceBtn');
    const m = document.getElementById('generateMarketInvoiceBtn');
    if (o) o.disabled = window.selectedLRs.length === 0;
    if (m) m.disabled = window.selectedMarketLRs.length === 0;
};

window.updateSelectAllCheckboxes = function () {
    const ownAll = document.getElementById('selectAllCheckbox');
    const mAll = document.getElementById('selectAllMarketCheckbox');
    const ownBoxes = document.querySelectorAll('.lr-checkbox');
    const mBoxes = document.querySelectorAll('.market-lr-checkbox');

    if (ownAll) {
        const allChecked = ownBoxes.length > 0 && window.selectedLRs.length === ownBoxes.length;
        ownAll.checked = allChecked;
        ownAll.indeterminate = window.selectedLRs.length > 0 && !allChecked;
    }
    if (mAll) {
        const allChecked = mBoxes.length > 0 && window.selectedMarketLRs.length === mBoxes.length;
        mAll.checked = allChecked;
        mAll.indeterminate = window.selectedMarketLRs.length > 0 && !allChecked;
    }
};

window.toggleSelectAll = function (isMarket) {
    const all = document.getElementById(isMarket ? 'selectAllMarketCheckbox' : 'selectAllCheckbox');
    const boxes = document.querySelectorAll(isMarket ? '.market-lr-checkbox' : '.lr-checkbox');
    boxes.forEach(b => {
        b.checked = all.checked;
        window.toggleLRSelection(b.value, all.checked, isMarket);
    });
};

window.showBankDetailsModal = function (isMarket) {
    if ((isMarket ? window.selectedMarketLRs : window.selectedLRs).length === 0) return alert('Select LRs first.');
    if (window.createAndSaveInvoice) window.createAndSaveInvoice(isMarket, null);
};

// --- AUTO GEN & HELPERS ---

function loadAutoGenerationSettings() {
    const s = localStorage.getItem('lrAutoGenerateSettings');
    if (s) window.autoSettings = JSON.parse(s);
    applyAutoGenerationSettings();
}

function applyAutoGenerationSettings() {
    const s = window.autoSettings;
    const set = (id, enabled, prefix) => {
        const el = document.getElementById(id);
        if (el) {
            el.readOnly = enabled;
            if (enabled && !el.value) {
                if (id === 'lrNumber') generateLRNumber(el);
                else generateSequentialNumber(el, prefix);
            }
        }
    };
    set('lrNumber', s.lrNo);
    set('invoiceNumberInput', s.invoiceNo, 'INV');
    set('shipmentNo', s.shipmentNo, 'SHP');
    set('orderNo', s.orderNo, 'ORD');
    set('deliveryNo', s.deliveryNo, 'DLV');
}

function applyEditAutoGenerationSettings() {
    // Similar to above but for edit fields
    const s = window.autoSettings;
    const set = (id, enabled, prefix) => {
        const el = document.getElementById(id);
        if (el) {
            el.readOnly = enabled;
            if (enabled && !el.value) generateSequentialNumber(el, prefix);
        }
    };
    set('editInvoiceNumberInput', s.invoiceNo, 'INV');
    set('editShipmentNo', s.shipmentNo, 'SHP');
    set('editOrderNo', s.orderNo, 'ORD');
    set('editDeliveryNo', s.deliveryNo, 'DLV');
}

function saveAutoGenerationSettings() {
    // Update autoSettings object from modal checkboxes
    window.autoSettings.lrNo = document.getElementById('autoGenerateLrNo').checked;
    window.autoSettings.invoiceNo = document.getElementById('autoGenerateInvoiceNo').checked;
    window.autoSettings.shipmentNo = document.getElementById('autoGenerateShipmentNo').checked;
    window.autoSettings.orderNo = document.getElementById('autoGenerateOrderNo').checked;
    window.autoSettings.deliveryNo = document.getElementById('autoGenerateDeliveryNo').checked;
    
    // Save to localStorage
    localStorage.setItem('lrAutoGenerateSettings', JSON.stringify(window.autoSettings));
    
    // Apply the settings to update form fields
    applyAutoGenerationSettings();
    applyEditAutoGenerationSettings();
}

function generateLRNumber(el) {
    const now = new Date();
    el.value = `LR${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${Math.floor(1000 + Math.random() * 9000)}`;
}

function generateSequentialNumber(el, prefix) {
    if (!window.currentCoreAccountId) return;
    const now = new Date();
    const datePrefix = `${prefix}${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    window.db.ref(`users/${window.currentCoreAccountId}/counters/${prefix.toLowerCase()}_${datePrefix.slice(prefix.length)}`).transaction(c => (c || 0) + 1)
        .then(res => { if (res.committed) el.value = `${datePrefix}${String(res.snapshot.val()).padStart(4, '0')}`; });
}

function generateRandomNumber(el, prefix) {
    el.value = `${prefix}-${Math.floor(100 + Math.random() * 900)}`;
}

function populateTransporterDropdowns(t, ...selects) {
    selects.forEach(s => {
        if (s) {
            const o = document.createElement('option');
            o.value = t.id;
            o.textContent = t.name;
            o.dataset.name = t.name;
            s.appendChild(o);
        }
    });
}

function populateDriverDropdowns(snap, ...ids) {
    const selects = ids.map(id => document.getElementById(id));
    selects.forEach(s => { if (s) s.innerHTML = '<option value="">Select a Driver</option>'; });
    if (snap.exists()) {
        snap.forEach(c => {
            const d = c.val();
            if (d.driverName) {
                const o = document.createElement('option');
                o.value = d.driverName;
                o.textContent = d.driverName;
                selects.forEach(s => { if (s) s.appendChild(o.cloneNode(true)); });
            }
        });
    }
}

window.updateConsigneeFromClient = function () {
    const c = document.getElementById('clientId');
    const con = document.getElementById('consigneeId');
    if (c && con) con.value = c.value;
};

window.updateTruckFilterDropdown = function () {
    const f = document.getElementById('truckFilter');
    if (!f) return;
    const cur = f.value;
    f.innerHTML = '<option value="">All Trucks</option>';
    const uniq = [...new Set(window.allVehicles.map(v => v.vehicleNumber))].filter(Boolean).sort();
    uniq.forEach(v => f.innerHTML += `<option value="${v}">${v}</option>`);
    if (cur && uniq.includes(cur)) f.value = cur;
};

window.navigateTripTabs = function (dir) {
    const tabs = Array.from(document.querySelectorAll('#tripDetailsTabs .nav-link'));
    const activeIdx = tabs.findIndex(t => t.classList.contains('active'));
    let next = activeIdx + dir;
    while (tabs[next] && tabs[next].parentElement.style.display === 'none') next += dir;
    if (next >= tabs.length) next = 0;
    if (next < 0) next = tabs.length - 1;
    if (tabs[next].parentElement.style.display !== 'none') {
        if (tabs[next].id === 'fuel-entry-tab') loadFuelPumps();
        new bootstrap.Tab(tabs[next]).show();
    }
};

window.calculateWeightFromPackages = function () {
    const n = parseFloat(document.getElementById('numPackages').value) || 0;
    const w = parseFloat(document.getElementById('weightPerPackage').value) || 0;
    if (n > 0 && w > 0) document.getElementById('weight').value = (n * w / 1000).toFixed(3);
};

window.handleManualWeightInput = function () {
    document.getElementById('numPackages').value = '';
    document.getElementById('weightPerPackage').value = '';
};

window.showLRCopy = async function (lrId) {
    const user = window.auth.currentUser;
    if (!user) return;
    const lr = (await window.db.ref(`users/${window.currentCoreAccountId}/lrReports/${lrId}`).once('value')).val();
    const profile = (await window.db.ref(`users/${user.uid}/profile`).once('value')).val() || {};
    const client = window.allClients.find(c => c.id === lr.clientId) || {};
    const vehicle = window.allVehicles.find(v => (v.vehicleNo || v.vehicleNumber) === lr.truckNumber);
    const tripDetails = lr.tripDetails || {};

    const html = `
      <div class="lr-copy-container printable-area" id="lr-pdf-content">
        <div class="lr-header lr-header-content" style="display:flex; justify-content:space-between; align-items:center;">
          ${profile.companyLogoUrl ? `<img src="${profile.companyLogoUrl}" style="max-height:60px; max-width:150px;">` : ''}
          <div style="text-align:center;">
            <h4>${profile.transportName || 'Transvortex Logistics'}</h4>
            <p>Authorized transport contractor of ${client.clientName || client.name || 'To be billed'}</p>
            <p>${profile.address || ''}, ${profile.city || ''} - ${profile.pincode || ''}</p>
            <p>GSTIN: ${profile.gstin || 'N/A'} | Phone: ${profile.phoneNumber || 'N/A'}</p>
          </div>
          <div style="width:150px;"></div>
        </div>
        <div class="lr-info" style="display:flex; justify-content:space-between;">
          <div class="lr-info-left">
            <div>From: <strong>${lr.fromLocation || 'N/A'}</strong></div>
            <div>To: <strong>${lr.toLocation || 'N/A'}</strong></div>
            <div>Consignor: <strong>${client.clientName || client.name || 'To be billed'}</strong></div>
            <div>Consignee: <strong>${(window.allClients.find(c => c.id === lr.consigneeId) || {}).clientName || client.clientName || 'N/A'}</strong></div>
            <div>GSTIN: <strong>${client.gstin || 'N/A'}</strong></div>
            <div>Order No: <strong>${lr.orderNo || 'N/A'}</strong></div>
            <div>Delivery No: <strong>${lr.deliveryNo || 'N/A'}</strong></div>
          </div>
          <div class="lr-info-right">
            <div>LR No: <strong>${lr.lrNumber || 'N/A'}</strong></div>
            <div>Date: <strong>${lr.date || 'N/A'}</strong></div>
            <div>Vehicle No: <strong>${lr.truckNumber || 'N/A'}</strong></div>
            <div>Driver Name: <strong>${lr.driverName || 'N/A'}</strong></div>
            <div>Vehicle Type: <strong>${vehicle ? vehicle.vehicleType || 'N/A' : 'N/A'}</strong></div>
            <div>Vehicle Owner: <strong>${vehicle ? vehicle.ownerName || vehicle.vehicleOwner || 'Self' : 'N/A'}</strong></div>
            <div>Invoice No: <strong>${lr.invoiceNumber || 'N/A'}</strong></div>
            <div>Shipment No: <strong>${lr.shipmentNo || 'N/A'}</strong></div>
          </div>
        </div>
        <table class="lr-table" style="width:100%; border-collapse:collapse; margin-top:20px;">
          <thead><tr><th>Type</th><th>Description</th><th>Weight (MT)</th><th>Rate</th><th>Freight</th><th>Value</th></tr></thead>
          <tbody>
            <tr>
              <td>${lr.numPackages > 0 ? lr.numPackages : 'Loose'}</td>
              <td>${lr.item || 'N/A'}</td>
              <td>${lr.weight || 'N/A'}</td>
              <td>${tripDetails.freightRate > 0 ? '₹' + tripDetails.freightRate : 'To be billed'}</td>
              <td>${tripDetails.freightAmount > 0 ? '₹' + tripDetails.freightAmount : 'To be billed'}</td>
              <td>₹${(lr.goodsValue || 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <div style="margin-top:20px;">Remarks: <strong>GIT TO BE PAID BY CONSIGNOR</strong></div>
        <div class="lr-footer" style="display:flex; justify-content:space-between; margin-top:40px;">
          <div style="text-align:center; border-top:1px solid #000; width:40%;">Signature of Consignor</div>
          <div style="text-align:center; border-top:1px solid #000; width:40%;">Authorized Signatory</div>
        </div>
      </div>
    `;
    document.getElementById('lrCopyContent').innerHTML = html;
    new bootstrap.Modal(document.getElementById('lrCopyModal')).show();
};

window.downloadLRCopyPDF = async function () {
    const content = document.getElementById('lr-pdf-content');
    if (!content) return;
    const { jsPDF } = window.jspdf;
    const canvas = await html2canvas(content, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const props = pdf.getImageProperties(imgData);
    const h = (props.height * (pdf.internal.pageSize.getWidth() - 20)) / props.width;
    pdf.addImage(imgData, 'PNG', 10, 10, pdf.internal.pageSize.getWidth() - 20, h);
    pdf.save('LR_Copy.pdf');
};

// --- QUICK ADD FUNCTIONS ---

function showQuickAddModal(type) {
    const modalMap = {
        'vehicle': 'quickAddVehicleModal',
        'driver': 'quickAddDriverModal',
        'client': 'quickAddClientModal',
        'transporter': 'quickAddTransporterModal',
        'route': 'quickAddRouteModal',
        'consignee': 'quickAddClientModal' // Consignee uses same modal as client
    };
    
    const modalId = modalMap[type];
    if (modalId) {
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
    }
}

async function saveQuickAddClient() {
    const name = document.getElementById('q_clientName')?.value?.trim();
    const address = document.getElementById('q_address')?.value?.trim();
    const phone = document.getElementById('q_phone')?.value?.trim();
    const gstin = document.getElementById('q_gstin')?.value?.trim();
    const contactPerson = document.getElementById('q_contactPerson')?.value?.trim();
    
    if (!name) {
        alert('Client name is required');
        return;
    }
    
    try {
        const clientData = {
            name: name,
            address: address,
            phone: phone,
            gstin: gstin,
            createdAt: new Date().toISOString()
        };
        
        await window.db.ref(`users/${window.currentCoreAccountId}/clients`).push(clientData);
        alert('Client added successfully!');
        
        // Close modal and reset form
        bootstrap.Modal.getInstance(document.getElementById('quickAddClientModal')).hide();
        document.querySelector('#quickAddClientModal form').reset();
        
    } catch (error) {
        console.error('Error adding client:', error);
        alert('Error adding client');
    }
}

async function saveQuickAddRoute() {
    const from = document.getElementById('q_fromLocation')?.value?.trim();
    const to = document.getElementById('q_toLocation')?.value?.trim();
    const distance = document.getElementById('q_distance')?.value?.trim();
    
    if (!from || !to) {
        alert('Both From and To locations are required');
        return;
    }
    
    try {
        const routeData = {
            from: from,
            to: to,
            distance: parseFloat(distance) || 0,
            createdAt: new Date().toISOString()
        };
        
        await window.db.ref(`users/${window.currentCoreAccountId}/routes`).push(routeData);
        alert('Route added successfully!');
        
        // Close modal and reset form
        bootstrap.Modal.getInstance(document.getElementById('quickAddRouteModal')).hide();
        document.querySelector('#quickAddRouteModal form').reset();
        
    } catch (error) {
        console.error('Error adding route:', error);
        alert('Error adding route');
    }
}

async function saveQuickAddTransporter() {
    const name = document.getElementById('q_transporterName')?.value?.trim();
    const phone = document.getElementById('q_transporterPhone')?.value?.trim();
    const address = document.getElementById('q_transporterAddress')?.value?.trim();
    const contactPerson = document.getElementById('q_transporterContactPerson')?.value?.trim();
    
    if (!name) {
        alert('Transporter name is required');
        return;
    }
    
    try {
        const transporterData = {
            name: name,
            phone: phone,
            address: address,
            createdAt: new Date().toISOString()
        };
        
        await window.db.ref(`users/${window.currentCoreAccountId}/transporters`).push(transporterData);
        alert('Transporter added successfully!');
        
        // Close modal and reset form
        bootstrap.Modal.getInstance(document.getElementById('quickAddTransporterModal')).hide();
        document.querySelector('#quickAddTransporterModal form').reset();
        
    } catch (error) {
        console.error('Error adding transporter:', error);
        alert('Error adding transporter');
    }
}

async function saveQuickAddVehicle() {
    const vehicleNumber = document.getElementById('q_vehicleNumber')?.value?.trim();
    const vehicleType = document.getElementById('q_vehicleType')?.value?.trim();
    const capacity = document.getElementById('q_vehicleCapacity')?.value?.trim();
    
    if (!vehicleNumber) {
        alert('Vehicle number is required');
        return;
    }
    
    try {
        const vehicleData = {
            vehicleNumber: vehicleNumber.toUpperCase(),
            vehicleType: vehicleType,
            capacity: parseFloat(capacity) || 0,
            currentFuel: 0,
            createdAt: new Date().toISOString()
        };
        
        await window.db.ref(`users/${window.currentCoreAccountId}/vehicles`).push(vehicleData);
        alert('Vehicle added successfully!');
        
        // Close modal and reset form
        bootstrap.Modal.getInstance(document.getElementById('quickAddVehicleModal')).hide();
        document.querySelector('#quickAddVehicleModal form').reset();
        
    } catch (error) {
        console.error('Error adding vehicle:', error);
        alert('Error adding vehicle');
    }
}

async function saveQuickAddDriver() {
    const name = document.getElementById('q_driverName')?.value?.trim();
    const licenseNumber = document.getElementById('q_driverLicense')?.value?.trim();
    const phone = document.getElementById('q_driverContact')?.value?.trim();
    
    if (!name) {
        alert('Driver name is required');
        return;
    }
    
    try {
        const driverData = {
            name: name,
            licenseNumber: licenseNumber,
            phone: phone,
            createdAt: new Date().toISOString()
        };
        
        await window.db.ref(`users/${window.currentCoreAccountId}/drivers`).push(driverData);
        alert('Driver added successfully!');
        
        // Close modal and reset form
        bootstrap.Modal.getInstance(document.getElementById('quickAddDriverModal')).hide();
        document.querySelector('#quickAddDriverModal form').reset();
        
    } catch (error) {
        console.error('Error adding driver:', error);
        alert('Error adding driver');
    }
}

