import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, MessageSquare } from 'lucide-react';
import Typewriter from './Typewriter';
import API from '../utils/api';
import { getToken } from '../utils/authHelper';

const VoiceChatBot = ({ onMessage, initialMessages = [], currentSOP = '' }) => {
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [completedMessages, setCompletedMessages] = useState(new Set());
    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            recognitionRef.current = new window.webkitSpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                //console.log('Voice input:', transcript);
                const voicePrompt = `Current SOP: ${currentSOP}\n\nUser request: ${transcript}`;
                handleSendMessage(voicePrompt);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);

                const errorMessage = {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: 'Sorry, there was an error with voice recognition. Please try again or type your request.',
                    isError: true,
                    timestamp: new Date()
                };

                setMessages(prev => [...prev, errorMessage]);
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
    }, [isListening, currentSOP]);

    const startListening = () => {
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

    const stopListening = () => {
        recognitionRef.current.stop();
        setIsListening(false);
    };

    const toggleSpeaking = () => {
        setIsSpeaking(!isSpeaking);
        if (!isSpeaking && messages.length > 0) {
            speak(messages[messages.length - 1].content);
        } else {
            synthRef.current.cancel();
        }
    };

    const speak = (text) => {
        if (!isSpeaking) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        synthRef.current.speak(utterance);
    };

    const handleSendMessage = async (message = input) => {
        if (!message.trim()) return;

        const isVoiceWithSOP = message.includes('Current SOP:');

        const displayMessage = isVoiceWithSOP
            ? message.split('User request:')[1]?.trim() || message
            : message;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: displayMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            //console.log('Sending message to backend...');

            const token = getToken();
            if (!token) {
                throw new Error('Authentication required');
            }

            const backendMessage = isVoiceWithSOP
                ? message
                : `Current SOP: ${currentSOP}\n\nUser request: ${message}`;

            const response = await API.post('/ai/chat/sop',
                {
                    message: backendMessage,
                    context: `You are an AI assistant helping with Statement of Purpose (SOP) writing. ` +
                        `The current SOP content is provided in the message. When the user asks you to improve or modify it, ` +
                        `always return the updated SOP in a markdown code block. Keep your responses concise and focused.`
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            //console.log('Response received from backend');
            const responseText = response.data.response;

            const assistantMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: responseText,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);

            if (onMessage) {
                onMessage(assistantMessage.content);
            }

            if (isSpeaking) {
                speak(responseText);
            }

        } catch (error) {
            console.error('Error sending message:', error);

            const errorMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Sorry, I encountered an error processing your request. Please try again.',
                isError: true,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBotMessage = (message) => {
        setMessages(prev => [...prev, message]);
        setCompletedMessages(prev => new Set([...prev, message.id]));
        if (onMessage) onMessage(message);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSendMessage();
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] p-3 rounded-lg text-sm ${message.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : message.isError
                                    ? 'bg-red-50 border border-red-100 text-red-700'
                                    : 'bg-gray-50 text-gray-800 border border-gray-100'
                                } shadow-sm`}
                        >
                            {message.role === 'assistant' && !message.isError ? (
                                <Typewriter
                                    text={message.content}
                                    speed={5}
                                    className="leading-relaxed"
                                    onComplete={() => {
                                        if (!completedMessages.has(message.id)) {
                                            setCompletedMessages(prev => new Set([...prev, message.id]));
                                            if (isSpeaking) {
                                                speak(message.content);
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <p className="leading-relaxed">{message.content}</p>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-gray-200 p-3 bg-white">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full px-4 py-2.5 pr-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        disabled={isLoading}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (input.trim() && !isLoading) {
                                    handleSubmit(e);
                                }
                            }
                        }}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                        <button
                            type="button"
                            onMouseDown={startListening}
                            onMouseUp={stopListening}
                            onMouseLeave={isListening ? stopListening : undefined}
                            onTouchStart={startListening}
                            onTouchEnd={stopListening}
                            className={`p-1.5 rounded-full transition-colors ${isListening
                                ? 'text-white bg-red-500'
                                : 'text-gray-500 hover:bg-gray-100'
                                }`}
                            disabled={isLoading}
                        >
                            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
                        <button
                            type="button"
                            onClick={toggleSpeaking}
                            className={`p-1.5 rounded-full transition-colors ${isSpeaking
                                ? 'text-blue-600 bg-blue-100'
                                : 'text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            {isSpeaking ? <Volume2 size={18} /> : <VolumeX size={18} />}
                        </button>
                        <button
                            type="submit"
                            onClick={(e) => {
                                e.preventDefault();
                                if (input.trim() && !isLoading) {
                                    handleSubmit(e);
                                }
                            }}
                            className={`p-1.5 rounded-full transition-colors ${input.trim()
                                ? 'text-blue-600 hover:bg-blue-50'
                                : 'text-gray-400'
                                }`}
                            disabled={!input.trim() || isLoading}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
                <div className="mt-1.5 text-xs text-gray-400 text-center">
                    {isListening ? (
                        <span className="text-red-500">Listening... Speak now</span>
                    ) : (
                        'Press and hold the mic to speak'
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoiceChatBot;
