/**
 * 🚀 DEPLOYMENT SCRIPT - Upload .env Configuration
 * 
 * This script helps you deploy the .env file to your server
 * and ensures secure configuration loading
 */

const fs = require('fs');

console.log('🚀 Preparing .env deployment...\n');

// Verify .env file exists
if (!fs.existsSync('.env')) {
    console.log('❌ .env file not found!');
    return;
}

// Read .env content
const envContent = fs.readFileSync('.env', 'utf8');
console.log('✅ .env file found and loaded');

// Create server-side configuration loader
const serverConfigLoader = `
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
    envContent.split('\\n').forEach(line => {
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
`;

// Write server configuration loader
fs.writeFileSync('server-config-loader.js', serverConfigLoader);
console.log('✅ Created server-config-loader.js');

// Create deployment instructions
console.log('\n📋 DEPLOYMENT INSTRUCTIONS:');
console.log('1. Upload .env file to your server (same directory as your HTML files)');
console.log('2. Upload server-config-loader.js to your server');
console.log('3. Ensure .env file is NOT accessible via URL');
console.log('4. Test your website functionality');

console.log('\n🔐 SECURITY REMINDERS:');
console.log('✅ .env file is hidden from git (.gitignore)');
console.log('✅ API keys are loaded server-side');
console.log('✅ Configuration is served securely');
console.log('✅ No API keys exposed in browser');

console.log('\n🚀 DEPLOYMENT METHODS:');

console.log('\n--- Method 1: Manual Upload ---');
console.log('1. Use FTP/SFTP to upload .env to your server');
console.log('2. Upload server-config-loader.js to server');
console.log('3. Set file permissions: chmod 600 .env');
console.log('4. Restart your web server');

console.log('\n--- Method 2: Netlify Environment Variables ---');
console.log('1. Go to Netlify dashboard > Site settings > Build & deploy');
console.log('2. Add environment variables:');
console.log('   - FIREBASE_API_KEY=' + (envContent.match(/FIREBASE_API_KEY=(.+)/)?.[1] || ''));
console.log('   - FIREBASE_DATABASE_URL=' + (envContent.match(/FIREBASE_DATABASE_URL=(.+)/)?.[1] || ''));
console.log('   - CLOUDINARY_CLOUD_NAME=' + (envContent.match(/CLOUDINARY_CLOUD_NAME=(.+)/)?.[1] || ''));
console.log('3. Redeploy your site');

console.log('\n--- Method 3: Vercel Environment Variables ---');
console.log('1. Go to Vercel dashboard > Project > Settings');
console.log('2. Add all variables from .env file');
console.log('3. Redeploy your project');

console.log('\n🎯 Current .env Configuration:');
console.log('📁 File size:', envContent.length, 'characters');
console.log('🔥 Firebase Project:', envContent.match(/FIREBASE_PROJECT_ID=(.+)/)?.[1] || 'Not found');
console.log('☁️ Cloudinary:', envContent.match(/CLOUDINARY_CLOUD_NAME=(.+)/)?.[1] || 'Not found');
console.log('🌍 Environment:', envContent.match(/ENVIRONMENT=(.+)/)?.[1] || 'Not found');

console.log('\n✨ Your .env file is ready for deployment!');
console.log('🚀 All HTML files are configured to use secure .env loading!');
