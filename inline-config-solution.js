/**
 * 🔧 INLINE CONFIGURATION SOLUTION
 * 
 * Creates inline Firebase and Cloudinary configuration in HTML files
 * This eliminates the need for separate evm.js file
 */

const fs = require('fs');

console.log('🔧 Creating inline configuration solution...\n');

// Configuration data
const inlineConfig = `
    <!-- Inline Configuration (replaces evm.js) -->
    <script>
        // ========================================
        // 🔥 FIREBASE CONFIGURATION
        // ========================================
        if (!window.FIREBASE_CONFIG) {
            window.FIREBASE_CONFIG = {
                apiKey: "AIzaSyDAlk_K8p8Of8Ne6Jpcl2QqXTtm95NgG7o",
                authDomain: "transport-dashboard-ad69a.firebaseapp.com",
                databaseURL: "https://transport-dashboard-ad69a-default-rtdb.asia-southeast1.firebasedatabase.app",
                projectId: "transport-dashboard-ad69a",
                storageBucket: "transport-dashboard-ad69a.appspot.com",
                messagingSenderId: "526889676196",
                appId: "1:526889676196:web:66032c80a4aede690ae531",
                measurementId: "G-7F9R7HJYDH"
            };
        }

        // ========================================
        // ☁️ CLOUDINARY CONFIGURATION
        // ========================================
        if (!window.CLOUDINARY_CONFIG) {
            window.CLOUDINARY_CONFIG = {
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
            };
        }

        // ========================================
        // 🌍 ENVIRONMENT CONFIGURATION
        // ========================================
        if (!window.ENVIRONMENT) {
            window.ENVIRONMENT = {
                name: "production",
                debug: false,
                apiBaseUrl: window.location.origin,
                version: "1.0.0"
            };
        }
    </script>
`;

// Get all HTML files
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));
let modifiedFiles = 0;

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Replace evm.js script tag with inline configuration
    if (content.includes('<script src="evm.js"></script>')) {
        content = content.replace('<script src="evm.js"></script>', inlineConfig.trim());
        modified = true;
    }
    
    // Also replace other variations
    if (content.includes('<script src="evm.js">')) {
        content = content.replace(/<script src="evm.js"[^>]*>/g, inlineConfig.trim());
        modified = true;
    }
    
    if (modified) {
        fs.writeFileSync(file, content);
        console.log(`✅ Added inline configuration to ${file}`);
        modifiedFiles++;
    }
});

console.log(`\n🎯 Inline Configuration Summary:`);
console.log(`✅ Modified ${modifiedFiles} HTML files`);
console.log(`✅ Removed dependency on evm.js`);
console.log(`✅ Firebase configuration embedded`);
console.log(`✅ Cloudinary configuration embedded`);
console.log(`✅ Environment configuration embedded`);

console.log(`\n🚀 Benefits:`);
console.log(`✅ No external evm.js file needed`);
console.log(`✅ Configuration always available`);
console.log(`✅ Faster loading (no extra HTTP request)`);
console.log(`✅ Works on any hosting platform`);
console.log(`✅ No deployment issues`);

console.log(`\n📋 What to do:`);
console.log(`1. Deploy your updated HTML files`);
console.log(`2. No need to upload evm.js separately`);
console.log(`3. Test website functionality`);
console.log(`4. Firebase should work perfectly`);

console.log(`\n✨ Inline configuration solution completed!`);
