import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser } from "../../utils/authHelper";
import logo from "../../assets/logo.png";
import login from "../../assets/login.jpg";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Get redirect path from URL query parameters and check if coming from verify
    const searchParams = new URLSearchParams(location.search);
    const redirectPath = searchParams.get('redirect');
    const fromVerify = location.state?.fromVerify;
    const verifyEmail = location.state?.email || '';

    // Pre-fill email if coming from verify
    useEffect(() => {
        if (verifyEmail) {
            setForm(prev => ({ ...prev, email: verifyEmail }));
        }
    }, [verifyEmail]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { isNewUser } = await loginUser({ email: form.email, password: form.password });
            toast.success("Login successful!");

            // Redirect based on the following priority:
            // 1. Redirect path from URL (if any)
            // 2. To profile if coming from verify or if it's a new user
            // 3. To home page as fallback
            if (redirectPath) {
                navigate(redirectPath);
            } else if (fromVerify || isNewUser) {
                navigate("/profile", { state: { fromLogin: true } });
            } else {
                navigate("/");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
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
                        <div className="flex justify-end">
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
                        src={login}
                        alt="Graduation"
                        className="object-cover w-full h-full rounded-r-lg"
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
