import API from './api';


const getScholarshipById = async (id) => {
    try {
        const response = await API.get(`/scholarships/${id}`);
        return response.data || null;
    } catch (error) {
        console.error(`Error fetching scholarship with ID ${id}:`, error);
        throw error;
    }
};


const getScholarshipsByIds = async (ids) => {
    if (!ids || ids.length === 0) return [];

    try {
        const scholarshipPromises = ids.map(id => getScholarshipById(id));
        const results = await Promise.all(scholarshipPromises);

        return results.filter(scholarship => scholarship !== null);
    } catch (error) {
        console.error('Error fetching scholarships:', error);
        throw error;
    }
};


const getScholarshipsByUniversityId = async (universityId) => {
    try {
        console.log(`Fetching scholarships for university ID: ${universityId}`);
        const response = await API.get(`/scholarships/university/${universityId}`);
        console.log('Scholarships API response:', response);
        // The response is an object with a scholarships array
        return Array.isArray(response.data?.scholarships) ? response.data.scholarships : [];
    } catch (error) {
        console.error(`Error fetching scholarships for university ${universityId}:`, {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        return [];
    }
};

const applyForScholarship = async (scholarshipId, userId) => {
    try {
        const response = await API.post('/scholarship-applications', {
            scholarshipId,
            userId
        });
        return response.data;
    } catch (error) {
        console.error('Error applying for scholarship:', error);
        throw error;
    }
};

const getUserScholarshipApplications = async (userId) => {
    try {
        const response = await API.get(`/scholarship-applications/me?userId=${userId}`);
        return response.data?.data || [];
    } catch (error) {
        console.error('Error fetching scholarship applications:', error);
        throw error;
    }
};

export {
    getScholarshipById,
    getScholarshipsByIds,
    getScholarshipsByUniversityId,
    applyForScholarship,
    getUserScholarshipApplications
};
