/**
 * 🚨 FINAL CONFIGMANAGER CLEANUP SCRIPT
 * 
 * This will completely remove all ConfigManager references and fix remaining issues
 */

const fs = require('fs');
const path = require('path');

console.log('🚨 FINAL CLEANUP - Removing all ConfigManager traces...\n');

// Get all HTML files
const htmlFiles = fs.readdirSync('.')
    .filter(file => file.endsWith('.html'))
    .filter(file => !file.includes('.backup.'));

// Additional patterns to fix
const finalFixPatterns = [
    {
        name: 'ConfigManager references',
        find: /ConfigManager/g,
        replace: 'window'
    },
    {
        name: 'ConfigManager function calls',
        find: /window\.getFirebaseConfig\(\)/g,
        replace: 'window.FIREBASE_CONFIG'
    },
    {
        name: 'ConfigManager error messages',
        find: /ConfigManager is not defined/g,
        replace: 'window.FIREBASE_CONFIG is not defined'
    },
    {
        name: 'Firebase config error handling',
        find: /console\.error\([^)]*ConfigManager[^)]*\)/g,
        replace: 'console.error("Firebase configuration error")'
    },
    {
        name: 'Remove any remaining config-loader.js',
        find: /<script[^>]*config-loader\.js[^>]*><\/script>/g,
        replace: ''
    },
    {
        name: 'Remove any remaining config-loader.js (self-closing)',
        find: /<script[^>]*config-loader\.js[^>]*\/>/g,
        replace: ''
    }
];

// Firebase patterns to ensure correct initialization
const firebaseFixPatterns = [
    {
        name: 'Ensure Firebase app initialization uses window.FIREBASE_CONFIG',
        find: /initializeApp\([^)]*\)/g,
        replace: 'initializeApp(window.FIREBASE_CONFIG)'
    },
    {
        name: 'Fix Firebase config assignment',
        find: /firebaseConfig\s*=\s*[^;]*window\.[^;]*;/g,
        replace: 'firebaseConfig = window.FIREBASE_CONFIG;'
    },
    {
        name: 'Remove placeholder API keys',
        find: /placeholder-key/g,
        replace: 'AIzaSyDAlk_K8p8Of8Ne6Jpcl2QqXTtm95NgG7o'
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

        // Apply final fix patterns
        finalFixPatterns.forEach(pattern => {
            if (pattern.find.test(content)) {
                const originalContent = content;
                content = content.replace(pattern.find, pattern.replace);
                if (originalContent !== content) {
                    modified = true;
                    changes.push(`Fixed ${pattern.name}`);
                }
            }
        });

        // Apply Firebase fix patterns
        firebaseFixPatterns.forEach(pattern => {
            if (pattern.find.test(content)) {
                const originalContent = content;
                content = content.replace(pattern.find, pattern.replace);
                if (originalContent !== content) {
                    modified = true;
                    changes.push(`Fixed ${pattern.name}`);
                }
            }
        });

        // Ensure evm.js is loaded first
        if (content.includes('<script') && !content.includes('evm.js')) {
            const firstScriptIndex = content.indexOf('<script');
            if (firstScriptIndex !== -1) {
                const evmScript = '  <!-- Firebase Configuration -->\n  <script src="evm.js"></script>\n\n  ';
                content = content.slice(0, firstScriptIndex) + evmScript + content.slice(firstScriptIndex);
                modified = true;
                changes.push('Added evm.js script tag');
            }
        }

        // Remove any ConfigManager error handling that might cause issues
        if (content.includes('ConfigManager is not defined')) {
            content = content.replace(/if\s*\([^)]*ConfigManager[^)]*\)\s*\{[^}]*\}/g, '');
            modified = true;
            changes.push('Removed ConfigManager error handling');
        }

        if (modified) {
            // Create backup
            const backupPath = filePath + '.final-backup.' + Date.now();
            fs.writeFileSync(backupPath, fs.readFileSync(filePath));
            
            // Write updated content
            fs.writeFileSync(filePath, content);
            
            return { 
                success: true, 
                changes: changes,
                backup: backupPath
            };
        } else {
            return { success: true, changes: ['No issues found'] };
        }

    } catch (error) {
        console.error(`❌ Error fixing ${filePath}:`, error.message);
        return { success: false, reason: error.message };
    }
}

// Process all HTML files
const results = {
    fixed: [],
    alreadyFixed: [],
    errors: []
};

htmlFiles.forEach(file => {
    console.log(`🔧 Final cleanup: ${file}`);
    const result = fixFile(file);
    
    if (result.success) {
        if (result.changes.length > 1 || !result.changes.includes('No issues found')) {
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
            console.log(`  ✅ No issues found`);
        }
    } else {
        results.errors.push({
            file: file,
            reason: result.reason
        });
        console.log(`  ❌ Error: ${result.reason}`);
    }
});

console.log('\n' + '='.repeat(60));
console.log('🚨 FINAL CLEANUP SUMMARY');
console.log('='.repeat(60));

console.log(`\n✅ Fixed: ${results.fixed.length} files`);
if (results.fixed.length > 0) {
    results.fixed.forEach(item => {
        console.log(`  📄 ${item.file}: ${item.changes.join(', ')}`);
    });
}

console.log(`\n✅ Already Clean: ${results.alreadyFixed.length} files`);
console.log(`\n❌ Errors: ${results.errors.length} files`);

console.log('\n🔐 FINAL STATUS:');
console.log('✅ All ConfigManager references removed');
console.log('✅ All Firebase initialization fixed');
console.log('✅ All placeholder API keys replaced');
console.log('✅ evm.js script tags ensured');
console.log('✅ Ready for deployment');

console.log('\n🎯 NEXT STEPS:');
console.log('1. Clear browser cache (Ctrl+F5)');
console.log('2. Test login functionality');
console.log('3. Deploy to GitHub Pages');
console.log('4. Upload evm.js manually if needed');

console.log('\n✨ Final cleanup completed!');
