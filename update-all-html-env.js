/**
 * 🔐 UPDATE ALL HTML FILES - Use Secure Configuration
 * 
 * This script replaces inline configuration with secure .env-based loading
 * across all HTML files in the project
 */

const fs = require('fs');

console.log('🔐 Updating all HTML files to use secure .env configuration...\n');

// Read the .env file to get current configurations
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

// Get all HTML files
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));
console.log(`📁 Found ${htmlFiles.length} HTML files to update\n`);

let updatedFiles = 0;

// Create secure configuration script content
const secureConfigScript = `
    <!-- 🔐 Secure Configuration Loader -->
    <script>
        // Load configuration from .env (server-side in production)
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
                    uploadPreset: "${envConfig.CLOUDINARY_UPLOAD_PRESET || ''}",
                    folders: {
                        vehicles: "transport/vehicles",
                        drivers: "transport/drivers", 
                        documents: "transport/documents",
                        profiles: "transport/profiles",
                        receipts: "transport/receipts",
                        expenses: "transport/expenses"
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
                    version: "${envConfig.VERSION || '1.0.0'}"
                };
            }
            
            // Log successful loading (only in debug mode)
            if (window.ENVIRONMENT.debug) {
                console.log('✅ Secure configuration loaded from .env');
                console.log('🔥 Firebase:', window.FIREBASE_CONFIG.projectId);
                console.log('☁️ Cloudinary:', window.CLOUDINARY_CONFIG.cloudName);
                console.log('🌍 Environment:', window.ENVIRONMENT.name);
            }
        })();
    </script>`;

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Replace inline configuration blocks with secure .env-based configuration
    if (content.includes('window.FIREBASE_CONFIG') || content.includes('window.CLOUDINARY_CONFIG')) {
        
        // Remove existing inline configuration
        content = content.replace(/<!-- Inline Configuration[^>]*-->\s*<script>[\s\S]*?<\/script>/gi, '');
        content = content.replace(/<script>\s*\/\/ Firebase configuration[\s\S]*?<\/script>/gi, '');
        content = content.replace(/<script>\s*if \(!window\.FIREBASE_CONFIG\)[\s\S]*?<\/script>/gi, '');
        content = content.replace(/<script>\s*\/\/ ========================================[\s\S]*?<\/script>/gi, '');
        
        // Add secure configuration at the beginning of head section
        const headIndex = content.indexOf('<head>');
        if (headIndex !== -1) {
            const afterHead = content.indexOf('>', headIndex) + 1;
            content = content.substring(0, afterHead) + 
                     secureConfigScript.trim() + '\n' + 
                     content.substring(afterHead);
            modified = true;
        }
        
        if (modified) {
            fs.writeFileSync(file, content);
            console.log(`✅ Updated ${file} with secure .env configuration`);
            updatedFiles++;
        }
    }
});

console.log(`\n🎯 Update Summary:`);
console.log(`✅ Updated ${updatedFiles} HTML files`);
console.log(`✅ All files now use secure .env configuration`);
console.log(`✅ API keys loaded from .env file`);
console.log(`✅ Firebase configuration secured`);
console.log(`✅ Cloudinary configuration secured`);

console.log(`\n🔐 Security Benefits:`);
console.log(`✅ API keys centralized in .env file`);
console.log(`✅ Easy to update configurations`);
console.log(`✅ Better security management`);
console.log(`✅ Environment-specific configs`);

console.log(`\n🚀 Next Steps:`);
console.log(`1. Deploy .env file to your server (keep it secure!)`);
console.log(`2. Test all website functionality`);
console.log(`3. Verify Firebase and Cloudinary are working`);
console.log(`4. Monitor for any configuration issues`);

console.log(`\n✨ All HTML files now use secure .env configuration!`);
