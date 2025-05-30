const express = require("express");
const uploadController = require("../controllers/uploadController");
const {
  singleImageUpload,
  multipleImageUpload,
  requireFile,
  logUploadStats,
} = require("../middleware/upload");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

/**
 * Health check for upload service
 * GET /api/upload/health
 */
router.get("/health", uploadController.checkUploadHealth);

/**
 * Test image upload endpoint (for development/testing)
 * POST /api/upload/test
 * Requires: image file
 */
router.post(
  "/test",
  singleImageUpload,
  requireFile,
  logUploadStats,
  uploadController.testImageUpload
);

/**
 * Get image metadata without uploading
 * POST /api/upload/metadata
 * Requires: image file
 */
router.post(
  "/metadata",
  singleImageUpload,
  requireFile,
  logUploadStats,
  uploadController.getImageMetadata
);

/**
 * Upload single image for a specific item
 * POST /api/upload/item/:itemId
 * Requires: Authentication, image file
 * Optional body: { imageType: 'raised'|'shop'|'thumbnail'|'medium'|'item' }
 */
router.post(
  "/item/:itemId",
  authenticateToken,
  singleImageUpload,
  requireFile,
  logUploadStats,
  uploadController.uploadItemImage
);

/**
 * Upload multiple images for a specific item
 * POST /api/upload/item/:itemId/multiple
 * Requires: Authentication, multiple image files (field: 'images')
 */
router.post(
  "/item/:itemId/multiple",
  authenticateToken,
  multipleImageUpload,
  requireFile,
  logUploadStats,
  uploadController.uploadMultipleItemImages
);

/**
 * Delete all images for a specific item
 * DELETE /api/upload/item/:itemId
 * Requires: Authentication
 */
router.delete(
  "/item/:itemId",
  authenticateToken,
  uploadController.deleteItemImages
);

/**
 * Upload both raised and shop images for item creation
 * POST /api/upload/item-images
 * Requires: imageRaised and imageShop files
 * Returns: URLs for all generated sizes
 */
router.post(
  "/item-images",
  authenticateToken,
  (req, res, next) => {
    // Custom multer for handling two specific files
    const upload = require("multer")({
      storage: require("multer").memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith("image/")) {
          cb(null, true);
        } else {
          cb(new Error("Only image files are allowed"), false);
        }
      },
    });

    // Handle both imageRaised and imageShop
    upload.fields([
      { name: "imageRaised", maxCount: 1 },
      { name: "imageShop", maxCount: 1 },
    ])(req, res, next);
  },
  logUploadStats,
  uploadController.uploadItemImages
);

module.exports = router;
