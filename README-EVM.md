# 🔐 Environment Variables Module (EVM) System

This secure configuration system helps you manage sensitive API keys, credentials, and configuration data without exposing them in your public codebase.

## 📁 Files Created

1. **`evm.js`** - Main environment variables module (contains all sensitive data)
2. **`.gitignore`** - Ensures sensitive files are never committed
3. **`config-loader.js`** - Secure configuration loader with fallbacks
4. **`secure-example.html`** - Example of how to use the secure configuration
5. **`README-EVM.md`** - This documentation file

## 🚨 SECURITY WARNING

**NEVER COMMIT THE `evm.js` FILE TO VERSION CONTROL!**

The `.gitignore` file has been configured to prevent this, but always double-check:
```bash
# Check if evm.js is in .gitignore
grep evm.js .gitignore

# Verify it's not tracked by git
git status evm.js
```

## 📋 What's Included in EVM

### 🔥 Firebase Configuration
- API keys, auth domains, database URLs
- Project IDs, storage buckets
- Measurement IDs for analytics

### ☁️ Cloudinary Configuration
- Cloud names and upload presets
- Organized folder structure for different file types
- API URLs for image/document uploads

### 🤖 AI Service Configuration
- Gemini API keys
- Support for multiple AI services (OpenAI, Anthropic, etc.)

### 💳 Payment Gateway Configuration
- Razorpay, Stripe, PayPal credentials
- Test and production keys separated

### 📧 Third-Party Services
- Email services (SendGrid, Mailgun)
- SMS services (Twilio)
- Maps services (Google Maps)

### ⚙️ Application Configuration
- Environment settings (dev/staging/prod)
- Security settings and limits
- Upload limits and file type restrictions

## 🛠️ How to Use

### 1. Basic Setup
```html
<!-- Load EVM first (must be before other scripts) -->
<script src="evm.js"></script>
<script src="config-loader.js"></script>
```

### 2. Initialize Firebase Securely
```javascript
// Instead of hardcoded config
const firebaseConfig = ConfigManager.getFirebaseConfig();
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
```

### 3. Use Cloudinary Securely
```javascript
const cloudinaryConfig = ConfigManager.getCloudinaryConfig();
const folder = ConfigManager.getCloudinaryFolder('vehicles');

// Use in upload function
formData.append('upload_preset', cloudinaryConfig.uploadPreset);
formData.append('folder', folder);
```

### 4. Access AI Services
```javascript
const aiConfig = ConfigManager.getAIConfig();
const geminiKey = aiConfig.geminiApiKey;
```

## 🔧 Configuration Management

### Adding New Configuration
```javascript
// In evm.js, add to appropriate section
const NEW_SERVICE_CONFIG = {
    apiKey: "your-api-key",
    endpoint: "https://api.example.com",
    // ... other config
};

// Add to ENV_CONFIG export
const ENV_CONFIG = {
    // ... existing configs
    NEW_SERVICE: NEW_SERVICE_CONFIG
};
```

### Environment-Specific Values
```javascript
// In evm.js, you can have different values for different environments
const APP_CONFIG = {
    environment: "development", // Change to "production" for production
    
    // Different API endpoints per environment
    apiEndpoints: {
        development: "https://dev-api.example.com",
        production: "https://api.example.com"
    }
};
```

## 🔄 Updating Existing Files

### For employees.html (and other files):
1. **Remove hardcoded Firebase config:**
```javascript
// REMOVE THIS:
const firebaseConfig = {
    apiKey: "AIzaSyDAlk_K8p8Of8Ne6Jpcl2QqXTtm95NgG7o",
    // ... other hardcoded values
};

// REPLACE WITH:
const firebaseConfig = ConfigManager.getFirebaseConfig();
```

2. **Remove hardcoded Cloudinary config:**
```javascript
// REMOVE THIS:
const CLOUDINARY_CLOUD_NAME = 'doqapn15f';
const CLOUDINARY_UPLOAD_PRESET = 'vehicle-driver';

// REPLACE WITH:
const cloudinaryConfig = ConfigManager.getCloudinaryConfig();
const cloudName = cloudinaryConfig.cloudName;
const uploadPreset = cloudinaryConfig.uploadPreset;
```

3. **Add script tags at the top:**
```html
<script src="evm.js"></script>
<script src="config-loader.js"></script>
```

## 🛡️ Security Best Practices

### ✅ DO:
- Keep `evm.js` in `.gitignore`
- Use different keys for development vs production
- Regularly rotate your API keys
- Use environment-specific configurations
- Validate configuration before use

### ❌ DON'T:
- Commit `evm.js` to version control
- Share API keys in public repositories
- Use production keys in development
- Hard-code sensitive values in your main code
- Include `evm.js` in public deployments

## 🚀 Deployment Considerations

### Development Environment
```javascript
// In evm.js
const APP_CONFIG = {
    environment: "development",
    debug: true
};
```

### Production Environment
```javascript
// In evm.js
const APP_CONFIG = {
    environment: "production", 
    debug: false
};
```

### Server-Side Deployment
For server-side deployments, consider using:
- Environment variables (process.env)
- Secret management services (AWS Secrets Manager, etc.)
- Server-side configuration files outside the web root

## 🐛 Troubleshooting

### "EVM file not found" error
- Ensure `evm.js` exists in the correct location
- Check that the script tag path is correct
- Verify the file is not blocked by browser security policies

### "Using fallback values" warning
- This means `evm.js` wasn't loaded or contains placeholder values
- Update `evm.js` with real API keys and configuration
- Ensure the script is loaded before other scripts that use it

### Configuration validation errors
- Check for placeholder values (like "your-api-key-here")
- Verify all required fields are present
- Ensure JSON syntax is correct in `evm.js`

## 📞 Support

If you have issues with the EVM system:
1. Check browser console for error messages
2. Verify `evm.js` is properly formatted JSON/JavaScript
3. Ensure all required fields are filled with real values
4. Check that `.gitignore` is properly configured

## 🔄 Migration Checklist

- [ ] Create `evm.js` with your actual API keys
- [ ] Add `evm.js` to `.gitignore`
- [ ] Update all files to use `ConfigManager`
- [ ] Remove hardcoded API keys from source code
- [ ] Test in development environment
- [ ] Verify production configuration
- [ ] Commit changes (excluding `evm.js`)
- [ ] Regularly rotate API keys

---

**Remember: Security is everyone's responsibility. Keep sensitive data secure!** 🔐
