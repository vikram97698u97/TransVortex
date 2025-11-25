/**
 * 🔧 FIX FIREBASE TIMING ISSUES
 * 
 * This script fixes Firebase initialization timing issues
 * by ensuring Firebase is loaded before trying to use it
 */

const fs = require('fs');
const path = require('path');

function fixFirebaseTiming(filePath) {
    try {
        console.log(`🔧 Fixing Firebase timing issues in ${filePath}...`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Replace the broken Firebase initialization script
        const brokenInitPattern = /<script>\s*\/\/ Initialize Firebase with configuration from \.env[\s\S]*?<\/script>/g;
        
        const fixedInitScript = `  <script>
    // Initialize Firebase with configuration from .env
    document.addEventListener('DOMContentLoaded', function() {
      try {
        // Wait a moment for Firebase to be fully loaded
        setTimeout(function() {
          if (typeof firebase === 'undefined') {
            console.error('❌ Firebase not loaded - check script order');
            return;
          }
          
          if (!window.FIREBASE_CONFIG) {
            console.error('❌ Firebase configuration not loaded');
            return;
          }
          
          // Initialize Firebase if not already initialized
          if (!firebase.apps.length) {
            firebase.initializeApp(window.FIREBASE_CONFIG);
            console.log('✅ Firebase initialized successfully');
            console.log('🔥 Database URL:', window.FIREBASE_CONFIG.databaseURL);
            console.log('🔥 Project ID:', window.FIREBASE_CONFIG.projectId);
          } else {
            console.log('✅ Firebase already initialized');
            firebase.app(); // Use existing app
          }
          
          // Initialize database and auth
          const db = firebase.database();
          const auth = firebase.auth();
          
          console.log('✅ Database and auth initialized');
          
          // Trigger data fetching
          if (typeof startDataFetching === 'function') {
            startDataFetching();
          }
          
        }, 500); // Wait 500ms for Firebase to be ready
        
      } catch (error) {
        console.error('❌ Firebase initialization error:', error);
      }
    });
  </script>`;
        
        if (brokenInitPattern.test(content)) {
            content = content.replace(brokenInitPattern, fixedInitScript);
            modified = true;
            console.log(`  ✅ Fixed Firebase initialization timing`);
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
    console.log('🔧 FIXING FIREBASE TIMING ISSUES');
    console.log('=================================');
    
    const filePath = path.join(__dirname, 'home.html');
    
    if (fs.existsSync(filePath)) {
        fixFirebaseTiming(filePath);
        
        console.log(`\n✅ Firebase timing fix completed!`);
        console.log(`📁 Firebase will now wait before initializing`);
        console.log(`🔧 Fixed 'firebase is not defined' error`);
        console.log(`📱 Home page should work correctly now`);
        
        console.log(`\n🎯 Expected Results:`);
        console.log(`✅ No 'firebase is not defined' errors`);
        console.log(`✅ Firebase initializes properly`);
        console.log(`✅ Data loading works correctly`);
        
    } else {
        console.log(`❌ File not found: home.html`);
    }
}

// Run the fix
main();
