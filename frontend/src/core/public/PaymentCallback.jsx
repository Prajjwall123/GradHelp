import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

const PaymentCallback = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handlePayment = async () => {
            try {
                // Show success message and redirect
                toast.success('Payment processed successfully!');
                setTimeout(() => {
                    // Clean up localStorage
                    localStorage.removeItem('application_course_id');
                    localStorage.removeItem('application_intake');

                    // Redirect to applications page
                    navigate('/my-applications');
                }, 2000);
            } catch (error) {
                console.error('Payment callback error:', error);
                setError(error.message || 'Failed to process payment');
                setLoading(false);
            }
        };

        handlePayment();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-gray-600">Processing payment... Please wait</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                    <h2 className="mt-4 text-xl font-semibold text-red-600">Payment Failed</h2>
                    <p className="mt-2 text-gray-600">{error}</p>
                    <button
                        onClick={() => {
                            // Clean up localStorage on error
                            localStorage.removeItem('application_course_id');
                            localStorage.removeItem('application_intake');
                            navigate('/dashboard');
                        }}
                        className="mt-6 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                    <h2 className="mt-4 text-xl font-semibold text-green-600">Payment Successful</h2>
                    <p className="mt-2 text-gray-600">Your payment has been processed successfully!</p>
                    <p className="mt-2 text-gray-600">You will be redirected to the applications page shortly...</p>
                </div>
            </div>
        );
    }

    return null;
};

export default PaymentCallback;
