export const getCSRFToken = () => {
    return sessionStorage.getItem('csrfToken');
};


export const setCSRFToken = (token) => {
    if (token) {
        sessionStorage.setItem('csrfToken', token);
    }
    return token;
};


export const removeCSRFToken = () => {
    sessionStorage.removeItem('csrfToken');
};


export const extractAndStoreCSRFToken = (response) => {
    const csrfToken = response?.headers?.['x-csrf-token'];
    if (csrfToken) {
        return setCSRFToken(csrfToken);
    }
    return null;
};
