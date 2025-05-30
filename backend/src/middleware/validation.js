const { body, param, query, validationResult } = require("express-validator");
const { AppError } = require("./errorHandler");

/**
 * Middleware to check validation results
 */
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));

    return next(
      new AppError(
        `Validation failed: ${formattedErrors
          .map((e) => e.message)
          .join(", ")}`,
        400
      )
    );
  }

  next();
};

/**
 * Validation rules for creating items
 */
const validateCreateItem = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters")
    .trim(),

  body("price")
    .isNumeric()
    .withMessage("Price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Price cannot be negative"),

  body("currency")
    .isIn(["diamonds", "peanuts"])
    .withMessage('Currency must be either "diamonds" or "peanuts"'),

  body("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage('Status must be either "draft" or "published"'),

  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters")
    .trim(),

  checkValidation,
];

/**
 * Validation rules for updating items
 */
const validateUpdateItem = [
  param("id").isMongoId().withMessage("Invalid item ID"),

  body("title")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters")
    .trim(),

  body("price")
    .optional()
    .isNumeric()
    .withMessage("Price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Price cannot be negative"),

  body("currency")
    .optional()
    .isIn(["diamonds", "peanuts"])
    .withMessage('Currency must be either "diamonds" or "peanuts"'),

  body("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage('Status must be either "draft" or "published"'),

  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters")
    .trim(),

  checkValidation,
];

/**
 * Validation rules for item ID parameter
 */
const validateItemId = [
  param("id").isMongoId().withMessage("Invalid item ID"),

  checkValidation,
];

/**
 * Validation rules for query parameters
 */
const validateItemQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage('Status must be either "draft" or "published"'),

  query("currency")
    .optional()
    .isIn(["diamonds", "peanuts"])
    .withMessage('Currency must be either "diamonds" or "peanuts"'),

  query("sortBy")
    .optional()
    .isIn(["title", "price", "createdAt", "updatedAt"])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage('Sort order must be "asc" or "desc"'),

  checkValidation,
];

/**
 * General purpose validation helpers
 */
const sanitizeInput = (req, res, next) => {
  // Remove any undefined or null values from body
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] === undefined || req.body[key] === null) {
        delete req.body[key];
      }
    });
  }

  next();
};

module.exports = {
  validateCreateItem,
  validateUpdateItem,
  validateItemId,
  validateItemQuery,
  sanitizeInput,
  checkValidation,
};
