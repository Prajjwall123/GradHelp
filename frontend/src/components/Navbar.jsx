import React, { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, User, LogIn, Bell, BookOpen, School, Info, Mail, Home as HomeIcon, LogOut, User as UserIcon, FileText } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import whiteLogo from "../assets/white_logo.png";
import { isAuthenticated, getUserInfo, clearUserData } from "../utils/authHelper";
import { fetchNotifications } from "../utils/notificationsHelper";
import NotificationsModal from "./NotificationsModal";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const user = getUserInfo();
  const isLoggedIn = isAuthenticated();

  // Fetch notifications
  useEffect(() => {
    const fetchUserNotifications = async () => {
      if (isLoggedIn) {
        const notifications = await fetchNotifications();
        setNotifications(notifications);
        setUnreadCount(notifications.filter(n => !n.is_read).length);
      }
    };
    fetchUserNotifications();
  }, [isLoggedIn]);

  // Close dropdown when clicking outside
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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const handleLogout = () => {
    clearUserData();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <HomeIcon size={18} className="mr-2" /> },
    { name: 'Universities', path: '/universities', icon: <School size={18} className="mr-2" /> },
    { name: 'Programs', path: '/programs', icon: <BookOpen size={18} className="mr-2" /> },
    { name: 'About Us', path: '/about', icon: <Info size={18} className="mr-2" /> },
    { name: 'Contact Us', path: '/contact', icon: <Mail size={18} className="mr-2" /> },
    { name: 'Mock Interview', path: '/mock-visa-interview', icon: <User size={18} className="mr-2" /> }
  ];

  const userMenuItems = [
    {
      name: 'My Profile',
      path: '/profile',
      icon: <UserIcon size={16} className="mr-2 text-gray-500" />
    },
    {
      name: 'My Applications',
      path: '/my-applications',
      icon: <FileText size={16} className="mr-2 text-gray-500" />
    },
    {
      name: 'Notifications',
      onClick: () => setNotificationsOpen(true),
      icon: <Bell size={16} className="mr-2 text-gray-500" />
    },
    {
      name: 'Logout',
      onClick: handleLogout,
      icon: <LogOut size={16} className="mr-2 text-gray-500" />,
      isDanger: true
    }
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 bg-gray-900 border-b border-gray-800 ${scrolled ? 'bg-opacity-95 backdrop-blur-md shadow-xl' : ''}`}>
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex items-center space-x-3">
                <img
                  src={whiteLogo}
                  alt="Gradly Logo"
                  className="h-10 w-auto transition-transform duration-300 hover:scale-105"
                />
                <span className="text-xl font-extrabold text-white tracking-tight bg-clip-text bg-gradient-to-r from-white to-gray-200">
                  GRADLY
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
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${location.pathname === item.path
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}

            {/* User Menu */}
            {isLoggedIn ? (
              <div className="ml-6">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-xl hover:bg-gray-800 transition-colors duration-200 focus:outline-none relative"
                  >
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-medium relative">
                      {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <ChevronDown size={16} className={`text-gray-300 transition-transform duration-200 ${userDropdownOpen ? 'transform rotate-180' : ''}`} />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden z-50">
                      <div className="py-1">
                        <div className="px-4 py-3 border-b border-gray-700">
                          <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
                          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                        {userMenuItems.map((item) => (
                          <Link
                            key={item.name}
                            to={item.path}
                            onClick={(e) => {
                              if (item.onClick) {
                                e.preventDefault();
                                item.onClick();
                              }
                              setUserDropdownOpen(false);
                            }}
                            className={`flex items-center px-4 py-2.5 text-sm ${item.isDanger
                              ? 'text-red-400 hover:bg-red-900/50'
                              : 'text-gray-300 hover:bg-gray-700'
                              }`}
                          >
                            {item.icon}
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <LogIn size={18} className="mr-2" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === item.path
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
      />
    </nav>
  );
};

export default Navbar;
