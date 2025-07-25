import API from './api';
import { getUserInfo } from './authHelper';

export const updateProfile = async (profileData) => {
    try {
        const { _id } = getUserInfo();
        if (!_id) {
            throw new Error('No user is currently logged in');
        }

        // Get authentication token
        const authData = JSON.parse(localStorage.getItem('auth'));
        const token = authData?.token;

        if (!token) {
            throw new Error('No authentication token found');
        }

        const formData = new FormData();

        // Add a helper function to safely handle object iteration
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

                    if (nestedKey === 'english_transcript' && nestedValue) {
                        formData.append('english_transcript', nestedValue);
                    } else if (nestedKey === 'exam_date' && nestedValue) {
                        formData.append('english_test[exam_date]', nestedValue);
                    } else if (nestedKey !== 'exam_date') {
                        formData.append(`english_test[${nestedKey}]`, nestedValue);
                    }
                });
            }
            // Handle file uploads
            else if ((key === 'education_transcript' && value) ||
                (key === 'english_transcript' && value)) {
                formData.append(key, value);
            }
            // Handle all other fields
            else {
                safeAppendData(key, value);
            }
        });

        const response = await API.patch(
            `profiles/${_id}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error updating profile:', error);
        const errorMessage = error.response?.data?.message ||
            error.message ||
            'Failed to update profile';
        throw new Error(errorMessage);
    }
};

export const getProfile = async () => {
    try {
        const { _id } = getUserInfo();
        if (!_id) {
            throw new Error('No user is currently logged in');
        }

        // Get authentication token
        const authData = JSON.parse(localStorage.getItem('auth'));
        const token = authData?.token;

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await API.get(
            `profiles/${_id}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error.response?.data || error;
    }
};
