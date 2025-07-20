const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('GEMINI_API_KEY is not defined in environment variables');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const getModelConfig = () => ({
    model: 'gemini-1.5-flash',
    generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 2048,
    },
    safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
});

// Generate SOP suggestion
router.post('/sop/suggest', authLimiter, async (req, res) => {
    try {
        const { prompt, currentSOP = '' } = req.body;

        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({
                error: 'Please provide a valid prompt. The prompt must be a non-empty string.'
            });
        }

        const model = genAI.getGenerativeModel(getModelConfig());

        const systemMessage = {
            role: 'user',
            parts: [{
                text: `You are an expert SOP (Statement of Purpose) assistant. Your task is to help students write compelling SOPs for university applications.
                
                INSTRUCTIONS:
                1. Always respond in valid JSON format with these fields:
                   - "message": Your chat response explaining the changes
                   - "updatedEssay": The complete updated SOP content (if changes were made)
                
                2. When the user asks for changes to the essay:
                   - Update the entire essay with the requested changes
                   - Return the complete updated essay in the "updatedEssay" field
                   - Explain what you changed in the "message" field
                
                3. For general questions:
                   - Keep the original essay content unchanged
                   - Set "updatedEssay" to null
                   - Provide your response in the "message" field
                
                Current SOP content:
                \`\`\`
                ${currentSOP || '[No content yet]'}
                \`\`\``
            }]
        };

        const chat = model.startChat({
            history: [systemMessage],
            generationConfig: {
                temperature: 0.7,
                response_mime_type: 'application/json',
            },
        });

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        let responseText = response.text();

        try {
            responseText = responseText.trim();
            if (responseText.startsWith('```json')) {
                responseText = responseText.slice(responseText.indexOf('{'), responseText.lastIndexOf('}') + 1);
            }
            const responseData = JSON.parse(responseText);

            res.json({
                message: responseData.message || 'I\'ve updated your SOP with the requested changes.',
                updatedEssay: responseData.updatedEssay || null
            });
        } catch (e) {
            console.error('Error parsing AI response:', e);
            res.json({
                message: responseText,
                updatedEssay: null
            });
        }
    } catch (error) {
        console.error('Error in generateSOPSuggestion:', error);
        res.status(500).json({
            error: 'Failed to generate SOP suggestion. Please try again later.'
        });
    }
});

// Analyze SOP
router.post('/sop/analyze', authLimiter, async (req, res) => {
    try {
        const { sopText } = req.body;

        if (!sopText || typeof sopText !== 'string' || sopText.trim().length < 50) {
            return res.status(400).json({
                error: 'Please provide a valid SOP with at least 50 characters for analysis.'
            });
        }

        const model = genAI.getGenerativeModel(getModelConfig());
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{
                        text: 'You are an expert academic advisor with years of experience reviewing Statements of Purpose. Provide detailed, constructive feedback on the following SOP.'
                    }],
                },
            ],
        });

        const prompt = `Please analyze this Statement of Purpose and provide detailed feedback covering these aspects:
        1. Overall clarity and coherence
        2. Structure and logical flow
        3. Grammar and language use
        4. Strengths and areas for improvement
        5. Specific suggestions for enhancement

        SOP: ${sopText}`;

        const result = await chat.sendMessage(prompt);
        const response = await result.response;

        res.json({ data: response.text() });
    } catch (error) {
        console.error('Error in analyzeSOP:', error);
        res.status(500).json({
            error: 'Failed to analyze SOP. Please try again later.'
        });
    }
});

// Chat endpoint
router.post('/chat', authLimiter, async (req, res) => {
    try {
        const { message, context } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                error: 'Please provide a valid message.'
            });
        }

        const model = genAI.getGenerativeModel(getModelConfig());

        const chatPrompt = `
            ${context || ''}
            
            Current page: ${req.headers.referer || 'Unknown'}
            Current time: ${new Date().toLocaleString()}
            User's message: "${message}"
            
            Guidelines for your response:
            1. Be specific about where to find features in the application
            2. Provide step-by-step guidance for multi-step processes
            3. If the user is at a specific step (like profile completion), focus on that step
            4. For application-related questions, remind about prerequisites (like profile completion)
            5. Keep responses concise but thorough
            6. If the user needs to complete a previous step, guide them there first
            7. For SOP-related questions, offer specific writing tips or structural advice
            8. If you're not sure about something, direct them to the support team
            
            Current task: Provide helpful guidance based on the user's message and their current location in the application flow.
        `;

        const result = await model.generateContent(chatPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({
            error: 'Failed to process chat message. Please try again later.'
        });
    }
});

module.exports = router;
