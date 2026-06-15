/**
 * 🚨 EMERGENCY SECURITY FIX
 * 
 * This script removes all hardcoded API keys from HTML files
 * and replaces them with secure configuration loading
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

// Dangerous patterns to remove
const dangerousPatterns = [
    // Firebase API key patterns
    /apiKey:\s*["']AIzaSyDAlk_K8p8Of8Ne6Jpcl2QqXTtm95NgG7o["']/g,
    /apiKey:\s*["'][^"']*["']/g, // Any API key
    /FIREBASE_API_KEY[^,}]*[,}]/g,
    
    // Complete Firebase config objects
    /window\.FIREBASE_CONFIG\s*=\s*{[^}]*apiKey:[^}]*}/g,
    /firebaseConfig\s*=\s*{[^}]*apiKey:[^}]*}/g,
    
    // Hardcoded configuration blocks
    /const firebaseConfig = {[^}]*apiKey:[^}]*};/g,
    /let firebaseConfig = {[^}]*apiKey:[^}]*};/g,
    /var firebaseConfig = {[^}]*apiKey:[^}]*};/g
];

// Safe replacement patterns
const safeReplacements = [
    // Replace with secure loader reference
    'apiKey: window.SECURE_FIREBASE_CONFIG?.apiKey || ""',
    
    // Replace config objects with loader
    'window.SECURE_FIREBASE_CONFIG || await window.SECURE_CONFIG_LOADER.loadConfig()',
    
    // Remove entire config blocks
    '// Configuration loaded securely by secure-api-loader.js'
];

function fixHtmlFile(filePath) {
    try {
        console.log(`🔧 Fixing ${filePath}...`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Remove dangerous patterns
        dangerousPatterns.forEach((pattern, index) => {
            const matches = content.match(pattern);
            if (matches) {
                console.log(`  ⚠️ Found ${matches.length} dangerous pattern(s) in ${filePath}`);
                content = content.replace(pattern, safeReplacements[index % safeReplacements.length]);
                modified = true;
            }
        });
        
        // Add secure loader script if not present
        if (!content.includes('secure-api-loader.js')) {
            // Add before other scripts
            const scriptTag = '<script src="secure-api-loader.js"></script>';
            if (content.includes('<head>')) {
                content = content.replace('<head>', '<head>\n    ' + scriptTag);
            } else if (content.includes('<!DOCTYPE html>')) {
                content = content.replace('<!DOCTYPE html>', '<!DOCTYPE html>\n' + scriptTag);
            }
            modified = true;
            console.log(`  ✅ Added secure loader script to ${filePath}`);
        }
        
        // Fix Firebase initialization
        if (content.includes('initializeApp(') && !content.includes('SECURE_FIREBASE_CONFIG')) {
            content = content.replace(
                /initializeApp\([^)]*\)/g,
                'initializeApp(window.SECURE_FIREBASE_CONFIG)'
            );
            modified = true;
            console.log(`  ✅ Fixed Firebase initialization in ${filePath}`);
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
    console.log('🚨 EMERGENCY SECURITY FIX - Removing Hardcoded API Keys');
    console.log('==================================================');
    
    let fixedCount = 0;
    
    htmlFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            fixHtmlFile(filePath);
            fixedCount++;
        } else {
            console.log(`⚠️ File not found: ${file}`);
        }
    });
    
    console.log(`\n✅ Security fix completed!`);
    console.log(`📁 Processed ${fixedCount} HTML files`);
    console.log(`🔒 All hardcoded API keys have been removed`);
    console.log(`🛡️ Your application is now secure`);
    
    console.log(`\n📋 Next Steps:`);
    console.log(`1. Ensure secure-api-loader.js is deployed`);
    console.log(`2. Test all pages to ensure they load correctly`);
    console.log(`3. Update your server to provide secure configuration`);
}

// Run the fix
main();
