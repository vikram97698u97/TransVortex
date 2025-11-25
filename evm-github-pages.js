/**
 * 🔒 GitHub Pages Secure Configuration
 * 
 * This approach uses read-only Firebase rules and public API keys
 * WARNING: API keys will be visible, but data will be protected
 */

// ========================================
// 🔥 PUBLIC FIREBASE CONFIG (GitHub Pages)
// ========================================
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDAlk_K8p8Of8Ne6Jpcl2QqXTtm95NgG7o",
    authDomain: "transport-dashboard-ad69a.firebaseapp.com",
    databaseURL: "https://transport-dashboard-ad69a-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "transport-dashboard-ad69a",
    storageBucket: "transport-dashboard-ad69a.appspot.com",
    messagingSenderId: "526889676196",
    appId: "1:526889676196:web:66032c80a4aede690ae531",
    measurementId: "G-7F9R7HJYDH"
};

// ========================================
// ☁️ CLOUDINARY CONFIG (GitHub Pages)
// ========================================
const CLOUDINARY_CONFIG = {
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

// ========================================
// 🌍 ENVIRONMENT
// ========================================
const ENVIRONMENT = {
    name: "github-pages",
    debug: false,
    apiBaseUrl: window.location.origin,
    version: "1.0.0",
    warning: "API keys are public - use strict security rules"
};

// ========================================
// 📊 APP CONFIG
// ========================================
const APP_CONFIG = {
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
    },
    security: {
        apiKeysPublic: true,
        requiresStrictRules: true
    }
};

// ========================================
// 🔐 SECURITY CONFIG
// ========================================
const SECURITY_CONFIG = {
    sessionTimeout: 24 * 60 * 60 * 1000,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000,
    passwordMinLength: 8,
    requireEmailVerification: true,
    enableTwoFactorAuth: false,
    enforceStrictRules: true
};

// ========================================
// 📱 NOTIFICATION CONFIG
// ========================================
const NOTIFICATION_CONFIG = {
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

// ========================================
// 🚀 EXPORT
// ========================================
window.ENV_CONFIG = ENVIRONMENT;
window.FIREBASE_CONFIG = FIREBASE_CONFIG;
window.CLOUDINARY_CONFIG = CLOUDINARY_CONFIG;
window.APP_CONFIG = APP_CONFIG;
window.SECURITY_CONFIG = SECURITY_CONFIG;
window.NOTIFICATION_CONFIG = NOTIFICATION_CONFIG;

// ========================================
// ⚠️ SECURITY WARNING
// ========================================
console.warn('⚠️  GitHub Pages: API keys are public!');
console.warn('🔒 Ensure Firebase security rules are strict!');
console.warn('📝 Read GITHUB-PAGES-ALTERNATIVES.md for better options');
