import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Loader2, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import API from '../../utils/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const MyPlan = () => {
    const { currentUser, isAuthenticated, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Check authentication status
    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                toast.error('Please log in to view this page');
                navigate('/login', { state: { from: '/my-plan' } });
            } else {
                setIsCheckingStatus(false);
                if (currentUser?.premium) {
                    setIsPremium(true);
                }
            }
        }
    }, [isAuthenticated, authLoading, navigate, currentUser]);

    // Fetch user's premium status when component mounts
    useEffect(() => {
        if (!isAuthenticated || authLoading) return;

        const fetchPremiumStatus = async () => {
            try {
                const response = await API.get('/users/premium-status');
                if (response.data?.success) {
                    setIsPremium(response.data.isPremium);
                }
            } catch (error) {
                console.error('Error fetching premium status:', error);
                toast.error('Failed to load your premium status');
            } finally {
                setIsCheckingStatus(false);
            }
        };

        fetchPremiumStatus();
    }, [isAuthenticated, authLoading]);

    const handleUpgrade = async () => {
        if (!isAuthenticated) {
            toast.error('Please log in to upgrade your plan');
            navigate('/login', { state: { from: '/my-plan' } });
            return;
        }

        setLoading(true);
        try {
            const response = await API.post('/payments/initiate', {
                amount: 500, // 500 NPR
            });

            if (response.data.success && response.data.data?.payment_url) {
                // Store the current URL to return to after payment
                sessionStorage.setItem('prePaymentUrl', window.location.pathname);
                // Redirect to Khalti payment page
                window.location.href = response.data.data.payment_url;
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Error initiating payment:', error);
            const errorMessage = error.response?.data?.message || 'Failed to initiate payment';
            toast.error(errorMessage);

            // If the error is due to being already premium, update the UI
            if (error.response?.data?.error?.detail?.includes('already premium')) {
                setIsPremium(true);
            }
        } finally {
            setLoading(false);
        }
    };

    // Check if we're returning from Khalti payment
    useEffect(() => {
        const pidx = searchParams.get('pidx');
        const transactionId = searchParams.get('transaction_id');

        const verifyPayment = async () => {
            if (pidx && transactionId) {
                try {
                    setLoading(true);
                    const response = await API.post('/payments/verify', { pidx });

                    if (response.data.success) {
                        // Update premium status
                        setIsPremium(true);
                        toast.success('Payment successful! You are now a premium member.');
                        // Clean up URL
                        navigate('/my-plan', { replace: true });
                    } else {
                        throw new Error(response.data.message || 'Payment verification failed');
                    }
                } catch (error) {
                    console.error('Error verifying payment:', error);
                    toast.error(error.response?.data?.message || 'Failed to verify payment');
                } finally {
                    setLoading(false);
                }
            }
        };

        verifyPayment();
    }, [searchParams, navigate]);

    if (authLoading || isCheckingStatus) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-16">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Your Plan</h1>
                        <p className="mt-2 text-gray-600">
                            {isPremium
                                ? 'You have access to all premium features!'
                                : 'Upgrade to unlock all premium features'}
                        </p>
                    </div>

                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {isPremium ? 'Premium Plan' : 'Free Plan'}
                                    </h2>
                                    <p className="mt-1 text-gray-600">
                                        {isPremium
                                            ? 'Full access to all features'
                                            : 'Limited access to basic features'}
                                    </p>
                                </div>

                                {!isPremium && (
                                    <button
                                        onClick={handleUpgrade}
                                        disabled={loading}
                                        className={`flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="-ml-1 mr-3 h-5 w-5" />
                                                Upgrade to Premium
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            <div className="mt-8">
                                <h3 className="text-lg font-medium text-gray-900">Features</h3>
                                <ul className="mt-4 space-y-3">
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                        <span>Unlimited document uploads</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                        <span>Advanced search functionality</span>
                                    </li>
                                    <li className="flex items-start">
                                        {isPremium ? (
                                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                        )}
                                        <span className={isPremium ? 'text-gray-900' : 'text-gray-500'}>
                                            Priority customer support
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        {isPremium ? (
                                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                        )}
                                        <span className={isPremium ? 'text-gray-900' : 'text-gray-500'}>
                                            Advanced analytics
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            {!isPremium && (
                                <div className="mt-8 p-4 bg-blue-50 rounded-md">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-blue-800">
                                                Upgrade to Premium for just NPR 500/year
                                            </p>
                                            <div className="mt-2 text-sm text-blue-700">
                                                <p>
                                                    Get access to all premium features with a one-time payment. No subscription required.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default MyPlan;
