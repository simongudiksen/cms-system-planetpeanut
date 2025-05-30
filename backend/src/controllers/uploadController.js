const imageService = require("../services/imageService");
const supabaseService = require("../services/supabaseService");
const Item = require("../models/Item");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const winston = require("winston");

// Create logger for upload controller
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

/**
 * Test image upload endpoint
 * POST /api/upload/test
 */
const testImageUpload = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("No image file provided", 400));
  }

  logger.info(`Test upload request for file: ${req.file.originalname}`);

  // Generate a test item ID for upload
  const testItemId = `test-${Date.now()}`;

  // Process and upload the image
  const result = await imageService.processAndUpload(
    req.file,
    testItemId,
    "test"
  );

  if (!result.success) {
    logger.error("Test upload failed:", result.error);
    return next(new AppError(result.error, 400));
  }

  logger.info(`Test upload successful for item: ${testItemId}`);

  res.status(200).json({
    success: true,
    message: "Image uploaded and processed successfully",
    data: {
      itemId: testItemId,
      imageUrls: result.data.imageUrls,
      originalMetadata: result.data.originalMetadata,
      uploadPaths: result.data.uploadPaths,
    },
  });
});

/**
 * Upload image for specific item
 * POST /api/upload/item/:itemId
 */
const uploadItemImage = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;
  const { imageType = "item" } = req.body;

  if (!req.file) {
    return next(new AppError("No image file provided", 400));
  }

  // Verify item exists
  const item = await Item.findById(itemId);
  if (!item) {
    return next(new AppError("Item not found", 404));
  }

  logger.info(`Uploading image for item: ${itemId}, type: ${imageType}`);

  // Process and upload the image
  const result = await imageService.processAndUpload(
    req.file,
    itemId,
    imageType
  );

  if (!result.success) {
    logger.error(`Image upload failed for item ${itemId}:`, result.error);
    return next(new AppError(result.error, 400));
  }

  // Update item with image URLs based on imageType
  const updateData = {};
  switch (imageType) {
    case "raised":
      updateData.imageRaisedUrl = result.data.imageUrls.raised;
      break;
    case "shop":
      updateData.imageShopUrl = result.data.imageUrls.shop;
      break;
    case "thumbnail":
      updateData.imageThumbnailUrl = result.data.imageUrls.thumbnail;
      break;
    case "medium":
      updateData.imageMediumUrl = result.data.imageUrls.medium;
      break;
    default:
      // For 'item' or other types, update all URLs
      updateData.imageRaisedUrl =
        result.data.imageUrls.raised || result.data.imageUrls.full;
      updateData.imageShopUrl =
        result.data.imageUrls.shop || result.data.imageUrls.full;
      updateData.imageThumbnailUrl = result.data.imageUrls.thumbnail;
      updateData.imageMediumUrl = result.data.imageUrls.medium;
  }

  // Add updatedBy information if available from auth
  if (req.user && req.user.id) {
    updateData.updatedBy = req.user.id;
  }

  // Update the item with new image URLs
  const updatedItem = await Item.findByIdAndUpdate(itemId, updateData, {
    new: true,
    runValidators: true,
  });

  logger.info(`Successfully updated item ${itemId} with new image URLs`);

  res.status(200).json({
    success: true,
    message: "Image uploaded and item updated successfully",
    data: {
      item: updatedItem,
      imageUrls: result.data.imageUrls,
      originalMetadata: result.data.originalMetadata,
      uploadPaths: result.data.uploadPaths,
    },
  });
});

/**
 * Upload multiple images for an item
 * POST /api/upload/item/:itemId/multiple
 */
const uploadMultipleItemImages = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;

  if (!req.files || req.files.length === 0) {
    return next(new AppError("No image files provided", 400));
  }

  // Verify item exists
  const item = await Item.findById(itemId);
  if (!item) {
    return next(new AppError("Item not found", 404));
  }

  logger.info(`Uploading ${req.files.length} images for item: ${itemId}`);

  const uploadResults = [];
  const updateData = {};

  // Process each file
  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i];
    const imageType = `item-${i + 1}`;

    logger.info(
      `Processing file ${i + 1}/${req.files.length}: ${file.originalname}`
    );

    const result = await imageService.processAndUpload(file, itemId, imageType);

    if (!result.success) {
      logger.error(`Failed to upload image ${i + 1}:`, result.error);
      return next(
        new AppError(`Failed to upload image ${i + 1}: ${result.error}`, 400)
      );
    }

    uploadResults.push({
      index: i + 1,
      originalName: file.originalname,
      imageType,
      imageUrls: result.data.imageUrls,
      uploadPaths: result.data.uploadPaths,
    });

    // Update the appropriate field based on index
    if (i === 0) {
      updateData.imageRaisedUrl = result.data.imageUrls.full;
      updateData.imageThumbnailUrl = result.data.imageUrls.thumbnail;
    } else if (i === 1) {
      updateData.imageShopUrl = result.data.imageUrls.full;
    } else if (i === 2) {
      updateData.imageMediumUrl = result.data.imageUrls.medium;
    }
  }

  // Add updatedBy information if available from auth
  if (req.user && req.user.id) {
    updateData.updatedBy = req.user.id;
  }

  // Update the item with new image URLs
  const updatedItem = await Item.findByIdAndUpdate(itemId, updateData, {
    new: true,
    runValidators: true,
  });

  logger.info(
    `Successfully uploaded ${uploadResults.length} images for item ${itemId}`
  );

  res.status(200).json({
    success: true,
    message: `${uploadResults.length} images uploaded and item updated successfully`,
    data: {
      item: updatedItem,
      uploadResults,
    },
  });
});

/**
 * Get image metadata without uploading
 * POST /api/upload/metadata
 */
const getImageMetadata = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("No image file provided", 400));
  }

  logger.info(`Getting metadata for file: ${req.file.originalname}`);

  // Validate the image
  const validation = await imageService.validateImage(req.file);
  if (!validation.valid) {
    return next(new AppError(validation.error, 400));
  }

  // Get detailed metadata using Sharp
  const metadata = await imageService.getImageMetadata(req.file.buffer);
  if (!metadata.success) {
    return next(new AppError(metadata.error, 400));
  }

  res.status(200).json({
    success: true,
    message: "Image metadata retrieved successfully",
    data: {
      file: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
      metadata: metadata.data,
      validation: validation.metadata,
    },
  });
});

/**
 * Delete images for an item
 * DELETE /api/upload/item/:itemId
 */
const deleteItemImages = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;

  // Verify item exists
  const item = await Item.findById(itemId);
  if (!item) {
    return next(new AppError("Item not found", 404));
  }

  logger.info(`Deleting images for item: ${itemId}`);

  // Delete images from Supabase Storage
  const deleteResult = await imageService.deleteItemImages(itemId);
  if (!deleteResult.success) {
    logger.error(
      `Failed to delete images for item ${itemId}:`,
      deleteResult.error
    );
    return next(new AppError(deleteResult.error, 400));
  }

  // Clear image URLs in database
  const updateData = {
    imageRaisedUrl: null,
    imageShopUrl: null,
    imageThumbnailUrl: null,
    imageMediumUrl: null,
  };

  // Add updatedBy information if available from auth
  if (req.user && req.user.id) {
    updateData.updatedBy = req.user.id;
  }

  const updatedItem = await Item.findByIdAndUpdate(itemId, updateData, {
    new: true,
    runValidators: true,
  });

  logger.info(`Successfully deleted images and updated item ${itemId}`);

  res.status(200).json({
    success: true,
    message: "Images deleted successfully",
    data: {
      item: updatedItem,
    },
  });
});

/**
 * Check Supabase connection and bucket access
 * GET /api/upload/health
 */
const checkUploadHealth = catchAsync(async (req, res, next) => {
  logger.info("Checking upload service health");

  // Check Supabase bucket access
  const bucketCheck = await supabaseService.checkBucketAccess();

  const healthData = {
    supabase: {
      connected: bucketCheck.success,
      error: bucketCheck.error || null,
    },
    imageService: {
      configured: true,
      maxFileSize: `${imageService.maxFileSize / 1024 / 1024}MB`,
      allowedTypes: imageService.allowedMimeTypes,
      imageSizes: imageService.imageSizes,
    },
  };

  const allHealthy = bucketCheck.success;

  res.status(allHealthy ? 200 : 503).json({
    success: allHealthy,
    message: allHealthy
      ? "Upload service healthy"
      : "Upload service has issues",
    data: healthData,
  });
});

/**
 * Upload both raised and shop images for item creation
 * Processes both images and returns all generated size URLs
 */
const uploadItemImages = catchAsync(async (req, res) => {
  const { files } = req;

  if (!files || (!files.imageRaised && !files.imageShop)) {
    throw new AppError(
      "At least one image file is required (imageRaised or imageShop)",
      400
    );
  }

  const results = {
    success: true,
    data: {
      imageUrls: {},
      processedSizes: [],
    },
  };

  try {
    // Process imageRaised if provided
    if (files.imageRaised && files.imageRaised[0]) {
      const raisedFile = files.imageRaised[0];

      logger.info(`Processing raised image: ${raisedFile.originalname}`);

      // Process image through imageService
      const processedImages = await imageService.processImage(
        raisedFile.buffer
      );

      // Upload to Supabase with temporary itemId (will be replaced when item is created)
      const tempItemId = `temp_${Date.now()}_raised`;
      const uploadResult = await supabaseService.uploadImageSizes(
        processedImages,
        tempItemId,
        "raised"
      );

      if (uploadResult.success) {
        results.data.imageUrls.raised = uploadResult.data.raised?.url;
        results.data.imageUrls.raisedThumbnail =
          uploadResult.data.thumbnail?.url;
        results.data.imageUrls.raisedMedium = uploadResult.data.medium?.url;
        results.data.processedSizes.push("raised");
      }
    }

    // Process imageShop if provided
    if (files.imageShop && files.imageShop[0]) {
      const shopFile = files.imageShop[0];

      logger.info(`Processing shop image: ${shopFile.originalname}`);

      // Process image through imageService
      const processedImages = await imageService.processImage(shopFile.buffer);

      // Upload to Supabase with temporary itemId
      const tempItemId = `temp_${Date.now()}_shop`;
      const uploadResult = await supabaseService.uploadImageSizes(
        processedImages,
        tempItemId,
        "shop"
      );

      if (uploadResult.success) {
        results.data.imageUrls.shop = uploadResult.data.shop?.url;
        results.data.imageUrls.shopThumbnail = uploadResult.data.thumbnail?.url;
        results.data.imageUrls.shopMedium = uploadResult.data.medium?.url;
        results.data.processedSizes.push("shop");
      }
    }

    logger.info(
      `Successfully processed ${results.data.processedSizes.length} image types`
    );

    res.json({
      success: true,
      message: `Successfully processed ${results.data.processedSizes.join(
        " and "
      )} images`,
      data: results.data,
    });
  } catch (error) {
    logger.error("Error in uploadItemImages:", error);
    throw new AppError(`Image upload failed: ${error.message}`, 500);
  }
});

module.exports = {
  testImageUpload,
  uploadItemImage,
  uploadMultipleItemImages,
  getImageMetadata,
  deleteItemImages,
  checkUploadHealth,
  uploadItemImages,
};
