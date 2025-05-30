const fs = require("fs").promises;
const path = require("path");
const { improveItemName } = require("./improveNames");

// Only require these if we need them for processing
let sharp, imageService, Item, mongoose;

require("dotenv").config();

// Create logger
const winston = require("winston");
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

class ItemImageProcessor {
  constructor() {
    this.raisedDir = path.join(__dirname, "../../ImageRaised");
    this.shopDir = path.join(__dirname, "../../ImageShop");
    this.mappings = [];
    this.processed = [];
    this.errors = [];
  }

  /**
   * Normalize filename for matching
   */
  normalizeFilename(filename) {
    return filename
      .replace(/\.png$/i, "")
      .toLowerCase()
      .replace(/store/g, "")
      .replace(/fixed/g, "")
      .replace(/alt\d?/g, "")
      .replace(/sv/g, "")
      .replace(/[^a-z0-9]/g, "");
  }

  /**
   * Create mapping between raised and shop images
   */
  async createImageMappings() {
    try {
      logger.info(
        "Creating image mappings between ImageRaised and ImageShop folders"
      );

      const raisedFiles = await fs.readdir(this.raisedDir);
      const shopFiles = await fs.readdir(this.shopDir);

      const pngRaisedFiles = raisedFiles.filter((f) =>
        f.toLowerCase().endsWith(".png")
      );
      const pngShopFiles = shopFiles.filter((f) =>
        f.toLowerCase().endsWith(".png")
      );

      logger.info(`Found ${pngRaisedFiles.length} PNG files in ImageRaised`);
      logger.info(`Found ${pngShopFiles.length} PNG files in ImageShop`);

      // Create normalized mappings
      const normalizedShopFiles = pngShopFiles.map((file) => ({
        original: file,
        normalized: this.normalizeFilename(file),
      }));

      for (const raisedFile of pngRaisedFiles) {
        const normalizedRaised = this.normalizeFilename(raisedFile);

        // Find matching shop file
        const shopMatch = normalizedShopFiles.find(
          (shopFile) =>
            shopFile.normalized === normalizedRaised ||
            shopFile.normalized.includes(normalizedRaised) ||
            normalizedRaised.includes(shopFile.normalized)
        );

        if (shopMatch) {
          this.mappings.push({
            raised: raisedFile,
            shop: shopMatch.original,
            normalizedName: normalizedRaised,
            raisedPath: path.join(this.raisedDir, raisedFile),
            shopPath: path.join(this.shopDir, shopMatch.original),
          });
        } else {
          logger.warn(`No shop image found for raised image: ${raisedFile}`);
          this.errors.push({
            type: "missing_shop",
            file: raisedFile,
            message: "No matching shop image found",
          });
        }
      }

      // Find orphaned shop files
      const mappedShopFiles = this.mappings.map((m) => m.shop);
      const orphanedShopFiles = pngShopFiles.filter(
        (f) => !mappedShopFiles.includes(f)
      );

      for (const orphan of orphanedShopFiles) {
        logger.warn(`Orphaned shop image (no matching raised): ${orphan}`);
        this.errors.push({
          type: "orphaned_shop",
          file: orphan,
          message: "No matching raised image found",
        });
      }

      logger.info(`Created ${this.mappings.length} image mappings`);
      return this.mappings;
    } catch (error) {
      logger.error("Error creating image mappings:", error);
      throw error;
    }
  }

  /**
   * Generate item name from filename
   */
  generateItemName(normalizedName) {
    // Use the improved naming system
    const basicName = normalizedName
      .replace(/([a-z])([A-Z])/g, "$1 $2") // Add spaces before capitals
      .replace(/\b\w/g, (l) => l.toUpperCase()) // Capitalize first letters
      .replace(/3d/gi, "3D")
      .replace(/Sv/gi, "")
      .trim();

    // Apply improvements from the helper
    const improvedName = improveItemName(normalizedName, basicName);
    return improvedName || "Unknown Item";
  }

  /**
   * Determine clothing type and layer from filename
   */
  determineItemProperties(filename) {
    const lower = filename.toLowerCase();

    // Determine clothing type
    let clothingType = "casual wear";
    let layer = "body_layer1";
    let tags = ["casual"];

    if (
      lower.includes("helmet") ||
      lower.includes("mask") ||
      lower.includes("hat") ||
      lower.includes("headband") ||
      lower.includes("glasses") ||
      lower.includes("ski")
    ) {
      clothingType = "space gear";
      layer = "head_layer1";
      tags = ["space", "utility"];
    } else if (lower.includes("gun") || lower.includes("knife")) {
      clothingType = "weapons";
      layer = "accessory";
      tags = ["weapons"];
    } else if (lower.includes("suit") || lower.includes("robe")) {
      clothingType = "Official Planet Peanut Work Wear";
      layer = "fullbody1";
      tags = ["official"];
    } else if (
      lower.includes("belt") ||
      lower.includes("cable") ||
      lower.includes("gear")
    ) {
      clothingType = "utility gear";
      layer = "accessory";
      tags = ["utility"];
    } else if (lower.includes("hoodie") || lower.includes("sweats")) {
      clothingType = "casual wear";
      layer = "body_layer1";
      tags = ["casual"];
    }

    // Determine price range based on type
    let price = 100;
    let currency = "peanuts";

    if (clothingType === "weapons") {
      price = 500;
      currency = "diamonds";
    } else if (clothingType === "Official Planet Peanut Work Wear") {
      price = 300;
    } else if (clothingType === "space gear") {
      price = 200;
    }

    return { clothingType, layer, tags, price, currency };
  }

  /**
   * Initialize required modules for processing
   */
  async initializeProcessingModules() {
    if (!sharp) {
      sharp = require("sharp");
      imageService = require("../src/services/imageService");
      Item = require("../src/models/Item");
      mongoose = require("mongoose");
    }
  }

  /**
   * Process a single image mapping
   */
  async processImageMapping(mapping, dryRun = false) {
    try {
      await this.initializeProcessingModules();

      logger.info(`Processing mapping: ${mapping.raised} -> ${mapping.shop}`);

      // Read both image files
      const raisedBuffer = await fs.readFile(mapping.raisedPath);
      const shopBuffer = await fs.readFile(mapping.shopPath);

      // Validate both images
      const raisedValidation = await imageService.validateImage({
        buffer: raisedBuffer,
        originalname: mapping.raised,
        mimetype: "image/png",
        size: raisedBuffer.length,
      });

      const shopValidation = await imageService.validateImage({
        buffer: shopBuffer,
        originalname: mapping.shop,
        mimetype: "image/png",
        size: shopBuffer.length,
      });

      if (!raisedValidation.valid || !shopValidation.valid) {
        throw new Error(
          `Image validation failed: ${
            raisedValidation.error || shopValidation.error
          }`
        );
      }

      // Generate item properties
      const itemName = this.generateItemName(mapping.normalizedName);
      const properties = this.determineItemProperties(mapping.raised);

      const itemData = {
        title: itemName,
        description: `${itemName} - Imported from image collection`,
        ...properties,
        level: 1,
        status: "draft", // Start as draft for review
      };

      if (dryRun) {
        logger.info(
          `DRY RUN - Would create item: ${JSON.stringify(itemData, null, 2)}`
        );
        return { success: true, dryRun: true, itemData };
      }

      // Create item in database
      const item = new Item(itemData);
      await item.save();

      logger.info(`Created item: ${item._id} - ${item.title}`);

      // Process and upload raised image
      const raisedResult = await imageService.processAndUpload(
        {
          buffer: raisedBuffer,
          originalname: mapping.raised,
          mimetype: "image/png",
          size: raisedBuffer.length,
        },
        item._id.toString(),
        "raised"
      );

      if (!raisedResult.success) {
        throw new Error(`Raised image upload failed: ${raisedResult.error}`);
      }

      // Process and upload shop image
      const shopResult = await imageService.processAndUpload(
        {
          buffer: shopBuffer,
          originalname: mapping.shop,
          mimetype: "image/png",
          size: shopBuffer.length,
        },
        item._id.toString(),
        "shop"
      );

      if (!shopResult.success) {
        throw new Error(`Shop image upload failed: ${shopResult.error}`);
      }

      // Update item with image URLs
      await Item.findByIdAndUpdate(item._id, {
        imageRaisedUrl: raisedResult.data.imageUrls.raised,
        imageShopUrl: shopResult.data.imageUrls.shop,
        imageThumbnailUrl: raisedResult.data.imageUrls.thumbnail,
        imageMediumUrl: raisedResult.data.imageUrls.medium,
      });

      const result = {
        success: true,
        item: {
          id: item._id,
          title: item.title,
          clothingType: item.clothingType,
          layer: item.layer,
          price: item.price,
          currency: item.currency,
        },
        images: {
          raised: raisedResult.data.imageUrls.raised,
          shop: shopResult.data.imageUrls.shop,
          thumbnail: raisedResult.data.imageUrls.thumbnail,
          medium: raisedResult.data.imageUrls.medium,
        },
        mapping,
      };

      this.processed.push(result);
      return result;
    } catch (error) {
      logger.error(
        `Error processing mapping ${mapping.raised} -> ${mapping.shop}:`,
        error
      );
      this.errors.push({
        type: "processing_error",
        mapping,
        error: error.message,
      });
      return { success: false, error: error.message, mapping };
    }
  }

  /**
   * Process all mappings
   */
  async processAllMappings(options = {}) {
    const { dryRun = false, limit = null, startIndex = 0 } = options;

    try {
      await this.initializeProcessingModules();

      logger.info(
        `Starting batch processing - DryRun: ${dryRun}, Limit: ${
          limit || "none"
        }, StartIndex: ${startIndex}`
      );

      if (!mongoose.connection.readyState) {
        await mongoose.connect(process.env.MONGODB_URI);
        logger.info("Connected to MongoDB");
      }

      const mappingsToProcess = limit
        ? this.mappings.slice(startIndex, startIndex + limit)
        : this.mappings.slice(startIndex);

      logger.info(`Processing ${mappingsToProcess.length} mappings`);

      const results = [];
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < mappingsToProcess.length; i++) {
        const mapping = mappingsToProcess[i];
        logger.info(
          `Processing ${i + 1}/${mappingsToProcess.length}: ${mapping.raised}`
        );

        try {
          const result = await this.processImageMapping(mapping, dryRun);
          results.push(result);

          if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }

          // Add delay between processing to avoid overwhelming services
          if (i < mappingsToProcess.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } catch (error) {
          logger.error(`Failed to process mapping ${i + 1}:`, error);
          errorCount++;
          results.push({ success: false, error: error.message, mapping });
        }
      }

      const summary = {
        total: mappingsToProcess.length,
        successful: successCount,
        failed: errorCount,
        dryRun,
        results,
        errors: this.errors,
      };

      logger.info(
        `Batch processing complete - Success: ${successCount}, Failed: ${errorCount}`
      );
      return summary;
    } catch (error) {
      logger.error("Error in batch processing:", error);
      throw error;
    }
  }

  /**
   * Generate report of mappings and potential issues
   */
  generateReport() {
    const report = {
      summary: {
        totalMappings: this.mappings.length,
        totalErrors: this.errors.length,
        totalProcessed: this.processed.length,
      },
      mappings: this.mappings.map((m) => ({
        raised: m.raised,
        shop: m.shop,
        normalizedName: m.normalizedName,
        suggestedTitle: this.generateItemName(m.normalizedName),
        properties: this.determineItemProperties(m.raised),
      })),
      errors: this.errors,
      processed: this.processed,
    };

    return report;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "help";

  const processor = new ItemImageProcessor();

  try {
    switch (command) {
      case "analyze":
        await processor.createImageMappings();
        const report = processor.generateReport();
        console.log(JSON.stringify(report, null, 2));
        break;

      case "dry-run":
        await processor.createImageMappings();
        const dryResults = await processor.processAllMappings({
          dryRun: true,
          limit: 5,
        });
        console.log(JSON.stringify(dryResults, null, 2));
        break;

      case "process":
        const limit = args[1] ? parseInt(args[1]) : null;
        const startIndex = args[2] ? parseInt(args[2]) : 0;

        await processor.createImageMappings();
        const results = await processor.processAllMappings({
          dryRun: false,
          limit,
          startIndex,
        });
        console.log(JSON.stringify(results, null, 2));
        break;

      case "help":
      default:
        console.log(`
Planet Peanut Image Processor

Commands:
  analyze                    - Analyze folders and create mappings report
  dry-run                   - Test processing first 5 mappings without creating items
  process [limit] [start]   - Process all or limited number of mappings
    limit: Number of items to process (optional)
    start: Start index (optional, default: 0)

Examples:
  node processItemImages.js analyze
  node processItemImages.js dry-run
  node processItemImages.js process
  node processItemImages.js process 10
  node processItemImages.js process 10 5
        `);
        break;
    }
  } catch (error) {
    logger.error("Script execution error:", error);
    process.exit(1);
  } finally {
    if (mongoose && mongoose.connection.readyState) {
      await mongoose.disconnect();
    }
  }
}

// Export for use as module
module.exports = ItemImageProcessor;

// Run if called directly
if (require.main === module) {
  main();
}
