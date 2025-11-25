/**
 * Configuration Loader
 * 
 * This file shows how to securely load and use the EVM (Environment Variables Module)
 * while providing fallbacks and error handling.
 */

// Load the environment configuration
let ENV_CONFIG;
let FIREBASE_CONFIG;
let CLOUDINARY_CONFIG;
let AI_CONFIG;

try {
    // Try to load from EVM file
    if (typeof window !== 'undefined' && window.ENV_CONFIG) {
        // Browser environment - already loaded via script tag
        ENV_CONFIG = window.ENV_CONFIG;
        FIREBASE_CONFIG = window.FIREBASE_CONFIG;
        CLOUDINARY_CONFIG = window.CLOUDINARY_CONFIG;
        AI_CONFIG = window.AI_CONFIG;
    } else if (typeof require !== 'undefined') {
        // Node.js environment
        ENV_CONFIG = require('./evm.js');
        FIREBASE_CONFIG = ENV_CONFIG.FIREBASE;
        CLOUDINARY_CONFIG = ENV_CONFIG.CLOUDINARY;
        AI_CONFIG = ENV_CONFIG.AI;
    } else {
        throw new Error('EVM file not loaded');
    }
    
    console.log('✅ Environment configuration loaded successfully');
} catch (error) {
    console.warn('⚠️  EVM file not found or not loaded. Using fallback values.');
    
    // Fallback configurations for development
    FIREBASE_CONFIG = {
        apiKey: "your-api-key-here",
        authDomain: "your-project.firebaseapp.com",
        databaseURL: "https://your-project.firebaseio.com",
        projectId: "your-project-id",
        storageBucket: "your-project.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:abcdef123456",
        measurementId: "G-XXXXXXXXX"
    };
    
    CLOUDINARY_CONFIG = {
        cloudName: "your-cloud-name",
        uploadPreset: "your-upload-preset",
        apiUrl: `https://api.cloudinary.com/v1_1/your-cloud-name/image/upload`,
        folders: {
            vehicles: "transport/vehicles",
            drivers: "transport/drivers",
            documents: "transport/documents",
            profiles: "transport/profiles"
        }
    };
    
    AI_CONFIG = {
        geminiApiKey: "your-gemini-api-key-here"
    };
}

/**
 * Secure configuration getter with validation
 */
class ConfigManager {
    /**
     * Get Firebase configuration
     * @returns {Object} Firebase config object
     */
    static getFirebaseConfig() {
        this.validateConfig(FIREBASE_CONFIG, 'Firebase');
        return FIREBASE_CONFIG;
    }
    
    /**
     * Get Cloudinary configuration
     * @returns {Object} Cloudinary config object
     */
    static getCloudinaryConfig() {
        this.validateConfig(CLOUDINARY_CONFIG, 'Cloudinary');
        return CLOUDINARY_CONFIG;
    }
    
    /**
     * Get AI configuration
     * @returns {Object} AI config object
     */
    static getAIConfig() {
        this.validateConfig(AI_CONFIG, 'AI');
        return AI_CONFIG;
    }
    
    /**
     * Get specific Cloudinary folder
     * @param {string} folderType - Type of folder (vehicles, drivers, etc.)
     * @returns {string} Folder path
     */
    static getCloudinaryFolder(folderType) {
        if (!CLOUDINARY_CONFIG.folders || !CLOUDINARY_CONFIG.folders[folderType]) {
            console.warn(`Cloudinary folder '${folderType}' not found. Using default.`);
            return 'transport/default';
        }
        return CLOUDINARY_CONFIG.folders[folderType];
    }
    
    /**
     * Validate configuration object
     * @param {Object} config - Configuration object to validate
     * @param {string} configName - Name of the configuration for error messages
     */
    static validateConfig(config, configName) {
        if (!config) {
            console.error(`❌ ${configName} configuration is missing!`);
            return false;
        }
        
        // Check for placeholder values that should be replaced
        const placeholders = ['your-', 'example-', 'test-', 'placeholder'];
        const configString = JSON.stringify(config);
        
        for (const placeholder of placeholders) {
            if (configString.includes(placeholder)) {
                console.warn(`⚠️  ${configName} configuration contains placeholder values. Please update EVM file.`);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Check if configuration is using development values
     * @returns {boolean} True if using development/fallback values
     */
    static isUsingFallbackValues() {
        const configString = JSON.stringify(FIREBASE_CONFIG);
        return configString.includes('your-') || configString.includes('example-');
    }
    
    /**
     * Get environment info
     * @returns {Object} Environment information
     */
    static getEnvironmentInfo() {
        return {
            hasEVM: typeof ENV_CONFIG !== 'undefined',
            usingFallback: this.isUsingFallbackValues(),
            environment: ENV_CONFIG?.APP?.environment || 'unknown',
            debug: ENV_CONFIG?.APP?.debug || false
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    // Node.js
    module.exports = ConfigManager;
} else {
    // Browser
    window.ConfigManager = ConfigManager;
}

// Auto-initialize and log status
if (typeof window !== 'undefined') {
    const envInfo = ConfigManager.getEnvironmentInfo();
    console.log('🔧 Configuration Status:', envInfo);
    
    if (envInfo.usingFallback) {
        console.warn('⚠️  Using fallback configuration values. Please create and configure evm.js file.');
    }
}
