const Log = require('../models/Log');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all logs
// @route   GET /api/v1/logs
// @access  Private/Admin
exports.getLogs = asyncHandler(async (req, res, next) => {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from filtering
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    let query = Log.find(JSON.parse(queryStr));

    // Select fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Log.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const logs = await query;

    // Pagination result
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

// @desc    Get single log
// @route   GET /api/v1/logs/:id
// @access  Private/Admin
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

// @desc    Delete log
// @route   DELETE /api/v1/logs/:id
// @access  Private/Admin
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

// @desc    Delete all logs
// @route   DELETE /api/v1/logs
// @access  Private/Admin
exports.deleteLogs = asyncHandler(async (req, res, next) => {
    await Log.deleteMany({});

    res.status(200).json({
        success: true,
        data: {}
    });
});
