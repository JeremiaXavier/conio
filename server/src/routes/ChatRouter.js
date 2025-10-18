// src/routes/ChatRouter.js

const express = require('express');
// Assuming the path is correct based on your structure
const { getGeminiResponse, clearUserContext } = require('../api/gemini.js'); 
const { verifyFirebaseToken } = require('../middleware/auth.middleware.js');

const router = express.Router();

// --- Middleware ---

// Middleware to check for required prompt data
const validateChatRequest = (req, res, next) => {
    // Always validate required fields
    if (!req.body.prompt || typeof req.body.prompt !== 'string' || req.body.prompt.trim() === '') {
        return res.status(400).json({ error: 'Prompt is required and cannot be empty.' });
    }
    next();
};

// --- CHAT ENDPOINT ---

// POST /api/chat-server
// 1. verifyFirebaseToken: Ensures user is logged in and sets req.user.uid
// 2. validateChatRequest: Ensures the prompt exists
router.post('/chat-server', verifyFirebaseToken, validateChatRequest, async (req, res) => {
    const { prompt } = req.body;
    
    // 🔑 Critical Step: Get user info from the verified token (set by middleware)
    const userId = req.user.uid;
    const userEmail = req.user.email;

    console.log(`[Request] Authenticated chat from: ${userEmail} (${userId})`);

    // Graceful handling for missing API key (Development safety net)
    if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
            text: `[SERVICE UNAVAILABLE] Conio is currently in maintenance mode. Your prompt was: "${prompt.substring(0, 50)}..."`
        });
    }

    try {
        // Pass the unique userId to the stateful AI function
        const generatedText = await getGeminiResponse(prompt, userId);
        
        // Success response
        res.json({ 
            text: generatedText,
            userId: userId // Useful for frontend debugging/confirmation
        });

    } catch (error) {
        // Log the specific error for server-side debugging
        console.error(`[Server Error] User ${userId}:`, error.message);
        
        // Return a generic, safe 500 status to the client
        res.status(500).json({ 
            error: "An unexpected error occurred while generating a response. Please try again." 
        });
    }
});

// --- LOGOUT/CONTEXT RESET ENDPOINT (Highly Recommended) ---

// POST /api/chat-reset
// Allows the frontend to clear the user's chat context on logout or manually.
router.post('/chat-reset', verifyFirebaseToken, (req, res) => {
    const userId = req.user.uid;
    clearUserContext(userId);
    res.status(200).json({ message: "Chat context successfully reset." });
});


module.exports = router;