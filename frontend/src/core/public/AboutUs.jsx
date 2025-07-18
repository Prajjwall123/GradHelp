import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Chatbot from '../../components/Chatbot';
import graduationImg from "../../assets/graduation.png";
import aboutImage from "../../assets/about.png";
import profileSideImage from "../../assets/profile-side-image.jpg";
import vecteezyImg from "../../assets/graduation.png";
import testimonial1 from "../../assets/testimonial1.jpg";
import testimonial2 from "../../assets/testimonial2.jpg";
import testimonial3 from "../../assets/testimonial3.jpg";
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';


export default function AboutUs() {
    const navigate = useNavigate();
    const testimonials = [
        {
            id: 1,
            name: "Sandesh Sapkota",
            content: "The platform helped me find the perfect scholarship that covered my tuition. The application process was seamless!",
            image: testimonial1
        },
        {
            id: 2,
            name: "Nikesh Bhandari",
            content: "The university matching system connected me with programs I didn't even know existed. Highly recommended!",
            image: testimonial2
        },
        {
            id: 3,
            name: "Prabin Tiwari",
            content: "The SOP writing tool was a game-changer for my applications. Got accepted to my dream school!",
            image: testimonial3
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main className="flex-grow mt-16">
                {/* Hero Section */}
                <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src={profileSideImage}
                            alt="Students achieving academic success"
                            className="w-full h-full object-cover object-center"
                            style={{
                                objectPosition: 'center 40%',
                                width: '100%',
                                height: '100%',
                                transform: 'scale(1.2)'
                            }}
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/30 flex items-center">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                            <div className="max-w-2xl">
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
                                >
                                    Empowering Students to Achieve Their Academic Dreams
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="text-lg md:text-xl text-gray-200 max-w-xl"
                                >
                                    Connecting ambitious students with world-class education opportunities
                                </motion.p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="mb-10 lg:mb-0"
                            >
                                <img
                                    src={aboutImage}
                                    alt="About Us"
                                    className="rounded-xl shadow-2xl w-full h-auto"
                                />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                                    We believe that every student deserves access to quality education. Our platform was built to simplify the complex process of finding and applying to universities and scholarships worldwide.
                                </p>
                                <div className="space-y-6">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full">
                                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-medium text-gray-900">University Matching</h3>
                                            <p className="mt-1 text-gray-600">Discover and compare universities that align with your academic goals and preferences.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full">
                                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-medium text-gray-900">AI-Powered Assistance</h3>
                                            <p className="mt-1 text-gray-600">Get personalized recommendations and support through our advanced AI system.</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Services Section */}
                <div className="py-16 bg-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="text-sm text-gray-400 tracking-widest mb-1"
                        >
                            Our Services
                        </motion.p>
                        <motion.h3
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-4xl font-extrabold text-[#16213E] mb-12"
                        >
                            Our Vision & Our Goal
                        </motion.h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    title: "University Browsing",
                                    description: "Easily browse through multiple universities and find the one that matches your requirements the best.",
                                    icon: (
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17L12 21L19 17V13.18L12 17L5 13.18Z" fill="#1E40AF" />
                                        </svg>
                                    ),
                                    bgColor: "bg-blue-50",
                                    delay: 0.2
                                },
                                {
                                    title: "Scholarship Finder",
                                    description: "Discover and apply for scholarships that match your profile and academic achievements.",
                                    icon: (
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 1L3 5V11C3 16.55 6.16 21.74 12 23C17.84 21.74 21 16.55 21 11V5L12 1ZM12 11.99H19C18.47 16.11 15.72 19.78 12 20.93V12H5V6.3L12 3.19V11.99Z" fill="#047857" />
                                        </svg>
                                    ),
                                    bgColor: "bg-green-50",
                                    delay: 0.3
                                },
                                {
                                    title: "SOP Writing",
                                    description: "Create compelling Statements of Purpose with our AI-powered writing assistant.",
                                    icon: (
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M15 15H17C18.1 15 19 14.1 19 13V5C19 3.9 18.1 3 17 3H7C5.9 3 5 3.9 5 5V13C5 14.1 5.9 15 7 15H9V19L12 17L15 19V15ZM7 5H17V13H14.17L12 14.17L9.83 13H7V5Z" fill="#5B21B6" />
                                        </svg>
                                    ),
                                    bgColor: "bg-purple-50",
                                    delay: 0.4
                                }
                            ].map((service, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: 0.5,
                                        delay: service.delay,
                                        type: "spring",
                                        stiffness: 100
                                    }}
                                    whileHover={{
                                        y: -5,
                                        transition: { duration: 0.2 }
                                    }}
                                    className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center h-full"
                                >
                                    <div className={`${service.bgColor} p-3 rounded-full mb-4`}>
                                        {service.icon}
                                    </div>
                                    <h4 className="font-semibold text-xl mb-2 text-[#16213E]">
                                        {service.title}
                                    </h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {service.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Testimonials */}
                <div className="bg-gray-50 py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-3xl font-extrabold text-gray-900 sm:text-4xl"
                            >
                                What Our Students Say
                            </motion.h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {testimonials.map((testimonial, index) => (
                                <motion.div
                                    key={testimonial.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.1,
                                        type: "spring",
                                        stiffness: 100
                                    }}
                                    className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center text-center"
                                >
                                    {/* Profile Image */}
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg mb-6">
                                        <img
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Quote */}
                                    <div className="relative mb-6">
                                        <Quote className="w-8 h-8 text-gray-200 absolute -top-4 -left-2" />
                                        <p className="text-gray-600 italic relative z-10">
                                            {testimonial.content}
                                        </p>
                                        <Quote className="w-8 h-8 text-gray-200 absolute -bottom-4 -right-2 transform rotate-180" />
                                    </div>

                                    {/* Name */}
                                    <h4 className="font-semibold text-lg text-gray-900 mb-4">
                                        {testimonial.name}
                                    </h4>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="max-w-3xl mx-auto"
                        >
                            <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-6">
                                Ready to Start Your Journey?
                            </h2>
                            <p className="text-xl text-blue-100 mb-8">
                                Explore our programs and find the perfect fit for your academic goals.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/programs')}
                                className="bg-white text-blue-700 hover:bg-blue-50 font-medium py-3 px-8 rounded-lg shadow-lg transition-all duration-300"
                            >
                                Explore Programs
                            </motion.button>
                        </motion.div>
                    </div>
                </div>
                <Chatbot />
            </main>
            <Footer />
        </div>
    );
}