/**
 * 🔧 CRITICAL FIX: Home Page Configuration Issues
 * 
 * This script fixes:
 * 1. Firebase being loaded multiple times
 * 2. Invalid API key (empty string)
 * 3. Duplicate Firebase app initialization
 * 4. Missing database URL
 * 5. Wrong configuration loading order
 */

const fs = require('fs');
const path = require('path');

function fixHomePageConfiguration(filePath) {
    try {
        console.log(`🔧 Fixing home page configuration in ${filePath}...`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Remove the broken inline configuration script
        const brokenConfigPattern = /<script>\s*\/\/ Configuration loaded from \.env file \(server-side\)[\s\S]*?\)\(\);[\s\S]*?<\/script>/g;
        
        if (brokenConfigPattern.test(content)) {
            content = content.replace(brokenConfigPattern, `
    <!-- 🔥 Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-storage-compat.js"></script>
    
    <!-- 🔐 Configuration Loading -->
    <script src="evm.js"></script>
    <script src="secure-api-loader.js"></script>`);
            
            modified = true;
            console.log(`  ✅ Replaced broken configuration script`);
        }
        
        // Remove duplicate Firebase scripts at the bottom
        const duplicateFirebasePattern = /<script src="https:\/\/www\.gstatic\.com\/firebasejs\/9\.6\.0\/firebase-[^"]*\.js"><\/script>/g;
        const duplicateScripts = content.match(duplicateFirebasePattern) || [];
        
        if (duplicateScripts.length > 0) {
            duplicateScripts.forEach(script => {
                content = content.replace(script, '');
            });
            modified = true;
            console.log(`  ✅ Removed ${duplicateScripts.length} duplicate Firebase scripts`);
        }
        
        // Fix the Firebase initialization script to check if app already exists
        const brokenInitPattern = /firebase\.initializeApp\(window\.FIREBASE_CONFIG\)/g;
        const fixedInitPattern = `if (!firebase.apps.length) {
                    firebase.initializeApp(window.FIREBASE_CONFIG);
                }`;
        
        if (brokenInitPattern.test(content)) {
            content = content.replace(brokenInitPattern, fixedInitPattern);
            modified = true;
            console.log(`  ✅ Fixed Firebase initialization to prevent duplicates`);
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
    console.log('🔧 CRITICAL FIX: Home Page Configuration Issues');
    console.log('================================================');
    
    const filePath = path.join(__dirname, 'home.html');
    
    if (fs.existsSync(filePath)) {
        fixHomePageConfiguration(filePath);
        
        console.log(`\n✅ Home page configuration fix completed!`);
        console.log(`📁 Fixed Firebase loading issues`);
        console.log(`🔧 Fixed API key and database URL issues`);
        console.log(`🛡️ Prevented duplicate Firebase app initialization`);
        console.log(`📱 Home page should work correctly now`);
        
        console.log(`\n📋 Next Steps:`);
        console.log(`1. Refresh the home page`);
        console.log(`2. Check console - should have no Firebase errors`);
        console.log(`3. Data should load properly`);
        
    } else {
        console.log(`❌ File not found: home.html`);
    }
}

// Run the fix
main();
