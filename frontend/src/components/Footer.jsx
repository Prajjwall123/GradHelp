import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import whiteLogo from "../assets/white_logo.png";
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-black text-gray-200 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Logo and Description */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <img
                                src={whiteLogo}
                                alt="GradHelp Logo"
                                className="h-8 w-auto"
                            />
                            <span className="text-xl font-bold text-white drop-shadow">GRADHELP</span>
                        </div>
                        <p className="text-sm text-gray-400">
                            Empowering students to find their perfect educational path with our comprehensive university search platform.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 text-lg">Quick Links</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center">
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-2"></span>
                                Home
                            </Link></li>
                            <li><Link to="/universities" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center">
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-2"></span>
                                Universities
                            </Link></li>
                            <li><Link to="/programs" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center">
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-2"></span>
                                Programs
                            </Link></li>
                            <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center">
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-2"></span>
                                About Us
                            </Link></li>
                            <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center">
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-2"></span>
                                Contact
                            </Link></li>
                            <li><Link to="/help" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center">
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-2"></span>
                                Help
                            </Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 text-lg">Contact Us</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start space-x-3 group">
                                <div className="p-1.5 bg-gray-800 rounded-full group-hover:bg-gray-600 transition-all duration-300 transform group-hover:scale-110">
                                    <Mail className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-gray-300 group-hover:text-white transition-colors duration-300">info@gradhelp.com</span>
                            </li>
                            <li className="flex items-start space-x-3 group">
                                <div className="p-1.5 bg-gray-800 rounded-full group-hover:bg-gray-600 transition-all duration-300 transform group-hover:scale-110">
                                    <Phone className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-gray-300 group-hover:text-white transition-colors duration-300">+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-start space-x-3 group">
                                <div className="p-1.5 bg-gray-700 rounded-full group-hover:bg-gray-500 transition-all duration-300 transform group-hover:scale-110 mt-1">
                                    <MapPin className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-gray-300 group-hover:text-white transition-colors duration-300">123 Education Street,<br />San Francisco, CA 94107</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-800 mt-12 pt-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <p className="text-center text-sm text-gray-400">
                            &copy; {new Date().getFullYear()} GradHelp. All rights reserved.
                        </p>
                        <div className="mt-2 flex justify-center space-x-6">
                            <a href="#" className="text-gray-400 hover:text-white text-xs transition-colors duration-200 hover:underline">Privacy Policy</a>
                            <span className="text-gray-500">•</span>
                            <a href="#" className="text-gray-400 hover:text-white text-xs transition-colors duration-200 hover:underline">Terms of Service</a>
                            <span className="text-gray-500">•</span>
                            <a href="#" className="text-gray-400 hover:text-white text-xs transition-colors duration-200 hover:underline">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
