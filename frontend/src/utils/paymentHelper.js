import API from './api';

export const createApplicationAndInitiatePayment = async (amount = 1000, courseId, intake) => {
    try {
        // Application creation - no need to pass userId as it's handled by JWT
        API.post('/applications', {
            courseId,
            intake,
            status: 'pending'
        }).catch(error => {
            console.error('Application creation error:', error);
        });

        // Payment initiation - no need to pass userId as it's handled by JWT
        const paymentResponse = await API.post('/payments/initiate', {
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
            transactionId
        });
        return response.data;
    } catch (error) {
        console.error('Error verifying payment:', error);
        throw error;
    }
};

export const getPaymentStatus = async (paymentId) => {
    try {
        const response = await API.get(`/payments/status/${paymentId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting payment status:', error);
        throw error;
    }
};
