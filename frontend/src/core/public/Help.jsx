import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, User, BookOpen, CheckCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const faqs = [
    {
        question: 'How do I create an account?',
        answer: 'Click on the "Register" button on the login page and fill in your details including your full name, email, and a strong password. You\'ll receive a verification email to activate your account.'
    },
    {
        question: 'I forgot my password. How can I reset it?',
        answer: 'Click on "Forgot Password" on the login page. Enter your email address, and we\'ll send you a password reset link with an OTP to create a new password.'
    },
    {
        question: 'What are the password requirements?',
        answer: 'Your password must be at least 8 characters long and include: at least one uppercase letter, one number, and one special character (!@#$%^&*).'
    },
    {
        question: 'How do I complete my profile?',
        answer: 'After logging in, you\'ll be guided through a step-by-step process to complete your profile, including personal information, education history, visa details, and English test scores.'
    },
    {
        question: 'How do I track my application status?',
        answer: 'Once you\'ve submitted your application, you can track its status in your dashboard. You\'ll also receive email notifications about any updates.'
    },
    {
        question: 'What documents do I need to apply?',
        answer: 'You\'ll need your academic transcripts, passport, English test results (if applicable), and any other supporting documents relevant to your application.'
    }
];

const howItWorks = [
    {
        icon: <User className="w-6 h-6 text-blue-600" />,
        title: 'Create Your Account',
        description: 'Sign up with your email and create a secure password to get started with your application.'
    },
    {
        icon: <BookOpen className="w-6 h-6 text-green-600" />,
        title: 'Complete Your Profile',
        description: 'Fill in your personal details, education history, and upload required documents.'
    },
    {
        icon: <CheckCircle className="w-6 h-6 text-purple-600" />,
        title: 'Submit Application',
        description: 'Review your information and submit your application for processing.'
    },
    {
        icon: <CheckCircle className="w-6 h-6 text-yellow-600" />,
        title: 'Get Updates',
        description: 'Receive real-time updates about your application status via email and in your dashboard.'
    }
];

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-200 py-4">
            <button
                className="flex justify-between items-center w-full text-left font-medium text-gray-700 hover:text-black focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{question}</span>
                {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            {isOpen && (
                <div className="mt-2 text-gray-600">
                    <p>{answer}</p>
                </div>
            )}
        </div>
    );
};

const Help = () => {
    const [activeTab, setActiveTab] = useState('faq');

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8 mt-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        How can we help you?
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                        Find answers to common questions about using our platform.
                    </p>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('faq')}
                            className={`${activeTab === 'faq' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            FAQs
                        </button>
                        <button
                            onClick={() => setActiveTab('how-it-works')}
                            className={`${activeTab === 'how-it-works' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            How It Works
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        {activeTab === 'faq' && (
                            <div className="divide-y divide-gray-200">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                                <div className="space-y-4">
                                    {faqs.map((faq, index) => (
                                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'how-it-works' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-8">How Our Application Works</h2>
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {howItWorks.map((step, index) => (
                                        <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
                                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 mb-4">
                                                {step.icon}
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">{step.title}</h3>
                                            <p className="text-gray-600">{step.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Help;
