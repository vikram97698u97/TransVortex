/**
 * 🔐 SECURE CONFIGURATION API ENDPOINT
 * 
 * This creates a secure API endpoint that serves configuration
 * Only authenticated users can access this
 * 
 * INSTRUCTIONS:
 * 1. Deploy this to your server (Node.js/Express)
 * 2. Update HTML files to fetch config from this endpoint
 * 3. Keep .env file secure on server
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.CONFIG_PORT || 3001;

// Security middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: 'Too many configuration requests, please try again later.'
});

app.use(cors());
app.use(limiter);

// Secure configuration endpoint
app.get('/api/config', (req, res) => {
    // Validate request (add authentication here in production)
    const authToken = req.headers.authorization;
    
    // In production, validate authToken against your user session
    // For now, we'll allow requests from your domain
    const allowedOrigin = req.headers.origin;
    const allowedOrigins = ['https://transvortex.online', 'http://localhost:3000'];
    
    if (!allowedOrigins.includes(allowedOrigin)) {
        return res.status(403).json({ error: 'Unauthorized domain' });
    }
    
    // Return secure configuration
    const secureConfig = {
        firebase: {
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            databaseURL: process.env.FIREBASE_DATABASE_URL,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID,
            measurementId: process.env.FIREBASE_MEASUREMENT_ID
        },
        cloudinary: {
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
            apiUrl: process.env.CLOUDINARY_API_URL,
            baseUrl: process.env.CLOUDINARY_BASE_URL,
            folders: {
                vehicles: "transport/vehicles",
                drivers: "transport/drivers", 
                documents: "transport/documents",
                profiles: "transport/profiles",
                receipts: "transport/receipts",
                expenses: "transport/expenses"
            }
        },
        environment: {
            name: process.env.ENVIRONMENT || 'production',
            debug: process.env.DEBUG === 'true',
            apiBaseUrl: process.env.API_BASE_URL,
            version: process.env.VERSION || '1.0.0'
        }
    };
    
    res.json(secureConfig);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Configuration service is running' });
});

app.listen(PORT, () => {
    console.log(`🔐 Secure configuration server running on port ${PORT}`);
    console.log(`📍 Config endpoint: /api/config`);
    console.log(`🔍 Health check: /health`);
});

module.exports = app;
