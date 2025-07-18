/**
 * Sends a contact form submission to the backend
 * @param {Object} formData - The contact form data
 * @param {string} formData.name - The user's name
 * @param {string} formData.email - The user's email
 * @param {string} formData.subject - The message subject
 * @param {string} formData.message - The message content
 * @returns {Promise<Object>} The response from the server
 */
export const submitContactForm = async (formData) => {
    try {
        const response = await fetch('http://localhost:3000/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                subject: formData.subject,
                message: formData.message
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to submit contact form');
        }

        return await response.json();
    } catch (error) {
        console.error('Error submitting contact form:', error);
        throw error;
    }
};
