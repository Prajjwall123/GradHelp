import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Chatbot from '../../components/Chatbot';
import { submitContactForm } from '../../utils/contactHelper';

const validateForm = (formData) => {
    const errors = {};

    if (!formData.name.trim()) {
        errors.name = 'Name is required';
    } else if (formData.name.length > 100) {
        errors.name = 'Name must be less than 100 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
        errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
    } else if (formData.email.length > 100) {
        errors.email = 'Email must be less than 100 characters';
    }

    if (!formData.subject.trim()) {
        errors.subject = 'Subject is required';
    } else if (formData.subject.length > 200) {
        errors.subject = 'Subject must be less than 200 characters';
    }

    if (!formData.message.trim()) {
        errors.message = 'Message is required';
    } else if (formData.message.length > 2000) {
        errors.message = 'Message must be less than 2000 characters';
    }

    return errors;
};

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    }, [errors]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formErrors = validateForm(formData);
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            await submitContactForm(formData);

            const sanitizedSubject = formData.subject.replace(/<[^>]*>?/gm, '');
            toast.success(`Thank you for your message about "${sanitizedSubject}". We'll get back to you soon!`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
            });

            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });
            setErrors({});

        } catch (error) {
            console.error('Error submitting form:', error);

            const safeErrorMessage = error.message.replace(/<[^>]*>?/gm, '');
            const errorMessage = error.status === 429
                ? 'Too many requests from this IP, please try again later'
                : safeErrorMessage || 'Failed to send message. Please try again later.';

            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const MAP_CENTER = '27.70632835018817,85.32993628072732';
    const MAP_ZOOM = '15';
    const MAP_URL = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.169674072031!2d85.32993628072732!3d27.70632835018817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDQyJzIyLjgiTiA4NcKwMTknNDcuOCJF!5e0!3m2!1sen!2snp!4v1620000000000!5m2!1sen!2snp&z=${MAP_ZOOM}`;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <Chatbot />
            <main className="flex-grow py-12 px-4 sm:px-6 mt-16">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Form and Contact Info */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Contact Form */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4 }}
                                className="bg-white p-8 rounded-xl shadow-md"
                            >
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a message</h2>
                                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1">
                                            <label htmlFor="name" className="text-sm font-medium text-gray-700">
                                                Your Name {errors.name && <span className="text-red-500 text-xs">({errors.name})</span>}
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-2.5 border ${errors.name ? 'border-red-500' : 'border-gray-300'
                                                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700`}
                                                required
                                                disabled={isSubmitting}
                                                maxLength={100}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                                Email Address {errors.email && <span className="text-red-500 text-xs">({errors.email})</span>}
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-2.5 border ${errors.email ? 'border-red-500' : 'border-gray-300'
                                                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700`}
                                                required
                                                disabled={isSubmitting}
                                                maxLength={100}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="subject" className="text-sm font-medium text-gray-700">
                                            Subject {errors.subject && <span className="text-red-500 text-xs">({errors.subject})</span>}
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 border ${errors.subject ? 'border-red-500' : 'border-gray-300'
                                                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700`}
                                            required
                                            disabled={isSubmitting}
                                            maxLength={200}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="message" className="text-sm font-medium text-gray-700">
                                            Your Message {errors.message && <span className="text-red-500 text-xs">({errors.message})</span>}
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows="4"
                                            value={formData.message}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 border ${errors.message ? 'border-red-500' : 'border-gray-300'
                                                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700`}
                                            required
                                            disabled={isSubmitting}
                                            maxLength={2000}
                                        />
                                    </div>
                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-5 w-5 mr-2" />
                                                    Send Message
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>

                            {/* Contact Info Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                {/* Phone */}
                                <div className="bg-white p-5 rounded-xl shadow-md flex items-start">
                                    <div className="bg-blue-100 p-2.5 rounded-lg mr-3.5">
                                        <Phone className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-800 text-sm">Phone</h3>
                                        <p className="text-gray-600 text-sm mt-0.5">+977 9803948966</p>
                                        <p className="text-gray-600 text-sm">+977 980-000-000</p>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="bg-white p-5 rounded-xl shadow-md flex items-start">
                                    <div className="bg-blue-100 p-2.5 rounded-lg mr-3.5">
                                        <Mail className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-800 text-sm">Email</h3>
                                        <p className="text-gray-600 text-sm mt-0.5">info.gradly@gmail.com</p>
                                        <p className="text-gray-600 text-sm">support@gradly.com</p>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="bg-white p-5 rounded-xl shadow-md flex items-start">
                                    <div className="bg-blue-100 p-2.5 rounded-lg mr-3.5">
                                        <MapPin className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-800 text-sm">Location</h3>
                                        <p className="text-gray-600 text-sm mt-0.5">Peepalbot, Dillibazar</p>
                                        <p className="text-gray-600 text-sm">Kathmandu, Nepal</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Map */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="h-full rounded-xl overflow-hidden shadow-md"
                        >
                            <iframe
                                src={MAP_URL}
                                width="100%"
                                height="100%"
                                style={{ minHeight: '500px' }}
                                allowFullScreen
                                loading="lazy"
                                title="Our Location"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="rounded-xl"
                            />
                        </motion.div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ContactUs;
