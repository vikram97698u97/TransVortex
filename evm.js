/**
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
}