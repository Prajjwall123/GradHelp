import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { registerUser } from "../../utils/authHelper";
import logo from "../../assets/logo.png";
import register from "../../assets/register.png";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { motion } from "framer-motion";

const passwordRequirements = [
    { id: 'length', text: 'At least 8 characters', regex: /.{8,}/ },
    { id: 'uppercase', text: 'At least one uppercase letter', regex: /[A-Z]/ },
    { id: 'number', text: 'At least one number', regex: /[0-9]/ },
    { id: 'special', text: 'At least one special character', regex: /[!@#$%^&*(),.?":{}|<>]/ },
];

const getPasswordStrength = (password) => {
    if (!password) return 0;

    let strength = 0;
    const requirements = [
        /.{8,}/,      // min length
        /[A-Z]/,      // uppercase
        /[0-9]/,      // number
        /[^A-Za-z0-9]/ // special char
    ];

    // Check each requirement
    requirements.forEach(req => {
        if (req.test(password)) strength += 25;
    });

    return strength;
};

const getStrengthColor = (strength) => {
    if (strength <= 25) return 'bg-red-500';
    if (strength <= 50) return 'bg-yellow-500';
    if (strength <= 75) return 'bg-blue-500';
    return 'bg-green-500';
};

const Register = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordChecks, setPasswordChecks] = useState(
        passwordRequirements.reduce((acc, req) => ({
            ...acc,
            [req.id]: false
        }), {})
    );
    const [loading, setLoading] = useState(false);

    const validatePassword = (password) => {
        const checks = {};
        passwordRequirements.forEach(req => {
            checks[req.id] = req.regex.test(password);
        });
        setPasswordChecks(checks);
        setPasswordStrength(getPasswordStrength(password));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'password') {
            validatePassword(value);
        }
    };

    const validateForm = () => {
        // Check if all password requirements are met
        const allChecksPassed = Object.values(passwordChecks).every(Boolean);

        if (form.password !== form.confirmPassword) {
            toast.error("Passwords do not match");
            return false;
        }

        if (!allChecksPassed) {
            toast.error("Please ensure your password meets all requirements");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            await registerUser({
                fullName: form.fullName,
                email: form.email,
                password: form.password,
            });
            toast.success("Registration successful! Please verify your email.");
            navigate("/verify-otp", { state: { email: form.email } });
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || "Registration failed. Please try again.");
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
                {/* Left: Image */}
                <div className="hidden md:block w-1/2 bg-gray-100">
                    <img
                        src={register}
                        alt="University"
                        className="object-cover w-full h-full rounded-l-lg"
                    />
                </div>
                {/* Right: Form */}
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                    <div className="mb-8 flex flex-col items-center">
                        <img src={logo} alt="Logo" className="w-50 h-16 mb-2" />
                    </div>
                    <h2 className="text-2xl text-center font-bold mb-2">Register Account</h2>
                    <p className="mb-6 text-center text-gray-500">Please enter your details to create an account.</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-1 font-medium" htmlFor="fullName">Full Name</label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                required
                                value={form.fullName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                                autoComplete="name"
                            />
                        </div>
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
                            <label className="block mb-1 font-medium" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={form.password}
                                    onChange={handleChange}
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => setPasswordFocused(false)}
                                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            {/* Password Strength Meter */}
                            {form.password && (
                                <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${getStrengthColor(passwordStrength)}`}
                                            style={{ width: `${passwordStrength}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs mt-1 text-gray-500">
                                        Password Strength: {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Good' : 'Strong'}
                                    </p>
                                </div>
                            )}

                            {/* Password Requirements */}
                            {(passwordFocused || form.password) && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                                    <p className="font-medium mb-2">Password must contain:</p>
                                    <ul className="space-y-1">
                                        {passwordRequirements.map(req => (
                                            <li key={req.id} className={`flex items-center ${passwordChecks[req.id] ? 'text-green-600' : 'text-gray-500'}`}>
                                                {passwordChecks[req.id] ? (
                                                    <Check size={16} className="mr-2" />
                                                ) : (
                                                    <X size={16} className="mr-2" />
                                                )}
                                                {req.text}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block mb-1 font-medium" htmlFor="confirmPassword">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                                <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-2 rounded font-semibold hover:bg-gray-900 transition"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-black font-medium hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
