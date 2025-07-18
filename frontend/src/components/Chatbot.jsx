import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, X, MessageSquare } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useLocation } from 'react-router-dom';

const Chatbot = ({ onClose }) => {
    const location = useLocation();
    const [isMinimized, setIsMinimized] = useState(true);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm your Study Abroad Assistant. I can help you find programs, write SOPs, and answer your questions about studying abroad. How can I assist you today?",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(true);
    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const inputRef = useRef(null);

    // Get context based on current route and user flow
    const getContext = useCallback(() => {
        const path = location.pathname;
        const searchParams = new URLSearchParams(location.search);

        // Main user flow context
        const userFlowContext = `
        You are a helpful assistant for a study abroad platform. Here's how the platform works:
        
        1. User Registration & Verification:
           - Users register an account
           - Verify their email with OTP
           - Log in to access the platform
        
        2. Profile Setup (required before applying):
           - Personal Information
           - Education Details:
             * Highest level of education
             * Program studied
             * Institution name
             * Transcript upload
        
        3. Application Process:
           - Browse universities at /university
           - Explore programs at /programs
           - Click 'Apply' on desired program
           - Choose intake period
           - Review entry requirements
           - Agree to terms and conditions
        
        4. SOP & Submission:
           - After application creation, go to /my-applications
           - Use the AI SOP Writer tool to create/update Statement of Purpose
           - Submit the application with the SOP
           - Track application status
           - Receive notifications about acceptance/decisions
        
        Important Notes:
        - Profile completion is mandatory before applying
        - Each application requires a unique SOP
        - Users can track all applications in one place
        - Support is available for any step in the process
        `;

        // Page-specific context
        let pageContext = '';
        if (path.includes('/university')) {
            pageContext = 'The user is browsing universities. Help them find the right university based on their preferences, or explain how to compare different institutions.';
        } else if (path.includes('/programs')) {
            pageContext = 'The user is exploring study programs. Help them understand program requirements, duration, fees, or how to find programs that match their profile.';
        } else if (path.includes('/profile')) {
            pageContext = 'The user is managing their profile. Help them complete required information, update details, or understand why certain information is needed for applications.';
        } else if (path.includes('/my-applications')) {
            pageContext = 'The user is viewing their applications. Help them track status, submit missing documents, or understand next steps in the application process.';
        } else if (path.includes('/sop-writer')) {
            pageContext = 'The user is using the SOP Writer tool. Help them craft a strong Statement of Purpose, provide writing tips, or explain how to highlight their qualifications.';
        } else if (path.includes('/apply/')) {
            pageContext = 'The user is in the application process. Guide them through selecting an intake, understanding requirements, or completing the application form.';
        } else if (path.includes('/auth')) {
            pageContext = 'The user is in the authentication section. Help them with login, registration, or account recovery processes.';
        }

        return userFlowContext + '\n\n' + pageContext;
    }, [location]);

    // Initialize Gemini with context
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            recognitionRef.current = new window.webkitSpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                handleSendMessage(transcript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                if (isListening) {
                    recognitionRef.current.start();
                }
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [isListening]);

    // Auto-scroll to bottom of messages
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (error) {
                console.error('Error starting speech recognition:', error);
            }
        }
    };

    const toggleSpeaking = () => {
        if (!isSpeaking) {
            // If we're turning speaking on, cancel any ongoing speech first
            if (synthRef.current.speaking) {
                synthRef.current.cancel();
            }
        } else {
            // If we're turning speaking off, stop any ongoing speech
            if (synthRef.current.speaking) {
                synthRef.current.cancel();
            }
        }
        setIsSpeaking(!isSpeaking);
    };

    const speak = (text) => {
        if (!isSpeaking) return;

        if (synthRef.current.speaking) {
            synthRef.current.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        synthRef.current.speak(utterance);
    };

    const handleSendMessage = async (message = input) => {
        if (!message.trim()) return;

        // Add user message
        const userMessage = {
            id: messages.length + 1,
            text: message,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');

        // Show typing indicator
        const typingIndicator = {
            id: messages.length + 2,
            text: '...',
            sender: 'bot',
            isTyping: true,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, typingIndicator]);

        try {
            // Get AI response with context
            const context = getContext();
            const prompt = `
                ${context}
                
                Current page: ${window.location.pathname}
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

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Remove typing indicator and add bot response
            setMessages(prev => [
                ...prev.filter(msg => !msg.isTyping),
                {
                    id: messages.length + 2,
                    text: text,
                    sender: 'bot',
                    timestamp: new Date()
                }
            ]);

            // Speak the response
            speak(text);
        } catch (error) {
            console.error('Error getting AI response:', error);
            setMessages(prev => [
                ...prev.filter(msg => !msg.isTyping),
                {
                    id: messages.length + 2,
                    text: 'Sorry, I encountered an error. Please try again.',
                    sender: 'bot',
                    timestamp: new Date()
                }
            ]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (isMinimized) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={() => setIsMinimized(false)}
                    className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-transform hover:scale-110"
                >
                    <MessageSquare size={24} />
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-96 bg-white rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200" style={{ maxHeight: '80vh' }}>
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                <h3 className="font-semibold text-lg">Study Abroad Assistant</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={toggleSpeaking}
                        className="p-1 rounded-full hover:bg-blue-500 transition-colors"
                        title={isSpeaking ? 'Mute' : 'Unmute'}
                    >
                        {isSpeaking ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </button>
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="p-1 rounded-full hover:bg-blue-500 transition-colors"
                        title="Minimize"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                className="flex-1 p-4 overflow-y-auto bg-gray-50"
                style={{ maxHeight: 'calc(80vh - 180px)', minHeight: '200px' }}
            >
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white border border-gray-200 rounded-bl-none'
                                    }`}
                            >
                                {message.isTyping ? (
                                    <div className="flex space-x-1 py-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                ) : (
                                    <p className="text-sm">{message.text}</p>
                                )}
                                <p className="text-xs opacity-70 mt-1 text-right">
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-3 bg-white">
                <div className="flex items-end space-x-2">
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me about anything"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows="1"
                            style={{ minHeight: '44px', maxHeight: '120px' }}
                        />
                        <button
                            onClick={toggleListening}
                            className={`absolute right-2 bottom-2 p-1 rounded-full ${isListening ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
                            title={isListening ? 'Stop listening' : 'Voice input'}
                        >
                            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>
                    </div>
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={!input.trim() || messages.some(m => m.isTyping)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                    Ask about programs, applications, or study abroad advice
                </p>
            </div>
        </div>
    );
};

export default Chatbot;
