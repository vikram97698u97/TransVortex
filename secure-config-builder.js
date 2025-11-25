/**
 * 🔐 SECURE CONFIGURATION BUILDER
 * 
 * Uses GitHub Secrets instead of .env file for maximum security
 * This runs in GitHub Actions environment
 */

function generateConfigFromSecrets() {
    // These will be populated from GitHub Secrets
    const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY || '',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
        databaseURL: process.env.FIREBASE_DATABASE_URL || '',
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.FIREBASE_APP_ID || '',
        measurementId: process.env.FIREBASE_MEASUREMENT_ID || ''
    };

    const cloudinaryConfig = {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
        uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET_VEHICLE_DRIVER || 'vehicle-driver',
        presets: {
            vehicleDriver: process.env.CLOUDINARY_UPLOAD_PRESET_VEHICLE_DRIVER || 'vehicle-driver',
            paymentBilling: process.env.CLOUDINARY_UPLOAD_PRESET_PAYMENT_BILLING || 'payment-billing',
            profilePic: process.env.CLOUDINARY_UPLOAD_PRESET_PROFILE_PIC || 'profile-pic',
            documents: process.env.CLOUDINARY_UPLOAD_PRESET_DOCUMENTS || 'documents',
            receipts: process.env.CLOUDINARY_UPLOAD_PRESET_RECEIPTS || 'receipts',
            expenses: process.env.CLOUDINARY_UPLOAD_PRESET_EXPENSES || 'expenses',
            tyres: process.env.CLOUDINARY_UPLOAD_PRESET_TYRES || 'tyres',
            vehicles: process.env.CLOUDINARY_UPLOAD_PRESET_VEHICLES || 'vehicles',
            drivers: process.env.CLOUDINARY_UPLOAD_PRESET_DRIVERS || 'drivers',
            invoices: process.env.CLOUDINARY_UPLOAD_PRESET_INVOICES || 'invoices',
            lrReports: process.env.CLOUDINARY_UPLOAD_PRESET_LR_REPORTS || 'lr-reports',
            tripExpenses: process.env.CLOUDINARY_UPLOAD_PRESET_TRIP_EXPENSES || 'trip-expenses'
        },
        folders: {
            vehicles: "transport/vehicles",
            drivers: "transport/drivers", 
            documents: "transport/documents",
            profiles: "transport/profiles",
            receipts: "transport/receipts",
            expenses: "transport/expenses"
        },
        apiUrl: process.env.CLOUDINARY_API_URL || '',
        baseUrl: process.env.CLOUDINARY_BASE_URL || ''
    };

    const environment = {
        name: process.env.ENVIRONMENT || 'production',
        debug: process.env.DEBUG === 'true',
        apiBaseUrl: process.env.API_BASE_URL || window.location.origin,
        version: process.env.VERSION || '1.0.0',
        corsOrigin: process.env.CORS_ORIGIN || '',
        allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []
    };

    const security = {
        sessionSecret: process.env.SESSION_SECRET || '',
        jwtSecret: process.env.JWT_SECRET || '',
        encryptionKey: process.env.ENCRYPTION_KEY || '',
        apiRateLimit: parseInt(process.env.API_RATE_LIMIT) || 100
    };

    return `/**
 * 🔐 EVM - Environment Variables Module (Auto-generated from GitHub Secrets)
 * 
 * Contains Firebase and other API configurations
 * Generated automatically from GitHub Secrets
 * DO NOT EDIT MANUALLY
 */

// ========================================
// 🔥 FIREBASE CONFIGURATION
// ========================================
if (!window.FIREBASE_CONFIG) {
    window.FIREBASE_CONFIG = ${JSON.stringify(firebaseConfig, null, 8)};
}

// ========================================
// ☁️ CLOUDINARY CONFIGURATION
// ========================================
if (!window.CLOUDINARY_CONFIG) {
    window.CLOUDINARY_CONFIG = ${JSON.stringify(cloudinaryConfig, null, 8)};
}

// ========================================
// 🌍 ENVIRONMENT CONFIGURATION
// ========================================
if (!window.ENVIRONMENT) {
    window.ENVIRONMENT = ${JSON.stringify(environment, null, 8)};
}

// ========================================
// 🔒 SECURITY CONFIGURATION (Server-side only)
// ========================================
if (!window.SECURITY_CONFIG) {
    window.SECURITY_CONFIG = ${JSON.stringify(security, null, 8)};
}

// Export for Node.js environments (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ENVIRONMENT: window.ENVIRONMENT,
        FIREBASE_CONFIG: window.FIREBASE_CONFIG,
        CLOUDINARY_CONFIG: window.CLOUDINARY_CONFIG,
        SECURITY_CONFIG: window.SECURITY_CONFIG
    };
}`;
}

// Write the configuration file
require('fs').writeFileSync('evm.js', generateConfigFromSecrets());
console.log('✅ Configuration built from GitHub Secrets');
