/**
 * 🔐 SECURE API CONFIGURATION LOADER
 * 
 * This script loads configuration securely without exposing API keys
 * Replaces all hardcoded Firebase configurations in HTML files
 */

(function() {
    'use strict';
    
    // Configuration loading strategy
    const loadConfiguration = async () => {
        try {
            // Wait a moment for evm.js to load
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Strategy 1: Try to load from evm.js (generated from .env)
            if (window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey) {
                console.log('✅ Loading configuration from evm.js');
                return window.FIREBASE_CONFIG;
            }
            
            // Strategy 2: Try to load from secure config endpoint
            try {
                const response = await fetch('/api/config');
                if (response.ok) {
                    const config = await response.json();
                    console.log('✅ Loading configuration from secure endpoint');
                    return config.firebase;
                }
            } catch (endpointError) {
                console.warn('⚠️ Config endpoint not available');
            }
            
            // Strategy 3: Fallback warning for development
            console.warn('⚠️ No fallback configuration available - ensure evm.js is generated or configuration server is running');
            return null;
            
        } catch (error) {
            console.error('❌ Failed to load secure configuration:', error);
            return null;
        }
    };
    
    // Initialize Firebase securely
    const initializeSecureFirebase = async () => {
        const config = await loadConfiguration();
        
        if (!config || !config.apiKey) {
            console.error('❌ Firebase API key not available - check your configuration');
            // Show user-friendly error
            document.body.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
                    <div style="text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                        <h2>🔒 Configuration Required</h2>
                        <p>This application requires secure configuration to load.</p>
                        <p>Please ensure the configuration server is running.</p>
                        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
                    </div>
                </div>
            `;
            return;
        }
        
        // Initialize Firebase with secure config
        try {
            if (typeof firebase !== 'undefined') {
                firebase.initializeApp(config);
                console.log('✅ Firebase initialized securely');
                
                // Make config available globally for other scripts
                window.SECURE_FIREBASE_CONFIG = config;
            } else {
                console.error('❌ Firebase SDK not loaded');
            }
        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
        }
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSecureFirebase);
    } else {
        initializeSecureFirebase();
    }
    
    // Export for manual initialization if needed
    window.SECURE_CONFIG_LOADER = {
        initialize: initializeSecureFirebase,
        loadConfig: loadConfiguration
    };
    
})();
