import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Mic, MicOff, Volume2, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { generateVisaInterviewScenario, continueVisaInterview, analyzeInterviewPerformance } from '../../utils/gemini';
import { getUserInfo } from '../../utils/authHelper';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { toast } from 'react-toastify';

// Memoize the speech synthesis voices
const useVoices = () => {
    const [voices, setVoices] = useState([]);

    useEffect(() => {
        const updateVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            // Prefer natural-sounding voices
            const preferredVoices = availableVoices.filter(v =>
                v.lang.includes('en-') &&
                (v.name.includes('Natural') || v.name.includes('Natural'))
            );
            setVoices(preferredVoices.length ? preferredVoices : availableVoices);
        };

        window.speechSynthesis.onvoiceschanged = updateVoices;
        updateVoices();

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    return voices;
};

const MockVisaInterview = () => {
    const [isListening, setIsListening] = useState(false);
    const [conversation, setConversation] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isInterviewComplete, setIsInterviewComplete] = useState(false);
    const [feedback, setFeedback] = useState('');
    const recognitionRef = useRef(null);
    const synthRef = useRef(null);
    const utteranceRef = useRef(null);
    const conversationEndRef = useRef(null);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const voices = useVoices();
    const userProfile = useMemo(() => getUserInfo(), []);

    // Set the best available voice when voices are loaded
    useEffect(() => {
        if (voices.length > 0 && !selectedVoice) {
            // Prefer female voices
            const femaleVoices = voices.filter(v => {
                const voiceName = v.name.toLowerCase();
                return voiceName.includes('female') ||
                    voiceName.includes('woman') ||
                    voiceName.includes('zira') ||  // Common female voice in Windows
                    voiceName.includes('samantha') ||  // Common female voice in macOS
                    voiceName.includes('karen');  // Common female voice in some systems
            });

            // If no explicitly female voices found, try to find natural-sounding ones
            const naturalVoices = voices.filter(v =>
                v.name.toLowerCase().includes('natural')
            );

            // Use the first available in this order: female voices > natural voices > any voice
            setSelectedVoice(
                femaleVoices[0] ||
                naturalVoices[0] ||
                voices[0]
            );
        }
    }, [voices, selectedVoice]);

    // Initialize speech synthesis and recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Initialize speech synthesis
            synthRef.current = window.speechSynthesis;

            // Initialize speech recognition
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = false;
                recognitionRef.current.lang = 'en-US';

                recognitionRef.current.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    if (transcript.trim()) {
                        handleUserResponse(transcript);
                    }
                };

                recognitionRef.current.onerror = (event) => {
                    if (event.error !== 'no-speech') {
                        console.error('Speech recognition error', event.error);
                        toast.error('Error with speech recognition. Please try again.');
                    }
                    setIsListening(false);
                };

                recognitionRef.current.onspeechend = () => {
                    if (isListening) {
                        recognitionRef.current.stop();
                        setIsListening(false);
                    }
                };
            } else {
                toast.error('Speech recognition is not supported in your browser. Try Chrome or Edge.');
            }
        }

        // Start the interview when component mounts
        startInterview();

        return () => {
            // Cleanup
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (synthRef.current && synthRef.current.speaking) {
                synthRef.current.cancel();
            }
        };
    }, []);

    // Auto-scroll to bottom of conversation
    useEffect(() => {
        if (conversationEndRef.current) {
            conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [conversation, feedback]);

    // Speak text using the Web Speech API with optimizations
    const speak = useCallback((text) => {
        return new Promise((resolve) => {
            if (!text || !synthRef.current) return resolve();

            // Cancel any ongoing speech
            if (synthRef.current.speaking) {
                synthRef.current.cancel();
            }

            const utterance = new SpeechSynthesisUtterance(text);

            // Optimize speech settings
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            // Use the selected natural voice if available
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            } else if (voices.length > 0) {
                // Fallback to first available voice
                utterance.voice = voices[0];
            }

            // Set up event handlers
            utterance.onend = () => {
                setIsSpeaking(false);
                resolve();
            };

            utterance.onerror = (event) => {
                console.error('SpeechSynthesis error:', event);
                setIsSpeaking(false);
                resolve();
            };

            // Start speaking
            utteranceRef.current = utterance;
            synthRef.current.speak(utterance);
            setIsSpeaking(true);
        });
    }, [selectedVoice, voices]);

    // Start a new interview
    const startInterview = async () => {
        try {
            setIsLoading(true);
            setConversation([]);
            setIsInterviewComplete(false);
            setFeedback('');

            const response = await generateVisaInterviewScenario(userProfile);
            if (response.success) {
                const newMessage = { role: 'officer', content: response.message };
                setConversation([newMessage]);
                await speak(response.message);
            } else {
                toast.error('Failed to start interview. Please try again.');
            }
        } catch (error) {
            console.error('Error starting interview:', error);
            toast.error('An error occurred while starting the interview.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle user's spoken response
    const handleUserResponse = async (userText) => {
        if (!userText.trim()) return;

        const userMessage = { role: 'applicant', content: userText };
        setConversation(prev => [...prev, userMessage]);

        try {
            setIsLoading(true);
            const response = await continueVisaInterview(conversation, userText);

            if (response.success) {
                const officerMessage = { role: 'officer', content: response.message };
                setConversation(prev => [...prev, officerMessage]);

                if (response.isComplete) {
                    setIsInterviewComplete(true);
                    // Don't wait for analysis to finish before showing the message
                    analyzeInterviewPerformance([...conversation, officerMessage])
                        .then(analysis => {
                            if (analysis.success) {
                                setFeedback(analysis.feedback);
                            }
                        });
                }

                await speak(response.message);
            }
        } catch (error) {
            console.error('Error processing response:', error);
            toast.error('An error occurred while processing your response.');
        } finally {
            setIsLoading(false);
        }
    };

    // Toggle microphone on/off
    const toggleListening = useCallback(() => {
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
                toast.info('Listening... Speak now.', { autoClose: 1500 });
            } catch (error) {
                console.error('Error starting recognition:', error);
                toast.error('Error starting voice recognition. Please try again.');
            }
        }
    }, [isListening]);

    // Replay the last message
    const replayLastMessage = useCallback(() => {
        if (conversation.length > 0) {
            const lastMessage = conversation[conversation.length - 1];
            if (lastMessage.role === 'officer') {
                speak(lastMessage.content);
            }
        }
    }, [conversation, speak]);

    // Memoize the conversation items to prevent unnecessary re-renders
    const conversationItems = useMemo(() => {
        return conversation.map((msg, index) => (
            <div
                key={index}
                className={`flex ${msg.role === 'officer' ? 'justify-start' : 'justify-end'}`}
            >
                <div
                    className={`max-w-3/4 rounded-lg px-4 py-2 ${msg.role === 'officer'
                        ? 'bg-blue-50 text-gray-800 border border-blue-100'
                        : 'bg-blue-600 text-white'
                        }`}
                >
                    <p className="font-medium text-sm text-blue-700">
                        {msg.role === 'officer' ? 'Visa Officer' : 'You'}
                    </p>
                    <p className="mt-1">{msg.content}</p>
                </div>
            </div>
        ));
    }, [conversation]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8 mt-16">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                        <div className="p-6 border-b border-gray-100">
                            <h1 className="text-2xl font-semibold text-gray-800">
                                Mock F1 Visa Interview
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Practice your visa interview with our AI-powered mock interview
                            </p>
                        </div>

                        <div className="p-6">
                            <div className="h-96 overflow-y-auto mb-6 p-4 border border-gray-200 rounded-lg bg-white">
                                {conversation.length === 0 ? (
                                    <div className="h-full flex items-center justify-center">
                                        <p className="text-gray-500 text-center">
                                            {isLoading ? (
                                                <span className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Preparing your interview...
                                                </span>
                                            ) : 'Click the microphone button to start speaking'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {conversationItems}
                                        {isLoading && (
                                            <div className="flex justify-start">
                                                <div className="bg-blue-50 rounded-lg px-4 py-2 border border-blue-100">
                                                    <div className="flex space-x-2">
                                                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div ref={conversationEndRef} />
                            </div>

                            <div className="flex flex-wrap justify-center gap-3">
                                <button
                                    onClick={toggleListening}
                                    disabled={isLoading || isSpeaking || isInterviewComplete}
                                    className={`flex items-center px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${isListening
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isListening ? (
                                        <>
                                            <MicOff className="mr-2" size={18} />
                                            Stop Listening
                                        </>
                                    ) : (
                                        <>
                                            <Mic className="mr-2" size={18} />
                                            {isSpeaking ? 'Please wait...' : 'Speak Your Answer'}
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={replayLastMessage}
                                    disabled={conversation.length === 0 || isSpeaking || isInterviewComplete}
                                    className="flex items-center px-5 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Volume2 className="mr-2" size={18} />
                                    Replay
                                </button>

                                <button
                                    onClick={startInterview}
                                    className="flex items-center px-5 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors"
                                >
                                    <RotateCcw className="mr-2" size={18} />
                                    Restart
                                </button>
                            </div>
                        </div>
                    </div>

                    {isInterviewComplete && feedback && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                            <div className="flex items-center mb-4">
                                <CheckCircle className="text-green-500 mr-2" size={20} />
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Interview Complete - Your Feedback
                                </h3>
                            </div>
                            <div className="prose max-w-none text-gray-700 mb-6" dangerouslySetInnerHTML={{
                                __html: feedback.replace(/\n/g, '<br>').replace(/•/g, '• ')
                            }} />
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                                    <AlertCircle className="mr-2" size={18} />
                                    Tips for Your Real Interview
                                </h4>
                                <ul className="list-disc pl-5 space-y-1 text-blue-700">
                                    <li>Be concise and to the point in your answers</li>
                                    <li>Bring all required documents in an organized manner</li>
                                    <li>Dress professionally and arrive early</li>
                                    <li>Be honest and consistent with your responses</li>
                                    <li>Practice common questions but don't sound rehearsed</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default React.memo(MockVisaInterview);
