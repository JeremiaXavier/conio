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

// 💡 PRODUCTION STATE MANAGEMENT: Map to store chat sessions, keyed by Firebase User ID (uid)
const userChatSessions = new Map();

// Configuration for the model's persona
const systemInstruction = "You are a friendly, helpful, and concise chat assistant. Keep your answers brief. Your name is conio. You can help with small questions related to technology or anything other than politics and government. do not answer political and social scenario questions";

// --- Session Management Utilities ---

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