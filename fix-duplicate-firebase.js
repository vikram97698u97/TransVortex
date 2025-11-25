/**
 * 🔧 FIREBASE_CONFIG Duplication Fix
 * 
 * This script will fix the "Identifier 'FIREBASE_CONFIG' has already been declared" error
 */

const fs = require('fs');

console.log('🔧 Fixing FIREBASE_CONFIG duplication issue...\n');

// Check if evm.js has proper declarations
if (fs.existsSync('evm.js')) {
    let content = fs.readFileSync('evm.js', 'utf8');
    
    // Fix: Change const to let to allow redeclaration
    content = content.replace(/const FIREBASE_CONFIG = /g, 'let FIREBASE_CONFIG = ');
    content = content.replace(/const CLOUDINARY_CONFIG = /g, 'let CLOUDINARY_CONFIG = ');
    content = content.replace(/const AI_CONFIG = /g, 'let AI_CONFIG = ');
    content = content.replace(/const ENVIRONMENT = /g, 'let ENVIRONMENT = ');
    content = content.replace(/const APP_CONFIG = /g, 'let APP_CONFIG = ');
    content = content.replace(/const SECURITY_CONFIG = /g, 'let SECURITY_CONFIG = ');
    content = content.replace(/const NOTIFICATION_CONFIG = /g, 'let NOTIFICATION_CONFIG = ');
    
    // Add check to prevent redeclaration
    const fixedContent = `// Prevent redeclaration
if (typeof window.FIREBASE_CONFIG !== 'undefined') {
    console.log('✅ FIREBASE_CONFIG already loaded, skipping...');
} else {

${content}

}`;
    
    // Backup and update
    fs.writeFileSync('evm.js.backup.duplication-fix', fs.readFileSync('evm.js'));
    fs.writeFileSync('evm.js', fixedContent);
    
    console.log('✅ Fixed FIREBASE_CONFIG duplication');
    console.log('✅ Changed const to let declarations');
    console.log('✅ Added redeclaration prevention');
    console.log('✅ Backup created: evm.js.backup.duplication-fix');
    
} else {
    console.log('❌ evm.js not found');
}

console.log('\n🎯 Next Steps:');
console.log('1. Clear browser cache (Ctrl+F5)');
console.log('2. Test the login again');
console.log('3. Error should be resolved');
