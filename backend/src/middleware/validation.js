const { body, query, param, validationResult } = require("express-validator");
const { AppError } = require("./errorHandler");

// Handle validation results
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    throw new AppError("Validation failed", 400, errorMessages);
  }
  next();
};

// Valid enum values
const VALID_TAGS = [
  "weapons",
  "official",
  "space",
  "utility",
  "governance",
  "armor",
  "primal",
  "experimental",
  "casual",
];

const VALID_CLOTHING_TYPES = [
  "weapons",
  "Official Planet Peanut Work Wear",
  "space gear",
  "utility gear",
  "Planetary Governance Wear",
  "battle armor",
  "tribal wear",
  "experimental tech",
  "casual wear",
];

const VALID_CURRENCIES = ["diamonds", "peanuts"];

const VALID_STATUSES = ["draft", "published", "archived"];

const VALID_LAYERS = [
  "body_layer1",
  "body_layer2",
  "body_layer3",
  "body_layer_full",
  "head_layer1",
  "head_layer2",
  "head_layer3",
  "head_layer_full",
  "pants_layer1",
  "pants_layer2",
  "pants_layer3",
  "pants_layer_full",
  "accessory",
  "accessoryBack",
  "fullbody1",
  "fullbody2",
];

// Item creation validation
const validateCreateItem = [
  // Required fields
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters"),

  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("currency")
    .isIn(VALID_CURRENCIES)
    .withMessage(`Currency must be one of: ${VALID_CURRENCIES.join(", ")}`),

  body("clothingType")
    .isIn(VALID_CLOTHING_TYPES)
    .withMessage(
      `Clothing type must be one of: ${VALID_CLOTHING_TYPES.join(", ")}`
    ),

  body("layer")
    .isIn(VALID_LAYERS)
    .withMessage(`Layer must be one of: ${VALID_LAYERS.join(", ")}`),

  body("level")
    .isInt({ min: 1, max: 100 })
    .withMessage("Level must be an integer between 1 and 100"),

  // Optional fields
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array")
    .custom((tags) => {
      const invalidTags = tags.filter((tag) => !VALID_TAGS.includes(tag));
      if (invalidTags.length > 0) {
        throw new Error(
          `Invalid tags: ${invalidTags.join(
            ", "
          )}. Valid tags are: ${VALID_TAGS.join(", ")}`
        );
      }
      return true;
    }),

  body("color")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Color name cannot exceed 50 characters"),

  body("status")
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(", ")}`),

  body("releaseDate")
    .optional()
    .isISO8601()
    .withMessage("Release date must be a valid ISO date"),

  body("retireDate")
    .optional()
    .isISO8601()
    .withMessage("Retire date must be a valid ISO date")
    .custom((retireDate, { req }) => {
      if (retireDate && req.body.releaseDate) {
        if (new Date(retireDate) <= new Date(req.body.releaseDate)) {
          throw new Error("Retire date must be after release date");
        }
      }
      return true;
    }),

  // Image URL validation
  body("imageRaisedUrl")
    .optional()
    .isURL()
    .withMessage("Image raised URL must be a valid URL")
    .matches(/\.(jpg|jpeg|png|webp)$/i)
    .withMessage("Image raised URL must point to a valid image file"),

  body("imageShopUrl")
    .optional()
    .isURL()
    .withMessage("Image shop URL must be a valid URL")
    .matches(/\.(jpg|jpeg|png|webp)$/i)
    .withMessage("Image shop URL must point to a valid image file"),

  body("imageThumbnailUrl")
    .optional()
    .isURL()
    .withMessage("Image thumbnail URL must be a valid URL")
    .matches(/\.(jpg|jpeg|png|webp)$/i)
    .withMessage("Image thumbnail URL must point to a valid image file"),

  body("imageMediumUrl")
    .optional()
    .isURL()
    .withMessage("Image medium URL must be a valid URL")
    .matches(/\.(jpg|jpeg|png|webp)$/i)
    .withMessage("Image medium URL must point to a valid image file"),

  handleValidation,
];

// Item update validation (all fields optional)
const validateUpdateItem = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters"),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("currency")
    .optional()
    .isIn(VALID_CURRENCIES)
    .withMessage(`Currency must be one of: ${VALID_CURRENCIES.join(", ")}`),

  body("clothingType")
    .optional()
    .isIn(VALID_CLOTHING_TYPES)
    .withMessage(
      `Clothing type must be one of: ${VALID_CLOTHING_TYPES.join(", ")}`
    ),

  body("layer")
    .optional()
    .isIn(VALID_LAYERS)
    .withMessage(`Layer must be one of: ${VALID_LAYERS.join(", ")}`),

  body("level")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Level must be an integer between 1 and 100"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array")
    .custom((tags) => {
      const invalidTags = tags.filter((tag) => !VALID_TAGS.includes(tag));
      if (invalidTags.length > 0) {
        throw new Error(
          `Invalid tags: ${invalidTags.join(
            ", "
          )}. Valid tags are: ${VALID_TAGS.join(", ")}`
        );
      }
      return true;
    }),

  body("color")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Color name cannot exceed 50 characters"),

  body("status")
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(", ")}`),

  body("releaseDate")
    .optional()
    .isISO8601()
    .withMessage("Release date must be a valid ISO date"),

  body("retireDate")
    .optional()
    .isISO8601()
    .withMessage("Retire date must be a valid ISO date"),

  // Image URL validation
  body("imageRaisedUrl")
    .optional()
    .isURL()
    .withMessage("Image raised URL must be a valid URL")
    .matches(/\.(jpg|jpeg|png|webp)$/i)
    .withMessage("Image raised URL must point to a valid image file"),

  body("imageShopUrl")
    .optional()
    .isURL()
    .withMessage("Image shop URL must be a valid URL")
    .matches(/\.(jpg|jpeg|png|webp)$/i)
    .withMessage("Image shop URL must point to a valid image file"),

  body("imageThumbnailUrl")
    .optional()
    .isURL()
    .withMessage("Image thumbnail URL must be a valid URL")
    .matches(/\.(jpg|jpeg|png|webp)$/i)
    .withMessage("Image thumbnail URL must point to a valid image file"),

  body("imageMediumUrl")
    .optional()
    .isURL()
    .withMessage("Image medium URL must be a valid URL")
    .matches(/\.(jpg|jpeg|png|webp)$/i)
    .withMessage("Image medium URL must point to a valid image file"),

  handleValidation,
];

// Query parameter validation for filtering
const validateGetItems = [
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
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(", ")}`),

  query("currency")
    .optional()
    .isIn(VALID_CURRENCIES)
    .withMessage(`Currency must be one of: ${VALID_CURRENCIES.join(", ")}`),

  query("clothingType")
    .optional()
    .isIn(VALID_CLOTHING_TYPES)
    .withMessage(
      `Clothing type must be one of: ${VALID_CLOTHING_TYPES.join(", ")}`
    ),

  query("layer")
    .optional()
    .isIn(VALID_LAYERS)
    .withMessage(`Layer must be one of: ${VALID_LAYERS.join(", ")}`),

  query("level")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Level must be between 1 and 100"),

  query("minLevel")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Minimum level must be between 1 and 100"),

  query("maxLevel")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Maximum level must be between 1 and 100"),

  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be a positive number"),

  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be a positive number"),

  query("sortBy")
    .optional()
    .isIn(["title", "price", "level", "createdAt", "updatedAt", "releaseDate"])
    .withMessage(
      "Sort by must be one of: title, price, level, createdAt, updatedAt, releaseDate"
    ),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),

  query("tags")
    .optional()
    .custom((tags) => {
      // Handle both string and array inputs
      const tagArray = Array.isArray(tags)
        ? tags
        : typeof tags === "string"
        ? tags.split(",")
        : [];
      const invalidTags = tagArray.filter(
        (tag) => !VALID_TAGS.includes(tag.trim())
      );
      if (invalidTags.length > 0) {
        throw new Error(
          `Invalid tags: ${invalidTags.join(
            ", "
          )}. Valid tags are: ${VALID_TAGS.join(", ")}`
        );
      }
      return true;
    }),

  query("search")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search term must be between 1 and 100 characters"),

  handleValidation,
];

// MongoDB ObjectId validation
const validateItemId = [
  param("id").isMongoId().withMessage("Invalid item ID format"),

  handleValidation,
];

module.exports = {
  validateCreateItem,
  validateUpdateItem,
  validateGetItems,
  validateItemId,
  VALID_TAGS,
  VALID_CLOTHING_TYPES,
  VALID_CURRENCIES,
  VALID_STATUSES,
  VALID_LAYERS,
};
