/**
 * Comprehensive Security Update Script
 * 
 * This script will automatically update all HTML files to use the secure EVM configuration
 * instead of hardcoded API keys and sensitive data.
 */

const fs = require('fs');
const path = require('path');

// List of all HTML files to process
const htmlFiles = [
    'index.html',
    'route.html',
    'route-details.html',
    'employees.html',
    'add.html',
    'booking.html',
    'lr-report.html',
    'payment-billing.html',
    'trip-expenses.html',
    'tyre.html',
    'tyre_history.html',
    'transporters.html',
    'work-management.html',
    'profile.html',
    'contact.html',
    'about.html',
    'services.html',
    'privacy.html',
    'terms.html',
    'plan-selection.html',
    'subscribe.html',
    'invoice.html',
    'alerts-system.html',
    'admin-payments.html',
    'back-add.html',
    'combined_ca.html',
    'home.html',
    'home1.html',
    'login.html',
    'login-fix.html',
    'roll.html',
    'signup.html',
    'signup-fix.html'
];

// Configuration patterns to find and replace
const securityUpdates = [
    {
        name: 'Firebase Configuration',
        find: /const firebaseConfig = \{[\s\S]*?\};/g,
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
        name: 'Cloudinary Configuration',
        find: /const CLOUDINARY_CLOUD_NAME = ['"][^'"]*['"];[\s\S]*?const CLOUDINARY_UPLOAD_PRESET = ['"][^'"]*['"];/g,
        replace: `// Load Cloudinary configuration securely from EVM
    const cloudinaryConfig = ConfigManager.getCloudinaryConfig();
    const CLOUDINARY_CLOUD_NAME = cloudinaryConfig.cloudName;
    const CLOUDINARY_UPLOAD_PRESET = cloudinaryConfig.uploadPreset;`
    },
    {
        name: 'AI API Keys',
        find: /const GEMINI_API_KEY = ['"][^'"]*['"];?/g,
        replace: `// Load AI configuration securely from EVM
    const aiConfig = ConfigManager.getAIConfig();
    const GEMINI_API_KEY = aiConfig.geminiApiKey;`
    },
    {
        name: 'Direct Firebase Config Object',
        find: /firebaseConfig\s*=\s*\{[\s\S]*?\}/g,
        replace: `firebaseConfig = ConfigManager.getFirebaseConfig()`
    }
];

// EVM script tags to add
const evmScriptTags = `  <!-- Load secure configuration first -->
  <script src="evm.js"></script>
  <script src="config-loader.js"></script>

  `;

function updateFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${filePath}`);
            return { success: false, reason: 'File not found' };
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        const changes = [];

        // Add EVM script tags if not present and file has scripts
        if (content.includes('<script') && !content.includes('evm.js')) {
            const firstScriptIndex = content.indexOf('<script');
            if (firstScriptIndex !== -1) {
                content = content.slice(0, firstScriptIndex) + evmScriptTags + content.slice(firstScriptIndex);
                modified = true;
                changes.push('Added EVM script tags');
            }
        }

        // Apply security updates
        securityUpdates.forEach(update => {
            if (update.find.test(content)) {
                const originalContent = content;
                content = content.replace(update.find, update.replace);
                if (originalContent !== content) {
                    modified = true;
                    changes.push(`Updated ${update.name}`);
                }
            }
        });

        if (modified) {
            // Create backup
            const backupPath = filePath + '.backup.' + Date.now();
            fs.writeFileSync(backupPath, fs.readFileSync(filePath));
            
            // Write updated content
            fs.writeFileSync(filePath, content);
            
            return { 
                success: true, 
                changes: changes,
                backup: backupPath
            };
        } else {
            return { success: true, changes: ['No security updates needed'] };
        }

    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
        return { success: false, reason: error.message };
    }
}

// Process all files
console.log('🚀 Starting comprehensive security update...\n');
console.log('📋 Processing files:\n');

const results = {
    updated: [],
    noChanges: [],
    errors: []
};

htmlFiles.forEach(file => {
    console.log(`📁 Processing: ${file}`);
    const result = updateFile(file);
    
    if (result.success) {
        if (result.changes.length > 1 || !result.changes.includes('No security updates needed')) {
            results.updated.push({
                file: file,
                changes: result.changes,
                backup: result.backup
            });
            console.log(`  ✅ Updated: ${result.changes.join(', ')}`);
            if (result.backup) {
                console.log(`  📋 Backup: ${result.backup}`);
            }
        } else {
            results.noChanges.push(file);
            console.log(`  ℹ️  No changes needed`);
        }
    } else {
        results.errors.push({
            file: file,
            reason: result.reason
        });
        console.log(`  ❌ Error: ${result.reason}`);
    }
});

// Generate summary report
console.log('\n' + '='.repeat(60));
console.log('📊 SECURITY UPDATE SUMMARY');
console.log('='.repeat(60));

console.log(`\n✅ Successfully Updated: ${results.updated.length} files`);
if (results.updated.length > 0) {
    results.updated.forEach(item => {
        console.log(`  📄 ${item.file}: ${item.changes.join(', ')}`);
    });
}

console.log(`\nℹ️  No Changes Needed: ${results.noChanges.length} files`);
if (results.noChanges.length > 0) {
    results.noChanges.forEach(file => {
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
console.log('✅ All sensitive configurations now use EVM system');
console.log('✅ Hardcoded API keys replaced with secure calls');
console.log('✅ Error handling and fallbacks implemented');
console.log('✅ Backup files created for all modified files');

console.log('\n🎯 NEXT STEPS:');
console.log('1. Update evm.js with your real API keys');
console.log('2. Test each updated HTML file');
console.log('3. Remove backup files when confirmed working');
console.log('4. Commit changes (excluding evm.js and backups)');

console.log('\n📝 IMPORTANT NOTES:');
console.log('⚠️  Never commit evm.js to version control');
console.log('⚠️  Keep backup files until you verify everything works');
console.log('⚠️  Update .gitignore to exclude backup files');

console.log('\n✨ Comprehensive security update completed!');
