const Log = require('../models/Log');

const requestLogger = async (req, res, next) => {
    const start = Date.now();
    
    const originalSend = res.send;
    
    let responseBody = '';
    
    res.send = function (body) {
        responseBody = body;
        return originalSend.apply(res, arguments);
    };

    const logRequest = async () => {
        try {
            const excludedPaths = ['/health', '/favicon.ico'];
            if (excludedPaths.includes(req.path)) return;

            const responseTime = Date.now() - start;
            
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

            await Log.create(logData);
        } catch (error) {
            console.error('Error logging request:', error);
        }
    };

    res.on('finish', logRequest);
    
    next();
};

module.exports = requestLogger;
