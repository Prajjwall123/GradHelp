/**
 * Client-side rate limiting utility
 * @param {Function} fn - The function to be rate limited
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Rate limited function
 */
const createRateLimitedFunction = (fn, delay = 2000) => {
    let lastCall = 0;
    let timeoutId = null;

    return function (...args) {
        const now = Date.now();
        const timeSinceLastCall = now - lastCall;

        // If enough time has passed since the last call, execute immediately
        if (timeSinceLastCall >= delay) {
            lastCall = now;
            return fn.apply(this, args);
        }

        // Otherwise, schedule the call for when the delay has passed
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        return new Promise((resolve) => {
            timeoutId = setTimeout(() => {
                lastCall = Date.now();
                resolve(fn.apply(this, args));
            }, delay - timeSinceLastCall);
        });
    };
};

/**
 * Creates a rate-limited version of a form submission function
 * @param {Function} submitFunction - The form submission function
 * @param {Object} options - Options for rate limiting
 * @param {number} options.delay - Minimum time between submissions in ms (default: 2000)
 * @param {Function} options.onRateLimited - Callback when rate limited
 * @returns {Function} - Rate-limited submission function
 */
const createRateLimitedSubmit = (submitFunction, options = {}) => {
    const {
        delay = 2000,
        onRateLimited = () => toast.error('Please wait before submitting again')
    } = options;

    let lastSubmitTime = 0;
    let isSubmitting = false;

    return async function (...args) {
        const now = Date.now();
        const timeSinceLastSubmit = now - lastSubmitTime;

        if (isSubmitting) {
            onRateLimited();
            return;
        }

        if (timeSinceLastSubmit < delay) {
            onRateLimited();
            return;
        }

        isSubmitting = true;
        lastSubmitTime = now;

        try {
            const result = await submitFunction.apply(this, args);
            return result;
        } finally {
            // Use a small delay before allowing the next submission
            setTimeout(() => {
                isSubmitting = false;
            }, delay);
        }
    };
};

export { createRateLimitedFunction, createRateLimitedSubmit };
