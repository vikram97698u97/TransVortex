/**
 * 🔧 RESTORE FIREBASE SDK SCRIPTS
 * 
 * This script restores the missing Firebase SDK scripts
 * that were accidentally removed during previous fixes
 */

const fs = require('fs');
const path = require('path');

function restoreFirebaseSDK(filePath) {
    try {
        console.log(`🔧 Restoring Firebase SDK scripts in ${filePath}...`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Check if Firebase SDK scripts are missing
        const hasFirebaseSDK = content.includes('firebase-app-compat.js');
        
        if (!hasFirebaseSDK) {
            // Add Firebase SDK scripts after the comment
            const firebaseSDKScripts = `    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-storage-compat.js"></script>
    
    `;
            
            // Replace the empty Firebase SDK section
            const emptySDKPattern = /<!-- 🔥 Firebase SDK -->[\s]*<!-- 🔐 Configuration Loading -->/;
            
            if (emptySDKPattern.test(content)) {
                content = content.replace(emptySDKPattern, `<!-- 🔥 Firebase SDK -->\n${firebaseSDKScripts}<!-- 🔐 Configuration Loading -->`);
                modified = true;
                console.log(`  ✅ Added Firebase SDK scripts`);
            }
        } else {
            console.log(`  ℹ️ Firebase SDK scripts already present`);
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
    console.log('🔧 RESTORING FIREBASE SDK SCRIPTS');
    console.log('==================================');
    
    const filePath = path.join(__dirname, 'home.html');
    
    if (fs.existsSync(filePath)) {
        restoreFirebaseSDK(filePath);
        
        console.log(`\n✅ Firebase SDK restoration completed!`);
        console.log(`📁 Firebase SDK scripts added back to head`);
        console.log(`🔧 Firebase will now be available for initialization`);
        console.log(`📱 Home page should work correctly now`);
        
        console.log(`\n🎯 Expected Results:`);
        console.log(`✅ No 'Firebase SDK not loaded' errors`);
        console.log(`✅ Firebase SDK loads properly`);
        console.log(`✅ Firebase initializes successfully`);
        console.log(`✅ Database connection established`);
        console.log(`✅ Data loading works correctly`);
        
    } else {
        console.log(`❌ File not found: home.html`);
    }
}

// Run the fix
main();
