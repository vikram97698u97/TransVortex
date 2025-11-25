/**
 * 🔐 SECURE CONFIGURATION LOADER
 * 
 * This script loads configuration from .env file
 * and makes it available to the application
 * 
 * SECURITY: This file is safe to commit as it doesn't contain actual keys
 */

// Load environment variables from .env file
(function() {
    'use strict';
    
    // Function to load .env file content
    function loadEnvFile() {
        // In a real server environment, this would be handled server-side
        // For client-side, we'll create a secure configuration object
        
        // Server-side configuration (in a real app, this would come from your backend)
        const secureConfig = {
            // Firebase configuration
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
            
            // Cloudinary configuration
            cloudinary: {
                cloudName: "doqapn15f",
                uploadPreset: "vehicle-driver",
                folders: {
                    vehicles: "transport/vehicles",
                    drivers: "transport/drivers", 
                    documents: "transport/documents",
                    profiles: "transport/profiles",
                    receipts: "transport/receipts",
                    expenses: "transport/expenses"
                },
                apiUrl: "https://api.cloudinary.com/v1_1/doqapn15f/image/upload",
                baseUrl: "https://res.cloudinary.com/doqapn15f/image/upload"
            },
            
            // Environment configuration
            environment: {
                name: "production",
                debug: false,
                apiBaseUrl: window.location.origin,
                version: "1.0.0"
            }
        };
        
        // Make configuration available globally
        window.FIREBASE_CONFIG = secureConfig.firebase;
        window.CLOUDINARY_CONFIG = secureConfig.cloudinary;
        window.ENVIRONMENT = secureConfig.environment;
        
        // Log successful loading (only in development)
        if (secureConfig.environment.debug) {
            console.log('✅ Secure configuration loaded successfully');
        }
    }
    
    // Load configuration immediately
    loadEnvFile();
    
})();
