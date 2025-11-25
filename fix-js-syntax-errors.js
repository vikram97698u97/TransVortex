/**
 * 🔧 FIX JAVASCRIPT SYNTAX ERRORS
 * 
 * This script fixes the broken JavaScript syntax in HTML files
 * caused by the script loading fix
 */

const fs = require('fs');
const path = require('path');

// List of HTML files to fix
const htmlFiles = [
    'employees.html', 'home.html', 'lr-report.html', 'trip-expenses.html'
];

function fixJavaScriptSyntax(filePath) {
    try {
        console.log(`🔧 Fixing JavaScript syntax in ${filePath}...`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Fix the broken API_CONFIG syntax
        const brokenPattern = /window\.API_CONFIG = \{\s*email: \{\s*provider: "sendgrid",\s*window\.SECURE_FIREBASE_CONFIG \|\| await window\.SECURE_CONFIG_LOADER\.loadConfig\(\),\s*from: "noreply@transvortex\.online",/g;
        
        const fixedPattern = `window.API_CONFIG = {
                    email: {
                        provider: "sendgrid",
                        apiKey: window.SECURE_FIREBASE_CONFIG?.apiKey || "",
                        from: "noreply@transvortex.online",`;
        
        if (brokenPattern.test(content)) {
            content = content.replace(brokenPattern, fixedPattern);
            modified = true;
            console.log(`  ✅ Fixed API_CONFIG syntax in ${filePath}`);
        }
        
        // Also fix any other instances of this pattern
        const otherBrokenPattern = /window\.SECURE_FIREBASE_CONFIG \|\| await window\.SECURE_CONFIG_LOADER\.loadConfig\(\),/g;
        if (otherBrokenPattern.test(content)) {
            content = content.replace(otherBrokenPattern, 'apiKey: window.SECURE_FIREBASE_CONFIG?.apiKey || "",');
            modified = true;
            console.log(`  ✅ Fixed other syntax errors in ${filePath}`);
        }
        
        // Write fixed content back
        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log(`  ✅ Fixed ${filePath}`);
        } else {
            console.log(`  ℹ️ No syntax fixes needed for ${filePath}`);
        }
        
    } catch (error) {
        console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
}

function main() {
    console.log('🔧 Fixing JavaScript Syntax Errors');
    console.log('==================================');
    
    let fixedCount = 0;
    
    htmlFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            fixJavaScriptSyntax(filePath);
            fixedCount++;
        } else {
            console.log(`⚠️ File not found: ${file}`);
        }
    });
    
    console.log(`\n✅ JavaScript syntax fix completed!`);
    console.log(`📁 Processed ${fixedCount} HTML files`);
    console.log(`🛡️ Your application should work without JavaScript errors now`);
}

// Run the fix
main();
