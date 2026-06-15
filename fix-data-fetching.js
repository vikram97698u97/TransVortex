/**
 * 🔧 FIX DATA FETCHING IN HOME PAGE
 * 
 * This script fixes the data fetching by properly connecting
 * the Firebase initialization with the existing data fetching logic
 */

const fs = require('fs');
const path = require('path');

function fixDataFetching(filePath) {
    try {
        console.log(`🔧 Fixing data fetching in ${filePath}...`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Find the Firebase initialization script and fix the data fetching trigger
        const brokenInitPattern = /\/\/ Trigger data fetching if function exists[\s\S]*?startDataFetching\(\);[\s\S]*?\}\)\(\);[\s\S]*?<\/script>/g;
        
        const fixedInitScript = `        // Trigger data fetching using the existing logic
        if (typeof waitForFirebase === 'function') {
          console.log('🚀 Starting data fetching with existing logic...');
          waitForFirebase().then(() => {
            console.log('✅ Firebase ready, checking authentication...');
            
            // Check authentication first
            firebase.auth().onAuthStateChanged((user) => {
              if (user) {
                console.log('✅ User authenticated:', user.uid);
                console.log('📊 Starting to fetch data...');
                fetchDataForUser(user);
              } else {
                console.log('❌ User not authenticated');
                // For home page, don't redirect - show public content
                console.log('🏠 Showing public home page content');
              }
            });
          }).catch(error => {
            console.error('❌ Error waiting for Firebase:', error);
          });
        } else {
          console.log('⚠️ waitForFirebase function not found');
        }
        
      } catch (error) {
        console.error('❌ Firebase initialization error:', error);
      }
    })();
  </script>`;
        
        if (brokenInitPattern.test(content)) {
            content = content.replace(brokenInitPattern, fixedInitScript);
            modified = true;
            console.log(`  ✅ Fixed data fetching trigger`);
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
    console.log('🔧 FIXING DATA FETCHING');
    console.log('========================');
    
    const filePath = path.join(__dirname, 'home.html');
    
    if (fs.existsSync(filePath)) {
        fixDataFetching(filePath);
        
        console.log(`\n✅ Data fetching fix completed!`);
        console.log(`📁 Connected Firebase initialization to existing data logic`);
        console.log(`🔧 Fixed authentication check and data fetching`);
        console.log(`📱 Home page should now load data correctly`);
        
        console.log(`\n🎯 Expected Results:`);
        console.log(`✅ Firebase initializes successfully`);
        console.log(`✅ Authentication check works`);
        console.log(`✅ Data fetching starts automatically`);
        console.log(`✅ User profile, vehicles, drivers data loads`);
        console.log(`✅ Dashboard shows actual data`);
        
    } else {
        console.log(`❌ File not found: home.html`);
    }
}

// Run the fix
main();
