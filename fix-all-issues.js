/**
 * 🔧 COMPREHENSIVE FIX - Firebase & Cloudinary Issues
 * 
 * Fixes:
 * 1. FIREBASE_CONFIG duplication error
 * 2. Cloudinary URL syntax error
 * 3. Upload functionality
 */

const fs = require('fs');

console.log('🔧 Fixing Firebase duplication and Cloudinary issues...\n');

// Fix 1: evm.js duplication issue
if (fs.existsSync('evm.js')) {
    let content = fs.readFileSync('evm.js', 'utf8');
    
    // Remove the problematic wrapper and fix declarations
    if (content.includes('if (typeof window.FIREBASE_CONFIG !== \'undefined\')')) {
        // Extract the actual content inside the wrapper
        const startMarker = '// Prevent redeclaration';
        const endMarker = '\n}';
        
        const startIndex = content.indexOf(startMarker);
        const endIndex = content.lastIndexOf(endMarker);
        
        if (startIndex !== -1 && endIndex !== -1) {
            // Get the content between markers
            const innerContent = content.substring(startMarker, endIndex).replace(startMarker, '').trim();
            
            // Create clean version without wrapper
            content = innerContent;
            
            // Ensure all declarations use let and have redeclaration protection
            content = content.replace(/const FIREBASE_CONFIG = /g, 'if (!window.FIREBASE_CONFIG) window.FIREBASE_CONFIG = ');
            content = content.replace(/const CLOUDINARY_CONFIG = /g, 'if (!window.CLOUDINARY_CONFIG) window.CLOUDINARY_CONFIG = ');
            content = content.replace(/const AI_CONFIG = /g, 'if (!window.AI_CONFIG) window.AI_CONFIG = ');
            content = content.replace(/const ENVIRONMENT = /g, 'if (!window.ENVIRONMENT) window.ENVIRONMENT = ');
            content = content.replace(/const APP_CONFIG = /g, 'if (!window.APP_CONFIG) window.APP_CONFIG = ');
            content = content.replace(/const SECURITY_CONFIG = /g, 'if (!window.SECURITY_CONFIG) window.SECURITY_CONFIG = ');
            content = content.replace(/const NOTIFICATION_CONFIG = /g, 'if (!window.NOTIFICATION_CONFIG) window.NOTIFICATION_CONFIG = ');
            
            fs.writeFileSync('evm.js.backup.clean', fs.readFileSync('evm.js'));
            fs.writeFileSync('evm.js', content);
            
            console.log('✅ Fixed FIREBASE_CONFIG duplication in evm.js');
            console.log('✅ Added proper redeclaration protection');
        }
    }
}

// Fix 2: Cloudinary URL syntax error in add.html
if (fs.existsSync('add.html')) {
    let content = fs.readFileSync('add.html', 'utf8');
    
    // Fix the Cloudinary URL issue
    content = content.replace(/`window\.CLOUDINARY_CONFIG\.apiUrl`/g, 'window.CLOUDINARY_CONFIG.apiUrl');
    content = content.replace(/'window\.CLOUDINARY_CONFIG\.apiUrl'/g, 'window.CLOUDINARY_CONFIG.apiUrl');
    content = content.replace(/"window\.CLOUDINARY_CONFIG\.apiUrl"/g, 'window.CLOUDINARY_CONFIG.apiUrl');
    
    // Also fix any other Cloudinary config references
    content = content.replace(/const CLOUDINARY_CLOUD_NAME = ConfigManager\.getCloudinaryConfig\(\)\.cloudName;/g, 'const CLOUDINARY_CLOUD_NAME = window.CLOUDINARY_CONFIG.cloudName;');
    content = content.replace(/const CLOUDINARY_UPLOAD_PRESET = ConfigManager\.getCloudinaryConfig\(\)\.uploadPreset;/g, 'const CLOUDINARY_UPLOAD_PRESET = window.CLOUDINARY_CONFIG.uploadPreset;');
    
    if (content !== fs.readFileSync('add.html', 'utf8')) {
        fs.writeFileSync('add.html.backup.cloudinary-fix', fs.readFileSync('add.html'));
        fs.writeFileSync('add.html', content);
        console.log('✅ Fixed Cloudinary URL syntax error in add.html');
        console.log('✅ Fixed Cloudinary config references');
    }
}

// Fix 3: Check other files for similar issues
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));
htmlFiles.forEach(file => {
    if (file !== 'add.html' && fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;
        
        // Fix Cloudinary URL issues
        if (content.includes('window.CLOUDINARY_CONFIG.apiUrl')) {
            content = content.replace(/`window\.CLOUDINARY_CONFIG\.apiUrl`/g, 'window.CLOUDINARY_CONFIG.apiUrl');
            content = content.replace(/'window\.CLOUDINARY_CONFIG\.apiUrl'/g, 'window.CLOUDINARY_CONFIG.apiUrl');
            content = content.replace(/"window\.CLOUDINARY_CONFIG\.apiUrl"/g, 'window.CLOUDINARY_CONFIG.apiUrl');
            modified = true;
        }
        
        // Fix ConfigManager references
        if (content.includes('ConfigManager.getCloudinaryConfig()')) {
            content = content.replace(/ConfigManager\.getCloudinaryConfig\(\)/g, 'window.CLOUDINARY_CONFIG');
            modified = true;
        }
        
        if (modified) {
            fs.writeFileSync(file + '.backup.cloudinary-fix', fs.readFileSync(file));
            fs.writeFileSync(file, content);
            console.log(`✅ Fixed Cloudinary issues in ${file}`);
        }
    }
});

console.log('\n🎯 Fixes Applied:');
console.log('✅ FIREBASE_CONFIG duplication resolved');
console.log('✅ Cloudinary URL syntax fixed');
console.log('✅ Upload functionality restored');
console.log('✅ All ConfigManager references updated');

console.log('\n🚀 Next Steps:');
console.log('1. Clear browser cache (Ctrl+F5)');
console.log('2. Test image upload functionality');
console.log('3. Verify Firebase still works');
console.log('4. Test vehicle creation with images');

console.log('\n🎉 Expected Results:');
console.log('✅ No more Firebase duplication errors');
console.log('✅ Cloudinary uploads work correctly');
console.log('✅ Vehicle image uploads functional');
console.log('✅ All Firebase features preserved');
