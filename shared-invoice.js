/**
 * Shared Invoice Logic for TransVortex
 * Handles invoice generation, viewing, and styling across the application.
 */

// Global Invoice Styling Settings
let currentInvoiceData = null;
let invoiceStyle = {
    themeColor: '#dc3545',
    accentStyle: 'header',
    fontStyle: 'sans-serif'
};

const styleTemplates = {
    default: { themeColor: '#dc3545', accentStyle: 'header', fontStyle: 'sans-serif' },
    blue: { themeColor: '#0d6efd', accentStyle: 'zebra', fontStyle: 'sans-serif' },
    green: { themeColor: '#198754', accentStyle: 'footer', fontStyle: 'serif' },
    minimal: { themeColor: '#343a40', accentStyle: 'none', fontStyle: 'sans-serif' }
};

/**
 * Creates and saves an invoice from selected LRs
 * @param {boolean} isMarket - Whether this is a market invoice
 * @param {string|null} singleLrId - Optional single LR ID to invoice
 */
window.createAndSaveInvoice = async function (isMarket = false, singleLrId = null) {
    const user = auth.currentUser;
    // Use global selected lists or single ID
    const lrsToProcess = singleLrId ? [singleLrId] : (isMarket ? (window.selectedMarketLRs || []) : (window.selectedLRs || []));

    if (!user || !currentCoreAccountId) {
        alert('Authentication error. Please log in again.');
        return;
    }

    if (lrsToProcess.length === 0) {
        alert('Please select at least one LR to generate an invoice.');
        return;
    }

    try {
        // 1. Fetch company profile and bank details
        const profileRef = db.ref(`users/${user.uid}/profile`);
        const profileSnap = await profileRef.once('value');
        const profile = profileSnap.exists() ? profileSnap.val() : {};

        const companyDetails = {
            name: profile.transportName || 'N/A',
            address: `${profile.address || ''}, ${profile.city || ''} - ${profile.pincode || ''}`,
            gstNumber: profile.gstin || 'N/A',
        };

        const bankDetails = {
            bankName: profile.bankName || 'N/A',
            accountNumber: profile.accountNumber || 'N/A',
            accountHolder: profile.accountHolder || 'N/A',
            ifscCode: profile.ifscCode || 'N/A',
        };

        if (bankDetails.bankName === 'N/A' || bankDetails.accountNumber === 'N/A') {
            alert('Bank details are missing in your profile. Please update your profile before generating an invoice.');
            return;
        }

        // 2. Fetch details for all selected LRs
        let subtotal = 0;
        let firstClientId = null;
        let firstTransporterId = null;
        let invoiceItems = [];
        let marketMode = null;

        const lrPromises = lrsToProcess.map(lrId => db.ref(`users/${currentCoreAccountId}/lrReports/${lrId}`).once('value'));
        const lrSnapshots = await Promise.all(lrPromises);

        for (const snap of lrSnapshots) {
            const lr = snap.val();
            if (!lr) continue;

            if (lr.tripDetails?.billingAmount === undefined || lr.tripDetails?.billingAmount <= 0) {
                alert(`Error: LR ${lr.lrNumber} does not have a valid billing amount. Please add trip details first.`);
                return;
            }

            const isMarketLR = lr.lrType === 'market_company';

            if (marketMode === null) marketMode = isMarketLR;
            if (marketMode !== isMarketLR) {
                alert('Error: Mixed LR types selected. Please select LRs of the same type.');
                return;
            }

            if (marketMode) {
                if (!firstTransporterId) firstTransporterId = lr.transporterId;
                if (lr.transporterId !== firstTransporterId) {
                    alert('Error: All selected market LRs must belong to the same transporter/market company.');
                    return;
                }
            } else {
                if (!firstClientId) firstClientId = lr.clientId;
                if (lr.clientId !== firstClientId) {
                    alert('Error: All selected LRs must belong to the same client.');
                    return;
                }
            }

            const billingAmount = lr.tripDetails?.billingAmount || 0;
            subtotal += billingAmount;

            // Helper to find client name safely
            const findClientName = (id) => {
                if (!window.allClients) return 'N/A';
                const c = window.allClients.find(c => c.id === id);
                return c ? (c.clientName || c.name) : 'N/A';
            };

            const consignor = findClientName(lr.clientId);
            const consignee = findClientName(lr.consigneeId) || consignor;

            invoiceItems.push({
                lrId: snap.key,
                date: lr.date,
                lrNumber: lr.lrNumber,
                truckNumber: lr.truckNumber,
                consignor: consignor,
                consignee: consignee,
                from: lr.fromLocation,
                to: lr.toLocation,
                weight: lr.weight,
                amount: billingAmount,
                marketCompanyName: lr.transporterCompany || ''
            });
        }

        // 3. Calculate totals
        const cgstPercentage = 9;
        const sgstPercentage = 9;
        const cgstAmount = (subtotal * cgstPercentage) / 100;
        const sgstAmount = (subtotal * sgstPercentage) / 100;
        let grandTotal = subtotal + cgstAmount + sgstAmount;

        // 4. Check outstanding balance
        let entityOutstanding = 0;
        if (marketMode && firstTransporterId) {
            const transporterSnap = await db.ref(`users/${currentCoreAccountId}/transporters/${firstTransporterId}`).once('value');
            if (transporterSnap.exists()) entityOutstanding = transporterSnap.val().outstanding || 0;
        } else if (!marketMode && firstClientId) {
            const clientSnap = await db.ref(`users/${currentCoreAccountId}/clients/${firstClientId}`).once('value');
            if (clientSnap.exists()) entityOutstanding = clientSnap.val().outstanding || 0;
        }

        // 5. Apply credit
        let paidAmount = 0;
        let paymentStatus = 'pending';
        if (entityOutstanding < 0) {
            const creditToApply = Math.min(Math.abs(entityOutstanding), grandTotal);
            paidAmount = creditToApply;
            if (paidAmount >= grandTotal - 0.01) {
                paymentStatus = 'paid';
                paidAmount = grandTotal;
            }
            else if (paidAmount > 0) paymentStatus = 'partial';
        }

        // 6. Create Invoice Object
        const invoiceNumber = `INV-${Date.now()}`;
        const invoiceData = {
            invoiceNumber: invoiceNumber,
            createdAt: new Date().toISOString(),
            transporterId: marketMode ? firstTransporterId : null,
            clientId: marketMode ? null : firstClientId,
            invoiceType: marketMode ? 'market_company' : 'client',
            companyDetails: companyDetails,
            bankDetails: bankDetails,
            items: invoiceItems,
            lrEntries: lrsToProcess,
            subtotal: subtotal,
            cgstAmount: cgstAmount,
            sgstAmount: sgstAmount,
            grandTotal: grandTotal,
            paymentStatus: paymentStatus,
            paidAmount: paidAmount,
        };

        // 7. Save and Update
        const updates = {};
        const newInvoiceKey = db.ref(`users/${currentCoreAccountId}/invoices`).push().key;
        updates[`/users/${currentCoreAccountId}/invoices/${newInvoiceKey}`] = invoiceData;

        lrsToProcess.forEach(lrId => {
            updates[`/users/${currentCoreAccountId}/lrReports/${lrId}/status`] = 'invoiced';
            updates[`/users/${currentCoreAccountId}/lrReports/${lrId}/invoiceId`] = newInvoiceKey;
        });

        if (marketMode) {
            const newOutstanding = entityOutstanding + grandTotal;
            updates[`/users/${currentCoreAccountId}/transporters/${firstTransporterId}/outstanding`] = newOutstanding;
        } else {
            const newOutstanding = entityOutstanding + grandTotal;
            updates[`/users/${currentCoreAccountId}/clients/${firstClientId}/outstanding`] = newOutstanding;
        }

        await db.ref().update(updates);

        alert('Invoice generated successfully!');
        // Redirect or open view
        if (window.location.pathname.includes('invoice.html')) {
            window.location.href = `invoice.html?view=${newInvoiceKey}`;
        } else {
            // If we are on LR page, we might want to just open the modal or redirect
            window.location.href = `invoice.html?view=${newInvoiceKey}`;
        }

    } catch (error) {
        console.error('Error creating invoice:', error);
        alert('Failed to create invoice: ' + error.message);
    }
};

/**
 * Loads style settings from local storage
 */
window.loadStyleSettings = function () {
    const storedStyle = localStorage.getItem('invoiceStyleSettings');
    if (storedStyle) {
        invoiceStyle = JSON.parse(storedStyle);
    }
    const invoiceModal = document.getElementById('invoiceDetailModal');
    if (invoiceModal) {
        invoiceModal.addEventListener('show.bs.modal', setupLivePreviewListeners);
        invoiceModal.addEventListener('hidden.bs.modal', cleanupLivePreviewListeners);
    }
};

function setupLivePreviewListeners() {
    const colorInput = document.getElementById('themeColor');
    const accentInput = document.getElementById('accentStyle');
    const fontInput = document.getElementById('fontStyle');
    if (colorInput) colorInput.value = invoiceStyle.themeColor;
    if (accentInput) accentInput.value = invoiceStyle.accentStyle;
    if (fontInput) fontInput.value = invoiceStyle.fontStyle;

    const presetSelect = document.getElementById('templatePreset');
    if (presetSelect) presetSelect.value = 'custom';

    if (currentInvoiceData) {
        applyLiveStyles();
    }
    if (colorInput) colorInput.addEventListener('input', applyLiveStyles);
    if (accentInput) accentInput.addEventListener('change', applyLiveStyles);
    if (fontInput) fontInput.addEventListener('change', applyLiveStyles);
}

function cleanupLivePreviewListeners() {
    const colorInput = document.getElementById('themeColor');
    const accentInput = document.getElementById('accentStyle');
    const fontInput = document.getElementById('fontStyle');
    if (colorInput) colorInput.removeEventListener('input', applyLiveStyles);
    if (accentInput) accentInput.removeEventListener('change', applyLiveStyles);
    if (fontInput) fontInput.removeEventListener('change', applyLiveStyles);
}

window.applyTemplate = function (templateName) {
    if (templateName === 'custom') return;
    const template = styleTemplates[templateName] || styleTemplates.default;
    const colorInput = document.getElementById('themeColor');
    const accentInput = document.getElementById('accentStyle');
    const fontInput = document.getElementById('fontStyle');

    if (colorInput) colorInput.value = template.themeColor;
    if (accentInput) accentInput.value = template.accentStyle;
    if (fontInput) fontInput.value = template.fontStyle;

    applyLiveStyles();
    const presetSelect = document.getElementById('templatePreset');
    if (presetSelect) presetSelect.value = templateName;
};

function applyLiveStyles() {
    if (!currentInvoiceData) return;
    const colorInput = document.getElementById('themeColor');
    const accentInput = document.getElementById('accentStyle');
    const fontInput = document.getElementById('fontStyle');

    if (!colorInput || !accentInput || !fontInput) return;

    const themeColor = colorInput.value;
    const accentStyle = accentInput.value;
    const fontStyle = fontInput.value;

    const previewElement = document.getElementById('printableInvoiceDetail');
    if (!previewElement) return;

    previewElement.style.fontFamily = fontStyle;
    document.querySelectorAll('#printableInvoiceDetail .invoice-theme-color').forEach(el => {
        el.style.color = themeColor;
    });

    const table = previewElement.querySelector('.table');
    if (table) {
        const thead = table.querySelector('thead');
        const tfoot = table.querySelector('tfoot');
        const tbodyRows = table.querySelectorAll('tbody tr');
        const tfootTotalRow = tfoot ? tfoot.querySelector('tr:last-child') : null;

        if (thead) { thead.style.backgroundColor = ''; thead.style.color = ''; }
        if (tfootTotalRow) { tfootTotalRow.style.backgroundColor = ''; tfootTotalRow.style.color = ''; }
        tbodyRows.forEach(row => row.classList.remove('table-zebra-stripe'));

        if (accentStyle === 'header' && thead) {
            thead.style.backgroundColor = themeColor;
            thead.style.color = 'white';
        } else if (accentStyle === 'footer' && tfootTotalRow) {
            tfootTotalRow.style.backgroundColor = themeColor;
            tfootTotalRow.style.color = 'white';
        } else if (accentStyle === 'zebra') {
            tbodyRows.forEach((row, index) => {
                if (index % 2 !== 0) row.classList.add('table-zebra-stripe');
            });
        }
    }
}

/**
 * View an invoice in the modal
 * @param {string} invoiceId 
 */
window.viewInvoice = async function (invoiceId) {
    const modalBody = document.getElementById('printableInvoiceDetail');
    if (!modalBody) return;

    modalBody.innerHTML = '<div class="text-center p-5"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Loading invoice...</p></div>';

    const invoiceModal = new bootstrap.Modal(document.getElementById('invoiceDetailModal'));
    invoiceModal.show();

    try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated.");

        const invoiceSnap = await db.ref(`users/${currentCoreAccountId}/invoices/${invoiceId}`).once('value');
        if (!invoiceSnap.exists()) {
            modalBody.innerHTML = '<p class="text-danger text-center">Invoice not found.</p>';
            return;
        }
        const invoice = invoiceSnap.val();
        currentInvoiceData = invoice;

        // Apply current styles
        const colorInput = document.getElementById('themeColor');
        const themeColor = colorInput ? colorInput.value : invoiceStyle.themeColor;
        const accentInput = document.getElementById('accentStyle');
        const accentStyle = accentInput ? accentInput.value : invoiceStyle.accentStyle;
        const fontInput = document.getElementById('fontStyle');
        const fontStyle = fontInput ? fontInput.value : invoiceStyle.fontStyle;

        const getSealSVG = (name, gstin) => `
            <svg class="company-seal stamp-on-print" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" style="display: block;"><defs><path id="topTextPath" fill="none" d="M 30,100 a 70,70 0 1,1 140,0" /><path id="bottomTextPath" fill="none" d="M 30,100 a 70,70 0 1,0 140,0" /></defs><g fill="${themeColor}" stroke="${themeColor}"><circle cx="100" cy="100" r="95" stroke-width="3" fill="none"/><circle cx="100" cy="100" r="88" stroke-width="1.5" fill="none"/><text font-family="'Arial Black', 'Impact', sans-serif" font-size="15" letter-spacing="1.5"><textPath xlink:href="#topTextPath" startOffset="50%" text-anchor="middle">${name.toUpperCase().substring(0, 20)}</textPath></text><text font-family="'Arial Black', 'Impact', sans-serif" font-size="12" letter-spacing="1"><textPath xlink:href="#bottomTextPath" startOffset="50%" text-anchor="middle">OFFICIAL SEAL</textPath></text><text x="100" y="125" font-family="'Arial', sans-serif" font-size="14" font-weight="bold" text-anchor="middle" letter-spacing="1">TRANSPORT</text><text x="100" y="145" font-family="'Arial', sans-serif" font-size="9" font-weight="normal" text-anchor="middle">GSTIN: ${gstin || 'N/A'}</text></g></svg>
        `;

        let billedToName = 'N/A', billedToGstin = 'N/A', billedToAddress = 'N/A';
        let billToLabel = 'Client Company';
        const lrs = invoice.items || [];

        if (invoice.invoiceType === 'market' || invoice.invoiceType === 'market_company') {
            billToLabel = 'Transporter Company';
            if (invoice.transporterId) {
                const transporterSnap = await db.ref(`users/${currentCoreAccountId}/transporters/${invoice.transporterId}`).once('value');
                if (transporterSnap.exists()) {
                    const t = transporterSnap.val();
                    billedToName = t.name || 'Market Company';
                    billedToGstin = t.gstin || 'N/A';
                    billedToAddress = t.address || t.billingAddress || 'N/A';
                }
            }
        } else if (invoice.clientId) {
            const clientSnap = await db.ref(`users/${currentCoreAccountId}/clients/${invoice.clientId}`).once('value');
            if (clientSnap.exists()) {
                const c = clientSnap.val();
                billedToName = c.clientName || 'N/A';
                billedToGstin = c.gstin || 'N/A';
                billedToAddress = c.billingAddress || 'N/A';
            }
        }

        // Use global profile if available, otherwise fetch
        let profile = window.currentUserProfile;
        if (!profile) {
            const pSnap = await db.ref(`users/${user.uid}/profile`).once('value');
            profile = pSnap.val() || {};
        }

        const companyLogoUrl = profile.companyLogoUrl || '';
        const companyName = profile.transportName || 'Transvortex Logistics';
        const fullCompanyAddress = `${profile.address || 'N/A'}, ${profile.city || 'N/A'}, ${profile.pincode || 'N/A'}`;
        const companyGstin = profile.gstin || 'N/A';

        const status = invoice.paymentStatus || 'pending';
        let stampHtml = '';
        switch (status) {
            case 'paid': stampHtml = '<div class="paid-stamp">Paid</div>'; break;
            case 'partial': stampHtml = '<div class="partial-stamp">Partially Paid</div>'; break;
            case 'pending': stampHtml = '<div class="pending-stamp">Pending</div>'; break;
        }

        const headerBgStyle = accentStyle === 'header' ? `style="background-color: ${themeColor}; color: white !important;" class="invoice-theme-bg"` : 'class="table-light"';
        const footerBgStyle = accentStyle === 'footer' ? `style="background-color: ${themeColor}; color: white !important;" class="invoice-theme-bg"` : 'class="table-success"';
        const fontStyleAttr = `style="font-family: ${fontStyle}, sans-serif;"`;

        const invoiceHtml = `
            <div class="printable-area" ${fontStyleAttr} style="position: relative;">
            ${stampHtml}
            <div style="height: 10px; background-color: ${themeColor}; margin-bottom: 20px;"></div>
            <div class="invoice-header-box px-3">
                <div class="company-details-left">
                    <div class="invoice-title invoice-theme-color" style="color: ${themeColor} !important;">INVOICE</div>
                    <p class="fw-bold mb-1">${companyName}</p>
                    <p class="small mb-0">${fullCompanyAddress}</p>
                    <p class="small mb-0">GSTIN: ${companyGstin}</p>
                </div>
                <div class="invoice-details-right">
                    ${companyLogoUrl ? `<img src="${companyLogoUrl}" alt="Logo" class="logo-on-print" style="max-height: 80px; max-width: 100px;">` : `<div class="logo-placeholder">LOGO</div>`}
                    <p class="small mb-1 mt-3">DATE: ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}</p>
                    <p class="small mb-3 fw-bold">INVOICE NO: ${invoice.invoiceNumber}</p>
                </div>
            </div>
            <div class="billing-shipping-row px-3">
                <div class="bill-to-box">
                    <p class="fw-bold mb-1 invoice-theme-color" style="color: ${themeColor} !important; border-bottom: 2px solid ${themeColor}; padding-bottom: 5px;">BILL TO:</p>
                    <p class="mb-1 small">${billToLabel}: ${billedToName}</p>
                    <p class="mb-1 small">Address: ${billedToAddress}</p>
                    <p class="mb-0 small">GSTIN: ${billedToGstin}</p>
                </div>
            </div>
            <div class="table-responsive px-3">
                <table class="table table-bordered">
                <thead ${headerBgStyle}>
                    <tr>
                    <th>LR No / Item</th><th>Date</th><th>Truck No</th><th>From</th><th>To</th><th class="text-end">Weight (MT)</th><th class="text-end">Rate</th><th class="text-end">Amount (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    ${lrs.map((lr, index) => {
            const rate = lr.weight > 0 ? (lr.amount / lr.weight).toFixed(2) : '0.00';
            const rowStyle = accentStyle === 'zebra' && index % 2 !== 0 ? `class="table-zebra-stripe"` : '';
            return `<tr ${rowStyle}><td>${lr.lrNumber || 'N/A'} - ${lr.item || 'Freight'}</td><td>${new Date(lr.date).toLocaleDateString('en-IN')}</td><td>${lr.truckNumber || 'N/A'}</td><td>${lr.from || lr.fromLocation || ''}</td><td>${lr.to || lr.toLocation || ''}</td><td class="text-end">${(lr.weight || 0).toFixed(2)}</td><td class="text-end">₹${rate}</td><td class="text-end">₹${(lr.amount || 0).toFixed(2)}</td></tr>`;
        }).join('')}
                </tbody>
                <tfoot>
                    <tr>
                    <td colspan="5" rowspan="4" class="align-bottom">
                        <p class="fw-bold mb-1">Remarks / Payment Instructions:</p>
                        <p class="small">Payment is due on receipt. Please include the Invoice number in all bank transfers.</p>
                        <div class="row">
                        <div class="col-md-6"><p class="mb-1 mt-3 fw-bold">Bank Details:</p><p class="mb-1 small">Bank: <span>${invoice.bankDetails.bankName}</span></p><p class="mb-1 small">A/C No: <span>${invoice.bankDetails.accountNumber}</span></p><p class="mb-1 small">IFSC: <span>${invoice.bankDetails.ifscCode || 'N/A'}</span></p></div>
                        <div class="col-md-6 text-end">
                            ${getSealSVG(companyName, companyGstin)}
                        </div>
                        </div>
                    </td><td colspan="2" class="text-end"><strong>SUBTOTAL:</strong></td><td class="text-end fw-bold">₹${(invoice.subtotal || 0).toFixed(2)}</td></tr>
                    <tr><td colspan="2" class="text-end"><strong>CGST (${invoice.cgstPercentage || 9}%):</strong></td><td class="text-end fw-bold">₹${(invoice.cgstAmount || 0).toFixed(2)}</td></tr>
                    <tr><td colspan="2" class="text-end"><strong>SGST (${invoice.sgstPercentage || 9}%):</strong></td><td class="text-end fw-bold">₹${(invoice.sgstAmount || 0).toFixed(2)}</td></tr>
                    <tr ${footerBgStyle}><td colspan="5" class="text-start ps-3 small fw-bold">AMOUNT IN WORDS: ${numberToWords(invoice.grandTotal || 0)}</td><td colspan="2" class="text-end"><strong>BALANCE DUE:</strong></td><td class="text-end fw-bold fs-5">₹${(invoice.grandTotal || 0).toFixed(2)}</td></tr>
                </tfoot>
                </table>
            </div>
            <div class="row mt-5 px-3"><div class="col-md-7"><p class="small text-muted">Note: Subject to ${invoice.companyDetails.city || 'Jurisdiction'} Jurisdiction.</p></div><div class="col-md-5 text-end signature-on-print"><div class="mt-4"><p class="mb-4">For <strong class="invoice-theme-color" style="color: ${themeColor} !important;">${companyName}</strong></p><p class="mb-0">___________________</p><p class="mb-0">Authorized Signatory</p></div></div></div>
            <div style="height: 10px; background-color: ${themeColor}; margin-top: 20px;"></div>
            </div>
        `;
        modalBody.innerHTML = invoiceHtml;
        applyLiveStyles();

    } catch (error) {
        console.error("Error viewing invoice:", error);
        modalBody.innerHTML = '<p class="text-danger text-center">Could not load invoice details.</p>';
    }
};

window.printInvoiceDetail = function () {
    window.print();
};

window.numberToWords = function (num) {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    if ((num = Math.floor(num).toString()).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';

    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';

    return str.trim().replace(/\s+/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' Only';
};

