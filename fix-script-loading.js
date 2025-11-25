/**
 * 🔧 FIX SCRIPT LOADING
 * 
 * This script fixes the script loading order in HTML files
 * Ensures evm.js is loaded before secure-api-loader.js
 */

const fs = require('fs');
const path = require('path');

// List of HTML files to fix
const htmlFiles = [
    'login.html', 'payment-billing.html', 'navbar.html', 'lr-report.html',
    'invoice.html', 'index.html', 'home.html', 'employees.html', 'contact.html',
    'combined_ca.html', 'booking.html', 'admin-payments.html', 'add.html',
    'about.html', 'tyre.html', 'trip-expenses.html', 'transporters.html',
    'subscribe.html', 'signup.html', 'services.html', 'route.html',
    'route-details.html', 'roll.html', 'profile.html', 'plan-selection.html',
    'work-management.html', 'tyre_history.html'
];

function fixScriptLoading(filePath) {
    try {
        console.log(`🔧 Fixing script loading in ${filePath}...`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Remove existing secure-api-loader.js script
        content = content.replace(/<script src="secure-api-loader\.js"><\/script>/g, '');
        
        // Remove old script blocks
        content = content.replace(/<!-- 🔥 Secure \.env Configuration Loader -->[\s\S]*?<\/script>/g, '');
        content = content.replace(/<!-- 🔥 Secure Configuration - Loaded from \.env -->[\s\S]*?<\/script>/g, '');
        
        // Add proper script loading order at the end of head
        const scriptBlock = `
    <!-- 🔥 Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-storage-compat.js"></script>
    
    <!-- 🔐 Configuration Loading -->
    <script src="evm.js"></script>
    <script src="secure-api-loader.js"></script>`;
        
        // Insert before closing head tag or before body
        if (content.includes('</head>')) {
            content = content.replace('</head>', scriptBlock + '\n</head>');
            modified = true;
            console.log(`  ✅ Added scripts to head in ${filePath}`);
        } else if (content.includes('<body>')) {
            content = content.replace('<body>', scriptBlock + '\n<body>');
            modified = true;
            console.log(`  ✅ Added scripts before body in ${filePath}`);
        }
        
        // Write fixed content back
        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log(`  ✅ Fixed ${filePath}`);
        } else {
            console.log(`  ℹ️ No fixes needed for ${filePath}`);
        }
        
    } catch (error) {
        console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
}

function main() {
    console.log('🔧 Fixing Script Loading Order');
    console.log('================================');
    
    let fixedCount = 0;
    
    htmlFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            fixScriptLoading(filePath);
            fixedCount++;
        } else {
            console.log(`⚠️ File not found: ${file}`);
        }
    });
    
    console.log(`\n✅ Script loading fix completed!`);
    console.log(`📁 Processed ${fixedCount} HTML files`);
    console.log(`🔒 evm.js now loads before secure-api-loader.js`);
    console.log(`🛡️ Your application should work correctly now`);
}

// Run the fix
main();
