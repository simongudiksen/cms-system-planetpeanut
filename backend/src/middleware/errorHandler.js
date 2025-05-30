const winston = require("winston");

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
});

/**
 * Custom Error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Mongoose validation error handler
 */
const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map((err) => ({
    field: err.path,
    message: err.message,
    value: err.value,
  }));

  return new AppError(
    `Validation failed: ${errors.map((e) => e.message).join(", ")}`,
    400
  );
};

/**
 * Mongoose duplicate key error handler
 */
const handleDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  return new AppError(`${field} '${value}' already exists`, 409);
};

/**
 * Mongoose cast error handler (invalid ObjectId)
 */
const handleCastError = (error) => {
  return new AppError(`Invalid ${error.path}: ${error.value}`, 400);
};

/**
 * JWT error handlers
 */
const handleJWTError = () => new AppError("Invalid token", 401);
const handleJWTExpiredError = () => new AppError("Token expired", 401);

/**
 * Send error response in development
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: {
      message: err.message,
      stack: err.stack,
      ...err,
    },
  });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
      },
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error("UNKNOWN ERROR:", err);

    res.status(500).json({
      success: false,
      error: {
        message: "Something went wrong",
      },
    });
  }
};

/**
 * Global error handling middleware
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  let error = { ...err };
  error.message = err.message;

  // Handle specific types of errors
  if (err.name === "ValidationError") {
    error = handleValidationError(err);
  }

  if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  }

  if (err.name === "CastError") {
    error = handleCastError(err);
  }

  if (err.name === "JsonWebTokenError") {
    error = handleJWTError();
  }

  if (err.name === "TokenExpiredError") {
    error = handleJWTExpiredError();
  }

  // Send error response
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

/**
 * Catch async errors wrapper
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Handle 404 routes
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

module.exports = {
  AppError,
  globalErrorHandler,
  catchAsync,
  notFound,
};
