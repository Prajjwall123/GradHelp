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

const getPasswordStrength = (password) => {
    if (!password) return 0;

    let strength = 0;
    const requirements = [
        /.{8,}/,      // min length
        /[A-Z]/,      // uppercase
        /[0-9]/,      // number
        /[^A-Za-z0-9]/ // special char
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
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
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
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            navigate('/forgot-password');
        }
    }, [location, navigate]);

    const validatePassword = (password) => {
        const checks = {};
        passwordRequirements.forEach(req => {
            checks[req.id] = req.regex.test(password);
        });
        setPasswordChecks(checks);
        setPasswordStrength(getPasswordStrength(password));
    };

    const handleNewPasswordChange = (e) => {
        const value = e.target.value;
        setNewPassword(value);
        validatePassword(value);
    };

    const validateForm = () => {
        if (!newPassword || !confirmPassword) {
            setPasswordError('Please fill in all fields');
            return false;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return false;
        }

        const allChecksPassed = Object.values(passwordChecks).every(Boolean);
        if (!allChecksPassed) {
            setPasswordError('Please ensure your password meets all requirements');
            return false;
        }

        setPasswordError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        const { success, error } = await resetPassword(email, otp, newPassword);
        setIsLoading(false);

        if (success) {
            navigate('/login');
        } else {
            setPasswordError(error || 'Failed to reset password. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
            <img src={logo} alt="Logo" className="w-32 h-16 mb-2" />
            <h1 className="text-3xl font-bold mb-2 text-center">Reset Password</h1>
            <p className="mb-8 text-center text-gray-400 max-w-lg">
                Enter the OTP sent to your email and your new password
            </p>

            <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4">
                <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                        OTP Code
                    </label>
                    <input
                        id="otp"
                        name="otp"
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="Enter 6-digit OTP"
                    />
                </div>

                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            id="newPassword"
                            name="newPassword"
                            type={showPassword ? "text" : "password"}
                            required
                            value={newPassword}
                            onChange={handleNewPasswordChange}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black pr-10 ${passwordError ? 'border-red-500' : ''}`}
                            placeholder="Enter new password"
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
                    {newPassword && (
                        <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${getStrengthColor(passwordStrength)}`}
                                    style={{ width: `${passwordStrength}%` }}
                                />
                            </div>
                            <p className="text-xs mt-1 text-gray-500">
                                {passwordStrength <= 25 ? 'Weak' :
                                    passwordStrength <= 50 ? 'Fair' :
                                        passwordStrength <= 75 ? 'Good' : 'Strong'}
                            </p>
                        </div>
                    )}

                    {/* Password Requirements */}
                    {(passwordFocused || newPassword) && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                            <p className="font-medium mb-2">Password must contain:</p>
                            <ul className="space-y-1">
                                {passwordRequirements.map((req) => (
                                    <li key={req.id} className="flex items-center">
                                        {passwordChecks[req.id] ? (
                                            <Check className="h-4 w-4 text-green-500 mr-2" />
                                        ) : (
                                            <X className="h-4 w-4 text-red-500 mr-2" />
                                        )}
                                        <span className={passwordChecks[req.id] ? 'text-gray-600' : 'text-gray-400'}>
                                            {req.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black pr-10 ${passwordError ? 'border-red-500' : ''}`}
                            placeholder="Confirm new password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                {passwordError && (
                    <div className="text-red-500 text-sm mt-1">
                        {passwordError}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black text-white py-3 rounded-lg font-semibold text-lg hover:bg-gray-900 transition mt-4 disabled:opacity-70"
                >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>

                <div className="text-center mt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                        Back to Login
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ResetPassword;
