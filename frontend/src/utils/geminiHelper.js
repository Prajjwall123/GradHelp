import API from './api';
import { getAuthToken } from './authHelper';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not defined in environment variables');
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
        const token = getAuthToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await API.post('/ai/sop/suggest', {
            prompt,
            currentSOP
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            data: response.data.message,
            error: null,
            updatedEssay: response.data.updatedEssay
        };
    } catch (error) {
        console.error('Error in generateSOPSuggestion:', error);
        let errorMessage = 'Error: Failed to generate SOP suggestion. ';

        if (error.response?.data?.error) {
            errorMessage += error.response.data.error;
        } else if (error.message === 'Authentication required') {
            errorMessage = 'Please log in to use this feature.';
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
        const token = getAuthToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await API.post('/ai/sop/analyze', {
            sopText
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return { data: response.data.data, error: null };
    } catch (error) {
        console.error('Error in analyzeSOP:', error);
        let errorMessage = 'Error: Failed to analyze SOP. ';

        if (error.response?.data?.error) {
            errorMessage += error.response.data.error;
        } else if (error.message === 'Authentication required') {
            errorMessage = 'Please log in to use this feature.';
        } else if (error.message) {
            errorMessage += error.message;
        } else {
            errorMessage += 'An unknown error occurred.';
        }

        return { data: null, error: errorMessage };
    }
};