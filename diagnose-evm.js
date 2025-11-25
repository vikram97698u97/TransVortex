/**
 * 🚨 EVM Loading Issue Fix
 * 
 * This script will help diagnose and fix EVM loading issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnosing EVM loading issues...\n');

// Check if evm.js exists and has content
if (fs.existsSync('evm.js')) {
    const evmContent = fs.readFileSync('evm.js', 'utf8');
    console.log('✅ evm.js exists');
    console.log('📏 File size:', evmContent.length, 'bytes');
    
    // Check for Firebase config
    if (evmContent.includes('AIzaSyDAlk_K8p8Of8Ne6Jpcl2QqXTtm95NgG7o')) {
        console.log('✅ Firebase API key found');
    } else {
        console.log('❌ Firebase API key not found');
    }
    
    // Check for Cloudinary config
    if (evmContent.includes('doqapn15f')) {
        console.log('✅ Cloudinary config found');
    } else {
        console.log('❌ Cloudinary config not found');
    }
    
    // Check for window exports
    if (evmContent.includes('window.FIREBASE_CONFIG')) {
        console.log('✅ Window exports found');
    } else {
        console.log('❌ Window exports missing');
    }
} else {
    console.log('❌ evm.js does not exist');
}

// Check if config-loader.js exists
if (fs.existsSync('config-loader.js')) {
    console.log('✅ config-loader.js exists');
} else {
    console.log('❌ config-loader.js missing');
}

// Check login.html for proper script loading
if (fs.existsSync('login.html')) {
    const loginContent = fs.readFileSync('login.html', 'utf8');
    if (loginContent.includes('<script src="evm.js"></script>')) {
        console.log('✅ login.html loads evm.js');
    } else {
        console.log('❌ login.html missing evm.js script');
    }
    
    if (loginContent.includes('<script src="config-loader.js"></script>')) {
        console.log('✅ login.html loads config-loader.js');
    } else {
        console.log('❌ login.html missing config-loader.js script');
    }
    
    if (loginContent.includes('ConfigManager.getFirebaseConfig()')) {
        console.log('✅ login.html uses ConfigManager');
    } else {
        console.log('❌ login.html not using ConfigManager');
    }
} else {
    console.log('❌ login.html does not exist');
}

console.log('\n🎯 Troubleshooting Steps:');
console.log('1. Open debug-evm.html in your browser');
console.log('2. Check browser console (F12) for errors');
console.log('3. Look for "EVM Loaded Successfully" message');
console.log('4. If ConfigManager is undefined, check script loading order');
console.log('5. If API keys are placeholders, evm.js needs updating');

console.log('\n🔧 Common Issues:');
console.log('❌ "ConfigManager is undefined" → Scripts not loading in correct order');
console.log('❌ "api-key-not-valid" → evm.js still has placeholder values');
console.log('❌ "evm.js not found" → File path incorrect');

console.log('\n📝 Test URLs:');
console.log('• Debug page: debug-evm.html');
console.log('• Config test: config-test.html');
console.log('• Main login: login.html');

console.log('\n✅ If everything looks correct here, the issue might be:');
console.log('• Browser caching (try Ctrl+F5)');
console.log('• File path issues');
console.log('• Local server not running');
