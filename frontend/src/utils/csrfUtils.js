/**
 * Get the current CSRF token from localStorage
 * @returns {string|null} The CSRF token or null if not found
 */
export const getCSRFToken = () => {
    return localStorage.getItem('csrfToken');
};

/**
 * Set the CSRF token in localStorage and return it
 * @param {string} token - The CSRF token to store
 * @returns {string} The stored CSRF token
 */
export const setCSRFToken = (token) => {
    if (token) {
        localStorage.setItem('csrfToken', token);
    }
    return token;
};

/**
 * Remove the CSRF token from localStorage
 */
export const removeCSRFToken = () => {
    localStorage.removeItem('csrfToken');
};

/**
 * Extract CSRF token from response headers and store it
 * @param {Object} response - Axios response object
 * @returns {string|null} The extracted CSRF token or null if not found
 */
export const extractAndStoreCSRFToken = (response) => {
    const csrfToken = response?.headers?.['x-csrf-token'];
    if (csrfToken) {
        return setCSRFToken(csrfToken);
    }
    return null;
};
