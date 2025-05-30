const fs = require("fs").promises;
const path = require("path");

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

// Original metadata from your code
const originalItems = {
  1: {
    title: "Gasmask",
    imageRaised: "Gasmask.png",
    imageShop: "StoreGasMask.png",
    layer: "head_layer1", // converted from layers.head.full
    price: 15,
    clothingType: "experimental",
    currency: "diamonds",
    level: 10,
  },
  2: {
    title: "Peanut Pulsar",
    imageRaised: "Gun1.png",
    imageShop: "StoreGun1.png",
    layer: "accessory", // converted from layers.accesory[1]
    price: 549,
    clothingType: "weapons",
    currency: "peanuts",
    level: 1,
  },
  3: {
    title: "Astro-Shell Helmet - Blue",
    imageRaised: "HelmetBlue.png",
    imageShop: "StoreHelmetBlue.png",
    layer: "head_layer1",
    price: 1000,
    clothingType: "space",
    currency: "peanuts",
    level: 1,
  },
  4: {
    title: "Legume Launcher",
    imageRaised: "Gun2.png",
    imageShop: "StoreGun2.png",
    layer: "accessory",
    price: 3,
    currency: "diamonds",
    clothingType: "weapons",
    level: 2,
  },
  5: {
    title: "Cosmic Cracker",
    imageRaised: "Gun3.png",
    imageShop: "StoreGun3.png",
    layer: "accessory",
    price: 15,
    clothingType: "weapons",
    currency: "diamonds",
    level: 7,
  },
  6: {
    title: "Peanut Fleet Standard Issue (PFSI) - Blue",
    imageRaised: "IndoorsuitBlue.png",
    imageShop: "IndoorsuitBlue1.png",
    layer: "fullbody1",
    price: 250,
    clothingType: "official",
    currency: "peanuts",
    level: 1,
  },
  7: {
    title: "3D glasses",
    imageRaised: "3DGlasses.png",
    imageShop: "Store3dGlasses.png",
    layer: "head_layer1",
    price: 55,
    clothingType: "utility",
    currency: "peanuts",
    level: 1,
  },
  8: {
    title: "Elf Hat",
    imageRaised: "ChristmasHat.png",
    imageShop: "StoreChristmasHat.png",
    layer: "head_layer1",
    price: 75,
    clothingType: "casual",
    currency: "peanuts",
    level: 1,
  },
  9: {
    title: "Crunch Ray",
    imageRaised: "Gun4.png",
    imageShop: "StoreGun4.png",
    layer: "accessory",
    price: 8,
    clothingType: "weapons",
    currency: "diamonds",
    level: 5,
  },
  10: {
    title: "Astro-Shell Helmet - Red",
    imageRaised: "HelmetRed.png",
    imageShop: "StoreHelmetRed.png",
    layer: "head_layer1",
    price: 1250,
    clothingType: "space",
    currency: "peanuts",
    level: 2,
  },
  11: {
    title: "Astro-Shell Helmet - Pink",
    imageRaised: "HelmetPink.png",
    imageShop: "StoreHelmetPink.png",
    layer: "head_layer1",
    price: 1250,
    clothingType: "space",
    currency: "peanuts",
    level: 4,
  },
  12: {
    title: "Astro-Shell Helmet - White",
    imageRaised: "HelmetWhite.png",
    imageShop: "StoreHelmet.png",
    layer: "head_layer1",
    price: 2390,
    clothingType: "space",
    currency: "peanuts",
    level: 5,
  },
  13: {
    title: "Peanut Pioneer Hoodie - Blue",
    imageRaised: "HoodieBlue.png",
    imageShop: "StoreHoodieBlue.png",
    layer: "body_layer1",
    price: 460,
    clothingType: "casual",
    currency: "peanuts",
    level: 1,
  },
  14: {
    title: "Peanut Pioneer Hoodie - Pink",
    imageRaised: "HoodiePink.png",
    imageShop: "StoreHoodiePink.png",
    layer: "body_layer1",
    price: 980,
    clothingType: "casual",
    currency: "peanuts",
    level: 1,
  },
  15: {
    title: "Peanut Pioneer Hoodie - Red",
    imageRaised: "HoodieRed.png",
    imageShop: "StoreHoodieRed.png",
    layer: "body_layer1",
    price: 1850,
    clothingType: "casual",
    currency: "peanuts",
    level: 8,
  },
  16: {
    title: "Peanut Fleet Standard Issue (PFSI) - Green",
    imageRaised: "IndoorsuitGreen.png",
    imageShop: "IndoorsuitGreen.png",
    layer: "fullbody1",
    price: 1500,
    clothingType: "official",
    currency: "peanuts",
    level: 1,
  },
  17: {
    title: "Peanut Fleet Standard Issue (PFSI) - Orange",
    imageRaised: "IndoorsuitOrange.png",
    imageShop: "IndoorsuitOrange.png",
    layer: "fullbody1",
    price: 1500,
    clothingType: "official",
    currency: "peanuts",
    level: 1,
  },
  18: {
    title: "Peanut Fleet Standard Issue (PFSI) - Pink",
    imageRaised: "IndoorsuitPink.png",
    imageShop: "IndoorsuitPink.png",
    layer: "fullbody1",
    price: 1500,
    clothingType: "official",
    currency: "peanuts",
    level: 1,
  },
  19: {
    title: "Peanut Fleet Standard Issue (PFSI) - Purple",
    imageRaised: "IndoorsuitPurple.png",
    imageShop: "IndoorsuitPurple.png",
    layer: "fullbody1",
    price: 1500,
    clothingType: "official",
    currency: "peanuts",
    level: 1,
  },
  20: {
    title: "Plasma Inhaler",
    imageRaised: "MouthMask.png",
    imageShop: "StoreMouthMask.png",
    layer: "head_layer1",
    price: 2800,
    clothingType: "experimental",
    currency: "peanuts",
    level: 10,
  },
  21: {
    title: "Stellar Glint Shades - Blue",
    imageRaised: "Ski1.png",
    imageShop: "StoreSkiGlasses1.png",
    layer: "head_layer1",
    price: 13000,
    clothingType: "casual",
    currency: "peanuts",
    level: 2,
  },
  22: {
    title: "Stellar Glint Shades - Green",
    imageRaised: "Ski2.png",
    imageShop: "StoreSkiGlasses2.png",
    layer: "head_layer1",
    price: 3800,
    clothingType: "casual",
    currency: "peanuts",
    level: 10,
  },
  23: {
    title: "Peanut Horizon Advanced Zonewear (PHAZ) - Orange",
    imageRaised: "SpacesuitOrange.png",
    imageShop: "SpacesuitOrange.png",
    layer: "fullbody1",
    price: 15000,
    clothingType: "space",
    currency: "peanuts",
    level: 11,
  },
  24: {
    title: "Peanut Horizon Advanced Zonewear (PHAZ) - White",
    imageRaised: "SpacesuitWhite.png",
    imageShop: "SpacesuitWhite.png",
    layer: "fullbody1",
    price: 15000,
    clothingType: "space",
    currency: "peanuts",
    level: 8,
  },
  25: {
    title: "Nutri-Flex Bottoms - Blue",
    imageRaised: "SweatsBlue.png",
    imageShop: "StoreSweatsBlue.png",
    layer: "pants_layer1",
    price: 950,
    clothingType: "casual",
    currency: "peanuts",
    level: 1,
  },
  26: {
    title: "Nutri-Flex Bottoms - Pink",
    imageRaised: "SweatsPink.png",
    imageShop: "StoreSweatsPink.png",
    layer: "pants_layer1",
    price: 1280,
    clothingType: "casual",
    currency: "peanuts",
    level: 6,
  },
  27: {
    title: "Nutri-Flex Bottoms - Red",
    imageRaised: "SweatsRed.png",
    imageShop: "StoreSweatsRed.png",
    layer: "pants_layer1",
    price: 1280,
    clothingType: "casual",
    currency: "peanuts",
    level: 9,
  },
  28: {
    title: "Banana Peel - Banana colored",
    imageRaised: "BananaFixed.png",
    imageShop: "BananaPeelSV.png",
    layer: "head_layer1",
    price: 565,
    clothingType: "experimental",
    currency: "peanuts",
    level: 1,
  },
  29: {
    title: "Current Strands",
    imageRaised: "CableFixed.png",
    imageShop: "CablesSV.png",
    layer: "body_layer2",
    price: 1780,
    clothingType: "utility",
    currency: "peanuts",
    level: 1,
  },
  291: {
    title: "Current Strands",
    imageRaised: "CablesAlt.png",
    imageShop: "CablesAltSV.png",
    layer: "body_layer2",
    price: 779,
    clothingType: "utility",
    currency: "peanuts",
    level: 1,
    color: "Red",
  },
  30: {
    title: "Titan Vest",
    imageRaised: "LeatherGearFixed.png",
    imageShop: "LeatherGearSV.png",
    layer: "body_layer1",
    price: 2999,
    clothingType: "armor",
    currency: "peanuts",
    level: 12,
  },
  31: {
    title: "Kernel Belt",
    imageRaised: "Multi-BeltFixed.png",
    imageShop: "MultiBeltSV.png",
    layer: "body_layer1",
    price: 380,
    clothingType: "armor",
    currency: "peanuts",
    level: 7,
  },
  311: {
    title: "Kernel Belt",
    imageRaised: "MultiBeltAlt.png",
    imageShop: "Multi-BeltAltSv.png",
    layer: "body_layer1",
    price: 1199,
    clothingType: "armor",
    currency: "peanuts",
    level: 11,
  },
  32: {
    title: "Orbit Chain",
    imageRaised: "NecklaceFixed.png",
    imageShop: "NecklaceSV.png",
    layer: "body_layer2",
    price: 430,
    clothingType: "governance",
    currency: "peanuts",
    level: 1,
  },
  33: {
    title: "Void Locket",
    imageRaised: "NeckScrapFixed.png",
    imageShop: "NeckScrapSV.png",
    layer: "body_layer2",
    price: 540,
    clothingType: "primal",
    currency: "peanuts",
    level: 12,
  },
  34: {
    title: "Lunar Crown",
    imageRaised: "PeanutHeadbandFixed.png",
    imageShop: "PeanutHeadBandSV.png",
    layer: "head_layer1",
    price: 899,
    clothingType: "governance",
    currency: "peanuts",
    level: 11,
  },
  35: {
    title: "Supreme Drape",
    imageRaised: "PeanutRobeFixed.png",
    imageShop: "PeanutRobeSV.png",
    layer: "fullbody1",
    price: 15,
    clothingType: "governance",
    currency: "diamonds",
    level: 13,
  },
  36: {
    title: "Echo Visor",
    imageRaised: "ScouterFixed.png",
    imageShop: "ScouterSV.png",
    layer: "head_layer1",
    price: 8,
    clothingType: "experimental",
    currency: "diamonds",
    level: 7,
    color: "White",
  },
  361: {
    title: "Echo Visor",
    imageRaised: "ScouterAlt.png",
    imageShop: "ScouterAltSV.png",
    layer: "head_layer1",
    price: 859,
    clothingType: "experimental",
    currency: "peanuts",
    level: 13,
    color: "Purple",
  },
  362: {
    title: "Echo Visor",
    imageRaised: "ScouterAlt2.png",
    imageShop: "ScouterAlt2SV.png",
    layer: "head_layer1",
    price: 999,
    clothingType: "experimental",
    currency: "peanuts",
    level: 9,
    color: "Black",
  },
  37: {
    title: "Crash Collar",
    imageRaised: "TireFixed.png",
    imageShop: "TireSV.png",
    layer: "body_layer2",
    price: 2,
    clothingType: "utility",
    currency: "diamonds",
    level: 5,
  },
  371: {
    title: "Crash Collar",
    imageRaised: "TireAlt.png",
    imageShop: "TireAltSV.png",
    layer: "body_layer2",
    price: 430,
    clothingType: "utility",
    currency: "peanuts",
    level: 6,
    color: "Blue",
  },
  38: {
    title: "Primal Wrap",
    imageRaised: "UngaBungaFixed.png",
    imageShop: "UngaBungaSV.png",
    layer: "fullbody1",
    price: 1199,
    clothingType: "primal",
    currency: "peanuts",
    level: 10,
  },
  381: {
    title: "Primal Wrap",
    imageRaised: "UngaBungaAlt.png",
    imageShop: "UngaBungaAltSV.png",
    layer: "fullbody1",
    price: 1449,
    clothingType: "primal",
    currency: "peanuts",
    level: 12,
    color: "Light",
  },
  39: {
    title: "Skull Helmet",
    imageRaised: "SkullHelmet.png",
    imageShop: "SkullHelmetSV.png",
    layer: "head_layer1",
    price: 879,
    clothingType: "primal",
    currency: "peanuts",
    level: 13,
  },
  40: {
    title: "Knife",
    imageRaised: "Knife.png",
    imageShop: "KnifeSV.png",
    layer: "accessory",
    price: 999,
    clothingType: "weapons",
    currency: "peanuts",
    level: 11,
  },
};

class MetadataImageProcessor {
  constructor() {
    this.raisedDir = path.join(__dirname, "../../ImageRaised");
    this.shopDir = path.join(__dirname, "../../ImageShop");
    this.processed = [];
    this.errors = [];
    this.availableFiles = { raised: [], shop: [] };
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
   * Scan available files in both directories
   */
  async scanAvailableFiles() {
    try {
      const raisedFiles = await fs.readdir(this.raisedDir);
      const shopFiles = await fs.readdir(this.shopDir);

      this.availableFiles.raised = raisedFiles
        .filter((f) => f.toLowerCase().endsWith(".png"))
        .map((f) => f.toLowerCase());

      this.availableFiles.shop = shopFiles
        .filter((f) => f.toLowerCase().endsWith(".png"))
        .map((f) => f.toLowerCase());

      logger.info(`Found ${this.availableFiles.raised.length} raised images`);
      logger.info(`Found ${this.availableFiles.shop.length} shop images`);

      return this.availableFiles;
    } catch (error) {
      logger.error("Error scanning files:", error);
      throw error;
    }
  }

  /**
   * Find matching files for metadata item
   */
  findMatchingFiles(metadata) {
    const raisedName = metadata.imageRaised.toLowerCase();
    const shopName = metadata.imageShop.toLowerCase();

    // Try exact match first
    let raisedMatch = this.availableFiles.raised.find((f) => f === raisedName);
    let shopMatch = this.availableFiles.shop.find((f) => f === shopName);

    // If no exact match, try partial matching
    if (!raisedMatch) {
      const baseName = raisedName
        .replace(/fixed\.png$/, ".png")
        .replace(/\.png$/, "");
      raisedMatch = this.availableFiles.raised.find(
        (f) => f.includes(baseName) || baseName.includes(f.replace(".png", ""))
      );
    }

    if (!shopMatch) {
      const baseName = shopName
        .replace(/sv\.png$/, ".png")
        .replace(/\.png$/, "");
      shopMatch = this.availableFiles.shop.find(
        (f) => f.includes(baseName) || baseName.includes(f.replace(".png", ""))
      );
    }

    return { raisedMatch, shopMatch };
  }

  /**
   * Convert clothing type to valid enum values
   */
  convertClothingType(clothingType) {
    const typeMap = {
      experimental: "experimental tech",
      weapons: "weapons",
      space: "space gear",
      official: "Official Planet Peanut Work Wear",
      utility: "utility gear",
      casual: "casual wear",
      armor: "battle armor",
      governance: "Planetary Governance Wear",
      primal: "tribal wear",
    };
    return typeMap[clothingType] || "casual wear";
  }

  /**
   * Convert layer to valid enum values
   */
  convertLayer(layer) {
    const layerMap = {
      head_layer1: "head_layer1",
      accessory: "accessory",
      fullbody1: "fullbody1",
      body_layer1: "body_layer1",
      body_layer2: "body_layer2",
      pants_layer1: "pants_layer1",
    };
    return layerMap[layer] || "body_layer1";
  }

  /**
   * Convert to valid tags array
   */
  convertToTags(clothingType) {
    const tagMap = {
      experimental: ["experimental"],
      weapons: ["weapons"],
      space: ["space"],
      official: ["official"],
      utility: ["utility"],
      casual: ["casual"],
      armor: ["armor"],
      governance: ["official"],
      primal: ["primal"],
    };
    return tagMap[clothingType] || ["casual"];
  }

  /**
   * Process a single item using metadata
   */
  async processMetadataItem(itemId, metadata, dryRun = false) {
    try {
      await this.initializeProcessingModules();

      logger.info(`Processing item ${itemId}: ${metadata.title}`);

      // Find matching files
      const { raisedMatch, shopMatch } = this.findMatchingFiles(metadata);

      if (!raisedMatch || !shopMatch) {
        const missing = [];
        if (!raisedMatch) missing.push(`raised: ${metadata.imageRaised}`);
        if (!shopMatch) missing.push(`shop: ${metadata.imageShop}`);
        throw new Error(`Missing files - ${missing.join(", ")}`);
      }

      // Read both image files
      const raisedPath = path.join(this.raisedDir, raisedMatch);
      const shopPath = path.join(this.shopDir, shopMatch);

      const raisedBuffer = await fs.readFile(raisedPath);
      const shopBuffer = await fs.readFile(shopPath);

      // Validate both images
      const raisedValidation = await imageService.validateImage({
        buffer: raisedBuffer,
        originalname: raisedMatch,
        mimetype: "image/png",
        size: raisedBuffer.length,
      });

      const shopValidation = await imageService.validateImage({
        buffer: shopBuffer,
        originalname: shopMatch,
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

      // Create item data from metadata
      const itemData = {
        title: metadata.title,
        description: `${metadata.title} - From Planet Peanut collection`,
        clothingType: this.convertClothingType(metadata.clothingType),
        layer: this.convertLayer(metadata.layer),
        tags: this.convertToTags(metadata.clothingType),
        price: metadata.price,
        currency: metadata.currency || "peanuts",
        level: metadata.level || 1,
        status: "draft",
        originalId: itemId, // Store original ID for reference
      };

      // Add color if specified
      if (metadata.color) {
        itemData.description += ` - ${metadata.color} variant`;
      }

      if (dryRun) {
        logger.info(
          `DRY RUN - Would create item: ${JSON.stringify(itemData, null, 2)}`
        );
        return {
          success: true,
          dryRun: true,
          itemData,
          files: { raisedMatch, shopMatch },
        };
      }

      // Create item in database
      const item = new Item(itemData);
      await item.save();

      logger.info(`Created item: ${item._id} - ${item.title}`);

      // Process and upload raised image
      const raisedResult = await imageService.processAndUpload(
        {
          buffer: raisedBuffer,
          originalname: raisedMatch,
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
          originalname: shopMatch,
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
          originalId: itemId,
          title: item.title,
          clothingType: item.clothingType,
          layer: item.layer,
          price: item.price,
          currency: item.currency,
          level: item.level,
        },
        images: {
          raised: raisedResult.data.imageUrls.raised,
          shop: shopResult.data.imageUrls.shop,
          thumbnail: raisedResult.data.imageUrls.thumbnail,
          medium: raisedResult.data.imageUrls.medium,
        },
        files: { raisedMatch, shopMatch },
        metadata,
      };

      this.processed.push(result);
      return result;
    } catch (error) {
      logger.error(
        `Error processing item ${itemId} (${metadata.title}):`,
        error
      );
      this.errors.push({
        type: "processing_error",
        itemId,
        metadata,
        error: error.message,
      });
      return { success: false, error: error.message, itemId, metadata };
    }
  }

  /**
   * Process multiple items from metadata
   */
  async processMetadataItems(options = {}) {
    const { dryRun = false, itemIds = null, limit = null } = options;

    try {
      await this.initializeProcessingModules();
      await this.scanAvailableFiles();

      if (!mongoose.connection.readyState) {
        await mongoose.connect(process.env.MONGODB_URI);
        logger.info("Connected to MongoDB");
      }

      // Determine which items to process
      let itemsToProcess = Object.entries(originalItems);

      if (itemIds) {
        itemsToProcess = itemsToProcess.filter(([id]) =>
          itemIds.includes(parseInt(id))
        );
      }

      if (limit) {
        itemsToProcess = itemsToProcess.slice(0, limit);
      }

      logger.info(
        `Processing ${itemsToProcess.length} items - DryRun: ${dryRun}`
      );

      const results = [];
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < itemsToProcess.length; i++) {
        const [itemId, metadata] = itemsToProcess[i];
        logger.info(
          `Processing ${i + 1}/${itemsToProcess.length}: ${metadata.title}`
        );

        try {
          const result = await this.processMetadataItem(
            itemId,
            metadata,
            dryRun
          );
          results.push(result);

          if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }

          // Add delay between processing to avoid overwhelming services
          if (i < itemsToProcess.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } catch (error) {
          logger.error(`Failed to process item ${itemId}:`, error);
          errorCount++;
          results.push({
            success: false,
            error: error.message,
            itemId,
            metadata,
          });
        }
      }

      const summary = {
        total: itemsToProcess.length,
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
   * Generate analysis report
   */
  async generateAnalysisReport() {
    await this.scanAvailableFiles();

    const analysis = {
      totalMetadataItems: Object.keys(originalItems).length,
      availableFiles: this.availableFiles,
      matches: [],
      missing: [],
    };

    for (const [itemId, metadata] of Object.entries(originalItems)) {
      const { raisedMatch, shopMatch } = this.findMatchingFiles(metadata);

      if (raisedMatch && shopMatch) {
        analysis.matches.push({
          itemId,
          title: metadata.title,
          raised: { expected: metadata.imageRaised, found: raisedMatch },
          shop: { expected: metadata.imageShop, found: shopMatch },
        });
      } else {
        analysis.missing.push({
          itemId,
          title: metadata.title,
          raised: { expected: metadata.imageRaised, found: raisedMatch },
          shop: { expected: metadata.imageShop, found: shopMatch },
        });
      }
    }

    analysis.summary = {
      totalItems: Object.keys(originalItems).length,
      matchingBoth: analysis.matches.length,
      missingFiles: analysis.missing.length,
      matchRate: `${Math.round(
        (analysis.matches.length / Object.keys(originalItems).length) * 100
      )}%`,
    };

    return analysis;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "help";

  const processor = new MetadataImageProcessor();

  try {
    switch (command) {
      case "analyze":
        const analysis = await processor.generateAnalysisReport();
        console.log(JSON.stringify(analysis, null, 2));
        break;

      case "dry-run":
        const dryResults = await processor.processMetadataItems({
          dryRun: true,
          limit: 5,
        });
        console.log(JSON.stringify(dryResults, null, 2));
        break;

      case "process":
        const limit = args[1] ? parseInt(args[1]) : null;
        const itemIds = args[2]
          ? args.slice(2).map((id) => parseInt(id))
          : null;

        const results = await processor.processMetadataItems({
          dryRun: false,
          limit,
          itemIds,
        });
        console.log(JSON.stringify(results, null, 2));
        break;

      case "help":
      default:
        console.log(`
Planet Peanut Metadata Image Processor

Uses your original item metadata for accurate processing.

Commands:
  analyze                           - Analyze metadata vs available files
  dry-run                          - Test processing first 5 items
  process [limit] [itemId1 itemId2...]  - Process items with metadata
    limit: Number of items to process (optional)
    itemIds: Specific item IDs to process (optional)

Examples:
  node processWithMetadata.js analyze
  node processWithMetadata.js dry-run
  node processWithMetadata.js process
  node processWithMetadata.js process 10
  node processWithMetadata.js process 5 1 2 7 8 9
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
module.exports = MetadataImageProcessor;

// Run if called directly
if (require.main === module) {
  main();
}
