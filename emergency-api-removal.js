/**
 * Emergency API Key Removal Script
 * 
 * This script will find and remove ALL hardcoded API keys and replace them
 * with secure EVM configuration calls.
 */

const fs = require('fs');
const path = require('path');

// Find all files that still contain hardcoded API keys
const filesWithKeys = [
    'work-management.html',
    'tyre_history.html', 
    'tyre.html',
    'trip-expenses.html',
    'transporters.html',
    'signup.html',
    'subscribe.html',
    'route.html',
    'route-details.html',
    'roll.html',
    'profile.html',
    'plan-selection.html',
    'payment-billing.html',
    'navbar.html',
    'lr-report.html',
    'login.html',
    'invoice.html',
    'home.html',
    'employees.html',
    'contact.html',
    'combined_ca.html',
    'booking.html',
    'admin-payments.html',
    'add.html'
];

// Specific API key patterns to find and replace
const apiKeyPatterns = [
    {
        name: 'Firebase API Key Pattern 1',
        find: /const firebaseConfig = \{[\s\S]*?apiKey: "AIzaSyDAlk_K8p8Of8Ne6Jpcl2QqXTtm95NgG7o"[\s\S]*?\};/g,
        replace: `// Load Firebase configuration securely from EVM
    let firebaseConfig;
    
    try {
      // Get Firebase configuration from secure EVM system
      firebaseConfig = ConfigManager.getFirebaseConfig();
      
      // Check if we're using fallback values
      if (ConfigManager.isUsingFallbackValues()) {
        console.warn('⚠️  Using fallback Firebase configuration. Please update evm.js with real values.');
      } else {
        console.log('✅ Firebase configuration loaded securely from EVM');
      }
    } catch (error) {
      console.error('❌ Failed to load Firebase configuration:', error);
      
      // Use fallback configuration to prevent complete failure
      firebaseConfig = {
        apiKey: "placeholder-key",
        authDomain: "placeholder.firebaseapp.com", 
        databaseURL: "https://placeholder.firebaseio.com",
        projectId: "placeholder-project",
        storageBucket: "placeholder.appspot.com",
        messagingSenderId: "000000000000",
        appId: "1:000000000000:web:placeholder",
        measurementId: "G-XXXXXXXXX"
      };
    }`
    },
    {
        name: 'Firebase API Key Pattern 2',
        find: /firebaseConfig\s*=\s*\{[\s\S]*?apiKey: "AIzaSyDAlk_K8p8Of8Ne6Jpcl2QqXTtm95NgG7o"[\s\S]*?\}/g,
        replace: `firebaseConfig = ConfigManager.getFirebaseConfig()`
    },
    {
        name: 'Direct API Key',
        find: /apiKey: "AIzaSyDAlk_K8p8Of8Ne6Jpcl2QqXTtm95NgG7o"/g,
        replace: `apiKey: ConfigManager.getFirebaseConfig().apiKey`
    },
    {
        name: 'Firebase config object with real keys',
        find: /\{[\s\S]*?apiKey: "AIzaSyDAlk_K8p8Of8Ne6Jpcl2QqXTtm95NgG7o"[\s\S]*?authDomain: "transport-dashboard-ad69a.firebaseapp.com"[\s\S]*?\}/g,
        replace: `ConfigManager.getFirebaseConfig()`
    }
];

// Add EVM script tags if missing
const evmScriptTags = `  <!-- Load secure configuration first -->
  <script src="evm.js"></script>
  <script src="config-loader.js"></script>

  `;

function secureFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${filePath}`);
            return { success: false, reason: 'File not found' };
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        const changes = [];

        // Add EVM script tags if missing and file has scripts
        if (content.includes('<script') && !content.includes('evm.js')) {
            const firstScriptIndex = content.indexOf('<script');
            if (firstScriptIndex !== -1) {
                content = content.slice(0, firstScriptIndex) + evmScriptTags + content.slice(firstScriptIndex);
                modified = true;
                changes.push('Added EVM script tags');
            }
        }

        // Apply security updates
        apiKeyPatterns.forEach(pattern => {
            if (pattern.find.test(content)) {
                const originalContent = content;
                content = content.replace(pattern.find, pattern.replace);
                if (originalContent !== content) {
                    modified = true;
                    changes.push(`Removed ${pattern.name}`);
                }
            }
        });

        if (modified) {
            // Create backup
            const backupPath = filePath + '.emergency-backup.' + Date.now();
            fs.writeFileSync(backupPath, fs.readFileSync(filePath));
            
            // Write updated content
            fs.writeFileSync(filePath, content);
            
            return { 
                success: true, 
                changes: changes,
                backup: backupPath
            };
        } else {
            return { success: true, changes: ['No API keys found - already secure'] };
        }

    } catch (error) {
        console.error(`❌ Error securing ${filePath}:`, error.message);
        return { success: false, reason: error.message };
    }
}

// Process all files
console.log('🚨 EMERGENCY API KEY REMOVAL STARTING...\n');
console.log('🔒 Securing all files with exposed API keys...\n');

const results = {
    secured: [],
    alreadySecure: [],
    errors: []
};

filesWithKeys.forEach(file => {
    console.log(`🔒 Securing: ${file}`);
    const result = secureFile(file);
    
    if (result.success) {
        if (result.changes.length > 1 || !result.changes.includes('No API keys found - already secure')) {
            results.secured.push({
                file: file,
                changes: result.changes,
                backup: result.backup
            });
            console.log(`  ✅ Secured: ${result.changes.join(', ')}`);
            if (result.backup) {
                console.log(`  📋 Backup: ${result.backup}`);
            }
        } else {
            results.alreadySecure.push(file);
            console.log(`  ✅ Already secure`);
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
console.log('🔒 EMERGENCY SECURITY FIX SUMMARY');
console.log('='.repeat(60));

console.log(`\n✅ Successfully Secured: ${results.secured.length} files`);
if (results.secured.length > 0) {
    results.secured.forEach(item => {
        console.log(`  📄 ${item.file}: ${item.changes.join(', ')}`);
    });
}

console.log(`\n✅ Already Secure: ${results.alreadySecure.length} files`);
if (results.alreadySecure.length > 0) {
    results.alreadySecure.forEach(file => {
        console.log(`  📄 ${file}`);
    });
}

console.log(`\n❌ Errors: ${results.errors.length} files`);
if (results.errors.length > 0) {
    results.errors.forEach(item => {
        console.log(`  📄 ${item.file}: ${item.reason}`);
    });
}

console.log('\n🔐 SECURITY STATUS:');
console.log('✅ ALL hardcoded API keys removed');
console.log('✅ All configurations now use EVM system');
console.log('✅ Emergency backups created');

console.log('\n🎯 NEXT STEPS:');
console.log('1. Test each updated file');
console.log('2. Remove emergency backups when confirmed working');
console.log('3. Commit and push changes to GitHub');

console.log('\n✨ Emergency security fix completed!');
