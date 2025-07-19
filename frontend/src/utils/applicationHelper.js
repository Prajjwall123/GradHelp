import API from './api';
import { getUserInfo } from './authHelper';

export const createApplication = async (courseId, intake) => {
    try {
        const user = getUserInfo();
        if (!user || !user._id) {
            throw new Error('User not authenticated');
        }

        const response = await API.post('/applications', {
            userId: user._id,
            courseId,
            intake
        });

        return response.data;
    } catch (error) {
        console.error('Error creating application:', error);
        throw error;
    }
};


export const getUserApplications = async () => {
    try {
        const user = getUserInfo();
        if (!user || !user._id) {
            throw new Error('User not authenticated');
        }

        const response = await API.get(`/applications/user/${user._id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user applications:', error);
        throw error;
    }
};


export const cancelApplication = async (applicationId) => {
    try {
        const user = getUserInfo();
        if (!user || !user._id) {
            throw new Error('User not authenticated');
        }

        const response = await API.delete(`applications/${applicationId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting application:', error);
        throw error;
    }
};


export const updateApplicationSOP = async (applicationId, sop) => {
    try {
        const user = getUserInfo();
        if (!user || !user._id) {
            throw new Error('User not authenticated');
        }

        const response = await API.patch(`/applications/${applicationId}/sop`, {
            sop,
            userId: user._id
        });

        return response.data;
    } catch (error) {
        console.error('Error updating application SOP:', error);
        throw error;
    }
};
