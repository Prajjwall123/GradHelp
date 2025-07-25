import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestPasswordReset } from '../../utils/passwordResetHelper';
import logo from '../../assets/logo.png';

export const sanitizeEmail = (email) => {
    if (!email) return '';
    const sanitized = email.replace(/<[^>]*>?/gm, '');
    return sanitized.trim().toLowerCase();
};

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleEmailChange = (e) => {
        const value = e.target.value;
        if (value.length > 100) {
            setError('Email is too long');
            return;
        }
        setEmail(value);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const sanitizedEmail = sanitizeEmail(email);

        if (!sanitizedEmail) {
            setError('Please enter a valid email address');
            return;
        }

        if (!isValidEmail(sanitizedEmail)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const { success, error } = await requestPasswordReset(sanitizedEmail);
            setIsLoading(false);

            if (success) {
                navigate('/reset-password', { state: { email: sanitizedEmail } });
            } else {
                setError(error || 'Failed to send reset email. Please try again.');
            }
        } catch (err) {
            console.error('Password reset error:', err);
            setError('An error occurred. Please try again later.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
            <img src={logo} alt="Logo" className="w-32 h-16 mb-2" />
            <h1 className="text-3xl font-bold mb-2 text-center">Forgot Password</h1>
            <p className="mb-8 text-center text-gray-400 max-w-lg">
                Enter your email address and we'll send you a code to reset your password.
            </p>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded w-full max-w-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="w-full max-w-lg">
                <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={handleEmailChange}
                        onBlur={() => setEmail(sanitizeEmail(email))}
                        className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="Enter your email"
                        maxLength={100}
                        autoComplete="email"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 px-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>
        </div>
    );
};

export default ForgotPassword;
