/**
 * 🔐 EVM (Environment Variables Module) - ACTUAL CONFIGURATIONS
 * 
 * This file contains your REAL API keys and configurations that are
 * currently being used in your transport management system.
 * 
 * ⚠️  IMPORTANT: This file should NEVER be committed to version control!
 * It's already protected by .gitignore
 */

// ========================================
// 🔥 FIREBASE CONFIGURATION (ACTUAL VALUES)
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
// ☁️ CLOUDINARY CONFIGURATION (ACTUAL VALUES)
// ========================================
const CLOUDINARY_CONFIG = {
    cloudName: "doqapn15f",
    uploadPreset: "vehicle-driver",
    // Specific folders for different uploads
    folders: {
        vehicles: "transport/vehicles",
        drivers: "transport/drivers", 
        documents: "transport/documents",
        profiles: "transport/profiles",
        receipts: "transport/receipts",
        expenses: "transport/expenses"
    },
    // API URLs
    apiUrl: "https://api.cloudinary.com/v1_1/doqapn15f/image/upload",
    baseUrl: "https://res.cloudinary.com/doqapn15f/image/upload"
};

// ========================================
// 🤖 AI CONFIGURATION (ACTUAL VALUES)
// ========================================
const AI_CONFIG = {
    geminiApiKey: "YOUR_REAL_GEMINI_API_KEY_HERE", // Add your actual Gemini key if you have one
    // Add other AI configurations if you're using them
};

// ========================================
// 💳 PAYMENT CONFIGURATION (if used)
// ========================================
const PAYMENT_CONFIG = {
    razorpay: {
        keyId: "YOUR_RAZORPAY_KEY_ID_HERE", // Add if you're using Razorpay
        keySecret: "YOUR_RAZORPAY_KEY_SECRET_HERE"
    },
    stripe: {
        publishableKey: "YOUR_STRIPE_PUBLISHABLE_KEY_HERE" // Add if you're using Stripe
    }
};

// ========================================
// 📧 EMAIL CONFIGURATION (if used)
// ========================================
const EMAIL_CONFIG = {
    sendgrid: {
        apiKey: "YOUR_SENDGRID_API_KEY_HERE" // Add if you're using SendGrid
    },
    nodemailer: {
        service: "gmail",
        user: "YOUR_EMAIL@gmail.com",
        pass: "YOUR_APP_PASSWORD" // Use app password for Gmail
    }
};

// ========================================
// 🌍 ENVIRONMENT CONFIGURATION
// ========================================
const ENVIRONMENT = {
    name: "production", // or "development" for local testing
    debug: false, // Set to true for debugging
    apiBaseUrl: window.location.origin, // Dynamic base URL
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
    maxFileSize: 5 * 1024 * 1024, // 5MB max file size
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    features: {
        firebase: true,
        cloudinary: true,
        ai: false, // Set to true if you add AI features
        payments: false, // Set to true if you add payment features
        email: false // Set to true if you add email features
    }
};

// ========================================
// 🔐 SECURITY CONFIGURATION
// ========================================
const SECURITY_CONFIG = {
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    passwordMinLength: 8,
    requireEmailVerification: true,
    enableTwoFactorAuth: false // Set to true if you implement 2FA
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
// Make all configurations available globally
window.ENV_CONFIG = ENVIRONMENT;
window.FIREBASE_CONFIG = FIREBASE_CONFIG;
window.CLOUDINARY_CONFIG = CLOUDINARY_CONFIG;
window.AI_CONFIG = AI_CONFIG;
window.PAYMENT_CONFIG = PAYMENT_CONFIG;
window.EMAIL_CONFIG = EMAIL_CONFIG;
window.APP_CONFIG = APP_CONFIG;
window.SECURITY_CONFIG = SECURITY_CONFIG;
window.NOTIFICATION_CONFIG = NOTIFICATION_CONFIG;

// ========================================
// ✅ VALIDATION
// ========================================
console.log('✅ EVM Loaded Successfully');
console.log('🔥 Firebase:', FIREBASE_CONFIG.projectId);
console.log('☁️ Cloudinary:', CLOUDINARY_CONFIG.cloudName);
console.log('🌍 Environment:', ENVIRONMENT.name);

// Validate required configurations
if (!FIREBASE_CONFIG.apiKey || FIREBASE_CONFIG.apiKey.includes('your-')) {
    console.warn('⚠️  Firebase API key not properly configured');
}

if (!CLOUDINARY_CONFIG.cloudName || CLOUDINARY_CONFIG.cloudName.includes('your-')) {
    console.warn('⚠️  Cloudinary cloud name not properly configured');
}

// Export for Node.js environments (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ENVIRONMENT,
        FIREBASE_CONFIG,
        CLOUDINARY_CONFIG,
        AI_CONFIG,
        PAYMENT_CONFIG,
        EMAIL_CONFIG,
        APP_CONFIG,
        SECURITY_CONFIG,
        NOTIFICATION_CONFIG
    };
}
