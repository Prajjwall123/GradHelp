import API from './api';


export const initiatePayment = async (amount) => {
    try {
        const response = await API.post('/payments/initiate', { amount });
        return {
            success: true,
            data: response.data,
            error: null
        };
    } catch (error) {
        console.error('Error initiating payment:', error);
        return {
            success: false,
            data: null,
            error: error.response?.data?.message || 'Failed to initiate payment'
        };
    }
};


export const verifyPayment = async (pidx) => {
    try {
        const response = await API.post('/payments/verify', { pidx });
        return {
            success: response.data.success,
            data: response.data,
            error: null
        };
    } catch (error) {
        console.error('Error verifying payment:', error);
        return {
            success: false,
            data: null,
            error: error.response?.data?.message || 'Failed to verify payment'
        };
    }
};


export const getPremiumStatus = async () => {
    try {
        const response = await API.get('/users/premium-status');
        return {
            success: true,
            isPremium: response.data.isPremium,
            data: response.data,
            error: null
        };
    } catch (error) {
        console.error('Error fetching premium status:', error);
        return {
            success: false,
            isPremium: false,
            data: null,
            error: error.response?.data?.message || 'Failed to fetch premium status'
        };
    }
};
