/**
 * 🔧 FIX BROKEN JAVASCRIPT SYNTAX
 * 
 * This script fixes the broken JavaScript syntax that's preventing pages from loading
 */

const fs = require('fs');
const path = require('path');

// List of HTML files to fix
const htmlFiles = [
    'home.html', 'lr-report.html', 'trip-expenses.html'
];

function fixBrokenSyntax(filePath) {
    try {
        console.log(`🔧 Fixing broken syntax in ${filePath}...`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Fix the broken Firebase configuration syntax
        const brokenFirebasePattern = /if \(!window\.FIREBASE_CONFIG\) {\s*apiKey: window\.SECURE_FIREBASE_CONFIG\?\.apiKey \|\| "";\s*}/g;
        
        const fixedFirebasePattern = `if (!window.FIREBASE_CONFIG) {
                window.FIREBASE_CONFIG = {
                    apiKey: window.SECURE_FIREBASE_CONFIG?.apiKey || "",
                    authDomain: "transport-dashboard-ad69a.firebaseapp.com",
                    databaseURL: "https://transport-dashboard-ad69a-default-rtdb.asia-southeast1.firebasedatabase.app",
                    projectId: "transport-dashboard-ad69a",
                    storageBucket: "transport-dashboard-ad69a.appspot.com",
                    messagingSenderId: "526889676196",
                    appId: "1:526889676196:web:66032c80a4aede690ae531",
                    measurementId: "G-7F9R7HJYDH"
                };
            }`;
        
        if (brokenFirebasePattern.test(content)) {
            content = content.replace(brokenFirebasePattern, fixedFirebasePattern);
            modified = true;
            console.log(`  ✅ Fixed Firebase configuration in ${filePath}`);
        }
        
        // Remove the broken script blocks and replace with proper script loading
        const brokenScriptPattern = /<!-- 🔐 Secure \.env Configuration Loader -->[\s\S]*?<\/script>/g;
        const properScriptLoading = `
    <!-- 🔥 Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-storage-compat.js"></script>
    
    <!-- 🔐 Configuration Loading -->
    <script src="evm.js"></script>
    <script src="secure-api-loader.js"></script>`;
        
        if (brokenScriptPattern.test(content)) {
            content = content.replace(brokenScriptPattern, properScriptLoading);
            modified = true;
            console.log(`  ✅ Replaced broken script loading in ${filePath}`);
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
    console.log('🔧 Fixing Broken JavaScript Syntax');
    console.log('===================================');
    
    let fixedCount = 0;
    
    htmlFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            fixBrokenSyntax(filePath);
            fixedCount++;
        } else {
            console.log(`⚠️ File not found: ${file}`);
        }
    });
    
    console.log(`\n✅ Broken syntax fix completed!`);
    console.log(`📁 Processed ${fixedCount} HTML files`);
    console.log(`🛡️ Your pages should now load and display data properly`);
}

// Run the fix
main();
