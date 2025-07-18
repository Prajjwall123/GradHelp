import axios from 'axios';
import { getUserInfo } from './authHelper';

export const fetchNotifications = async () => {
    try {
        const user = getUserInfo();
        if (!user?._id) return [];

        const response = await axios.get(`http://localhost:3000/api/notifications/user/${user._id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
};

export const markNotificationAsRead = async (notificationId) => {
    try {
        await axios.post(`http://localhost:3000/api/notifications/${notificationId}/read`);
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
};
