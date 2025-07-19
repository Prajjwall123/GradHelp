
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

        let responseData;
        const contentType = response.headers.get('content-type');

        try {
            responseData = await (contentType?.includes('application/json')
                ? response.json()
                : response.text().then(text => ({
                    message: text.includes('Too many')
                        ? 'Too many requests from this IP, please try again later'
                        : 'An error occurred while processing your request'
                })));
        } catch (parseError) {
            console.error('Error parsing response:', parseError);
            responseData = { message: 'Error processing server response' };
        }

        if (!response.ok) {
            const error = new Error(responseData.message || 'Failed to submit contact form');
            error.status = response.status;
            error.response = responseData;
            throw error;
        }

        return responseData;
    } catch (error) {
        console.error('Error in submitContactForm:', error);
        throw error;
    }
};
