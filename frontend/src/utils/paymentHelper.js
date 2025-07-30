import API from './api';

/**
 * Initiates a payment for premium membership
 * @param {number} amount - The amount to be paid in NPR
 * @returns {Promise<Object>} - The payment initiation response
 */
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

/**
 * Verifies a payment using the pidx
 * @param {string} pidx - The payment identifier from Khalti
 * @returns {Promise<Object>} - The payment verification response
 */
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

/**
 * Fetches the user's premium status
 * @returns {Promise<Object>} - The premium status response
 */
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
