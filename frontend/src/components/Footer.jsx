import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import whiteLogo from "../assets/white_logo.png";
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Logo and Description */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <img
                                src={whiteLogo}
                                alt="Gradly Logo"
                                className="h-8 w-auto"
                            />
                            <span className="text-xl font-bold text-white">GRADLY</span>
                        </div>
                        <p className="text-sm text-gray-400">
                            Empowering students to find their perfect educational path with our comprehensive university search platform.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                            <li><Link to="/universities" className="hover:text-white transition-colors">Universities</Link></li>
                            <li><Link to="/programs" className="hover:text-white transition-colors">Programs</Link></li>
                            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                            <li><Link to="/help" className="hover:text-white transition-colors">Help</Link></li>
                            <li><Link to="/cost-of-living-calculator" className="hover:text-white transition-colors">Cost of Living Calculator</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contact Info</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start space-x-2">
                                <MapPin size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>Peepalbot Dillibazar, Kathmandu, Nepal</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Phone size={18} className="text-blue-500" />
                                <span>+977 9803948966</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Mail size={18} className="text-blue-500" />
                                <span>info.gradly@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-800 mt-12 pt-6 text-center text-sm text-gray-500">
                    <p> {new Date().getFullYear()} Gradly. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
