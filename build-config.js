/**
 * 🔧 CONFIGURATION BUILDER
 * 
 * This script reads from .env file and generates evm.js
 * Run this whenever you update .env values
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
function loadEnvFile() {
    const envPath = path.join(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
                envVars[key] = valueParts.join('=');
            }
        }
    });
    
    return envVars;
}

// Generate evm.js content from .env variables
function generateEVMJS(envVars) {
    const firebaseConfig = {
        apiKey: envVars.FIREBASE_API_KEY || '',
        authDomain: envVars.FIREBASE_AUTH_DOMAIN || '',
        databaseURL: envVars.FIREBASE_DATABASE_URL || '',
        projectId: envVars.FIREBASE_PROJECT_ID || '',
        storageBucket: envVars.FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: envVars.FIREBASE_MESSAGING_SENDER_ID || '',
        appId: envVars.FIREBASE_APP_ID || '',
        measurementId: envVars.FIREBASE_MEASUREMENT_ID || ''
    };

    const cloudinaryConfig = {
        cloudName: envVars.CLOUDINARY_CLOUD_NAME || '',
        uploadPreset: envVars.CLOUDINARY_UPLOAD_PRESET_VEHICLE_DRIVER || 'vehicle-driver',
        presets: {
            vehicleDriver: envVars.CLOUDINARY_UPLOAD_PRESET_VEHICLE_DRIVER || 'vehicle-driver',
            paymentBilling: envVars.CLOUDINARY_UPLOAD_PRESET_PAYMENT_BILLING || 'payment-billing',
            profilePic: envVars.CLOUDINARY_UPLOAD_PRESET_PROFILE_PIC || 'profile-pic',
            documents: envVars.CLOUDINARY_UPLOAD_PRESET_DOCUMENTS || 'documents',
            receipts: envVars.CLOUDINARY_UPLOAD_PRESET_RECEIPTS || 'receipts',
            expenses: envVars.CLOUDINARY_UPLOAD_PRESET_EXPENSES || 'expenses',
            tyres: envVars.CLOUDINARY_UPLOAD_PRESET_TYRES || 'tyres',
            vehicles: envVars.CLOUDINARY_UPLOAD_PRESET_VEHICLES || 'vehicles',
            drivers: envVars.CLOUDINARY_UPLOAD_PRESET_DRIVERS || 'drivers',
            invoices: envVars.CLOUDINARY_UPLOAD_PRESET_INVOICES || 'invoices',
            lrReports: envVars.CLOUDINARY_UPLOAD_PRESET_LR_REPORTS || 'lr-reports',
            tripExpenses: envVars.CLOUDINARY_UPLOAD_PRESET_TRIP_EXPENSES || 'trip-expenses'
        },
        folders: {
            vehicles: "transport/vehicles",
            drivers: "transport/drivers", 
            documents: "transport/documents",
            profiles: "transport/profiles",
            receipts: "transport/receipts",
            expenses: "transport/expenses"
        },
        apiUrl: envVars.CLOUDINARY_API_URL || '',
        baseUrl: envVars.CLOUDINARY_BASE_URL || ''
    };

    const environment = {
        name: envVars.ENVIRONMENT || 'production',
        debug: envVars.DEBUG === 'true',
        apiBaseUrl: envVars.API_BASE_URL || '',
        version: envVars.VERSION || '1.0.0',
        corsOrigin: envVars.CORS_ORIGIN || '',
        allowedOrigins: envVars.ALLOWED_ORIGINS ? envVars.ALLOWED_ORIGINS.split(',') : []
    };

    const security = {
        sessionSecret: envVars.SESSION_SECRET || '',
        jwtSecret: envVars.JWT_SECRET || '',
        encryptionKey: envVars.ENCRYPTION_KEY || '',
        apiRateLimit: parseInt(envVars.API_RATE_LIMIT) || 100
    };

    const emailjsConfig = {
        serviceId: envVars.EMAILJS_SERVICE_ID || '',
        templateId: envVars.EMAILJS_TEMPLATE_ID || '',
        publicKey: envVars.EMAILJS_PUBLIC_KEY || ''
    };

    const razorpayConfig = {
        keyId: envVars.RAZORPAY_KEY_ID || 'rzp_test_placeholder'
    };

    return `/**
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
    window.FIREBASE_CONFIG = ${JSON.stringify(firebaseConfig, null, 8)};
}

// ========================================
// ☁️ CLOUDINARY CONFIGURATION
// ========================================
if (!window.CLOUDINARY_CONFIG) {
    window.CLOUDINARY_CONFIG = ${JSON.stringify(cloudinaryConfig, null, 8)};
}

// ========================================
// ✉️ EMAILJS CONFIGURATION
// ========================================
if (!window.EMAILJS_CONFIG) {
    window.EMAILJS_CONFIG = ${JSON.stringify(emailjsConfig, null, 8)};
}

// ========================================
// 💳 RAZORPAY CONFIGURATION
// ========================================
if (!window.RAZORPAY_CONFIG) {
    window.RAZORPAY_CONFIG = ${JSON.stringify(razorpayConfig, null, 8)};
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
        EMAILJS_CONFIG: window.EMAILJS_CONFIG,
        RAZORPAY_CONFIG: window.RAZORPAY_CONFIG,
        SECURITY_CONFIG: window.SECURITY_CONFIG
    };
}
`;
}

// Main execution
try {
    console.log('🔧 Building configuration from .env...');
    
    const envVars = loadEnvFile();
    const evmContent = generateEVMJS(envVars);
    
    // Write to evm.js
    fs.writeFileSync(path.join(__dirname, 'evm.js'), evmContent);
    
    console.log('✅ evm.js updated successfully from .env file');
    console.log('📁 Generated files: evm.js');
    console.log('🚀 Your HTML pages will now use the updated configuration');
    
} catch (error) {
    console.error('❌ Error building configuration:', error.message);
    process.exit(1);
}
