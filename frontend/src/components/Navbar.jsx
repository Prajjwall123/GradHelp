import React, { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, User, LogIn, BookOpen, School, Info, Mail, Home as HomeIcon, LogOut, User as UserIcon, FileText, Shield, Crown } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import whiteLogo from "../assets/white_logo.png";
import { isAuthenticated, clearUserData } from "../utils/authHelper";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const isLoggedIn = isAuthenticated();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => document.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };


  const handleLogout = () => {
    clearUserData();
    // navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <HomeIcon size={18} className="mr-2" /> },
    { name: 'Universities', path: '/universities', icon: <School size={18} className="mr-2" /> },
    { name: 'Programs', path: '/programs', icon: <BookOpen size={18} className="mr-2" /> },
    { name: 'About Us', path: '/about', icon: <Info size={18} className="mr-2" /> },
    { name: 'Contact Us', path: '/contact', icon: <Mail size={18} className="mr-2" /> },
  ];

  const userMenuItems = [
    {
      name: 'My Profile',
      path: '/profile',
      icon: <UserIcon size={16} className="mr-2 text-gray-500" />
    },
    {
      name: 'My Plan',
      path: '/my-plan',
      icon: <Crown size={16} className="mr-2 text-yellow-500" />
    },
    {
      name: 'My Applications',
      path: '/my-applications',
      icon: <FileText size={16} className="mr-2 text-gray-500" />
    },
    {
      name: 'Logout',
      onClick: handleLogout,
      icon: <LogOut size={16} className="mr-2 text-gray-500" />,
      isDanger: true
    }
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 bg-black border-b border-gray-800 ${scrolled ? 'bg-opacity-95 backdrop-blur-md shadow-xl' : ''}`}>
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex items-center space-x-3">
                <img
                  src={whiteLogo}
                  alt="GradHelp"
                  className="h-10 w-auto transition-transform duration-300 hover:scale-105"
                />
                <span className="text-xl font-extrabold text-white tracking-tight bg-clip-text bg-gradient-to-r from-white to-gray-200">
                  GradHelp
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-1 justify-center items-center space-x-1">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${location.pathname === item.path
                  ? 'bg-black text-white'
                  : 'text-gray-300 hover:bg-black hover:text-white'
                  }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <div className="relative">
                  <div>
                    <button
                      type="button"
                      className="flex items-center max-w-xs rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      id="user-menu-button"
                      onClick={toggleUserDropdown}
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-9 w-9 rounded-full bg-gray-800 flex items-center justify-center border border-gray-600 hover:border-gray-500 transition-colors duration-200">
                        <UserIcon className="h-4.5 w-4.5 text-gray-300" />
                      </div>
                    </button>
                  </div>

                  {userDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-xl py-1.5 bg-gray-900 border border-gray-800 focus:outline-none z-50">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-800 transition-colors duration-200"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <UserIcon size={16} className="w-5 h-5 mr-3 text-gray-400" />
                        <span>Your Profile</span>
                      </Link>
                      <Link
                        to="/my-plan"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-800 transition-colors duration-200"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <Crown size={16} className="w-5 h-5 mr-3 text-yellow-500" />
                        <span>My Plan</span>
                      </Link>
                      <Link
                        to="/my-applications"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-800 transition-colors duration-200"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <FileText size={16} className="w-5 h-5 mr-3 text-blue-400" />
                        <span>Your Applications</span>
                      </Link>
                      <Link
                        to="/settings/security"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-800 transition-colors duration-200"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <Shield size={16} className="w-5 h-5 mr-3 text-purple-400" />
                        <span>Security Settings</span>
                      </Link>
                      <div className="border-t border-gray-800 my-1"></div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setUserDropdownOpen(false);
                        }}
                        className="flex w-full items-center px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 transition-colors duration-200"
                      >
                        <LogOut size={16} className="w-5 h-5 mr-3" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200"
                >
                  <LogIn size={18} className="mr-2" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="ml-4 px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white transition-colors duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-gray-900 shadow-xl border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`${location.pathname === item.path
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    } block px-3 py-2 rounded-md text-base font-medium`}
                  onClick={toggleMobileMenu}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}

              {isLoggedIn ? (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="flex items-center px-5">
                    <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-600">
                      <UserIcon className="h-6 w-6 text-gray-300" />
                    </div>
                  </div>
                  <div className="mt-3 px-2 space-y-1">
                    <Link
                      to="/profile"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                      onClick={toggleMobileMenu}
                    >
                      Your Profile
                    </Link>
                    <Link
                      to="/my-plan"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                      onClick={toggleMobileMenu}
                    >
                      My Plan
                    </Link>
                    <Link
                      to="/my-applications"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                      onClick={toggleMobileMenu}
                    >
                      Your Applications
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        toggleMobileMenu();
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="space-y-1">
                    <Link
                      to="/login"
                      className="block w-full px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full px-4 py-2 text-base font-medium text-center text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      Sign up
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
