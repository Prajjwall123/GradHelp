import API from './api';

const getCourses = async (params = {}) => {
    try {
        const response = await API.get("/courses", { params });
        return response.data || [];
    } catch (error) {
        console.error('Error fetching courses:', error);
        throw error;
    }
};

const getCourseById = async (id) => {
    try {
        const response = await API.get(`/courses/${id}`);
        return response.data || null;
    } catch (error) {
        console.error(`Error fetching course with ID ${id}:`, error);
        throw error;
    }
};

export { getCourses, getCourseById };
