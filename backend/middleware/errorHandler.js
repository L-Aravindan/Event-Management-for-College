const ApiError = require('../utils/ApiError');

// Global error-handling middleware
const errorHandler = (err, req, res, next) => {
    // Log the error for debugging purposes
    console.error(err);

    // Default error details
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Handle specific error types
    if (err.name === 'CastError') {
        // MongoDB CastError (e.g., invalid ID format)
        const castError = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
        statusCode = castError.statusCode;
        message = castError.message;
    } else if (err.name === 'ValidationError') {
        // Mongoose validation error
        const validationError = new ApiError(400, err.message);
        statusCode = validationError.statusCode;
        message = validationError.message;
    } else if (err.code === 11000) {
        // MongoDB duplicate key error
        const duplicateError = new ApiError(400, `Duplicate field value entered`);
        statusCode = duplicateError.statusCode;
        message = duplicateError.message;
    }

    // Return error response
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
    });
};

module.exports = errorHandler;