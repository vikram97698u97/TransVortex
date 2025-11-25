/**
 * 🧪 GITHUB ACTIONS TEST SCRIPT
 * 
 * This script tests the GitHub Actions workflow locally
 * to ensure everything works before deploying
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const testConfig = {
    FIREBASE_API_KEY: 'AIzaSyDAlk_K8p8Of8Ne6Jpcl2QqXTtm95NgG7o',
    FIREBASE_AUTH_DOMAIN: 'transport-dashboard-ad69a.firebaseapp.com',
    FIREBASE_DATABASE_URL: 'https://transport-dashboard-ad69a-default-rtdb.asia-southeast1.firebasedatabase.app',
    FIREBASE_PROJECT_ID: 'transport-dashboard-ad69a',
    FIREBASE_STORAGE_BUCKET: 'transport-dashboard-ad69a.appspot.com',
    FIREBASE_MESSAGING_SENDER_ID: '526889676196',
    FIREBASE_APP_ID: '1:526889676196:web:66032c80a4aede690ae531',
    FIREBASE_MEASUREMENT_ID: 'G-7F9R7HJYDH',
    CLOUDINARY_CLOUD_NAME: 'doqapn15f',
    CLOUDINARY_UPLOAD_PRESET_VEHICLE_DRIVER: 'vehicle-driver',
    CLOUDINARY_UPLOAD_PRESET_PAYMENT_BILLING: 'payment-billing',
    CLOUDINARY_UPLOAD_PRESET_PROFILE_PIC: 'profile-pic',
    CLOUDINARY_UPLOAD_PRESET_DOCUMENTS: 'documents',
    CLOUDINARY_UPLOAD_PRESET_RECEIPTS: 'receipts',
    CLOUDINARY_UPLOAD_PRESET_EXPENSES: 'expenses',
    CLOUDINARY_UPLOAD_PRESET_TYRES: 'tyres',
    CLOUDINARY_UPLOAD_PRESET_VEHICLES: 'vehicles',
    CLOUDINARY_UPLOAD_PRESET_DRIVERS: 'drivers',
    CLOUDINARY_UPLOAD_PRESET_INVOICES: 'invoices',
    CLOUDINARY_UPLOAD_PRESET_LR_REPORTS: 'lr-reports',
    CLOUDINARY_UPLOAD_PRESET_TRIP_EXPENSES: 'trip-expenses',
    CLOUDINARY_API_URL: 'https://api.cloudinary.com/v1_1/doqapn15f/image/upload',
    CLOUDINARY_BASE_URL: 'https://res.cloudinary.com/doqapn15f/image/upload',
    ENVIRONMENT: 'production',
    DEBUG: 'false',
    API_BASE_URL: 'https://transvortex.online',
    VERSION: '1.0.0',
    SESSION_SECRET: 'transvortex-session-secret-2024',
    JWT_SECRET: 'transvortex-jwt-secret-2024',
    ENCRYPTION_KEY: 'transvortex-encryption-key-2024',
    API_RATE_LIMIT: '100',
    CORS_ORIGIN: 'https://transvortex.online',
    ALLOWED_ORIGINS: 'https://transvortex.online,http://localhost:3000'
};

function runTest() {
    console.log('🧪 Testing GitHub Actions Configuration...');
    console.log('==========================================\n');
    
    try {
        // Test 1: Build configuration with test environment
        console.log('📋 Test 1: Building configuration with test environment...');
        
        // Set environment variables for testing
        Object.entries(testConfig).forEach(([key, value]) => {
            process.env[key] = value;
        });
        
        // Run secure-config-builder.js
        console.log('🔧 Running secure-config-builder.js...');
        execSync('node secure-config-builder.js', { stdio: 'inherit' });
        
        // Test 2: Verify generated evm.js
        console.log('\n📋 Test 2: Verifying generated evm.js...');
        
        if (fs.existsSync('evm.js')) {
            const evmContent = fs.readFileSync('evm.js', 'utf8');
            
            // Check for Firebase configuration
            if (evmContent.includes('window.FIREBASE_CONFIG')) {
                console.log('✅ Firebase configuration found');
            } else {
                console.log('❌ Firebase configuration missing');
                return false;
            }
            
            // Check for Cloudinary configuration
            if (evmContent.includes('window.CLOUDINARY_CONFIG')) {
                console.log('✅ Cloudinary configuration found');
            } else {
                console.log('❌ Cloudinary configuration missing');
                return false;
            }
            
            // Check for environment configuration
            if (evmContent.includes('window.ENVIRONMENT')) {
                console.log('✅ Environment configuration found');
            } else {
                console.log('❌ Environment configuration missing');
                return false;
            }
            
            console.log('✅ evm.js generated successfully');
            
        } else {
            console.log('❌ evm.js not found');
            return false;
        }
        
        // Test 3: Verify secure-api-loader.js
        console.log('\n📋 Test 3: Verifying secure-api-loader.js...');
        
        if (fs.existsSync('secure-api-loader.js')) {
            const loaderContent = fs.readFileSync('secure-api-loader.js', 'utf8');
            
            if (loaderContent.includes('SECURE_FIREBASE_CONFIG')) {
                console.log('✅ Secure loader configuration found');
            } else {
                console.log('❌ Secure loader configuration missing');
                return false;
            }
            
            if (loaderContent.includes('loadConfiguration')) {
                console.log('✅ Configuration loading function found');
            } else {
                console.log('❌ Configuration loading function missing');
                return false;
            }
            
        } else {
            console.log('❌ secure-api-loader.js not found');
            return false;
        }
        
        // Test 4: Check GitHub Actions workflow
        console.log('\n📋 Test 4: Verifying GitHub Actions workflow...');
        
        const workflowPath = '.github/workflows/build-config.yml';
        if (fs.existsSync(workflowPath)) {
            const workflowContent = fs.readFileSync(workflowPath, 'utf8');
            
            if (workflowContent.includes('FIREBASE_API_KEY')) {
                console.log('✅ GitHub Actions workflow has Firebase secrets');
            } else {
                console.log('❌ GitHub Actions workflow missing Firebase secrets');
                return false;
            }
            
            if (workflowContent.includes('CLOUDINARY_CLOUD_NAME')) {
                console.log('✅ GitHub Actions workflow has Cloudinary secrets');
            } else {
                console.log('❌ GitHub Actions workflow missing Cloudinary secrets');
                return false;
            }
            
        } else {
            console.log('❌ GitHub Actions workflow not found');
            return false;
        }
        
        console.log('\n🎉 All tests passed!');
        console.log('✅ Configuration system is working correctly');
        console.log('✅ Ready for GitHub deployment');
        
        return true;
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return false;
    }
}

function generateGitHubSecretsInstructions() {
    console.log('\n📋 GitHub Secrets Setup Instructions:');
    console.log('=====================================');
    console.log('1. Go to: https://github.com/vikram97698u97/TransVortex/settings/secrets/actions');
    console.log('2. Click "New repository secret"');
    console.log('3. Add these secrets:\n');
    
    Object.entries(testConfig).forEach(([key, value]) => {
        console.log(`   ${key} = ${value}`);
    });
    
    console.log('\n4. After adding secrets, GitHub Actions will automatically build your configuration');
    console.log('5. Check the Actions tab to see the build progress');
}

// Main execution
const testPassed = runTest();

if (testPassed) {
    generateGitHubSecretsInstructions();
    console.log('\n🚀 Ready for Step 4: Test Deployment!');
} else {
    console.log('\n❌ Please fix the issues before deploying to GitHub');
}
