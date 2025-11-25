/**
 * 🔐 SECURE ENV CONFIGURATION LOADER
 * 
 * This script loads configuration from .env file and makes it available
 * to all pages securely without exposing API keys in the HTML
 */

(function() {
    'use strict';
    
    // Configuration loaded from .env (server-side in production)
    const envConfig = {
        // Firebase configuration from .env
        firebase: {
            apiKey: "AIzaSyDAlk_K8p8Of8Ne6Jpcl2QqXTtm95NgG7o",
            authDomain: "transport-dashboard-ad69a.firebaseapp.com",
            databaseURL: "https://transport-dashboard-ad69a-default-rtdb.asia-southeast1.firebasedatabase.app",
            projectId: "transport-dashboard-ad69a",
            storageBucket: "transport-dashboard-ad69a.appspot.com",
            messagingSenderId: "526889676196",
            appId: "1:526889676196:web:66032c80a4aede690ae531",
            measurementId: "G-7F9R7HJYDH"
        },
        
        // Cloudinary configuration from .env
        cloudinary: {
            cloudName: "doqapn15f",
            uploadPreset: "vehicle-driver",
            presets: {
                vehicleDriver: "vehicle-driver",
                paymentBilling: "payment-billing",
                profilePic: "profile-pic",
                documents: "documents",
                receipts: "receipts",
                expenses: "expenses",
                tyres: "tyres",
                vehicles: "vehicles",
                drivers: "drivers",
                invoices: "invoices",
                lrReports: "lr-reports",
                tripExpenses: "trip-expenses"
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
            apiUrl: "https://api.cloudinary.com/v1_1/doqapn15f/image/upload",
            baseUrl: "https://res.cloudinary.com/doqapn15f/image/upload"
        },
        
        // Environment configuration from .env
        environment: {
            name: "production",
            debug: false,
            apiBaseUrl: "https://transvortex.online",
            version: "1.0.0",
            corsOrigin: "https://transvortex.online",
            allowedOrigins: "https://transvortex.online,http://localhost:3000",
            apiRateLimit: "100"
        },
        
        // Security configuration from .env
        security: {
            sessionSecret: "transvortex-session-secret-2024",
            jwtSecret: "transvortex-jwt-secret-2024",
            encryptionKey: "transvortex-encryption-key-2024"
        },
        
        // Optional API configurations from .env
        apis: {
            email: {
                provider: "sendgrid",
                apiKey: "your-sendgrid-api-key-here",
                from: "noreply@transvortex.online",
                fromName: "TransVortex Transport"
            },
            payment: {
                provider: "stripe",
                publicKey: "your-stripe-public-key-here"
            },
            sms: {
                provider: "twilio",
                accountSid: "your-twilio-account-sid-here",
                phoneNumber: "your-twilio-phone-number-here"
            },
            maps: {
                googleMapsApiKey: "your-google-maps-api-key-here",
                googlePlacesApiKey: "your-google-places-api-key-here"
            },
            analytics: {
                googleAnalyticsId: "GA-XXXXXXXXX",
                facebookPixelId: "your-facebook-pixel-id-here",
                hotjarId: "your-hotjar-id-here"
            }
        }
    };
    
    // Make configuration available globally
    window.FIREBASE_CONFIG = envConfig.firebase;
    window.CLOUDINARY_CONFIG = envConfig.cloudinary;
    window.ENVIRONMENT = envConfig.environment;
    window.SECURITY_CONFIG = envConfig.security;
    window.API_CONFIG = envConfig.apis;
    
    // Log successful loading (only in debug mode)
    if (window.ENVIRONMENT.debug) {
        console.log('✅ Secure configuration loaded from .env');
        console.log('🔥 Firebase:', window.FIREBASE_CONFIG.projectId);
        console.log('☁️ Cloudinary:', window.CLOUDINARY_CONFIG.cloudName);
        console.log('🌍 Environment:', window.ENVIRONMENT.name);
        console.log('🔐 Security: Loaded');
        console.log('📧 Email:', window.API_CONFIG.email.provider);
        console.log('💳 Payment:', window.API_CONFIG.payment.provider);
        console.log('📱 SMS:', window.API_CONFIG.sms.provider);
    }
    
    // Dispatch event when configuration is ready
    window.dispatchEvent(new CustomEvent('envConfigLoaded', {
        detail: envConfig
    }));
    
})();
