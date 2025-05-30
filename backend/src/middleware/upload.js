const multer = require("multer");
const winston = require("winston");

// Create logger for upload middleware
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Configuration constants
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB default
const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

/**
 * File filter function for Multer
 * @param {Object} req - Express request object
 * @param {Object} file - Multer file object
 * @param {Function} cb - Callback function
 */
const fileFilter = (req, file, cb) => {
  logger.info(
    `File upload attempt: ${file.originalname}, type: ${file.mimetype}, size: ${
      file.size || "unknown"
    }`
  );

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const error = new Error(
      `File type ${file.mimetype} not allowed. Supported types: PNG, JPEG, JPG, WebP`
    );
    error.code = "INVALID_FILE_TYPE";
    logger.error("File type validation failed:", error.message);
    return cb(error, false);
  }

  // Check file extension as additional validation
  const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp"];
  const fileExtension = file.originalname.toLowerCase().split(".").pop();

  if (!allowedExtensions.includes(`.${fileExtension}`)) {
    const error = new Error(
      `File extension .${fileExtension} not allowed. Supported extensions: ${allowedExtensions.join(
        ", "
      )}`
    );
    error.code = "INVALID_FILE_EXTENSION";
    logger.error("File extension validation failed:", error.message);
    return cb(error, false);
  }

  logger.info(`File validation passed: ${file.originalname}`);
  cb(null, true);
};

/**
 * Memory storage configuration for Multer
 * Files are stored in memory as Buffer objects for processing
 */
const storage = multer.memoryStorage();

/**
 * Multer configuration object
 */
const multerConfig = {
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5, // Maximum 5 files per request
    fields: 10, // Maximum 10 non-file fields
    fieldNameSize: 100, // Maximum field name size
    fieldSize: 1024 * 1024, // 1MB max for non-file fields
  },
};

/**
 * Create multer instance with configuration
 */
const upload = multer(multerConfig);

/**
 * Middleware for handling single image upload
 * Field name: 'image'
 */
const singleImageUpload = upload.single("image");

/**
 * Middleware for handling multiple image uploads
 * Field name: 'images'
 * Maximum: 5 files
 */
const multipleImageUpload = upload.array("images", 5);

/**
 * Middleware for handling multiple fields with images
 * Useful for different image types (raised, shop, thumbnail, etc.)
 */
const fieldsImageUpload = upload.fields([
  { name: "imageRaised", maxCount: 1 },
  { name: "imageShop", maxCount: 1 },
  { name: "imageThumbnail", maxCount: 1 },
  { name: "imageMedium", maxCount: 1 },
]);

/**
 * Error handling middleware for Multer errors
 * @param {Error} error - Multer error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const handleUploadError = (error, req, res, next) => {
  logger.error("Upload error:", error);

  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          error: {
            message: `File too large. Maximum size allowed: ${
              MAX_FILE_SIZE / 1024 / 1024
            }MB`,
            statusCode: 400,
            code: "FILE_TOO_LARGE",
          },
        });

      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          error: {
            message: "Too many files. Maximum 5 files allowed per request",
            statusCode: 400,
            code: "TOO_MANY_FILES",
          },
        });

      case "LIMIT_FIELD_COUNT":
        return res.status(400).json({
          success: false,
          error: {
            message: "Too many fields in the request",
            statusCode: 400,
            code: "TOO_MANY_FIELDS",
          },
        });

      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          error: {
            message: "Unexpected file field. Check the field name",
            statusCode: 400,
            code: "UNEXPECTED_FILE",
          },
        });

      default:
        return res.status(400).json({
          success: false,
          error: {
            message: `Upload error: ${error.message}`,
            statusCode: 400,
            code: error.code || "UPLOAD_ERROR",
          },
        });
    }
  }

  // Handle custom validation errors
  if (
    error.code === "INVALID_FILE_TYPE" ||
    error.code === "INVALID_FILE_EXTENSION"
  ) {
    return res.status(400).json({
      success: false,
      error: {
        message: error.message,
        statusCode: 400,
        code: error.code,
      },
    });
  }

  // Pass other errors to the global error handler
  next(error);
};

/**
 * Wrapper function to add error handling to upload middleware
 * @param {Function} uploadMiddleware - Multer upload middleware
 * @returns {Function} Enhanced middleware with error handling
 */
const withErrorHandling = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (error) => {
      if (error) {
        return handleUploadError(error, req, res, next);
      }
      next();
    });
  };
};

/**
 * Validation middleware to check if file was uploaded
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const requireFile = (req, res, next) => {
  if (!req.file && !req.files) {
    logger.error("No file uploaded in request");
    return res.status(400).json({
      success: false,
      error: {
        message:
          "No file uploaded. Please include an image file in your request",
        statusCode: 400,
        code: "NO_FILE_UPLOADED",
      },
    });
  }

  logger.info(
    `File upload received: ${
      req.file
        ? req.file.originalname
        : Object.keys(req.files).length + " files"
    }`
  );
  next();
};

/**
 * Middleware to log upload statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const logUploadStats = (req, res, next) => {
  if (req.file) {
    logger.info(
      `Single file upload: ${req.file.originalname}, size: ${req.file.size} bytes, type: ${req.file.mimetype}`
    );
  } else if (req.files) {
    if (Array.isArray(req.files)) {
      logger.info(
        `Multiple files upload: ${
          req.files.length
        } files, total size: ${req.files.reduce(
          (total, file) => total + file.size,
          0
        )} bytes`
      );
    } else {
      const fileCount = Object.keys(req.files).reduce(
        (count, field) => count + req.files[field].length,
        0
      );
      logger.info(
        `Field-based upload: ${fileCount} files across ${
          Object.keys(req.files).length
        } fields`
      );
    }
  }
  next();
};

module.exports = {
  // Basic upload middleware
  singleImageUpload: withErrorHandling(singleImageUpload),
  multipleImageUpload: withErrorHandling(multipleImageUpload),
  fieldsImageUpload: withErrorHandling(fieldsImageUpload),

  // Validation middleware
  requireFile,
  logUploadStats,

  // Error handling
  handleUploadError,

  // Configuration
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,

  // Raw multer instance for custom configurations
  upload,
};
