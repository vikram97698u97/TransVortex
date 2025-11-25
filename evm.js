/**
 * 🔐 EVM - Environment Variables Module (Auto-generated)
 * 
 * Contains Firebase and other API configurations
 * Generated automatically from .env file
 * DO NOT EDIT MANUALLY - Run build-config.js instead
 * This file should be kept out of version control (.gitignore)
 */

// ========================================
// 🔥 FIREBASE CONFIGURATION
// ========================================
if (!window.FIREBASE_CONFIG) {
    window.FIREBASE_CONFIG = {
        "apiKey": "AIzaSyDAlk_K8p8Of8Ne6Jpcl2QqXTtm95NgG7o",
        "authDomain": "transport-dashboard-ad69a.firebaseapp.com",
        "databaseURL": "https://transport-dashboard-ad69a-default-rtdb.asia-southeast1.firebasedatabase.app",
        "projectId": "transport-dashboard-ad69a",
        "storageBucket": "transport-dashboard-ad69a.appspot.com",
        "messagingSenderId": "526889676196",
        "appId": "1:526889676196:web:66032c80a4aede690ae531",
        "measurementId": "G-7F9R7HJYDH"
};
}

// ========================================
// ☁️ CLOUDINARY CONFIGURATION
// ========================================
if (!window.CLOUDINARY_CONFIG) {
    window.CLOUDINARY_CONFIG = {
        "cloudName": "doqapn15f",
        "uploadPreset": "vehicle-driver",
        "presets": {
                "vehicleDriver": "vehicle-driver",
                "paymentBilling": "payment-billing",
                "profilePic": "profile-pic",
                "documents": "documents",
                "receipts": "receipts",
                "expenses": "expenses",
                "tyres": "tyres",
                "vehicles": "vehicles",
                "drivers": "drivers",
                "invoices": "invoices",
                "lrReports": "lr-reports",
                "tripExpenses": "trip-expenses"
        },
        "folders": {
                "vehicles": "transport/vehicles",
                "drivers": "transport/drivers",
                "documents": "transport/documents",
                "profiles": "transport/profiles",
                "receipts": "transport/receipts",
                "expenses": "transport/expenses"
        },
        "apiUrl": "https://api.cloudinary.com/v1_1/doqapn15f/image/upload",
        "baseUrl": "https://res.cloudinary.com/doqapn15f/image/upload"
};
}

// ========================================
// 🌍 ENVIRONMENT CONFIGURATION
// ========================================
if (!window.ENVIRONMENT) {
    window.ENVIRONMENT = {
        "name": "production",
        "debug": false,
        "apiBaseUrl": "https://transvortex.online",
        "version": "1.0.0",
        "corsOrigin": "https://transvortex.online",
        "allowedOrigins": [
                "https://transvortex.online",
                "http://localhost:3000"
        ]
};
}

// ========================================
// 🔒 SECURITY CONFIGURATION (Server-side only)
// ========================================
if (!window.SECURITY_CONFIG) {
    window.SECURITY_CONFIG = {
        "sessionSecret": "transvortex-session-secret-2024",
        "jwtSecret": "transvortex-jwt-secret-2024",
        "encryptionKey": "transvortex-encryption-key-2024",
        "apiRateLimit": 100
};
}

// Export for Node.js environments (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ENVIRONMENT: window.ENVIRONMENT,
        FIREBASE_CONFIG: window.FIREBASE_CONFIG,
        CLOUDINARY_CONFIG: window.CLOUDINARY_CONFIG,
        SECURITY_CONFIG: window.SECURITY_CONFIG
    };
}
