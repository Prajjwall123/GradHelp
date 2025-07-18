import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Save, ExternalLink, MessageSquare, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import VoiceChatBot from '../../components/VoiceChatBot';
import Typewriter from '../../components/Typewriter';
import Chatbot from '../../components/Chatbot';
import './SOPWriter.css';
import { updateApplicationSOP } from '../../utils/applicationHelper';

const SOPWriter = () => {
    const [content, setContent] = useState('');
    const [isUpdatingEssay, setIsUpdatingEssay] = useState(false);
    const [displayedContent, setDisplayedContent] = useState('');
    const [courseData, setCourseData] = useState({
        courseName: 'Computer Science',
        universityName: 'Stanford University',
        courseId: 'cs101',
        university_photo: null
    });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const textareaRef = useRef(null);
    const editorRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const isInitialMount = useRef(true);

    // Initialize with data from route state
    useEffect(() => {
        if (location.state?.course && location.state?.university) {
            console.log('University data:', location.state.university);
            setCourseData({
                courseName: location.state.course.course_name || 'Computer Science',
                universityName: location.state.university.university_name || 'Stanford University',
                courseId: location.state.course._id || 'cs101',
                university_photo: location.state.university.university_photo || null
            });
            if (location.state.currentSOP) {
                setContent(location.state.currentSOP);
                setDisplayedContent(location.state.currentSOP);
            }
        }
    }, [location.state]);

    // Handle content updates with typewriter effect
    const handleContentUpdate = useCallback((newContent) => {
        if (!newContent || newContent === content) return;

        // Store scroll position
        const editor = editorRef.current;
        const scrollTop = editor?.scrollTop || 0;

        // Update content
        setContent(newContent);
        setIsUpdatingEssay(true);

        // Restore scroll position after update
        requestAnimationFrame(() => {
            if (editor) {
                editor.scrollTop = scrollTop;
            }
        });
    }, [content]);

    const handleTypewriterComplete = useCallback(() => {
        setIsUpdatingEssay(false);
        setDisplayedContent(content);
    }, [content]);

    const handleViewCourse = () => {
        navigate(`/course/${courseData.courseId}`);
    };

    const handleSubmit = async () => {
        setShowConfirmModal(true);
    };

    const handleConfirmSubmit = async () => {
        try {
            // Get application ID from location state
            const applicationId = location.state?.applicationId;
            if (!applicationId) {
                throw new Error('No application ID found');
            }

            // Update SOP in the backend
            await updateApplicationSOP(applicationId, content);

            // Show success toast
            toast.success('SOP updated successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            // Close the modal
            setShowConfirmModal(false);

            // Navigate back to applications page after a short delay
            setTimeout(() => {
                navigate('/my-applications');
            }, 1500);
        } catch (error) {
            console.error('Error submitting SOP:', error);
            toast.error(error.response?.data?.message || 'Failed to update SOP. Please try again.');
            setShowConfirmModal(false);
        }
    };

    const handleCancelSubmit = () => {
        setShowConfirmModal(false);
    };

    // Handle messages from the chatbot
    const handleBotMessage = useCallback((message) => {
        if (message.updatedEssay) {
            handleContentUpdate(message.updatedEssay);
        }
    }, [handleContentUpdate]);

    // Word and character count
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const characterCount = content.length;

    // Initial message for the chatbot
    const initialMessages = [{
        id: 1,
        role: 'assistant',
        content: 'Hello! I\'m your SOP Assistant. I can help you write and improve your Statement of Purpose. How can I assist you today?',
        timestamp: new Date()
    }];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-20 flex-1">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                    {/* Course Header */}
                    <div className="bg-gray-900 text-white shadow-lg rounded-lg overflow-hidden border border-gray-800">
                        <div className="px-6 py-5 sm:px-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0 bg-gray-800 p-3 rounded-lg">
                                        {courseData.university_photo ? (
                                            <img
                                                src={`http://localhost:3000/api/images/${courseData.university_photo}`}
                                                alt={`${courseData.universityName} logo`}
                                                className="w-12 h-12 object-contain rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                                                <span className="text-2xl font-bold text-white">
                                                    {courseData.universityName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-white">{courseData.courseName}</h1>
                                        <p className="text-gray-300 mt-1">{courseData.universityName}</p>
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <button
                                        onClick={handleViewCourse}
                                        className="inline-flex items-center px-5 py-2.5 border border-gray-600 text-sm font-medium rounded-lg text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        View Course
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Editor and Chat Layout */}
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
                        {/* Editor Section */}
                        <div
                            ref={editorRef}
                            className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 flex flex-col"
                            style={{ height: 'calc(100vh - 280px)' }}
                        >
                            {/* Editor Header */}
                            <div className="bg-gray-50 px-6 py-3.5 border-b border-gray-200 flex justify-between items-center">
                                <div className="text-sm font-medium text-gray-700">
                                    {wordCount} words • {characterCount} characters
                                </div>
                                <button
                                    onClick={handleViewCourse}
                                    className="lg:hidden inline-flex items-center px-3.5 py-1.5 border border-gray-300 text-xs rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                    View Course
                                </button>
                            </div>

                            {/* Editor Content */}
                            <div className="flex-1 overflow-auto">
                                <div className={`essay-container ${isUpdatingEssay ? 'updating' : ''}`}>
                                    {isUpdatingEssay ? (
                                        <div className="p-6">
                                            <Typewriter
                                                text={content}
                                                speed={1}
                                                onComplete={handleTypewriterComplete}
                                                className="whitespace-pre-wrap text-base leading-relaxed text-gray-800"
                                                scrollContainer={editorRef.current}
                                                preventScroll={true}
                                            />
                                        </div>
                                    ) : (
                                        <textarea
                                            ref={textareaRef}
                                            className="essay-editor w-full p-6 text-base leading-relaxed text-gray-800 focus:outline-none resize-none bg-white"
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Start writing your Statement of Purpose here..."
                                            style={{
                                                minHeight: '100%',
                                                lineHeight: '1.75',
                                                width: '100%'
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Editor Footer */}
                            <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-200">
                                <div className="flex justify-center">
                                    <button
                                        onClick={handleSubmit}
                                        className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                    >
                                        <Save className="w-4 h-4 mr-2 text-white" />
                                        Submit SOP
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Chat Section */}
                        <div className="lg:col-span-1 flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
                                <div className="bg-gray-900 px-5 py-3.5">
                                    <h3 className="text-white font-semibold flex items-center">
                                        <MessageSquare className="w-5 h-5 mr-2" />
                                        SOP Assistant
                                    </h3>
                                </div>
                                <div className="flex-1 overflow-auto">
                                    <VoiceChatBot
                                        onMessage={handleBotMessage}
                                        initialMessages={initialMessages}
                                        currentSOP={content}
                                        disableAutoScroll={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Chatbot />
            <Footer />

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Confirm Submission</h3>
                            <button
                                onClick={handleCancelSubmit}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="mb-6">
                            <p className="text-gray-600">Are you sure you want to submit this SOP? This action cannot be undone.</p>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handleCancelSubmit}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmSubmit}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SOPWriter;
