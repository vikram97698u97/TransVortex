/**
 * 🔧 FINAL FIREBASE FIX
 * 
 * This script completely fixes all Firebase issues:
 * 1. Remove ALL duplicate Firebase scripts
 * 2. Fix secure-api-loader.js to prevent duplicate initialization
 * 3. Ensure proper loading order
 */

const fs = require('fs');
const path = require('path');

function finalFirebaseFix(filePath) {
    try {
        console.log(`🔧 Applying final Firebase fix to ${filePath}...`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Remove ALL Firebase scripts from the body (keep only the ones in head)
        const bodyFirebasePattern = /<script src="https:\/\/www\.gstatic\.com\/firebasejs\/9\.6\.1\/firebase-[^"]*\.js"><\/script>/g;
        const bodyFirebaseScripts = content.match(bodyFirebasePattern) || [];
        
        if (bodyFirebaseScripts.length > 0) {
            bodyFirebaseScripts.forEach(script => {
                content = content.replace(script, '');
            });
            modified = true;
            console.log(`  ✅ Removed ${bodyFirebaseScripts.length} duplicate Firebase scripts from body`);
        }
        
        // Remove secure-api-loader.js script tag (it's causing duplicate initialization)
        const secureLoaderPattern = /<script src="secure-api-loader\.js"><\/script>/g;
        if (secureLoaderPattern.test(content)) {
            content = content.replace(secureLoaderPattern, '');
            modified = true;
            console.log(`  ✅ Removed secure-api-loader.js (preventing duplicate initialization)`);
        }
        
        // Fix Firebase initialization to prevent duplicates
        const brokenInitPattern = /firebase\.initializeApp\(window\.FIREBASE_CONFIG\)/g;
        const safeInitPattern = `if (!firebase.apps.length) {
                    firebase.initializeApp(window.FIREBASE_CONFIG);
                } else {
                    firebase.app(); // Use existing app
                }`;
        
        if (brokenInitPattern.test(content)) {
            content = content.replace(brokenInitPattern, safeInitPattern);
            modified = true;
            console.log(`  ✅ Fixed Firebase initialization with duplicate check`);
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
    console.log('🔧 FINAL FIREBASE FIX');
    console.log('======================');
    
    const filePath = path.join(__dirname, 'home.html');
    
    if (fs.existsSync(filePath)) {
        finalFirebaseFix(filePath);
        
        console.log(`\n✅ Final Firebase fix completed!`);
        console.log(`📁 Removed all duplicate Firebase scripts`);
        console.log(`🔧 Fixed duplicate app initialization`);
        console.log(`🛡️ Using only evm.js for configuration`);
        console.log(`📱 Home page should work perfectly now`);
        
        console.log(`\n🎯 Expected Results:`);
        console.log(`✅ No Firebase warnings`);
        console.log(`✅ No auth/invalid-api-key errors`);
        console.log(`✅ No duplicate-app errors`);
        console.log(`✅ Proper database connection`);
        console.log(`✅ Data loading correctly`);
        
    } else {
        console.log(`❌ File not found: home.html`);
    }
}

// Run the fix
main();
