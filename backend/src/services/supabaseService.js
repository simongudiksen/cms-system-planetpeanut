const { createClient } = require("@supabase/supabase-js");
const winston = require("winston");

// Create logger for Supabase service
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

class SupabaseService {
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL;
    this.supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    this.bucketName = process.env.SUPABASE_STORAGE_BUCKET || "item-images";

    if (!this.supabaseUrl || !this.supabaseServiceKey) {
      logger.error(
        "Supabase configuration missing: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required"
      );
      throw new Error("Supabase configuration incomplete");
    }

    this.supabase = createClient(this.supabaseUrl, this.supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    logger.info("Supabase client initialized successfully");
  }

  /**
   * Upload a file to Supabase Storage
   * @param {Buffer} fileBuffer - File buffer to upload
   * @param {string} fileName - Name for the file in storage
   * @param {string} contentType - MIME type of the file
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async uploadFile(fileBuffer, fileName, contentType) {
    try {
      logger.info(`Uploading file: ${fileName} to bucket: ${this.bucketName}`);

      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(fileName, fileBuffer, {
          contentType,
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        logger.error("Supabase upload error:", error);
        return {
          success: false,
          error: `Upload failed: ${error.message}`,
        };
      }

      logger.info(`File uploaded successfully: ${data.path}`);
      return {
        success: true,
        data: {
          path: data.path,
          fullPath: data.fullPath || data.path,
        },
      };
    } catch (error) {
      logger.error("Unexpected error during file upload:", error);
      return {
        success: false,
        error: `Upload failed: ${error.message}`,
      };
    }
  }

  /**
   * Upload multiple image sizes for an item
   * @param {Object} imageSizes - Object containing different size buffers
   * @param {string} itemId - Unique identifier for the item
   * @param {string} imageType - Type of image (raised, shop, thumbnail, medium)
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async uploadImageSizes(imageSizes, itemId, imageType = "item") {
    try {
      const uploadResults = {};
      const uploadPromises = [];

      // Define size mappings
      const sizeConfig = {
        thumbnail: { suffix: "thumb", size: "256x256" },
        medium: { suffix: "med", size: "512x512" },
        full: { suffix: "full", size: "1024x1024" },
        raised: { suffix: "raised", size: "2079x2954" },
        shop: { suffix: "shop", size: "1040x1477" },
      };

      // Create upload promises for each size
      for (const [sizeName, buffer] of Object.entries(imageSizes)) {
        if (buffer && sizeConfig[sizeName]) {
          const config = sizeConfig[sizeName];
          const fileName = `${itemId}/${imageType}_${config.suffix}.webp`;

          const uploadPromise = this.uploadFile(
            buffer,
            fileName,
            "image/webp"
          ).then((result) => ({ sizeName, result }));

          uploadPromises.push(uploadPromise);
        }
      }

      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);

      // Process results
      for (const { sizeName, result } of results) {
        if (result.success) {
          uploadResults[sizeName] = {
            path: result.data.path,
            url: this.getPublicUrl(result.data.path),
          };
        } else {
          logger.error(
            `Failed to upload ${sizeName} for item ${itemId}:`,
            result.error
          );
          return {
            success: false,
            error: `Failed to upload ${sizeName}: ${result.error}`,
          };
        }
      }

      logger.info(
        `Successfully uploaded ${
          Object.keys(uploadResults).length
        } image sizes for item ${itemId}`
      );

      return {
        success: true,
        data: uploadResults,
      };
    } catch (error) {
      logger.error("Error uploading image sizes:", error);
      return {
        success: false,
        error: `Failed to upload images: ${error.message}`,
      };
    }
  }

  /**
   * Get public URL for a file in Supabase Storage
   * @param {string} filePath - Path to the file in storage
   * @returns {string} Public URL
   */
  getPublicUrl(filePath) {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Delete a file from Supabase Storage
   * @param {string} filePath - Path to the file to delete
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deleteFile(filePath) {
    try {
      logger.info(`Deleting file: ${filePath}`);

      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        logger.error("Supabase delete error:", error);
        return {
          success: false,
          error: `Delete failed: ${error.message}`,
        };
      }

      logger.info(`File deleted successfully: ${filePath}`);
      return { success: true };
    } catch (error) {
      logger.error("Unexpected error during file deletion:", error);
      return {
        success: false,
        error: `Delete failed: ${error.message}`,
      };
    }
  }

  /**
   * Delete all images for an item
   * @param {string} itemId - Unique identifier for the item
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deleteItemImages(itemId) {
    try {
      logger.info(`Deleting all images for item: ${itemId}`);

      // List all files in the item's folder
      const { data: files, error: listError } = await this.supabase.storage
        .from(this.bucketName)
        .list(itemId);

      if (listError) {
        logger.error("Error listing files for deletion:", listError);
        return {
          success: false,
          error: `Failed to list files: ${listError.message}`,
        };
      }

      if (!files || files.length === 0) {
        logger.info(`No files found for item ${itemId}`);
        return { success: true };
      }

      // Create full paths for deletion
      const filePaths = files.map((file) => `${itemId}/${file.name}`);

      // Delete all files
      const { error: deleteError } = await this.supabase.storage
        .from(this.bucketName)
        .remove(filePaths);

      if (deleteError) {
        logger.error("Error deleting files:", deleteError);
        return {
          success: false,
          error: `Failed to delete files: ${deleteError.message}`,
        };
      }

      logger.info(
        `Successfully deleted ${filePaths.length} files for item ${itemId}`
      );
      return { success: true };
    } catch (error) {
      logger.error("Unexpected error during item image deletion:", error);
      return {
        success: false,
        error: `Delete failed: ${error.message}`,
      };
    }
  }

  /**
   * Check if Supabase Storage bucket exists and is accessible
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async checkBucketAccess() {
    try {
      logger.info(`Checking access to bucket: ${this.bucketName}`);

      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .list("", { limit: 1 });

      if (error) {
        logger.error("Bucket access check failed:", error);
        return {
          success: false,
          error: `Bucket access failed: ${error.message}`,
        };
      }

      logger.info("Bucket access confirmed");
      return { success: true };
    } catch (error) {
      logger.error("Unexpected error during bucket access check:", error);
      return {
        success: false,
        error: `Bucket check failed: ${error.message}`,
      };
    }
  }
}

// Create and export a singleton instance
const supabaseService = new SupabaseService();

module.exports = supabaseService;
