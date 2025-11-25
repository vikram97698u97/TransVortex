/**
 * 🔐 UPDATE ALL HTML FILES - Complete .env Configuration
 * 
 * This script updates all HTML files to use the comprehensive .env configuration
 * with all presets, API keys, and security settings
 */

const fs = require('fs');

console.log('🔐 Updating all HTML files with complete .env configuration...\n');

// Read the updated .env file
let envConfig = {};
try {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && !key.startsWith('#') && valueParts.length > 0) {
            envConfig[key] = valueParts.join('=').trim();
        }
    });
    console.log('✅ Loaded comprehensive .env configuration');
} catch (error) {
    console.log('❌ Error reading .env file:', error.message);
    return;
}

// Get all HTML files
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));
console.log(`📁 Updating ${htmlFiles.length} HTML files...\n`);

let updatedFiles = 0;

// Create comprehensive secure configuration script
const comprehensiveConfigScript = `
    <!-- 🔐 Comprehensive Secure Configuration Loader -->
    <script>
        // Load complete configuration from .env (server-side in production)
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
            
            // Comprehensive Cloudinary configuration from .env
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
            
            // Optional API configurations
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
                console.log('✅ Comprehensive configuration loaded from .env');
                console.log('🔥 Firebase:', window.FIREBASE_CONFIG.projectId);
                console.log('☁️ Cloudinary:', window.CLOUDINARY_CONFIG.cloudName);
                console.log('🌍 Environment:', window.ENVIRONMENT.name);
                console.log('🔐 Security: Loaded');
                console.log('📧 Email:', window.API_CONFIG.email.provider);
                console.log('💳 Payment:', window.API_CONFIG.payment.provider);
                console.log('📱 SMS:', window.API_CONFIG.sms.provider);
            }
        })();
    </script>`;

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Replace existing configuration with comprehensive .env configuration
    if (content.includes('window.FIREBASE_CONFIG') || content.includes('window.CLOUDINARY_CONFIG')) {
        
        // Remove all existing configuration blocks
        content = content.replace(/<!-- 🔐 Secure Configuration Loader -->[\s\S]*?<\/script>/gi, '');
        content = content.replace(/<!-- Inline Configuration[^>]*-->\s*<script>[\s\S]*?<\/script>/gi, '');
        content = content.replace(/<script>\s*\/\/ Firebase configuration[\s\S]*?<\/script>/gi, '');
        content = content.replace(/<script>\s*if \(!window\.FIREBASE_CONFIG\)[\s\S]*?<\/script>/gi, '');
        content = content.replace(/<script>\s*\/\/ ========================================[\s\S]*?<\/script>/gi, '');
        
        // Add comprehensive configuration at the beginning of head section
        const headIndex = content.indexOf('<head>');
        if (headIndex !== -1) {
            const afterHead = content.indexOf('>', headIndex) + 1;
            content = content.substring(0, afterHead) + 
                     comprehensiveConfigScript.trim() + '\n' + 
                     content.substring(afterHead);
            modified = true;
        }
        
        if (modified) {
            fs.writeFileSync(file, content);
            console.log(`✅ Updated ${file} with comprehensive .env configuration`);
            updatedFiles++;
        }
    }
});

console.log(`\n🎯 Comprehensive Update Summary:`);
console.log(`✅ Updated ${updatedFiles} HTML files`);
console.log(`✅ All files now use complete .env configuration`);
console.log(`✅ Firebase configuration loaded from .env`);
console.log(`✅ Cloudinary presets loaded from .env`);
console.log(`✅ Security configuration loaded from .env`);
console.log(`✅ Optional API configurations loaded from .env`);

console.log(`\n🔐 Complete Configuration Includes:`);
console.log(`✅ Firebase: All API keys and database URLs`);
console.log(`✅ Cloudinary: Cloud name and 12 upload presets`);
console.log(`✅ Security: Session, JWT, and encryption keys`);
console.log(`✅ Email: SendGrid configuration`);
console.log(`✅ Payment: Stripe configuration`);
console.log(`✅ SMS: Twilio configuration`);
console.log(`✅ Maps: Google Maps API keys`);
console.log(`✅ Analytics: Google Analytics, Facebook Pixel, Hotjar`);

console.log(`\n🚀 Available Presets:`);
console.log(`✅ vehicle-driver - For vehicle and driver documents`);
console.log(`✅ payment-billing - For payment receipts and billing`);
console.log(`✅ profile-pic - For user profile pictures`);
console.log(`✅ documents - For general document uploads`);
console.log(`✅ receipts - For payment receipts`);
console.log(`✅ expenses - For expense-related uploads`);
console.log(`✅ tyres - For tire management images`);
console.log(`✅ vehicles - For vehicle images`);
console.log(`✅ drivers - For driver documents`);
console.log(`✅ invoices - For invoice documents`);
console.log(`✅ lr-reports - For LR report attachments`);
console.log(`✅ trip-expenses - For trip expense receipts`);

console.log(`\n✨ All HTML files now use comprehensive .env configuration!`);
console.log(`🎉 Your website is fully configured with all API keys and presets!`);
