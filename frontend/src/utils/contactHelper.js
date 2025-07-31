const sanitizeInput = (input) => {
    if (!input) return '';

    let str = String(input);

    str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    str = str.replace(/<[^>]*>?/gm, '');


    const specialChars = {
        '\\': '\\\\',
        '"': '\\"',
        "'": "\\'",
        '$': '\\$',
        '{': '\\{',
        '}': '\\}'
    };

    return str.replace(/[\\"'${}]/g, match => specialChars[match]);
};

export const submitContactForm = async (formData) => {
    try {

        const sanitizedData = {
            name: sanitizeInput(formData.name).substring(0, 100),
            email: sanitizeInput(formData.email).toLowerCase().substring(0, 100),
            subject: sanitizeInput(formData.subject).substring(0, 200),
            message: sanitizeInput(formData.message).substring(0, 2000)
        };


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitizedData.email)) {
            throw new Error('Please enter a valid email address');
        }

        const response = await fetch('https://localhost:3443/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sanitizedData)
        });

        let responseData;
        const contentType = response.headers.get('content-type');

        try {
            responseData = await (contentType?.includes('application/json')
                ? response.json()
                : response.text().then(text => {

                    const safeText = sanitizeInput(text);
                    return {
                        message: safeText.includes('Too many')
                            ? 'Too many requests from this IP, please try again later'
                            : 'An error occurred while processing your request'
                    };
                }));
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

        const safeError = new Error(error.message || 'Failed to submit form. Please try again.');
        safeError.status = error.status || 500;
        throw safeError;
    }
};
