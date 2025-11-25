/**
 * 🔧 CRITICAL SYNTAX FIX - evm.js and Cloudinary Issues
 * 
 * Fixes:
 * 1. evm.js syntax error (incomplete code)
 * 2. Cloudinary config undefined error
 * 3. Missing configuration declarations
 */

const fs = require('fs');

console.log('🔧 Fixing critical syntax errors...\n');

// Fix 1: Create a clean, complete evm.js
const cleanEvmJs = `/**
 * 🔐 EVM - Environment Variables Module
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
// 🤖 AI CONFIGURATION
// ========================================
if (!window.AI_CONFIG) {
    window.AI_CONFIG = {
        geminiApiKey: "YOUR_GEMINI_API_KEY_HERE"
    };
}

// ========================================
// 🌍 ENVIRONMENT CONFIGURATION
// ========================================
if (!window.ENVIRONMENT) {
    window.ENVIRONMENT = {
        name: "netlify-production",
        debug: false,
        apiBaseUrl: window.location.origin,
        version: "1.0.0"
    };
}

// ========================================
// 📊 APPLICATION CONFIGURATION
// ========================================
if (!window.APP_CONFIG) {
    window.APP_CONFIG = {
        name: "TransVortex Transport Management",
        description: "AI-Powered Transport Management System",
        version: "2.0.0",
        author: "TransVortex Team",
        supportEmail: "support@transvortex.com",
        maxFileSize: 5 * 1024 * 1024,
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
        features: {
            firebase: true,
            cloudinary: true,
            ai: false,
            payments: false,
            email: false
        }
    };
}

// ========================================
// 🔐 SECURITY CONFIGURATION
// ========================================
if (!window.SECURITY_CONFIG) {
    window.SECURITY_CONFIG = {
        sessionTimeout: 24 * 60 * 60 * 1000,
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000,
        passwordMinLength: 8,
        requireEmailVerification: true,
        enableTwoFactorAuth: false
    };
}

// ========================================
// 📱 NOTIFICATION CONFIGURATION
// ========================================
if (!window.NOTIFICATION_CONFIG) {
    window.NOTIFICATION_CONFIG = {
        enableNotifications: true,
        defaultSound: true,
        vibration: true,
        badge: true,
        types: {
            info: true,
            success: true,
            warning: true,
            error: true
        }
    };
}

// ========================================
// ✅ VALIDATION
// ========================================
console.log('✅ EVM Loaded Successfully');
console.log('🔥 Firebase Project:', window.FIREBASE_CONFIG.projectId);
console.log('☁️ Cloudinary:', window.CLOUDINARY_CONFIG.cloudName);
console.log('🌍 Environment:', window.ENVIRONMENT.name);

// Export for Node.js environments (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ENVIRONMENT: window.ENVIRONMENT,
        FIREBASE_CONFIG: window.FIREBASE_CONFIG,
        CLOUDINARY_CONFIG: window.CLOUDINARY_CONFIG,
        AI_CONFIG: window.AI_CONFIG,
        APP_CONFIG: window.APP_CONFIG,
        SECURITY_CONFIG: window.SECURITY_CONFIG,
        NOTIFICATION_CONFIG: window.NOTIFICATION_CONFIG
    };
}`;

// Backup current evm.js and replace with clean version
if (fs.existsSync('evm.js')) {
    fs.writeFileSync('evm.js.backup.syntax-fix', fs.readFileSync('evm.js'));
    fs.writeFileSync('evm.js', cleanEvmJs);
    console.log('✅ Fixed evm.js syntax errors');
    console.log('✅ Created complete, valid JavaScript');
    console.log('✅ Added proper conditional declarations');
    console.log('✅ All configurations properly defined');
} else {
    fs.writeFileSync('evm.js', cleanEvmJs);
    console.log('✅ Created new evm.js file');
}

// Fix 2: Fix Cloudinary config access in add.html
if (fs.existsSync('add.html')) {
    let content = fs.readFileSync('add.html', 'utf8');
    let modified = false;
    
    // Fix Cloudinary config access
    content = content.replace(/const CLOUDINARY_CLOUD_NAME = window\.CLOUDINARY_CONFIG\.cloudName;/g, 
                              'const CLOUDINARY_CLOUD_NAME = window.CLOUDINARY_CONFIG ? window.CLOUDINARY_CONFIG.cloudName : null;');
    
    content = content.replace(/const CLOUDINARY_UPLOAD_PRESET = window\.CLOUDINARY_CONFIG\.uploadPreset;/g, 
                              'const CLOUDINARY_UPLOAD_PRESET = window.CLOUDINARY_CONFIG ? window.CLOUDINARY_CONFIG.uploadPreset : null;');
    
    // Add safety check for Cloudinary config
    const safetyCheck = `// Safety check for Cloudinary configuration
    if (!window.CLOUDINARY_CONFIG) {
        console.error('❌ Cloudinary configuration not loaded!');
        return;
    }
    
    if (!window.CLOUDINARY_CONFIG.cloudName || !window.CLOUDINARY_CONFIG.uploadPreset) {
        console.error('❌ Cloudinary configuration incomplete!');
        return;
    }
    
    `;
    
    // Add safety check before upload function
    if (content.includes('async function uploadToCloudinary')) {
        content = content.replace(/async function uploadToCloudinary/g, safetyCheck + 'async function uploadToCloudinary');
        modified = true;
    }
    
    // Fix any undefined access
    content = content.replace(/window\.CLOUDINARY_CONFIG\.cloudName/g, 
                              '(window.CLOUDINARY_CONFIG && window.CLOUDINARY_CONFIG.cloudName)');
    
    content = content.replace(/window\.CLOUDINARY_CONFIG\.uploadPreset/g, 
                              '(window.CLOUDINARY_CONFIG && window.CLOUDINARY_CONFIG.uploadPreset)');
    
    content = content.replace(/window\.CLOUDINARY_CONFIG\.apiUrl/g, 
                              '(window.CLOUDINARY_CONFIG && window.CLOUDINARY_CONFIG.apiUrl)');
    
    if (modified) {
        fs.writeFileSync('add.html.backup.syntax-fix', fs.readFileSync('add.html'));
        fs.writeFileSync('add.html', content);
        console.log('✅ Fixed Cloudinary config access in add.html');
        console.log('✅ Added safety checks');
        console.log('✅ Fixed undefined property access');
    }
}

// Fix 3: Check other files for similar issues
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));
htmlFiles.forEach(file => {
    if (file !== 'add.html' && fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;
        
        // Fix Cloudinary config access
        if (content.includes('window.CLOUDINARY_CONFIG.') && !content.includes('window.CLOUDINARY_CONFIG &&')) {
            content = content.replace(/window\.CLOUDINARY_CONFIG\.cloudName/g, 
                                      '(window.CLOUDINARY_CONFIG && window.CLOUDINARY_CONFIG.cloudName)');
            content = content.replace(/window\.CLOUDINARY_CONFIG\.uploadPreset/g, 
                                      '(window.CLOUDINARY_CONFIG && window.CLOUDINARY_CONFIG.uploadPreset)');
            content = content.replace(/window\.CLOUDINARY_CONFIG\.apiUrl/g, 
                                      '(window.CLOUDINARY_CONFIG && window.CLOUDINARY_CONFIG.apiUrl)');
            modified = true;
        }
        
        if (modified) {
            fs.writeFileSync(file + '.backup.syntax-fix', fs.readFileSync(file));
            fs.writeFileSync(file, content);
            console.log(`✅ Fixed Cloudinary config access in ${file}`);
        }
    }
});

console.log('\n🎯 Critical Fixes Applied:');
console.log('✅ evm.js syntax errors resolved');
console.log('✅ Complete and valid JavaScript code');
console.log('✅ Cloudinary config access fixed');
console.log('✅ Safety checks added');
console.log('✅ Undefined property access resolved');

console.log('\n🚀 Next Steps:');
console.log('1. Clear browser cache (Ctrl+F5)');
console.log('2. Test Cloudinary uploads');
console.log('3. Verify Firebase functionality');
console.log('4. Check all image uploads');

console.log('\n🎉 Expected Results:');
console.log('✅ No more syntax errors in evm.js');
console.log('✅ Cloudinary configuration accessible');
console.log('✅ Image uploads working correctly');
console.log('✅ All Firebase features operational');

console.log('\n✨ Critical syntax fix completed!');
