/**
 * 🔄 Netlify EVM Update Script
 * 
 * This will update your evm.js to work with Netlify environment variables
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Updating evm.js for Netlify deployment...\n');

// Backup current evm.js
if (fs.existsSync('evm.js')) {
    const backupName = `evm.js.netlify-backup.${Date.now()}`;
    fs.copyFileSync('evm.js', backupName);
    console.log(`✅ Backed up current evm.js to ${backupName}`);
}

// Copy Netlify version
if (fs.existsSync('evm-netlify.js')) {
    fs.copyFileSync('evm-netlify.js', 'evm.js');
    console.log('✅ Updated evm.js for Netlify environment variables');
    console.log('✅ Now uses process.env for secure configuration');
    
    // Clean up
    fs.unlinkSync('evm-netlify.js');
    console.log('✅ Cleaned up temporary file');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Go to your Netlify site dashboard');
    console.log('2. Site settings → Build & deploy → Environment');
    console.log('3. Add environment variables (see list below)');
    console.log('4. Trigger a new deploy in Netlify');
    console.log('5. Test your login functionality');
    
    console.log('\n📝 Required Environment Variables:');
    console.log('• FIREBASE_API_KEY = AIzaSyDAlk_K8p8Of8Ne6Jpcl2QqXTtm95NgG7o');
    console.log('• FIREBASE_AUTH_DOMAIN = transport-dashboard-ad69a.firebaseapp.com');
    console.log('• FIREBASE_DATABASE_URL = https://transport-dashboard-ad69a-default-rtdb.asia-southeast1.firebasedatabase.app');
    console.log('• FIREBASE_PROJECT_ID = transport-dashboard-ad69a');
    console.log('• FIREBASE_STORAGE_BUCKET = transport-dashboard-ad69a.appspot.com');
    console.log('• FIREBASE_MESSAGING_SENDER_ID = 526889676196');
    console.log('• FIREBASE_APP_ID = 1:526889676196:web:66032c80a4aede690ae531');
    console.log('• FIREBASE_MEASUREMENT_ID = G-7F9R7HJYDH');
    console.log('• CLOUDINARY_CLOUD_NAME = doqapn15f');
    console.log('• CLOUDINARY_UPLOAD_PRESET = vehicle-driver');
    
} else {
    console.log('❌ evm-netlify.js not found');
}
