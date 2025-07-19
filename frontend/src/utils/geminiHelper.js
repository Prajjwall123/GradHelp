import { GoogleGenerativeAI } from '@google/generative-ai';


const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not defined in environment variables');
}


let genAI;
try {
    genAI = new GoogleGenerativeAI(apiKey);
} catch (error) {
    console.error('Failed to initialize GoogleGenerativeAI:', error);
    throw new Error('Failed to initialize AI service');
}


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


export const generateSOPSuggestion = async (prompt, currentSOP = '') => {
    if (!prompt || typeof prompt !== 'string') {
        const error = 'Error: Please provide a valid prompt. The prompt must be a non-empty string.';
        console.error(error);
        return { data: null, error, updatedEssay: null };
    }

    try {
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

        console.log('Raw AI Response:', responseText);

        try {
            
            responseText = responseText.trim();

            
            if (responseText.startsWith('```json')) {
                responseText = responseText.slice(responseText.indexOf('{'), responseText.lastIndexOf('}') + 1);
            }

            
            const responseData = JSON.parse(responseText);

            
            console.log('Parsed Response:', responseData);

            
            return {
                data: responseData.message || 'I\'ve updated your SOP with the requested changes.',
                error: null,
                updatedEssay: responseData.updatedEssay || null
            };
        } catch (e) {
            console.error('Error parsing AI response:', e);
            
            return {
                data: responseText,
                error: null,
                updatedEssay: null
            };
        }
    } catch (error) {
        console.error('Error in generateSOPSuggestion:', error);
        let errorMessage = 'Error: Failed to generate SOP suggestion. ';

        if (error.message?.includes('API key not valid')) {
            errorMessage += 'The API key is invalid. Please check your configuration.';
        } else if (error.message?.includes('quota')) {
            errorMessage += 'API quota exceeded. Please try again later or check your API usage limits.';
        } else if (error.message) {
            errorMessage += error.message;
        } else {
            errorMessage += 'An unknown error occurred.';
        }

        return { data: null, error: errorMessage, updatedEssay: null };
    }
};


export const analyzeSOP = async (sopText) => {
    if (!sopText || typeof sopText !== 'string' || sopText.trim().length < 50) {
        const error = 'Error: Please provide a valid SOP with at least 50 characters for analysis.';
        console.error(error);
        return { data: null, error };
    }

    try {
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
        return { data: response.text(), error: null };
    } catch (error) {
        console.error('Error in analyzeSOP:', error);
        let errorMessage = 'Error: Failed to analyze SOP. ';

        if (error.message?.includes('API key not valid')) {
            errorMessage += 'The API key is invalid. Please check your configuration.';
        } else if (error.message?.includes('quota')) {
            errorMessage += 'API quota exceeded. Please try again later or check your API usage limits.';
        } else if (error.message) {
            errorMessage += error.message;
        } else {
            errorMessage += 'An unknown error occurred.';
        }

        return { data: null, error: errorMessage };
    }
};