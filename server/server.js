const express = require('express');
const cors = require('cors'); // Import CORS middleware
const chatRouter = require('./src/routes/ChatRouter.js'); // Updated path
require('dotenv').config();
const app = express();
const port = 5000; // Using port 5000 as per your execution environment

// --- Core Middleware ---

// 0. CORS Configuration: IMPORTANT! Must be placed before any other routes/middleware.
// We configure CORS to accept requests ONLY from the specified frontend origin (localhost:5173).
const corsOptions = {
    // 💡 Rewritten to include multiple origins as an array
    origin: [
        'http://localhost:5173', // Your React development environment
        'https://jeremiaxavier.github.io', // Example: Your staging environment
        'https://conioai.web.app' // Example: Your production environment
    ], 
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization'
};
app.use(cors(corsOptions)); // Apply the custom options

// 1. Logging: Logs every incoming request.
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// 2. JSON Body Parsing: Allows the server to read JSON payloads from the frontend.
app.use(express.json());

// --- Router Mounting ---
app.use('/api', chatRouter);
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});
// --- Start Server ---
app.listen(port, () => {
    console.log('--- Server Started ---');
    console.log(`Server listening at http://localhost:${port}`);
    console.log(`API is active at http://localhost:${port}/api/chat-server`);
    
    if (!process.env.GEMINI_API_KEY) {
        console.warn('WARNING: GEMINI_API_KEY environment variable is NOT set. The server will return mock data.');
    }
});
