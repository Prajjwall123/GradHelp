const Log = require('../models/Log');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');




exports.getLogs = asyncHandler(async (req, res, next) => {
    
    const reqQuery = { ...req.query };

    
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    
    let query = Log.find(JSON.parse(queryStr));

    
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Log.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    
    const logs = await query;

    
    const pagination = {};
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.status(200).json({
        success: true,
        count: logs.length,
        pagination,
        data: logs
    });
});




exports.getLog = asyncHandler(async (req, res, next) => {
    const log = await Log.findById(req.params.id);

    if (!log) {
        return next(
            new ErrorResponse(`Log not found with id of ${req.params.id}`, 404)
        );
    }

    res.status(200).json({
        success: true,
        data: log
    });
});




exports.deleteLog = asyncHandler(async (req, res, next) => {
    const log = await Log.findById(req.params.id);

    if (!log) {
        return next(
            new ErrorResponse(`Log not found with id of ${req.params.id}`, 404)
        );
    }

    await log.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});




exports.deleteLogs = asyncHandler(async (req, res, next) => {
    await Log.deleteMany({});

    res.status(200).json({
        success: true,
        data: {}
    });
});
