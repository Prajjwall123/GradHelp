import API from './api';

const getUniversities = async () => {
    try {
        const response = await API.get("/universities");
        return response.data || [];
    } catch (error) {
        console.error('Error fetching universities:', error);
        throw error;
    }
};

const getUniversityById = async (id) => {
    try {
        console.log(`Fetching university with ID: ${id}`);
        const response = await API.get(`/universities/${id}`);
        console.log('University API response:', response);

        // Handle both nested and direct response structures
        const universityData = response.data?.university || response.data;
        if (!universityData) {
            throw new Error('No university data found in response');
        }

        return universityData;
    } catch (error) {
        console.error(`Error fetching university with ID ${id}:`, {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers
            }
        });
        throw error;
    }
};

export { getUniversities, getUniversityById };
