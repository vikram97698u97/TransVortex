/**
 * 🔧 FIX OPTIONAL CHAINING SYNTAX
 * 
 * This script replaces optional chaining (?.) with compatible syntax
 * for better browser compatibility
 */

const fs = require('fs');
const path = require('path');

// List of HTML files to fix
const htmlFiles = [
    'employees.html', 'home.html', 'lr-report.html', 'trip-expenses.html'
];

function fixOptionalChaining(filePath) {
    try {
        console.log(`🔧 Fixing optional chaining in ${filePath}...`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Replace optional chaining with compatible syntax
        const optionalChainingPattern = /window\.SECURE_FIREBASE_CONFIG\?\.apiKey/g;
        const compatiblePattern = '(window.SECURE_FIREBASE_CONFIG && window.SECURE_FIREBASE_CONFIG.apiKey)';
        
        if (optionalChainingPattern.test(content)) {
            content = content.replace(optionalChainingPattern, compatiblePattern);
            modified = true;
            console.log(`  ✅ Fixed optional chaining in ${filePath}`);
        }
        
        // Write fixed content back
        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log(`  ✅ Fixed ${filePath}`);
        } else {
            console.log(`  ℹ️ No optional chaining fixes needed for ${filePath}`);
        }
        
    } catch (error) {
        console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
}

function main() {
    console.log('🔧 Fixing Optional Chaining Syntax');
    console.log('===================================');
    
    let fixedCount = 0;
    
    htmlFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            fixOptionalChaining(filePath);
            fixedCount++;
        } else {
            console.log(`⚠️ File not found: ${file}`);
        }
    });
    
    console.log(`\n✅ Optional chaining fix completed!`);
    console.log(`📁 Processed ${fixedCount} HTML files`);
    console.log(`🛡️ Your application should work in all browsers now`);
}

// Run the fix
main();
