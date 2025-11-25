/**
 * 🌐 evm-template.js - PLACEHOLDER VERSION ONLY
 * 
 * This is a TEMPLATE file with placeholder values.
 * Copy this to evm.js and replace with REAL values locally.
 * 
 * ⚠️  NEVER commit real API keys to GitHub!
 */

// ========================================
// 🔥 FIREBASE CONFIGURATION (PLACEHOLDER)
// ========================================
const FIREBASE_CONFIG = {
    apiKey: "YOUR_FIREBASE_API_KEY_HERE",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:placeholder",
    measurementId: "G-XXXXXXXXX"
};

// ========================================
// ☁️ CLOUDINARY CONFIGURATION (PLACEHOLDER)
// ========================================
const CLOUDINARY_CONFIG = {
    cloudName: "your-cloud-name",
    uploadPreset: "your-upload-preset",
    folders: {
        vehicles: "transport/vehicles",
        drivers: "transport/drivers", 
        documents: "transport/documents",
        profiles: "transport/profiles",
        receipts: "transport/receipts",
        expenses: "transport/expenses"
    },
    apiUrl: "https://api.cloudinary.com/v1_1/your-cloud-name/image/upload",
    baseUrl: "https://res.cloudinary.com/your-cloud-name/image/upload"
};

// ========================================
// 🤖 AI CONFIGURATION (PLACEHOLDER)
// ========================================
const AI_CONFIG = {
    geminiApiKey: "YOUR_GEMINI_API_KEY_HERE"
};

// ========================================
// 🌍 ENVIRONMENT CONFIGURATION
// ========================================
const ENVIRONMENT = {
    name: "production",
    debug: false,
    apiBaseUrl: window.location.origin,
    version: "1.0.0"
};

// ========================================
// 📊 APPLICATION CONFIGURATION
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
    }
};

// ========================================
// 🔐 SECURITY CONFIGURATION
// ========================================
const SECURITY_CONFIG = {
    sessionTimeout: 24 * 60 * 60 * 1000,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000,
    passwordMinLength: 8,
    requireEmailVerification: true,
    enableTwoFactorAuth: false
};

// ========================================
// 📱 NOTIFICATION CONFIGURATION
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
// 🚀 EXPORT CONFIGURATIONS
// ========================================
window.ENV_CONFIG = ENVIRONMENT;
window.FIREBASE_CONFIG = FIREBASE_CONFIG;
window.CLOUDINARY_CONFIG = CLOUDINARY_CONFIG;
window.AI_CONFIG = AI_CONFIG;
window.APP_CONFIG = APP_CONFIG;
window.SECURITY_CONFIG = SECURITY_CONFIG;
window.NOTIFICATION_CONFIG = NOTIFICATION_CONFIG;

console.log('⚠️  EVM Template Loaded - Replace placeholders with real values locally!');
