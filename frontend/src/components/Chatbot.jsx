import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, X, MessageSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import API from '../utils/api';
import { getToken } from '../utils/authHelper';

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
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const inputRef = useRef(null);

    const getContext = useCallback(() => {
        const path = location.pathname;
        const searchParams = new URLSearchParams(location.search);

        return `
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
           - View detailed program information
           - Submit applications
        
        4. Application Tracking:
           - View application status
           - Upload required documents
           - Check admission decisions
        
        Current page: ${path}
        Query parameters: ${searchParams.toString()}
        `;
    }, [location]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const handleSendMessage = async (message = input) => {
        if (!message.trim()) return;

        // Add user message to chat
        const userMessage = {
            id: messages.length + 1,
            text: message,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');

        // Add typing indicator
        const typingIndicator = {
            id: messages.length + 2,
            text: '...',
            sender: 'bot',
            isTyping: true,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, typingIndicator]);

        try {
            const token = getToken();
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await API.post('/ai/chat',
                {
                    message,
                    context: getContext()
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Remove typing indicator and add bot response
            setMessages(prev => [
                ...prev.filter(msg => !msg.isTyping),
                {
                    id: messages.length + 2,
                    text: response.data.response,
                    sender: 'bot',
                    timestamp: new Date()
                }
            ]);
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
                    className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center"
                    aria-label="Open chat"
                >
                    <MessageSquare size={24} />
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl flex flex-col z-50 overflow-hidden">
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                <h3 className="font-semibold">Study Abroad Assistant</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="text-white hover:bg-blue-700 p-1 rounded"
                        aria-label="Minimize chat"
                    >
                        <X size={18} />
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-blue-700 p-1 rounded"
                            aria-label="Close chat"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            <div
                ref={messagesContainerRef}
                className="flex-1 p-4 overflow-y-auto max-h-96"
            >
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
                    >
                        <div
                            className={`inline-block p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'}`}
                        >
                            {msg.text}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t">
                <div className="flex items-center">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        className="flex-1 border rounded-l-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        className="bg-blue-600 text-white p-2 rounded-r-lg hover:bg-blue-700 transition-colors"
                        aria-label="Send message"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
