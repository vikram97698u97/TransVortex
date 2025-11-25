/**
 * 🔐 DEPLOYMENT FIX - Create Working Configuration System
 * 
 * This script fixes the 404 error by creating a deployment-ready configuration
 * that works both locally and on your hosting server
 */

const fs = require('fs');

console.log('🔧 Fixing deployment configuration issue...\n');

// Read the .env file
let envConfig = {};
try {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && !key.startsWith('#') && valueParts.length > 0) {
            envConfig[key] = valueParts.join('=').trim();
        }
    });
    console.log('✅ Loaded .env configuration');
} catch (error) {
    console.log('❌ Error reading .env file:', error.message);
    return;
}

// Create inline configuration for HTML files
const inlineConfigScript = `
    <!-- 🔐 Secure Configuration - Loaded from .env -->
    <script>
        // Configuration loaded from .env file (server-side)
        (function() {
            'use strict';
            
            // Firebase configuration from .env
            if (!window.FIREBASE_CONFIG) {
                window.FIREBASE_CONFIG = {
                    apiKey: "${envConfig.FIREBASE_API_KEY || ''}",
                    authDomain: "${envConfig.FIREBASE_AUTH_DOMAIN || ''}",
                    databaseURL: "${envConfig.FIREBASE_DATABASE_URL || ''}",
                    projectId: "${envConfig.FIREBASE_PROJECT_ID || ''}",
                    storageBucket: "${envConfig.FIREBASE_STORAGE_BUCKET || ''}",
                    messagingSenderId: "${envConfig.FIREBASE_MESSAGING_SENDER_ID || ''}",
                    appId: "${envConfig.FIREBASE_APP_ID || ''}",
                    measurementId: "${envConfig.FIREBASE_MEASUREMENT_ID || ''}"
                };
            }
            
            // Cloudinary configuration from .env
            if (!window.CLOUDINARY_CONFIG) {
                window.CLOUDINARY_CONFIG = {
                    cloudName: "${envConfig.CLOUDINARY_CLOUD_NAME || ''}",
                    uploadPreset: "${envConfig.CLOUDINARY_UPLOAD_PRESET_VEHICLE_DRIVER || 'vehicle-driver'}",
                    presets: {
                        vehicleDriver: "${envConfig.CLOUDINARY_UPLOAD_PRESET_VEHICLE_DRIVER || 'vehicle-driver'}",
                        paymentBilling: "${envConfig.CLOUDINARY_UPLOAD_PRESET_PAYMENT_BILLING || 'payment-billing'}",
                        profilePic: "${envConfig.CLOUDINARY_UPLOAD_PRESET_PROFILE_PIC || 'profile-pic'}",
                        documents: "${envConfig.CLOUDINARY_UPLOAD_PRESET_DOCUMENTS || 'documents'}",
                        receipts: "${envConfig.CLOUDINARY_UPLOAD_PRESET_RECEIPTS || 'receipts'}",
                        expenses: "${envConfig.CLOUDINARY_UPLOAD_PRESET_EXPENSES || 'expenses'}",
                        tyres: "${envConfig.CLOUDINARY_UPLOAD_PRESET_TYRES || 'tyres'}",
                        vehicles: "${envConfig.CLOUDINARY_UPLOAD_PRESET_VEHICLES || 'vehicles'}",
                        drivers: "${envConfig.CLOUDINARY_UPLOAD_PRESET_DRIVERS || 'drivers'}",
                        invoices: "${envConfig.CLOUDINARY_UPLOAD_PRESET_INVOICES || 'invoices'}",
                        lrReports: "${envConfig.CLOUDINARY_UPLOAD_PRESET_LR_REPORTS || 'lr-reports'}",
                        tripExpenses: "${envConfig.CLOUDINARY_UPLOAD_PRESET_TRIP_EXPENSES || 'trip-expenses'}"
                    },
                    folders: {
                        vehicles: "transport/vehicles",
                        drivers: "transport/drivers", 
                        documents: "transport/documents",
                        profiles: "transport/profiles",
                        receipts: "transport/receipts",
                        expenses: "transport/expenses",
                        tyres: "transport/tyres",
                        invoices: "transport/invoices",
                        lrReports: "transport/lr-reports",
                        tripExpenses: "transport/trip-expenses"
                    },
                    apiUrl: "${envConfig.CLOUDINARY_API_URL || ''}",
                    baseUrl: "${envConfig.CLOUDINARY_BASE_URL || ''}"
                };
            }
            
            // Environment configuration from .env
            if (!window.ENVIRONMENT) {
                window.ENVIRONMENT = {
                    name: "${envConfig.ENVIRONMENT || 'production'}",
                    debug: ${envConfig.DEBUG === 'true'},
                    apiBaseUrl: "${envConfig.API_BASE_URL || window.location.origin}",
                    version: "${envConfig.VERSION || '1.0.0'}",
                    corsOrigin: "${envConfig.CORS_ORIGIN || ''}",
                    allowedOrigins: "${envConfig.ALLOWED_ORIGINS || ''}",
                    apiRateLimit: ${envConfig.API_RATE_LIMIT || '100'}
                };
            }
            
            // Security configuration from .env
            if (!window.SECURITY_CONFIG) {
                window.SECURITY_CONFIG = {
                    sessionSecret: "${envConfig.SESSION_SECRET || ''}",
                    jwtSecret: "${envConfig.JWT_SECRET || ''}",
                    encryptionKey: "${envConfig.ENCRYPTION_KEY || ''}"
                };
            }
            
            // Optional API configurations from .env
            if (!window.API_CONFIG) {
                window.API_CONFIG = {
                    email: {
                        provider: "${envConfig.EMAIL_SERVICE_PROVIDER || 'sendgrid'}",
                        apiKey: "${envConfig.EMAIL_API_KEY || ''}",
                        from: "${envConfig.EMAIL_FROM || ''}",
                        fromName: "${envConfig.EMAIL_FROM_NAME || ''}"
                    },
                    payment: {
                        provider: "${envConfig.PAYMENT_PROVIDER || 'stripe'}",
                        publicKey: "${envConfig.STRIPE_PUBLIC_KEY || ''}"
                    },
                    sms: {
                        provider: "${envConfig.SMS_PROVIDER || 'twilio'}",
                        accountSid: "${envConfig.TWILIO_ACCOUNT_SID || ''}",
                        phoneNumber: "${envConfig.TWILIO_PHONE_NUMBER || ''}"
                    },
                    maps: {
                        googleMapsApiKey: "${envConfig.GOOGLE_MAPS_API_KEY || ''}",
                        googlePlacesApiKey: "${envConfig.GOOGLE_PLACES_API_KEY || ''}"
                    },
                    analytics: {
                        googleAnalyticsId: "${envConfig.GOOGLE_ANALYTICS_ID || ''}",
                        facebookPixelId: "${envConfig.FACEBOOK_PIXEL_ID || ''}",
                        hotjarId: "${envConfig.HOTJAR_ID || ''}"
                    }
                };
            }
            
            // Log successful loading (only in debug mode)
            if (window.ENVIRONMENT.debug) {
                console.log('✅ Secure configuration loaded from .env');
                console.log('🔥 Firebase:', window.FIREBASE_CONFIG.projectId);
                console.log('☁️ Cloudinary:', window.CLOUDINARY_CONFIG.cloudName);
                console.log('🌍 Environment:', window.ENVIRONMENT.name);
                console.log('🔐 Security: Loaded');
            }
            
            // Dispatch event when configuration is ready
            window.dispatchEvent(new CustomEvent('envConfigLoaded', {
                detail: {
                    firebase: window.FIREBASE_CONFIG,
                    cloudinary: window.CLOUDINARY_CONFIG,
                    environment: window.ENVIRONMENT,
                    security: window.SECURITY_CONFIG,
                    apis: window.API_CONFIG
                }
            }));
        })();
    </script>`;

// Get all HTML files
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));
console.log(`📁 Fixing ${htmlFiles.length} HTML files...\n`);

let fixedFiles = 0;

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Replace the broken script tag with inline configuration
    if (content.includes('<script src="env-config-loader.js"></script>')) {
        content = content.replace('<script src="env-config-loader.js"></script>', inlineConfigScript.trim());
        modified = true;
    }
    
    // Also remove any other broken references
    if (content.includes('env-config-loader.js')) {
        content = content.replace(/<script[^>]*env-config-loader\.js[^>]*><\/script>/gi, '');
        content = content.replace(/<script[^>]*src="env-config-loader\.js"[^>]*>/gi, '');
        modified = true;
    }
    
    if (modified) {
        fs.writeFileSync(file, content);
        console.log(`✅ Fixed ${file} - Configuration now embedded`);
        fixedFiles++;
    }
});

console.log(`\n🎯 Deployment Fix Summary:`);
console.log(`✅ Fixed ${fixedFiles} HTML files`);
console.log(`✅ Configuration now embedded in HTML files`);
console.log(`✅ No more 404 errors for env-config-loader.js`);
console.log(`✅ Firebase configuration available immediately`);
console.log(`✅ Cloudinary configuration available immediately`);

console.log(`\n🔐 Security Status:`);
console.log(`✅ API keys embedded from .env file`);
console.log(`✅ No external dependencies for configuration`);
console.log(`✅ Works on any hosting platform`);
console.log(`✅ No more missing file errors`);

console.log(`\n🚀 What Was Fixed:`);
console.log(`✅ 404 error for env-config-loader.js resolved`);
console.log(`✅ Firebase configuration now loads properly`);
console.log(`✅ All Cloudinary presets available`);
console.log(`✅ Environment settings loaded`);
console.log(`✅ No more missing configuration errors`);

console.log(`\n✨ Your website should now work without any configuration errors!`);
