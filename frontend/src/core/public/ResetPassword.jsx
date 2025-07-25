import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resetPassword } from '../../utils/passwordResetHelper';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import logo from '../../assets/logo.png';

const passwordRequirements = [
    { id: 'length', text: 'At least 8 characters', regex: /.{8,}/ },
    { id: 'uppercase', text: 'At least one uppercase letter', regex: /[A-Z]/ },
    { id: 'number', text: 'At least one number', regex: /[0-9]/ },
    { id: 'special', text: 'At least one special character', regex: /[!@#$%^&*(),.?":{}|<>]/ },
];

export const sanitizeInput = (input) => {
    if (!input) return '';
    return input.replace(/[<>\"\']/g, '').trim();
};

const getPasswordStrength = (password) => {
    if (!password) return 0;

    let strength = 0;
    const requirements = [
        /.{8,}/,      
        /[A-Z]/,      
        /[0-9]/,      
        /[^A-Za-z0-9]/ 
    ];

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

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordChecks, setPasswordChecks] = useState(
        passwordRequirements.reduce((acc, req) => ({
            ...acc,
            [req.id]: false
        }), {})
    );

    useEffect(() => {
        if (!location.state?.email) {
            navigate('/forgot-password');
            return;
        }
        setEmail(sanitizeInput(location.state.email));
    }, [location.state, navigate]);

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6); 
        setOtp(value);
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        if (value.length > 100) return;

        setNewPassword(value);

        const strength = getPasswordStrength(value);
        setPasswordStrength(strength);

        const checks = { ...passwordChecks };
        passwordRequirements.forEach(req => {
            checks[req.id] = req.regex.test(value);
        });
        setPasswordChecks(checks);
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        if (value.length <= 100) {
            setConfirmPassword(value);
        }
    };

    const validateForm = () => {
        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return false;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return false;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        const allChecksPassed = Object.values(passwordChecks).every(Boolean);
        if (!allChecksPassed) {
            setError('Please ensure your password meets all requirements');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const { success, error } = await resetPassword({
                email: sanitizeInput(email),
                newPassword: sanitizeInput(newPassword),
                otp: otp.trim()
            });

            if (success) {
                navigate('/login', {
                    state: {
                        message: 'Password reset successfully. Please login with your new password.'
                    }
                });
            } else {
                setError(error || 'Failed to reset password. Please try again.');
            }
        } catch (err) {
            console.error('Password reset error:', err);
            setError('An error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
            <img src={logo} alt="Logo" className="w-32 h-16 mb-2" />
            <h1 className="text-3xl font-bold mb-2 text-center">Reset Password</h1>
            <p className="mb-8 text-center text-gray-400 max-w-lg">
                Enter the OTP sent to your email and create a new password.
            </p>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded w-full max-w-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="w-full max-w-lg">
                <div className="mb-6">
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                        OTP (6 digits)
                    </label>
                    <input
                        id="otp"
                        name="otp"
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={6}
                        required
                        value={otp}
                        onChange={handleOtpChange}
                        className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="Enter OTP"
                        autoComplete="one-time-code"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            id="newPassword"
                            name="newPassword"
                            type={showPassword ? "text" : "password"}
                            required
                            value={newPassword}
                            onChange={handlePasswordChange}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black pr-12"
                            placeholder="Enter new password"
                            autoComplete="new-password"
                            minLength={8}
                            maxLength={100}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {passwordFocused && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <div className="mb-2 text-sm font-medium">Password Requirements:</div>
                            <ul className="space-y-1 text-sm">
                                {passwordRequirements.map((req) => (
                                    <li key={req.id} className="flex items-center">
                                        {passwordChecks[req.id] ? (
                                            <Check className="w-4 h-4 text-green-500 mr-2" />
                                        ) : (
                                            <X className="w-4 h-4 text-red-500 mr-2" />
                                        )}
                                        <span className={passwordChecks[req.id] ? 'text-green-600' : 'text-gray-500'}>
                                            {req.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-3">
                                <div className="text-sm font-medium mb-1">
                                    Password Strength: {
                                        passwordStrength < 25 ? 'Weak' :
                                            passwordStrength < 50 ? 'Fair' :
                                                passwordStrength < 75 ? 'Good' : 'Strong'
                                    }
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${getStrengthColor(passwordStrength)}`}
                                        style={{ width: `${passwordStrength}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black pr-12"
                            placeholder="Confirm new password"
                            autoComplete="new-password"
                            minLength={8}
                            maxLength={100}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 px-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;
