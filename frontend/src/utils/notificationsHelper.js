import API from './api';
import { getUserInfo } from './authHelper';

export const fetchNotifications = async () => {
    try {
        const user = getUserInfo();
        if (!user?._id) return [];

        const response = await API.get(`/notifications/user/${user._id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
};

export const markNotificationAsRead = async (notificationId) => {
    try {
        await API.post(`/notifications/${notificationId}/read`);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};
