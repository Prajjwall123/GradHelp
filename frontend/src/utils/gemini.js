import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with API key from environment variables
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

// Common study visa document requirements
const STUDY_VISA_DOCS = `
1. Valid passport (6+ months validity)
2. DS-160 confirmation page
3. SEVIS I-901 fee receipt
4. Visa application fee receipt
5. Passport-size photo (recent)
6. Form I-20 (signed by you and school)
7. University acceptance letter
8. Academic documents (transcripts, diplomas, test scores)
9. Proof of financial support (bank statements, sponsor letters)
10. Proof of intent to return home (family ties, property, job offer)`;

// Common interview questions to reduce API calls
const COMMON_QUESTIONS = [
    "Why do you want to study in the US?",
    "Why did you choose this university?",
    "What is your intended major?",
    "How will you fund your education?",
    "What are your career goals after graduation?",
    "Do you have family in the US?",
    "Why not study in your home country?",
    "What do you know about this university?",
    "What makes you a good candidate?",
    "Where will you live during your studies?"
];

// Cache for storing responses
const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Function to get a random question without API call
const getRandomQuestion = () => {
    return COMMON_QUESTIONS[Math.floor(Math.random() * COMMON_QUESTIONS.length)];
};

// Generate a cache key
const getCacheKey = (type, ...args) => {
    return `${type}:${JSON.stringify(args)}`;
};

// Check cache before making API calls
const checkCache = (key) => {
    const cached = responseCache.get(key);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        return cached.data;
    }
    return null;
};

// Function to generate visa interview response
export const generateVisaInterviewResponse = async (messages) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Get the last user message
        const lastMessage = messages[messages.length - 1].content.toLowerCase();

        // Check for document-related queries
        if (lastMessage.includes('document') || lastMessage.includes('bring') || lastMessage.includes('need')) {
            return {
                success: true,
                message: `For your F-1 student visa interview, bring these documents:\n\n${STUDY_VISA_DOCS}\n\nTip: Organize them in a folder for easy access.`
            };
        }

        // Check for common questions
        if (lastMessage.includes('common question') || lastMessage.includes('ask') || lastMessage.includes('prepare')) {
            const questionsList = COMMON_QUESTIONS.map((q, i) => `${i + 1}. ${q}`).join('\n');
            return {
                success: true,
                message: `Common F-1 visa interview questions:\n\n${questionsList}\n\nPractice answering these clearly and honestly.`
            };
        }

        // For other queries, use the AI
        const chat = model.startChat({
            generationConfig: {
                temperature: 0.7,
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 500,
            },
            systemInstruction: {
                role: 'model',
                parts: [{
                    text: 'You are a helpful F-1 student visa interview assistant. Provide clear, concise answers. ' +
                        'Focus on study visa requirements and interview preparation. ' +
                        'Keep responses under 3 sentences when possible. ' +
                        'For document questions, refer to the standard F-1 visa requirements.'
                }]
            },
        });

        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        const text = response.text();

        return {
            success: true,
            message: text
        };
    } catch (error) {
        console.error('Error generating response:', error);
        return {
            success: false,
            message: 'Sorry, I encountered an error. Please try again.'
        };
    }
};

// Optimized interview scenario generation
export const generateVisaInterviewScenario = async (userProfile = {}) => {
    const cacheKey = getCacheKey('scenario', JSON.stringify(userProfile));
    const cached = checkCache(cacheKey);
    if (cached) return cached;

    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 150,
                responseMimeType: 'text/plain'
            }
        });

        const prompt = `Give a short greeting and ask the first question for an F1 visa interview. Keep it under 2 sentences.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const message = response.text().trim();

        const data = {
            success: true,
            message: message || getRandomQuestion()
        };

        responseCache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
    } catch (error) {
        console.error('Error generating scenario:', error);
        return {
            success: true, // Still return success to keep the flow going
            message: getRandomQuestion()
        };
    }
};

// Optimized interview continuation
export const continueVisaInterview = async (conversationHistory, userResponse) => {
    // Use a simpler cache key for continuation
    const cacheKey = getCacheKey('continue', userResponse.substring(0, 50));
    const cached = checkCache(cacheKey);
    if (cached) return cached;

    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 100,
                responseMimeType: 'text/plain'
            }
        });

        // Only send the last 2 messages for context to reduce payload
        const recentMessages = conversationHistory.slice(-2);
        const prompt = `As a visa officer, respond to this in 1-2 sentences: "${userResponse}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const message = response.text().trim();

        const data = {
            success: true,
            message: message || getRandomQuestion(),
            isComplete: message.toLowerCase().includes('thank you') ||
                message.toLowerCase().includes('good luck')
        };

        responseCache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
    } catch (error) {
        console.error('Error continuing interview:', error);
        return {
            success: true,
            message: getRandomQuestion(),
            isComplete: false
        };
    }
};

// Simplified performance analysis
export const analyzeInterviewPerformance = async (conversationHistory) => {
    try {
        // Only analyze the last 5 exchanges to reduce processing
        const recentExchanges = conversationHistory.slice(-10);
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 300,
                responseMimeType: 'text/plain'
            }
        });

        const prompt = `In 3 bullet points, provide feedback on this interview:\n${recentExchanges.map(m => `${m.role}: ${m.content}`).join('\n')}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;

        return {
            success: true,
            feedback: response.text().trim()
        };
    } catch (error) {
        console.error('Error analyzing interview:', error);
        return {
            success: false,
            feedback: 'Thank you for the practice! Remember to be clear and concise in your answers.'
        };
    }
};

// Function to analyze visa documents
export const analyzeVisaDocuments = async (documentText) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Analyze these F-1 visa documents. Be concise. Highlight any issues or missing items:
        
        ${documentText}
        
        Format response:
        1. Document type
        2. Key points
        3. Any issues found`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return {
            success: true,
            analysis: text
        };
    } catch (error) {
        console.error('Error analyzing documents:', error);
        return {
            success: false,
            analysis: 'Error analyzing documents. Please try again.'
        };
    }
};
