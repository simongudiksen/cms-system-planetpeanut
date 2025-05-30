const sharp = require("sharp");
const winston = require("winston");
const supabaseService = require("./supabaseService");

// Create logger for Image service
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

class ImageService {
  constructor() {
    // Define different size configurations for different image types
    this.imageSizes = {
      // Standard sizes for general use
      thumbnail: { width: 256, height: 256, quality: 80, fit: "cover" },
      medium: { width: 512, height: 512, quality: 85, fit: "cover" },

      // Avatar-specific sizes matching Planet Peanut requirements
      raised: { width: 2079, height: 2954, quality: 95, fit: "contain" }, // High-res for raised state
      shop: { width: 1040, height: 1477, quality: 90, fit: "contain" }, // Shop display size

      // Keep full for backward compatibility
      full: { width: 1024, height: 1024, quality: 90, fit: "cover" },
    };

    this.allowedMimeTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB default
  }

  /**
   * Validate image file
   * @param {Object} file - Multer file object
   * @returns {Promise<{valid: boolean, error?: string}>}
   */
  async validateImage(file) {
    try {
      // Check file size
      if (file.size > this.maxFileSize) {
        return {
          valid: false,
          error: `File size ${(file.size / 1024 / 1024).toFixed(
            2
          )}MB exceeds maximum allowed size of ${
            this.maxFileSize / 1024 / 1024
          }MB`,
        };
      }

      // Check MIME type
      if (!this.allowedMimeTypes.includes(file.mimetype)) {
        return {
          valid: false,
          error: `File type ${file.mimetype} not allowed. Supported types: PNG, JPEG, JPG, WebP`,
        };
      }

      // Verify image using Sharp
      try {
        const metadata = await sharp(file.buffer).metadata();

        if (!metadata.width || !metadata.height) {
          return {
            valid: false,
            error: "Invalid image file: unable to read dimensions",
          };
        }

        logger.info(
          `Image validation passed: ${metadata.width}x${metadata.height}, format: ${metadata.format}`
        );

        return {
          valid: true,
          metadata: {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size: file.size,
          },
        };
      } catch (sharpError) {
        logger.error("Sharp validation error:", sharpError);
        return {
          valid: false,
          error: "Invalid image file: corrupted or unsupported format",
        };
      }
    } catch (error) {
      logger.error("Image validation error:", error);
      return {
        valid: false,
        error: `Validation failed: ${error.message}`,
      };
    }
  }

  /**
   * Process image to multiple sizes
   * @param {Buffer} inputBuffer - Original image buffer
   * @param {Object} options - Processing options
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async processImage(inputBuffer, options = {}) {
    try {
      logger.info("Starting image processing for multiple sizes");

      const processedImages = {};
      const processingPromises = [];

      // Process each size
      for (const [sizeName, config] of Object.entries(this.imageSizes)) {
        const processingPromise = this.resizeImage(
          inputBuffer,
          config,
          sizeName
        );
        processingPromises.push(processingPromise);
      }

      // Wait for all processing to complete
      const results = await Promise.all(processingPromises);

      // Organize results
      for (const result of results) {
        if (result.success) {
          processedImages[result.sizeName] = result.buffer;
        } else {
          logger.error(`Failed to process ${result.sizeName}:`, result.error);
          return {
            success: false,
            error: `Image processing failed for ${result.sizeName}: ${result.error}`,
          };
        }
      }

      logger.info(
        `Successfully processed ${
          Object.keys(processedImages).length
        } image sizes`
      );

      return {
        success: true,
        data: processedImages,
      };
    } catch (error) {
      logger.error("Image processing error:", error);
      return {
        success: false,
        error: `Image processing failed: ${error.message}`,
      };
    }
  }

  /**
   * Resize image to specific dimensions
   * @param {Buffer} inputBuffer - Original image buffer
   * @param {Object} config - Size configuration
   * @param {string} sizeName - Name of the size being processed
   * @returns {Promise<{success: boolean, buffer?: Buffer, sizeName: string, error?: string}>}
   */
  async resizeImage(inputBuffer, config, sizeName) {
    try {
      const { width, height, quality, fit } = config;

      logger.info(
        `Resizing image to ${sizeName}: ${width}x${height} at ${quality}% quality (fit: ${fit})`
      );

      const resizedBuffer = await sharp(inputBuffer)
        .resize(width, height, {
          fit: fit,
          position: "center",
        })
        .webp({
          quality: quality,
          effort: 6, // Higher effort for better compression
        })
        .toBuffer();

      logger.info(
        `Successfully resized image to ${sizeName}: ${resizedBuffer.length} bytes`
      );

      return {
        success: true,
        buffer: resizedBuffer,
        sizeName,
      };
    } catch (error) {
      logger.error(`Error resizing image to ${sizeName}:`, error);
      return {
        success: false,
        sizeName,
        error: error.message,
      };
    }
  }

  /**
   * Upload processed images to Supabase
   * @param {Object} processedImages - Object containing processed image buffers
   * @param {string} itemId - Item identifier
   * @param {string} imageType - Type of image (raised, shop, etc.)
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async uploadToSupabase(processedImages, itemId, imageType = "item") {
    try {
      logger.info(
        `Uploading ${
          Object.keys(processedImages).length
        } processed images for item ${itemId}`
      );

      const uploadResult = await supabaseService.uploadImageSizes(
        processedImages,
        itemId,
        imageType
      );

      if (!uploadResult.success) {
        logger.error("Supabase upload failed:", uploadResult.error);
        return uploadResult;
      }

      // Transform the result to match our database schema
      const imageUrls = {
        thumbnail: uploadResult.data.thumbnail?.url || null,
        medium: uploadResult.data.medium?.url || null,
        full: uploadResult.data.full?.url || null,
        raised: uploadResult.data.raised?.url || null,
        shop: uploadResult.data.shop?.url || null,
      };

      logger.info(`Successfully uploaded all images for item ${itemId}`);

      return {
        success: true,
        data: {
          imageUrls,
          uploadPaths: uploadResult.data,
        },
      };
    } catch (error) {
      logger.error("Error uploading to Supabase:", error);
      return {
        success: false,
        error: `Upload failed: ${error.message}`,
      };
    }
  }

  /**
   * Complete image processing and upload pipeline
   * @param {Object} file - Multer file object
   * @param {string} itemId - Item identifier
   * @param {string} imageType - Type of image (raised, shop, etc.)
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async processAndUpload(file, itemId, imageType = "item") {
    try {
      logger.info(
        `Starting complete image pipeline for item ${itemId}, type: ${imageType}`
      );

      // Step 1: Validate image
      const validation = await this.validateImage(file);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Step 2: Process image to multiple sizes
      const processing = await this.processImage(file.buffer);
      if (!processing.success) {
        return {
          success: false,
          error: processing.error,
        };
      }

      // Step 3: Upload to Supabase
      const upload = await this.uploadToSupabase(
        processing.data,
        itemId,
        imageType
      );

      if (!upload.success) {
        return {
          success: false,
          error: upload.error,
        };
      }

      logger.info(`Complete image pipeline successful for item ${itemId}`);

      return {
        success: true,
        data: {
          imageUrls: upload.data.imageUrls,
          originalMetadata: validation.metadata,
          uploadPaths: upload.data.uploadPaths,
        },
      };
    } catch (error) {
      logger.error("Error in complete image pipeline:", error);
      return {
        success: false,
        error: `Image pipeline failed: ${error.message}`,
      };
    }
  }

  /**
   * Generate filename for image upload
   * @param {string} itemId - Item identifier
   * @param {string} imageType - Type of image
   * @param {string} size - Image size (thumbnail, medium, full)
   * @param {string} extension - File extension
   * @returns {string} Generated filename
   */
  generateFilename(itemId, imageType, size, extension = "webp") {
    const timestamp = Date.now();
    return `${itemId}/${imageType}_${size}_${timestamp}.${extension}`;
  }

  /**
   * Delete all images for an item
   * @param {string} itemId - Item identifier
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deleteItemImages(itemId) {
    try {
      logger.info(`Deleting all images for item: ${itemId}`);

      const result = await supabaseService.deleteItemImages(itemId);

      if (!result.success) {
        logger.error(
          `Failed to delete images for item ${itemId}:`,
          result.error
        );
      }

      return result;
    } catch (error) {
      logger.error("Error deleting item images:", error);
      return {
        success: false,
        error: `Failed to delete images: ${error.message}`,
      };
    }
  }

  /**
   * Get image metadata without processing
   * @param {Buffer} buffer - Image buffer
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async getImageMetadata(buffer) {
    try {
      const metadata = await sharp(buffer).metadata();

      return {
        success: true,
        data: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          space: metadata.space,
          channels: metadata.channels,
          depth: metadata.depth,
          density: metadata.density,
          hasProfile: metadata.hasProfile,
          hasAlpha: metadata.hasAlpha,
        },
      };
    } catch (error) {
      logger.error("Error getting image metadata:", error);
      return {
        success: false,
        error: `Failed to read metadata: ${error.message}`,
      };
    }
  }
}

// Create and export a singleton instance
const imageService = new ImageService();

module.exports = imageService;
