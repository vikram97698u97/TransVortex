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

    return `/**
 * 🔐 EVM - Environment Variables Module (Auto-generated from GitHub Secrets)
 * 
 * Contains Firebase and other API configurations
 * Generated automatically from GitHub Secrets
 * DO NOT EDIT MANUALLY
 */

if (!window.FIREBASE_CONFIG) {
    window.FIREBASE_CONFIG = ${JSON.stringify(firebaseConfig, null, 8)};
}

if (!window.CLOUDINARY_CONFIG) {
    window.CLOUDINARY_CONFIG = ${JSON.stringify(cloudinaryConfig, null, 8)};
}

if (!window.ENVIRONMENT) {
    window.ENVIRONMENT = {
        name: "production",
        debug: false,
        apiBaseUrl: window.location.origin,
        version: "1.0.0"
    };
}`;
}

// Write the configuration file
require('fs').writeFileSync('evm.js', generateConfigFromSecrets());
console.log('✅ Configuration built from GitHub Secrets');
