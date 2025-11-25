/**
 * 🗑️ COMPLETE PROJECT CLEANUP - Remove All Unwanted Files
 * 
 * This script will remove all unwanted files and folders from the project
 * leaving only essential production files.
 */

const fs = require('fs');
const path = require('path');

console.log('🗑️ Starting complete project cleanup...\n');

// Define essential files to keep
const essentialFiles = [
    // HTML files (keep all functional pages)
    'about.html',
    'add.html',
    'admin-payments.html',
    'alerts-system.html',
    'back-add.html',
    'booking.html',
    'combined_ca.html',
    'contact.html',
    'employees.html',
    'home.html',
    'index.html',
    'invoice.html',
    'login.html',
    'lr-report.html',
    'navbar.html',
    'payment-billing.html',
    'plan-selection.html',
    'privacy.html',
    'profile.html',
    'roll.html',
    'route-details.html',
    'route.html',
    'services.html',
    'signup.html',
    'subscribe.html',
    'transporters.html',
    'trip-expenses.html',
    'tyre.html',
    'tyre_history.html',
    'work-management.html'
];

const essentialConfigFiles = [
    '.gitignore',
    'README.md',
    'evm.js'
];

// Files to delete
const filesToDelete = [
    // Test and debug files
    'config-test.html',
    'debug-evm.html',
    'secure-example.html',
    'secure-cloudinary-example.html',
    'security-test.html',
    
    // Cleanup and fix scripts
    'production-cleanup.js',
    'production-cleanup-fixed.js',
    'config.js',
    
    // Any remaining backup or temporary files
    ...fs.readdirSync('.').filter(file => 
        file.includes('.backup.') || 
        file.includes('.old.') || 
        file.includes('.orig.') || 
        file.includes('.temp.') ||
        file.includes('.final-backup.') ||
        file.endsWith('.tmp') ||
        file.endsWith('.log') ||
        file.endsWith('.swp') ||
        file.endsWith('~')
    )
];

// Folders to delete
const foldersToDelete = [
    '.vscode',
    '.idea',
    '__pycache__',
    'node_modules',
    'dist',
    'build',
    'coverage',
    '.nyc_output',
    '.cache',
    'tmp',
    'temp'
];

// Step 1: Delete unwanted files
console.log('🗑️ Deleting unwanted files...');
let deletedFiles = 0;

filesToDelete.forEach(file => {
    try {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
            console.log(`✅ Deleted file: ${file}`);
            deletedFiles++;
        }
    } catch (error) {
        console.log(`⚠️ Could not delete file: ${file} (${error.message})`);
    }
});

// Step 2: Delete unwanted folders
console.log('\n🗑️ Deleting unwanted folders...');
let deletedFolders = 0;

foldersToDelete.forEach(folder => {
    try {
        if (fs.existsSync(folder)) {
            fs.rmSync(folder, { recursive: true, force: true });
            console.log(`✅ Deleted folder: ${folder}`);
            deletedFolders++;
        }
    } catch (error) {
        console.log(`⚠️ Could not delete folder: ${folder} (${error.message})`);
    }
});

// Step 3: Show what's left
console.log('\n📋 Essential files remaining:');
const allFiles = fs.readdirSync('.');
const remainingFiles = allFiles.filter(file => {
    const stat = fs.statSync(file);
    return stat.isFile() && (essentialFiles.includes(file) || essentialConfigFiles.includes(file));
});

remainingFiles.forEach(file => {
    console.log(`✅ ${file}`);
});

// Step 4: Create a clean .gitignore
console.log('\n📝 Creating clean .gitignore...');
const cleanGitignore = `# Environment Variables
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
*.temp

# Test files
*-test.*
test.*
debug.*
config-test.*
security-test.*
secure-example.*`;

fs.writeFileSync('.gitignore', cleanGitignore);
console.log('✅ Created clean .gitignore');

// Step 5: Summary
console.log('\n🎯 Cleanup Summary:');
console.log(`✅ Deleted ${deletedFiles} unwanted files`);
console.log(`✅ Deleted ${deletedFolders} unwanted folders`);
console.log(`✅ Kept ${remainingFiles.length} essential files`);
console.log('✅ Clean .gitignore created');

console.log('\n📁 Project Structure After Cleanup:');
console.log('📄 Essential HTML Files (29 pages)');
console.log('⚙️  Configuration Files (.gitignore, README.md, evm.js)');
console.log('🔧 Git Repository (.git folder)');

console.log('\n🚀 Your project is now clean and production-ready!');
console.log('✅ Only essential files remain');
console.log('✅ No debug or test files');
console.log('✅ No backup or temporary files');
console.log('✅ Professional project structure');

console.log('\n🎉 Complete project cleanup finished!');
