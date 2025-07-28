const Log = require('../models/Log');

const requestLogger = async (req, res, next) => {
    const start = Date.now();
    
    // Store the original send function
    const originalSend = res.send;
    
    // Create a buffer to store the response body
    let responseBody = '';
    
    // Override the send function to capture the response body
    res.send = function (body) {
        responseBody = body;
        return originalSend.apply(res, arguments);
    };

    // Function to log the request after the response is sent
    const logRequest = async () => {
        try {
            // Skip logging for certain paths (e.g., health checks, static files)
            const excludedPaths = ['/health', '/favicon.ico'];
            if (excludedPaths.includes(req.path)) return;

            // Calculate response time
            const responseTime = Date.now() - start;
            
            // Prepare log data
            const logData = {
                level: res.statusCode >= 500 ? 'error' : 
                       res.statusCode >= 400 ? 'warn' : 'info',
                message: `${req.method} ${req.originalUrl} - ${res.statusCode}`,
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                responseTime,
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.get('user-agent'),
                userId: req.user?._id || null,
                requestBody: req.method !== 'GET' ? req.body : undefined,
                queryParams: Object.keys(req.query).length > 0 ? req.query : undefined,
                error: responseBody?.error || undefined
            };

            // Create log entry
            await Log.create(logData);
        } catch (error) {
            console.error('Error logging request:', error);
        }
    };

    // Log when response finishes
    res.on('finish', logRequest);
    
    // Continue to next middleware
    next();
};

module.exports = requestLogger;
