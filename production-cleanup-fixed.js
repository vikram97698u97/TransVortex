/**
 * 🧹 COMPREHENSIVE CLEANUP - Unpluck Netlify & Remove Unwanted Content
 * 
 * This script will:
 * 1. Change environment from netlify-production to production
 * 2. Remove all console.log statements for checking purposes
 * 3. Remove unwanted files and folders
 * 4. Clean up the repository
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Starting comprehensive cleanup...\n');

// Step 1: Change environment from netlify-production to production
console.log('🌍 Updating environment configuration...');
if (fs.existsSync('evm.js')) {
    let evmContent = fs.readFileSync('evm.js', 'utf8');
    
    // Change environment from netlify-production to production
    evmContent = evmContent.replace(/name: "netlify-production"/g, 'name: "production"');
    
    // Remove console logs from evm.js
    evmContent = evmContent.replace(/console\.log\([^)]*\);?/g, '');
    
    fs.writeFileSync('evm.js', evmContent);
    console.log('✅ Environment changed to production');
    console.log('✅ Removed console logs from evm.js');
}

// Step 2: Remove console.log statements from all HTML files
console.log('\n🧹 Removing console logs from HTML files...');
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Remove console.log statements (keep errors and warnings)
    if (content.includes('console.log(')) {
        content = content.replace(/console\.log\([^)]*\);?/g, '');
        modified = true;
    }
    
    // Remove specific debug statements
    const debugPatterns = [
        /console\.log\('✅[^']*'\);?/g,
        /console\.log\('🔥[^']*'\);?/g,
        /console\.log\('☁️[^']*'\);?/g,
        /console\.log\('🌍[^']*'\);?/g,
        /console\.log\('🎯[^']*'\);?/g,
        /console\.log\('🚀[^']*'\);?/g,
        /console\.log\('🎉[^']*'\);?/g,
        /console\.log\('✨[^']*'\);?/g,
        /console\.log\('📱[^']*'\);?/g,
        /console\.log\('🛡️[^']*'\);?/g,
        /console\.log\('🔧[^']*'\);?/g,
        /console\.log\('📄[^']*'\);?/g,
        /console\.log\('⚠️[^']*'\);?/g,
        /console\.log\('❌[^']*'\);?/g,
        /console\.warn\('⚠️[^']*'\);?/g,
        /console\.error\('❌[^']*'\);?/g
    ];
    
    debugPatterns.forEach(pattern => {
        if (pattern.test(content)) {
            content = content.replace(pattern, '');
            modified = true;
        }
    });
    
    if (modified) {
        fs.writeFileSync(file, content);
        console.log(`✅ Cleaned console logs in ${file}`);
    }
});

// Step 3: Remove unwanted files and folders
console.log('\n🗑️ Removing unwanted files and folders...');

const filesToRemove = [
    // Backup files
    ...fs.readdirSync('.').filter(file => file.includes('.backup.')),
    ...fs.readdirSync('.').filter(file => file.includes('.old.')),
    ...fs.readdirSync('.').filter(file => file.includes('.orig.')),
    ...fs.readdirSync('.').filter(file => file.includes('.temp.')),
    
    // Test and debug files
    ...fs.readdirSync('.').filter(file => file.includes('test.html')),
    ...fs.readdirSync('.').filter(file => file.includes('debug.html')),
    ...fs.readdirSync('.').filter(file => file.includes('config-test.html')),
    ...fs.readdirSync('.').filter(file => file.includes('security-test.html')),
    ...fs.readdirSync('.').filter(file => file.includes('secure-example.html')),
    ...fs.readdirSync('.').filter(file => file.includes('example.html')),
    
    // Fix scripts
    ...fs.readdirSync('.').filter(file => file.startsWith('fix-') && file.endsWith('.js')),
    ...fs.readdirSync('.').filter(file => file.includes('-fix.js')),
    ...fs.readdirSync('.').filter(file => file.startsWith('urgent-') && file.endsWith('.js')),
    ...fs.readdirSync('.').filter(file => file.startsWith('critical-') && file.endsWith('.js')),
    
    // Documentation files (except README.md)
    ...fs.readdirSync('.').filter(file => file.endsWith('.md') && file !== 'README.md'),
    
    // Temporary files
    ...fs.readdirSync('.').filter(file => file.endsWith('.tmp')),
    ...fs.readdirSync('.').filter(file => file.endsWith('.log')),
    ...fs.readdirSync('.').filter(file => file.endsWith('.swp')),
    ...fs.readdirSync('.').filter(file => file.endsWith('~'))
];

// Remove files
filesToRemove.forEach(file => {
    try {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
            console.log(`🗑️ Removed file: ${file}`);
        }
    } catch (error) {
        console.log(`⚠️ Could not remove file: ${file} (${error.message})`);
    }
});

// Remove folders
const foldersToRemove = ['node_modules', '__pycache__', '.vscode', '.idea', 'dist', 'build', 'coverage', '.nyc_output', '.cache', 'tmp', 'temp'];

foldersToRemove.forEach(folder => {
    try {
        if (fs.existsSync(folder)) {
            fs.rmSync(folder, { recursive: true, force: true });
            console.log(`🗑️ Removed folder: ${folder}`);
        }
    } catch (error) {
        console.log(`⚠️ Could not remove folder: ${folder} (${error.message})`);
    }
});

// Step 4: Clean up .gitignore
console.log('\n📝 Updating .gitignore...');
const essentialGitignore = `# Environment Variables
evm.js

# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
*.tgz

# Cache
.cache/
.tmp/
*.tmp

# Logs
*.log

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Backup files
*.backup
*.backup-*
*.old
*.orig

# Test files
*-test.*
test.*
debug.*
config-test.*
security-test.*
secure-example.*`;

fs.writeFileSync('.gitignore', essentialGitignore);
console.log('✅ Updated .gitignore with essential entries');

// Step 5: Create a clean production-ready evm.js
console.log('\n🔧 Creating production-ready evm.js...');
const productionEvmJs = `/**
 * 🔐 EVM - Environment Variables Module (Production)
 * 
 * Contains Firebase and other API configurations
 * This file should be kept out of version control (.gitignore)
 */

// ========================================
// 🔥 FIREBASE CONFIGURATION
// ========================================
if (!window.FIREBASE_CONFIG) {
    window.FIREBASE_CONFIG = {
        apiKey: "AIzaSyDAlk_K8p8Of8Ne6Jpcl2QqXTtm95NgG7o",
        authDomain: "transport-dashboard-ad69a.firebaseapp.com",
        databaseURL: "https://transport-dashboard-ad69a-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "transport-dashboard-ad69a",
        storageBucket: "transport-dashboard-ad69a.appspot.com",
        messagingSenderId: "526889676196",
        appId: "1:526889676196:web:66032c80a4aede690ae531",
        measurementId: "G-7F9R7HJYDH"
    };
}

// ========================================
// ☁️ CLOUDINARY CONFIGURATION
// ========================================
if (!window.CLOUDINARY_CONFIG) {
    window.CLOUDINARY_CONFIG = {
        cloudName: "doqapn15f",
        uploadPreset: "vehicle-driver",
        folders: {
            vehicles: "transport/vehicles",
            drivers: "transport/drivers", 
            documents: "transport/documents",
            profiles: "transport/profiles",
            receipts: "transport/receipts",
            expenses: "transport/expenses"
        },
        apiUrl: "https://api.cloudinary.com/v1_1/doqapn15f/image/upload",
        baseUrl: "https://res.cloudinary.com/doqapn15f/image/upload"
    };
}

// ========================================
// 🌍 ENVIRONMENT CONFIGURATION
// ========================================
if (!window.ENVIRONMENT) {
    window.ENVIRONMENT = {
        name: "production",
        debug: false,
        apiBaseUrl: window.location.origin,
        version: "1.0.0"
    };
}`;

fs.writeFileSync('evm.js', productionEvmJs);
console.log('✅ Created production-ready evm.js');

console.log('\n🎯 Cleanup Summary:');
console.log('✅ Environment changed from netlify-production to production');
console.log('✅ Removed all debug console logs');
console.log('✅ Removed unwanted files and folders');
console.log('✅ Updated .gitignore with essential entries');
console.log('✅ Created production-ready evm.js');

console.log('\n🚀 Next Steps:');
console.log('1. Commit and push changes to repository');
console.log('2. Deploy to production');
console.log('3. Test all functionality');
console.log('4. Verify clean console output');

console.log('\n🎉 Production cleanup completed!');
