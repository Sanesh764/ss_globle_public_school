import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';

export const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Resource or Endpoint Not Found - ${req.originalUrl}`);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || (error.name === 'ValidationError' ? 422 : 500);
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Invalid resource identifier: ${err.path}`;
    error = new ApiError(400, message);
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value entered for '${field}'. Please use another value.`;
    error = new ApiError(409, message);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Validation Failure: ${errors.join(', ')}`;
    error = new ApiError(422, message, errors);
  }

  // Log error cleanly
  if (error.statusCode >= 500) {
    logger.error(`[500 Internal Server Error] ${req.method} ${req.originalUrl}`, error);
  } else if (error.statusCode === 401) {
    logger.info(`[401 Unauthorized] ${req.method} ${req.originalUrl} - ${error.message}`);
  } else {
    logger.warn(`[${error.statusCode}] ${req.method} ${req.originalUrl} - ${error.message}`);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors.length > 0 ? error.errors : undefined,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  };

  res.status(error.statusCode).json(response);
};
