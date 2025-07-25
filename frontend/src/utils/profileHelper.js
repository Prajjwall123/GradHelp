import API from './api';

export const updateProfile = async (profileData) => {
    try {
        const formData = new FormData();

        // Helper function to safely append data to formData
        const safeAppendData = (key, value) => {
            if (value === null || value === undefined) return;

            if (value instanceof File || typeof value !== 'object') {
                formData.append(key, value);
                return;
            }

            // Handle nested objects
            if (typeof value === 'object' && !Array.isArray(value)) {
                Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                    if (nestedValue !== null && nestedValue !== undefined) {
                        formData.append(`${key}[${nestedKey}]`, nestedValue);
                    }
                });
            } else {
                formData.append(key, value);
            }
        };

        // Process all profile data
        Object.entries(profileData).forEach(([key, value]) => {
            if (value === null || value === undefined) return;

            // Special handling for english_test
            if (key === 'english_test' && value) {
                Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                    if (nestedValue === null || nestedValue === undefined) return;

                    if (nestedKey === 'transcript' && nestedValue) {
                        formData.append('english_transcript', nestedValue);
                    } else if (nestedKey === 'exam_date' && nestedValue) {
                        formData.append('english_test[exam_date]', nestedValue);
                    } else if (nestedKey !== 'transcript') {
                        formData.append(`english_test[${nestedKey}]`, nestedValue);
                    }
                });
            }
            // Handle file uploads
            else if ((key === 'education_transcript' && value) ||
                (key === 'english_transcript' && value)) {
                formData.append(key, value);
            }
            // Handle other fields
            else {
                safeAppendData(key, value);
            }
        });

        const response = await API.patch('/profiles/me', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error.response?.data || { message: 'An error occurred while updating profile' };
    }
};

export const getProfile = async () => {
    try {
        const response = await API.get('/profiles/me');
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        // If it's a 404, return null to indicate no profile exists
        if (error.response?.status === 404) {
            return { success: true, profile: null };
        }
        throw error.response?.data || { message: 'An error occurred while fetching profile' };
    }
};
