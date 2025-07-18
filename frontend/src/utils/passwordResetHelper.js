import API from './api';
import { toast } from 'react-toastify';

export const requestPasswordReset = async (email) => {
    try {
        const response = await API.post('/auth/forgot-password', { email });
        toast.success('Password reset OTP sent to your email');
        return { success: true, data: response.data };
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to send reset OTP';
        toast.error(message);
        return { success: false, error: message };
    }
};

export const resetPassword = async (email, otp, newPassword) => {
    try {
        const response = await API.post('/auth/reset-password', {
            email,
            otp,
            newPassword
        });
        toast.success('Password has been reset successfully');
        return { success: true, data: response.data };
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to reset password';
        toast.error(message);
        return { success: false, error: message };
    }
};
