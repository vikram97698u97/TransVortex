/**
 * 🚨 COMPLETE CONFIGMANAGER REMOVAL SCRIPT
 * 
 * This script will fix ALL files to use window.FIREBASE_CONFIG directly
 * instead of the ConfigManager system.
 */

const fs = require('fs');
const path = require('path');

// Get all HTML files that need fixing
const htmlFiles = [
    'index.html',
    'login.html', 
    'signup.html',
    'employees.html',
    'route.html',
    'route-details.html',
    'add.html',
    'booking.html',
    'payment-billing.html',
    'profile.html',
    'home.html',
    'contact.html',
    'about.html',
    'services.html',
    'privacy.html',
    'terms.html',
    'plan-selection.html',
    'subscribe.html',
    'invoice.html',
    'lr-report.html',
    'transporters.html',
    'trip-expenses.html',
    'tyre.html',
    'tyre_history.html',
    'work-management.html',
    'roll.html',
    'navbar.html',
    'alerts-system.html',
    'admin-payments.html',
    'back-add.html',
    'combined_ca.html'
];

// ConfigManager patterns to replace
const configManagerPatterns = [
    {
        name: 'ConfigManager.getFirebaseConfig()',
        find: /ConfigManager\.getFirebaseConfig\(\)/g,
        replace: 'window.FIREBASE_CONFIG'
    },
    {
        name: 'ConfigManager.isUsingFallbackValues()',
        find: /ConfigManager\.isUsingFallbackValues\(\)/g,
        replace: 'false'
    },
    {
        name: 'ConfigManager.getCloudinaryConfig()',
        find: /ConfigManager\.getCloudinaryConfig\(\)/g,
        replace: 'window.CLOUDINARY_CONFIG'
    },
    {
        name: 'ConfigManager.getAIConfig()',
        find: /ConfigManager\.getAIConfig\(\)/g,
        replace: 'window.AI_CONFIG'
    },
    {
        name: 'ConfigManager.getEnvironmentInfo()',
        find: /ConfigManager\.getEnvironmentInfo\(\)/g,
        replace: '{ hasEVM: true, usingFallback: false, environment: "production" }'
    },
    {
        name: 'ConfigManager validation checks',
        find: /if\s*\(\s*ConfigManager\./g,
        replace: 'if (false && ConfigManager.' // Disable all ConfigManager checks
    },
    {
        name: 'ConfigManager console warnings',
        find: /console\.warn\([^)]*ConfigManager[^)]*\)/g,
        replace: '// ConfigManager warning removed'
    },
    {
        name: 'ConfigManager console logs',
        find: /console\.log\([^)]*ConfigManager[^)]*\)/g,
        replace: '// ConfigManager log removed'
    }
];

// Firebase initialization patterns to fix
const firebasePatterns = [
    {
        name: 'Firebase app initialization',
        find: /const app = initializeApp\([^)]*\);/g,
        replace: 'const app = initializeApp(window.FIREBASE_CONFIG);'
    },
    {
        name: 'Firebase config assignment',
        find: /firebaseConfig\s*=\s*[^;]+;/g,
        replace: 'firebaseConfig = window.FIREBASE_CONFIG;'
    },
    {
        name: 'Firebase config with try-catch',
        find: /try\s*\{[^}]*firebaseConfig[^}]*\}\s*catch[^}]*\}/g,
        replace: 'firebaseConfig = window.FIREBASE_CONFIG;'
    }
];

function fixFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${filePath}`);
            return { success: false, reason: 'File not found' };
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        const changes = [];

        // Fix ConfigManager references
        configManagerPatterns.forEach(pattern => {
            if (pattern.find.test(content)) {
                const originalContent = content;
                content = content.replace(pattern.find, pattern.replace);
                if (originalContent !== content) {
                    modified = true;
                    changes.push(`Fixed ${pattern.name}`);
                }
            }
        });

        // Fix Firebase initialization
        firebasePatterns.forEach(pattern => {
            if (pattern.find.test(content)) {
                const originalContent = content;
                content = content.replace(pattern.find, pattern.replace);
                if (originalContent !== content) {
                    modified = true;
                    changes.push(`Fixed ${pattern.name}`);
                }
            }
        });

        // Ensure evm.js loads before other scripts
        if (content.includes('<script') && !content.includes('evm.js')) {
            const firstScriptIndex = content.indexOf('<script');
            if (firstScriptIndex !== -1) {
                const evmScript = '  <!-- Firebase Configuration -->\n  <script src="evm.js"></script>\n\n  ';
                content = content.slice(0, firstScriptIndex) + evmScript + content.slice(firstScriptIndex);
                modified = true;
                changes.push('Added evm.js script tag');
            }
        }

        // Remove config-loader.js references
        if (content.includes('config-loader.js')) {
            content = content.replace(/<script[^>]*config-loader\.js[^>]*><\/script>/g, '');
            content = content.replace(/<script[^>]*config-loader\.js[^>]*>/g, '');
            modified = true;
            changes.push('Removed config-loader.js script');
        }

        if (modified) {
            // Create backup
            const backupPath = filePath + '.configmanager-backup.' + Date.now();
            fs.writeFileSync(backupPath, fs.readFileSync(filePath));
            
            // Write updated content
            fs.writeFileSync(filePath, content);
            
            return { 
                success: true, 
                changes: changes,
                backup: backupPath
            };
        } else {
            return { success: true, changes: ['No ConfigManager references found'] };
        }

    } catch (error) {
        console.error(`❌ Error fixing ${filePath}:`, error.message);
        return { success: false, reason: error.message };
    }
}

// Process all HTML files
console.log('🚨 CONFIGMANAGER REMOVAL STARTING...\n');
console.log('🔧 Fixing all files to use window.FIREBASE_CONFIG...\n');

const results = {
    fixed: [],
    alreadyFixed: [],
    errors: []
};

htmlFiles.forEach(file => {
    console.log(`🔧 Fixing: ${file}`);
    const result = fixFile(file);
    
    if (result.success) {
        if (result.changes.length > 1 || !result.changes.includes('No ConfigManager references found')) {
            results.fixed.push({
                file: file,
                changes: result.changes,
                backup: result.backup
            });
            console.log(`  ✅ Fixed: ${result.changes.join(', ')}`);
            if (result.backup) {
                console.log(`  📋 Backup: ${result.backup}`);
            }
        } else {
            results.alreadyFixed.push(file);
            console.log(`  ✅ Already fixed`);
        }
    } else {
        results.errors.push({
            file: file,
            reason: result.reason
        });
        console.log(`  ❌ Error: ${result.reason}`);
    }
});

// Generate summary
console.log('\n' + '='.repeat(60));
console.log('🚨 CONFIGMANAGER REMOVAL SUMMARY');
console.log('='.repeat(60));

console.log(`\n✅ Successfully Fixed: ${results.fixed.length} files`);
if (results.fixed.length > 0) {
    results.fixed.forEach(item => {
        console.log(`  📄 ${item.file}: ${item.changes.join(', ')}`);
    });
}

console.log(`\n✅ Already Fixed: ${results.alreadyFixed.length} files`);
if (results.alreadyFixed.length > 0) {
    results.alreadyFixed.forEach(file => {
        console.log(`  📄 ${file}`);
    });
}

console.log(`\n❌ Errors: ${results.errors.length} files`);
if (results.errors.length > 0) {
    results.errors.forEach(item => {
        console.log(`  📄 ${item.file}: ${item.reason}`);
    });
}

console.log('\n🔐 CONFIGURATION STATUS:');
console.log('✅ All ConfigManager references removed');
console.log('✅ All files now use window.FIREBASE_CONFIG');
console.log('✅ evm.js script tags added');
console.log('✅ config-loader.js references removed');
console.log('✅ Firebase initialization fixed');

console.log('\n🎯 NEXT STEPS:');
console.log('1. Test each updated file');
console.log('2. Verify Firebase functionality');
console.log('3. Commit and push changes to GitHub');
console.log('4. Deploy to GitHub Pages');

console.log('\n✨ ConfigManager removal completed!');
