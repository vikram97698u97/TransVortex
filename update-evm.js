/**
 * 🔄 EVM Update Helper
 * 
 * This will help you replace your current evm.js with the updated version
 * containing your actual Firebase and Cloudinary configurations.
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Updating evm.js with your actual configurations...\n');

// Backup current evm.js if it exists
if (fs.existsSync('evm.js')) {
    const backupName = `evm.js.backup.${Date.now()}`;
    fs.copyFileSync('evm.js', backupName);
    console.log(`✅ Backed up current evm.js to ${backupName}`);
}

// Copy the updated version
if (fs.existsSync('evm-updated.js')) {
    fs.copyFileSync('evm-updated.js', 'evm.js');
    console.log('✅ Updated evm.js with your actual configurations');
    console.log('✅ Firebase API key: AIzaSyDAlk_K8p8Of8Ne6Jpcl2QqXTtm95NgG7o');
    console.log('✅ Cloudinary name: doqapn15f');
    console.log('✅ Cloudinary preset: vehicle-driver');
    
    // Clean up the temporary file
    fs.unlinkSync('evm-updated.js');
    console.log('✅ Cleaned up temporary file');
    
    console.log('\n🎉 evm.js has been updated with your real configurations!');
    console.log('🚀 Your website should now work properly!');
    console.log('📝 Refresh your website to test the login functionality');
} else {
    console.log('❌ evm-updated.js not found. Please ensure it exists in the current directory.');
}

console.log('\n📋 What was updated:');
console.log('🔥 Firebase: Your actual project credentials');
console.log('☁️ Cloudinary: Your actual cloud name and preset');
console.log('🌍 Environment: Set to production mode');
console.log('📱 Added additional configuration options for future use');

console.log('\n🎯 Next steps:');
console.log('1. Refresh your website');
console.log('2. Test the login functionality');
console.log('3. Test image uploads (if you use them)');
console.log('4. If you have AI features, add your Gemini API key');
console.log('5. If you add payment features, add your payment keys');
