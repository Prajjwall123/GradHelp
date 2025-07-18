import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestPasswordReset } from '../../utils/passwordResetHelper';
import logo from '../../assets/logo.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        const { success } = await requestPasswordReset(email);
        setIsLoading(false);

        if (success) {
            navigate('/reset-password', { state: { email } });
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
            <img src={logo} alt="Logo" className="w-32 h-16 mb-2" />
            <h1 className="text-3xl font-bold mb-2 text-center">Forgot Password</h1>
            <p className="mb-8 text-center text-gray-400 max-w-lg">
                Enter your email address and we'll send you a code to reset your password.
            </p>

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
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="Enter your email"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black text-white py-3 rounded-lg font-semibold text-lg hover:bg-gray-900 transition mb-6"
                >
                    {isLoading ? 'Sending...' : 'Send Reset Code'}
                </button>

                <div className="text-center">
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

export default ForgotPassword;
