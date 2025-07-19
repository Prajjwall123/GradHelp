import API from './api';
import { getUserInfo } from './authHelper';

export const updateProfile = async (profileData) => {
    try {
        const { _id } = getUserInfo();
        if (!_id) {
            throw new Error('No user is currently logged in');
        }

        
        const authData = JSON.parse(localStorage.getItem('auth'));
        const token = authData?.token;

        if (!token) {
            throw new Error('No authentication token found');
        }

        
        const formData = new FormData();

        
        Object.keys(profileData).forEach(key => {
            
            if (typeof profileData[key] === 'object' && !(profileData[key] instanceof File)) {
                
                if (key === 'english_test' && profileData.english_test) {
                    Object.keys(profileData.english_test).forEach(nestedKey => {
                        
                        if (profileData.english_test[nestedKey] === null ||
                            profileData.english_test[nestedKey] === undefined) {
                            return;
                        }

                        
                        if (nestedKey === 'english_transcript' && profileData.english_test.english_transcript) {
                            formData.append('english_transcript', profileData.english_test.english_transcript);
                        }
                        
                        else if (nestedKey === 'exam_date' && profileData.english_test.exam_date) {
                            formData.append('english_test[exam_date]', profileData.english_test.exam_date);
                        }
                        
                        else if (nestedKey !== 'exam_date') {
                            formData.append(`english_test[${nestedKey}]`, profileData.english_test[nestedKey]);
                        }
                    });
                } else {
                    
                    Object.keys(profileData[key]).forEach(nestedKey => {
                        if (profileData[key][nestedKey] !== null && profileData[key][nestedKey] !== undefined) {
                            formData.append(`${key}[${nestedKey}]`, profileData[key][nestedKey]);
                        }
                    });
                }
            } else if ((key === 'education_transcript' && profileData.education_transcript) ||
                (key === 'english_transcript' && profileData.english_transcript)) {
                
                formData.append(key, profileData[key]);
            } else {
                
                if (profileData[key] !== null && profileData[key] !== undefined) {
                    formData.append(key, profileData[key]);
                }
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
        throw error.response?.data || error;
    }
};

export const getProfile = async () => {
    try {
        const { _id } = getUserInfo();
        if (!_id) {
            throw new Error('No user is currently logged in');
        }

        
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
