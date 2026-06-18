const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain'
};

const server = http.createServer((req, res) => {
    // Clean up URL path
    let urlPath = req.url.split('?')[0];
    
    // Serve index.html for root path
    if (urlPath === '/' || urlPath === '') {
        urlPath = '/index.html';
    }

    // Secure config API endpoint mock
    if (urlPath === '/api/config') {
        res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        
        let config = {};
        try {
            // Define window on global object so evm.js can run in Node.js without errors
            global.window = {};
            
            // Clear require cache to ensure fresh load
            delete require.cache[require.resolve('./evm.js')];
            const evm = require('./evm.js');
            
            config = {
                firebase: global.window.FIREBASE_CONFIG || evm.FIREBASE_CONFIG,
                cloudinary: global.window.CLOUDINARY_CONFIG || evm.CLOUDINARY_CONFIG,
                environment: global.window.ENVIRONMENT || evm.ENVIRONMENT,
                razorpay: global.window.RAZORPAY_CONFIG || evm.RAZORPAY_CONFIG,
                security: global.window.SECURITY_CONFIG || evm.SECURITY_CONFIG
            };
        } catch (e) {
            console.error('⚠️ Could not load configuration from evm.js:', e.message);
            // Minimal fallback configuration
            config = {
                firebase: {
                    apiKey: "AIzaSyDAlk_K8p8Of8Ne6Jpcl2QqXTtm95NgG7o",
                    authDomain: "transport-dashboard-ad69a.firebaseapp.com",
                    databaseURL: "https://transport-dashboard-ad69a-default-rtdb.asia-southeast1.firebasedatabase.app",
                    projectId: "transport-dashboard-ad69a",
                    storageBucket: "transport-dashboard-ad69a.appspot.com",
                    messagingSenderId: "526889676196",
                    appId: "1:526889676196:web:66032c80a4aede690ae531",
                    measurementId: "G-7F9R7HJYDH"
                }
            };
        }
        res.end(JSON.stringify(config));
        return;
    }

    // Client-side logging endpoint
    if (urlPath === '/api/log' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            console.log('🔴 [CLIENT LOG]:', body);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Logged');
        });
        return;
    }

    // Construct local file path
    const filePath = path.join(__dirname, urlPath);

    // Security check: ensure path is within the directory
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    // Read and serve the file
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Check if file exists with .html extension (nice URLs)
            const htmlFilePath = filePath + '.html';
            fs.stat(htmlFilePath, (htmlErr, htmlStats) => {
                if (!htmlErr && htmlStats.isFile()) {
                    serveFile(htmlFilePath, '.html', res);
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>404 Not Found</h1><p>The requested file was not found on this server.</p>');
                }
            });
        } else {
            const ext = path.extname(filePath).toLowerCase();
            serveFile(filePath, ext, res);
        }
    });
});

function serveFile(filePath, ext, res) {
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    stream.on('error', (err) => {
        console.error('File stream error:', err);
        if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('500 Internal Server Error');
        }
    });
    stream.pipe(res);
}

server.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 TransVortex Local Server is running!`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`==================================================\n`);
});
