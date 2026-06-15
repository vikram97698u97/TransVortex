/**
 * 🔧 FIX DUPLICATE FIREBASE AND MISSING FUNCTIONS
 * 
 * This script fixes:
 * 1. Firebase being loaded multiple times
 * 2. Missing toggleSelectAll function
 */

const fs = require('fs');
const path = require('path');

// List of HTML files to fix
const htmlFiles = [
    'home.html', 'lr-report.html', 'trip-expenses.html'
];

function fixDuplicateFirebaseAndFunctions(filePath) {
    try {
        console.log(`🔧 Fixing Firebase and functions in ${filePath}...`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Remove all Firebase script tags except the first occurrence
        const firebaseScriptPattern = /<script src="https:\/\/www\.gstatic\.com\/firebasejs\/[^"]*firebase-[^"]*\.js"><\/script>/g;
        const firebaseScripts = content.match(firebaseScriptPattern) || [];
        
        if (firebaseScripts.length > 4) { // More than the standard 4 Firebase scripts
            console.log(`  ⚠️ Found ${firebaseScripts.length} Firebase scripts, removing duplicates...`);
            
            // Keep only the first 4 Firebase scripts
            const firstFourScripts = firebaseScripts.slice(0, 4);
            const duplicateScripts = firebaseScripts.slice(4);
            
            duplicateScripts.forEach(script => {
                content = content.replace(script, '');
            });
            
            modified = true;
            console.log(`  ✅ Removed ${duplicateScripts.length} duplicate Firebase scripts`);
        }
        
        // Add missing toggleSelectAll function
        if (content.includes('onclick="toggleSelectAll()"') && !content.includes('function toggleSelectAll')) {
            const toggleFunction = `
<script>
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const rowCheckboxes = document.querySelectorAll('tbody input[type="checkbox"]');
    
    rowCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

function initializeLRReport() {
    // Initialize any LR report specific functionality
    console.log('🚀 LR Report initialized');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeLRReport();
});
</script>`;
            
            // Add before closing body tag
            if (content.includes('</body>')) {
                content = content.replace('</body>', toggleFunction + '\n</body>');
                modified = true;
                console.log(`  ✅ Added toggleSelectAll function to ${filePath}`);
            }
        }
        
        // Fix any remaining duplicate Firebase loading in script blocks
        const duplicateFirebaseInit = /firebase\.initializeApp\([^)]*\)/g;
        const firebaseInits = content.match(duplicateFirebaseInit) || [];
        
        if (firebaseInits.length > 1) {
            console.log(`  ⚠️ Found ${firebaseInits.length} Firebase initializations, removing duplicates...`);
            
            // Keep only the first Firebase initialization
            const firstInit = firebaseInits[0];
            const duplicateInits = firebaseInits.slice(1);
            
            duplicateInits.forEach(init => {
                content = content.replace(init, '// Firebase already initialized');
            });
            
            modified = true;
            console.log(`  ✅ Removed ${duplicateInits.length} duplicate Firebase initializations`);
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
    console.log('🔧 Fixing Duplicate Firebase and Missing Functions');
    console.log('==================================================');
    
    let fixedCount = 0;
    
    htmlFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            fixDuplicateFirebaseAndFunctions(filePath);
            fixedCount++;
        } else {
            console.log(`⚠️ File not found: ${file}`);
        }
    });
    
    console.log(`\n✅ Firebase and function fixes completed!`);
    console.log(`📁 Processed ${fixedCount} HTML files`);
    console.log(`🛡️ Firebase warnings should be gone`);
    console.log(`📱 toggleSelectAll function should work now`);
}

// Run the fix
main();
