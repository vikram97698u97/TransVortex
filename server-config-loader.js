
/**
 * 🔐 SERVER-SIDE CONFIGURATION LOADER
 * 
 * This file should be placed on your server
 * It loads the .env file and serves configuration securely
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
function loadEnvConfig() {
    const envPath = path.join(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const config = {};
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && !key.startsWith('#') && valueParts.length > 0) {
            config[key] = valueParts.join('=').trim();
        }
    });
    
    return config;
}

// Export configuration
module.exports = {
    firebase: {
        apiKey: loadEnvConfig().FIREBASE_API_KEY,
        authDomain: loadEnvConfig().FIREBASE_AUTH_DOMAIN,
        databaseURL: loadEnvConfig().FIREBASE_DATABASE_URL,
        projectId: loadEnvConfig().FIREBASE_PROJECT_ID,
        storageBucket: loadEnvConfig().FIREBASE_STORAGE_BUCKET,
        messagingSenderId: loadEnvConfig().FIREBASE_MESSAGING_SENDER_ID,
        appId: loadEnvConfig().FIREBASE_APP_ID,
        measurementId: loadEnvConfig().FIREBASE_MEASUREMENT_ID
    },
    cloudinary: {
        cloudName: loadEnvConfig().CLOUDINARY_CLOUD_NAME,
        uploadPreset: loadEnvConfig().CLOUDINARY_UPLOAD_PRESET,
        apiUrl: loadEnvConfig().CLOUDINARY_API_URL,
        baseUrl: loadEnvConfig().CLOUDINARY_BASE_URL,
        folders: {
            vehicles: "transport/vehicles",
            drivers: "transport/drivers", 
            documents: "transport/documents",
            profiles: "transport/profiles",
            receipts: "transport/receipts",
            expenses: "transport/expenses"
        }
    },
    environment: {
        name: loadEnvConfig().ENVIRONMENT || 'production',
        debug: loadEnvConfig().DEBUG === 'true',
        apiBaseUrl: loadEnvConfig().API_BASE_URL,
        version: loadEnvConfig().VERSION || '1.0.0'
    }
};
