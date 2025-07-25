import API from './api';

export const createApplication = async (courseId, intake) => {
    try {
        const response = await API.post('/applications', {
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
        const response = await API.get('/applications/me');
        return response.data;
    } catch (error) {
        console.error('Error fetching user applications:', error);
        throw error;
    }
};

export const cancelApplication = async (applicationId) => {
    try {
        const response = await API.delete(`/applications/${applicationId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting application:', error);
        throw error;
    }
};

export const updateApplicationSOP = async (applicationId, sop) => {
    try {
        const response = await API.patch(`/applications/${applicationId}/sop`, {
            sop
        });

        return response.data;
    } catch (error) {
        console.error('Error updating application SOP:', error);
        throw error;
    }
};
