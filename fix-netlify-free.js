/**
 * 🔄 Netlify Free Plan Fix
 * 
 * Updates evm.js to work with Netlify free plan (public API keys)
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Updating evm.js for Netlify FREE plan...\n');

// Backup current evm.js
if (fs.existsSync('evm.js')) {
    const backupName = `evm.js.free-plan-backup.${Date.now()}`;
    fs.copyFileSync('evm.js', backupName);
    console.log(`✅ Backed up current evm.js to ${backupName}`);
}

// Copy free plan version
if (fs.existsSync('evm-netlify-free.js')) {
    fs.copyFileSync('evm-netlify-free.js', 'evm.js');
    console.log('✅ Updated evm.js for Netlify FREE plan');
    console.log('✅ Using public API keys (works on free plan)');
    
    // Clean up
    fs.unlinkSync('evm-netlify-free.js');
    console.log('✅ Cleaned up temporary file');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Commit and push to GitHub');
    console.log('2. Netlify will auto-deploy the changes');
    console.log('3. Test your login functionality');
    console.log('4. Your website should work now!');
    
    console.log('\n📝 What this does:');
    console.log('• Uses public API keys (normal for client-side apps)');
    console.log('• Works on Netlify free plan');
    console.log('• No environment variables needed');
    console.log('• Login should work immediately');
    
} else {
    console.log('❌ evm-netlify-free.js not found');
}
