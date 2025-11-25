/**
 * Batch Update Script for Secure Configuration
 * 
 * This script helps update all HTML files to use the secure EVM configuration
 * instead of hardcoded API keys and sensitive data.
 */

const fs = require('fs');
const path = require('path');

// List of files to update
const filesToUpdate = [
    'index.html',
    'route.html', 
    'route-details.html',
    'profile.html',
    'add.html',
    'booking.html',
    'lr-report.html',
    'payment-billing.html',
    'trip-expenses.html',
    'tyre.html',
    'transporters.html',
    'work-management.html'
];

// Patterns to find and replace
const replacements = [
    {
        // Firebase configuration pattern
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
        // Cloudinary configuration pattern
        find: /const CLOUDINARY_CLOUD_NAME = ['"][^'"]*['"];[\s\S]*?const CLOUDINARY_UPLOAD_PRESET = ['"][^'"]*['"];/g,
        replace: `// Load Cloudinary configuration securely from EVM
    const cloudinaryConfig = ConfigManager.getCloudinaryConfig();
    const CLOUDINARY_CLOUD_NAME = cloudinaryConfig.cloudName;
    const CLOUDINARY_UPLOAD_PRESET = cloudinaryConfig.uploadPreset;`
    },
    {
        // AI API key pattern
        find: /const GEMINI_API_KEY = ['"][^'"]*['"];?/g,
        replace: `// Load AI configuration securely from EVM
    const aiConfig = ConfigManager.getAIConfig();
    const GEMINI_API_KEY = aiConfig.geminiApiKey;`
    }
];

// Script tags to add for EVM loading
const evmScriptTags = `  <!-- Load secure configuration first -->
  <script src="evm.js"></script>
  <script src="config-loader.js"></script>

  `;

function updateFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${filePath}`);
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Add EVM script tags before other scripts
        if (content.includes('<script') && !content.includes('evm.js')) {
            const firstScriptIndex = content.indexOf('<script');
            if (firstScriptIndex !== -1) {
                content = content.slice(0, firstScriptIndex) + evmScriptTags + content.slice(firstScriptIndex);
                modified = true;
                console.log(`✅ Added EVM script tags to ${filePath}`);
            }
        }

        // Apply replacements
        replacements.forEach(replacement => {
            if (replacement.find.test(content)) {
                content = content.replace(replacement.find, replacement.replace);
                modified = true;
                console.log(`✅ Updated configuration in ${filePath}`);
            }
        });

        if (modified) {
            // Create backup
            const backupPath = filePath + '.backup.' + Date.now();
            fs.writeFileSync(backupPath, fs.readFileSync(filePath));
            console.log(`📋 Created backup: ${backupPath}`);

            // Write updated content
            fs.writeFileSync(filePath, content);
            console.log(`🔄 Updated: ${filePath}`);
        } else {
            console.log(`ℹ️  No changes needed for: ${filePath}`);
        }

    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
    }
}

// Update all files
console.log('🚀 Starting batch update for secure configuration...\n');

filesToUpdate.forEach(file => {
    console.log(`\n📁 Processing: ${file}`);
    updateFile(file);
});

console.log('\n✨ Batch update completed!');
console.log('\n📋 Summary:');
console.log('🔐 All sensitive configurations now use EVM system');
console.log('📝 Backups created for all modified files');
console.log('⚠️  Remember to update evm.js with your actual API keys');
console.log('🔄 Test all functionality after updating');

console.log('\n🔧 Next Steps:');
console.log('1. Update evm.js with your real API keys');
console.log('2. Test each updated HTML file');
console.log('3. Remove backup files when confirmed working');
console.log('4. Commit changes (excluding evm.js)');
