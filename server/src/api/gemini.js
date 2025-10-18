// ../api/gemini.js (The Stateful Core Logic)

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY || ""; 
const model = 'gemini-2.5-flash-preview-09-2025';

if (!apiKey) {
    // Note: We don't throw here; we let the router handle the "missing key" case 
    // to potentially return a graceful mock response.
    console.warn("❌ model not configured. AI requests will fail.");
}

const ai = new GoogleGenAI({ apiKey });
const SESSION_INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; 
// Check for expired sessions every 1 minute
const CLEANUP_INTERVAL_MS = 60 * 1000;
// 💡 PRODUCTION STATE MANAGEMENT: Map to store chat sessions, keyed by Firebase User ID (uid)
const userChatSessions = new Map();

// Configuration for the model's persona
const systemInstruction = "You are a friendly, helpful, and concise chat assistant. Keep your answers brief. Your name is conio by JeremiaXavier Corporation. You can help with small questions related to technology or anything other than politics and government. Do not answer about illegal questions such as pornography,sex,hacking or criminal contexts";

// --- Session Management Utilities ---
function runSessionCleanup() {
    const now = Date.now();
    let cleanedCount = 0;
    
    // Iterate over all keys (user IDs) in the Map
    for (const [userId, sessionWrapper] of userChatSessions.entries()) {
        const timeElapsed = now - sessionWrapper.lastAccess;

        if (timeElapsed > SESSION_INACTIVITY_TIMEOUT_MS) {
            // Session has expired due to inactivity
            userChatSessions.delete(userId);
            cleanedCount++;
            console.log(`[Chat Cleanup] Session expired for ${userId} after ${Math.round(timeElapsed / 60000)} minutes.`);
        }
    }

    if (cleanedCount > 0) {
        console.log(`[ Chat Cleanup] Total ${cleanedCount} expired sessions removed.`);
    }
}


// 🚀 Start the cleanup timer when the server module loads
console.log(`[Chat Cleanup] Starting cleanup job. Checking for expired sessions every ${CLEANUP_INTERVAL_MS / 1000} seconds.`);
setInterval(runSessionCleanup, CLEANUP_INTERVAL_MS).unref(); // unref allows Node.js to exit gracefully
/**
 * Gets or creates a chat session for a specific user ID.
 * Uses the systemInstruction once during creation to set the persona.
 * @param {string} userId - The Firebase User ID (uid).
 * @returns {object} The Gemini Chat object for the user.
 */
function getOrCreateChatSession(userId) {
    if (userChatSessions.has(userId)) {
        return userChatSessions.get(userId);
    }

    // --- Create a new, ISOLATED chat session ---
    const newChat = ai.chats.create({
        model: model,
        config: {
            systemInstruction: systemInstruction,
            // You can add other configs like temperature here
            // temperature: 0.7, 
        },
    });

    // Store the new session linked to the unique userId
    userChatSessions.set(userId, newChat);
    console.log(`[Gemini Chat] 🔑 New session created for user: ${userId}`);
    return newChat;
}

/**
 * Sends a message, maintaining context by using the user's isolated chat session.
 * @param {string} prompt - The user's input message.
 * @param {string} userId - The unique ID of the user (Firebase uid).
 * @returns {Promise<string>} The generated text response.
 */
async function getGeminiResponse(prompt, userId) {
    if (!apiKey) {
        throw new Error("AI service is unavailable due to missing API key.");
    }
    
    try {
        // 1. Get the isolated, stateful chat session for the current user
        const chat = getOrCreateChatSession(userId);

        // 2. Use chat.sendMessage() to handle history automatically
        const response = await chat.sendMessage({ message: prompt });
        
        return response.text;

    } catch (error) {
        console.error(`[AI server Error for ${userId}]:`, error.message);
        // Re-throw a standardized error for the router to catch
        throw new Error("Failed to communicate with the AI model. Please try again.");
    }
}

/**
 * Clears a user's context from memory (essential for memory management).
 * This should be called on user logout or after a period of inactivity.
 * @param {string} userId 
 */
function clearUserContext(userId) {
    if (userChatSessions.has(userId)) {
        userChatSessions.delete(userId);
        console.log(`[JXai Chat] 🗑️ Context cleared for user: ${userId}`);
    }
}

module.exports = { 
    getGeminiResponse,
    clearUserContext 
};