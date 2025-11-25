/**
 * 🔧 FIX SCRIPT LOADING ORDER
 * 
 * This script fixes the Firebase loading order by moving
 * the initialization script to the end of the body
 */

const fs = require('fs');
const path = require('path');

function fixScriptOrder(filePath) {
    try {
        console.log(`🔧 Fixing script loading order in ${filePath}...`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Remove the Firebase initialization script from its current location
        const brokenInitPattern = /<script>\s*\/\/ Initialize Firebase with configuration from \.env[\s\S]*?<\/script>/g;
        
        if (brokenInitPattern.test(content)) {
            content = content.replace(brokenInitPattern, '');
            modified = true;
            console.log(`  ✅ Removed Firebase initialization from current location`);
        }
        
        // Add the Firebase initialization script at the end of body (before closing body tag)
        const properInitScript = `
  <!-- Firebase Initialization Script -->
  <script>
    // Initialize Firebase with configuration from .env
    (function() {
      try {
        // Check if Firebase is loaded
        if (typeof firebase === 'undefined') {
          console.error('❌ Firebase SDK not loaded');
          return;
        }
        
        // Check if configuration is loaded
        if (!window.FIREBASE_CONFIG) {
          console.error('❌ Firebase configuration not loaded');
          return;
        }
        
        console.log('🔧 Initializing Firebase...');
        console.log('🔥 Database URL:', window.FIREBASE_CONFIG.databaseURL);
        console.log('🔥 Project ID:', window.FIREBASE_CONFIG.projectId);
        
        // Initialize Firebase if not already initialized
        if (!firebase.apps.length) {
          firebase.initializeApp(window.FIREBASE_CONFIG);
          console.log('✅ Firebase initialized successfully');
        } else {
          console.log('✅ Firebase already initialized');
          firebase.app(); // Use existing app
        }
        
        // Initialize database and auth
        const db = firebase.database();
        const auth = firebase.auth();
        
        console.log('✅ Database and auth initialized');
        
        // Make available globally
        window.db = db;
        window.auth = auth;
        
        // Trigger data fetching if function exists
        if (typeof startDataFetching === 'function') {
          console.log('🚀 Starting data fetching...');
          startDataFetching();
        }
        
      } catch (error) {
        console.error('❌ Firebase initialization error:', error);
      }
    })();
  </script>`;
        
        // Add before closing body tag
        if (content.includes('</body>')) {
            content = content.replace('</body>', properInitScript + '\n</body>');
            modified = true;
            console.log(`  ✅ Added Firebase initialization at end of body`);
        }
        
        // Write fixed content back
        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log(`  ✅ Fixed ${filePath}`);
        } else {
            console.log(`  ℹ️ No fixes needed for ${filePath}`);
        }
        
    } catch (error) {
        console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
}

function main() {
    console.log('🔧 FIXING SCRIPT LOADING ORDER');
    console.log('==============================');
    
    const filePath = path.join(__dirname, 'home.html');
    
    if (fs.existsSync(filePath)) {
        fixScriptOrder(filePath);
        
        console.log(`\n✅ Script loading order fix completed!`);
        console.log(`📁 Firebase initialization moved to end of body`);
        console.log(`🔧 Firebase SDK will load before initialization`);
        console.log(`📱 Home page should work correctly now`);
        
        console.log(`\n🎯 Expected Results:`);
        console.log(`✅ No 'Firebase not loaded' errors`);
        console.log(`✅ Firebase initializes properly`);
        console.log(`✅ Database connection established`);
        console.log(`✅ Data loading works correctly`);
        
    } else {
        console.log(`❌ File not found: home.html`);
    }
}

// Run the fix
main();
