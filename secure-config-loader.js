/**
 * 🔐 SECURE CONFIGURATION LOADER - CLIENT SIDE
 * 
 * This script securely loads configuration from your server
 * and initializes Firebase and other services
 */

(function() {
    'use strict';
    
    // Secure configuration loader
    class SecureConfigLoader {
        constructor() {
            this.config = null;
            this.loaded = false;
            this.loadPromise = null;
        }
        
        // Load configuration from secure endpoint
        async loadConfig() {
            if (this.loadPromise) {
                return this.loadPromise;
            }
            
            this.loadPromise = new Promise(async (resolve, reject) => {
                try {
                    // Fetch configuration from your secure server
                    const response = await fetch('/api/config', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Origin': window.location.origin
                        }
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Failed to load configuration: ${response.status}`);
                    }
                    
                    this.config = await response.json();
                    this.loaded = true;
                    
                    // Make configuration available globally
                    this.setupGlobalConfig();
                    
                    resolve(this.config);
                    
                } catch (error) {
                    console.error('❌ Failed to load secure configuration:', error);
                    
                    // Fallback to local configuration for development
                    this.loadFallbackConfig();
                    resolve(this.config);
                }
            });
            
            return this.loadPromise;
        }
        
        // Setup global configuration objects
        setupGlobalConfig() {
            if (!this.config) return;
            
            // Firebase configuration
            window.FIREBASE_CONFIG = this.config.firebase;
            
            // Cloudinary configuration
            window.CLOUDINARY_CONFIG = this.config.cloudinary;
            
            // Environment configuration
            window.ENVIRONMENT = this.config.environment;
            
            if (this.config.environment.debug) {
                console.log('✅ Secure configuration loaded successfully');
            }
        }
        
        // Fallback configuration (for development only)
        loadFallbackConfig() {
            console.warn('⚠️ Using fallback configuration - ensure secure server is running');
            
            this.config = {
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
                environment: {
                    name: "production",
                    debug: false,
                    apiBaseUrl: window.location.origin,
                    version: "1.0.0"
                }
            };
            
            this.loaded = true;
            this.setupGlobalConfig();
        }
        
        // Get configuration (async)
        async getConfig() {
            if (!this.loaded) {
                await this.loadConfig();
            }
            return this.config;
        }
        
        // Check if configuration is loaded
        isLoaded() {
            return this.loaded;
        }
    }
    
    // Create global instance
    window.secureConfigLoader = new SecureConfigLoader();
    
    // Auto-load configuration when page loads
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            await window.secureConfigLoader.loadConfig();
            
            // Dispatch event when configuration is ready
            window.dispatchEvent(new CustomEvent('configLoaded', {
                detail: window.secureConfigLoader.getConfig()
            }));
            
        } catch (error) {
            console.error('❌ Configuration loading failed:', error);
        }
    });
    
})();
