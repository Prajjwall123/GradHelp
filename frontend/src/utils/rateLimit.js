
const createRateLimitedFunction = (fn, delay = 2000) => {
    let lastCall = 0;
    let timeoutId = null;

    return function (...args) {
        const now = Date.now();
        const timeSinceLastCall = now - lastCall;

        
        if (timeSinceLastCall >= delay) {
            lastCall = now;
            return fn.apply(this, args);
        }

        
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
            
            setTimeout(() => {
                isSubmitting = false;
            }, delay);
        }
    };
};

export { createRateLimitedFunction, createRateLimitedSubmit };
