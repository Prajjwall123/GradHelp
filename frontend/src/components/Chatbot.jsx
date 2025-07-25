import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, X, MessageSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import API from '../utils/api';
import { getToken } from '../utils/authHelper';
import { sanitizeInput, sanitizeHTML } from '../utils/sanitize';

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

    const handleInputChange = (e) => {
        const sanitizedValue = sanitizeInput(e.target.value);
        setInput(sanitizedValue);
    };

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
        }

        const messageToSend = input.trim();
        if (!messageToSend) return;

        const sanitizedMessage = sanitizeInput(messageToSend);

        const userMessage = {
            id: messages.length + 1,
            text: sanitizedMessage,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');

        try {
            const token = getToken();
            if (!token) {
                throw new Error('You need to be logged in to chat');
            }

            const context = getContext();

            const response = await API.post('/ai/chat', {
                message: sanitizedMessage,
                context: context
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const botResponse = {
                id: messages.length + 2,
                text: sanitizeHTML(response.data.response),
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botResponse]);
        } catch (error) {
            console.error('Error sending message:', error);

            const errorMessage = {
                id: messages.length + 2,
                text: 'Sorry, I encountered an error. Please try again later.',
                sender: 'bot',
                timestamp: new Date(),
                isError: true
            };

            setMessages(prev => [...prev, errorMessage]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSendMessage();
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
                            dangerouslySetInnerHTML={{ __html: msg.text }}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type your message..."
                        className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label="Type your message"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label="Send message"
                        onClick={handleSendMessage}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Chatbot;
