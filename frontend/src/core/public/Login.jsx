import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { Modal } from 'antd';
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import authApi from "../../services/authApi";
import { setToken, setRefreshToken, setUser } from "../../utils/authHelper";
import MfaVerification from "../../components/auth/MfaVerification";

// Import images using Vite's import.meta.glob
const logo = new URL('../../assets/logo.png', import.meta.url).href;
const loginImage = new URL('../../assets/login.jpg', import.meta.url).href;

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login: loginUser } = useAuth();

    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [mfaVerification, setMfaVerification] = useState({
        show: false,
        tempToken: '',
        user: null
    });

    const searchParams = new URLSearchParams(location.search);
    const redirectPath = searchParams.get('redirect');
    const fromVerify = location.state?.fromVerify;
    const verifyEmail = location.state?.email || '';

    useEffect(() => {
        if (verifyEmail) {
            setForm(prev => ({ ...prev, email: verifyEmail }));
        }
    }, [verifyEmail]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleLoginSuccess = (userData, tokens) => {
        const { accessToken, refreshToken, user } = tokens || userData;
        
        // Store tokens and user data
        if (accessToken) setToken(accessToken);
        if (refreshToken) setRefreshToken(refreshToken);
        if (user) setUser(user);

        // Update auth context
        loginUser(user || userData);

        // Show success message
        toast.success("Login successful!");

        // Redirect based on the user's previous location or role
        if (redirectPath) {
            navigate(redirectPath);
        } else if (fromVerify || user?.isNewUser) {
            navigate("/profile", { state: { fromLogin: true } });
        } else {
            navigate("/");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authApi.login({
                email: form.email,
                password: form.password,
            });

            // Check if MFA verification is required
            if (response.data.requiresMFA) {
                setMfaVerification({
                    show: true,
                    tempToken: response.data.tempToken,
                    user: response.data.user
                });
                return;
            }

            // If no MFA required, proceed with normal login
            handleLoginSuccess(response.data);
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.message || "Login failed. Please check your credentials.";
            setError(errorMessage);

            // Show toast for rate limiting errors
            if (err.response?.status === 429) {
                toast.error(errorMessage, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMfaVerificationComplete = (data) => {
        // Hide MFA verification
        setMfaVerification({
            show: false,
            tempToken: '',
            user: null
        });
        
        // Proceed with login using the returned data
        handleLoginSuccess(data);
    };

    const handleMfaBackToLogin = () => {
        setMfaVerification({
            show: false,
            tempToken: '',
            user: null
        });
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            {/* MFA Verification Modal */}
            <Modal
                title="Two-Factor Authentication"
                open={mfaVerification.show}
                onCancel={handleMfaBackToLogin}
                footer={null}
                width={400}
                centered
                closable={false}
                maskClosable={false}
            >
                <MfaVerification 
                    tempToken={mfaVerification.tempToken}
                    user={mfaVerification.user}
                    onBack={handleMfaBackToLogin}
                    onComplete={handleMfaVerificationComplete}
                />
            </Modal>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex w-full max-w-4xl bg-white rounded-lg shadow-2xl border-2 border-gray-300 overflow-hidden"
            >
                {/* Left: Form */}
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                    <div className="mb-8 flex flex-col items-center">
                        <img src={logo} alt="Logo" className="w-50 h-16 mb-2" />
                    </div>
                    <h2 className="text-2xl text-center font-bold mb-2">Welcome Back</h2>
                    <p className="mb-6 text-center text-gray-500">Please login to continue to your account.</p>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-1 font-medium" htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={form.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                                autoComplete="email"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium" htmlFor="password">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={form.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black pr-10"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="remember-me"
                                    className="ml-2 block text-sm text-gray-900"
                                >
                                    Remember me
                                </label>
                            </div>
                            <Link
                                to="/forgot-password"
                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition duration-200 disabled:opacity-50"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>
                    <p className="mt-6 text-center text-sm">
                        Need an account?{" "}
                        <Link to="/register" className="font-semibold underline">
                            Create one
                        </Link>
                    </p>
                </div>
                {/* Right: Image */}
                <div className="hidden md:block w-1/2 bg-gray-100">
                    <img
                        src={loginImage}
                        alt="Graduation"
                        className="object-cover w-full h-full rounded-r-lg"
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
