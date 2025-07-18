import API from './api';
import { getUserInfo } from './authHelper';

/**
 * Create application and get payment URL
 * @param {number} amount - Amount in NPR
 * @param {string} courseId - Course ID
 * @param {string} intake - Selected intake
 * @returns {Promise<Object>} Payment initiation response
 */
export const createApplicationAndInitiatePayment = async (amount = 1000, courseId, intake) => {
    try {
        const user = getUserInfo();
        if (!user || !user._id) {
            throw new Error('User not authenticated');
        }

        // First create application (don't wait for response)
        API.post('/applications', {
            userId: user._id,
            courseId,
            intake,
            status: 'pending'
        }).catch(error => {
            console.error('Application creation error:', error);
            // Don't throw error here, we'll continue with payment
        });

        // Then initiate payment
        const paymentResponse = await API.post('/payments/initiate', {
            userId: user._id,
            amount,
            paymentGateway: 'Khalti',
            callbackUrl: `${window.location.origin}/payment-callback`
        });

        if (paymentResponse.data.success) {
            return {
                success: true,
                data: {
                    payment_url: paymentResponse.data.payment_url,
                    pidx: paymentResponse.data.pidx,
                    transactionId: paymentResponse.data.transactionId
                }
            };
        } else {
            throw new Error(paymentResponse.data.message || 'Failed to initiate payment');
        }
    } catch (error) {
        console.error('Error initiating payment:', error);
        throw error;
    }
};

export const verifyPayment = async (pidx, transactionId) => {
    try {
        const response = await API.post('/payments/verify', {
            pidx,
            transaction_id: transactionId
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getPaymentStatus = async (paymentId) => {
    try {
        const response = await API.get(`/payments/status/${paymentId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
