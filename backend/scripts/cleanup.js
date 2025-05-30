const mongoose = require("mongoose");
const Item = require("../src/models/Item");
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

// Valid items that should be kept (based on proper metadata processing)
const validItemTitles = [
  "Gasmask",
  "Peanut Pulsar",
  "Astro-Shell Helmet - Blue",
  "Legume Launcher",
  "Cosmic Cracker",
  "Peanut Fleet Standard Issue (PFSI) - Blue",
  "3D glasses",
  "Elf Hat",
  "Crunch Ray",
  "Astro-Shell Helmet - Red",
  "Astro-Shell Helmet - Pink",
  "Astro-Shell Helmet - White",
  "Peanut Pioneer Hoodie - Blue",
  "Peanut Pioneer Hoodie - Pink",
  "Peanut Pioneer Hoodie - Red",
  "Peanut Fleet Standard Issue (PFSI) - Green",
  "Peanut Fleet Standard Issue (PFSI) - Orange",
  "Peanut Fleet Standard Issue (PFSI) - Pink",
  "Peanut Fleet Standard Issue (PFSI) - Purple",
  "Plasma Inhaler",
  "Stellar Glint Shades - Blue",
  "Stellar Glint Shades - Green",
  "Peanut Horizon Advanced Zonewear (PHAZ) - Orange",
  "Peanut Horizon Advanced Zonewear (PHAZ) - White",
  "Nutri-Flex Bottoms - Blue",
  "Nutri-Flex Bottoms - Pink",
  "Nutri-Flex Bottoms - Red",
  "Banana Peel - Banana colored",
  "Current Strands",
  "Titan Vest",
  "Kernel Belt",
  "Orbit Chain",
  "Void Locket",
  "Lunar Crown",
  "Supreme Drape",
  "Echo Visor",
  "Crash Collar",
  "Primal Wrap",
  "Skull Helmet",
  "Knife",
];

class DatabaseCleanup {
  constructor() {
    this.itemsToDelete = [];
    this.validItems = [];
    this.supabaseService = null;
  }

  async initialize() {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI);
      logger.info("Connected to MongoDB");
    }
  }

  async initializeSupabase() {
    if (!this.supabaseService) {
      this.supabaseService = require("../src/services/supabaseService");
    }
  }

  async analyzeItems() {
    await this.initialize();

    const allItems = await Item.find({})
      .select(
        "_id title price currency level clothingType originalId createdAt imageRaisedUrl imageShopUrl"
      )
      .sort({ createdAt: 1 });

    logger.info(`Found ${allItems.length} total items in database`);

    // Categorize items
    for (const item of allItems) {
      const isValidTitle = validItemTitles.includes(item.title);
      const hasOriginalId = item.originalId != null;

      // Keep items that have valid titles AND originalId (proper metadata processing)
      if (isValidTitle && hasOriginalId) {
        this.validItems.push(item);
      } else {
        // Mark for deletion if:
        // 1. Title not in valid list (test items, auto-generated names)
        // 2. No originalId (test items from early processing)
        // 3. Obviously test names like "Advanced Battle Helmet", etc.
        this.itemsToDelete.push({
          ...item.toObject(),
          reason: !isValidTitle ? "Invalid title" : "Missing originalId",
        });
      }
    }

    const analysis = {
      total: allItems.length,
      valid: this.validItems.length,
      toDelete: this.itemsToDelete.length,
      validItems: this.validItems.map((item) => ({
        id: item._id,
        title: item.title,
        originalId: item.originalId,
        price: item.price,
        currency: item.currency,
        level: item.level,
      })),
      itemsToDelete: this.itemsToDelete.map((item) => ({
        id: item._id,
        title: item.title,
        originalId: item.originalId,
        reason: item.reason,
        createdAt: item.createdAt,
      })),
    };

    return analysis;
  }

  async deleteItems(confirmed = false) {
    if (!confirmed) {
      throw new Error("Deletion not confirmed. Use confirmed=true parameter");
    }

    await this.initialize();
    await this.initializeSupabase();

    logger.info(`Starting deletion of ${this.itemsToDelete.length} items`);

    let deletedCount = 0;
    let errorCount = 0;

    for (const item of this.itemsToDelete) {
      try {
        logger.info(`Deleting item: ${item.title} (${item._id})`);

        // Delete from Supabase storage if URLs exist
        if (item.imageRaisedUrl || item.imageShopUrl) {
          try {
            // Extract folder path from URL (e.g., "6839b7cd382c0ffd1ef3df3a")
            const itemId = item._id.toString();
            await this.supabaseService.deleteItemImages(itemId);
            logger.info(`Deleted Supabase images for item ${itemId}`);
          } catch (storageError) {
            logger.warn(
              `Failed to delete Supabase images for ${item._id}: ${storageError.message}`
            );
          }
        }

        // Delete from MongoDB
        await Item.findByIdAndDelete(item._id);
        deletedCount++;
        logger.info(`Successfully deleted item ${item._id} - ${item.title}`);

        // Add small delay to avoid overwhelming services
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        errorCount++;
        logger.error(`Failed to delete item ${item._id}: ${error.message}`);
      }
    }

    const summary = {
      attempted: this.itemsToDelete.length,
      successful: deletedCount,
      failed: errorCount,
      remaining: this.validItems.length,
    };

    logger.info(
      `Cleanup complete - Deleted: ${deletedCount}, Failed: ${errorCount}, Remaining: ${this.validItems.length}`
    );
    return summary;
  }

  async disconnect() {
    if (mongoose.connection.readyState) {
      await mongoose.disconnect();
      logger.info("Disconnected from MongoDB");
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "help";

  const cleanup = new DatabaseCleanup();

  try {
    switch (command) {
      case "analyze":
        const analysis = await cleanup.analyzeItems();
        console.log(JSON.stringify(analysis, null, 2));
        break;

      case "delete":
        const confirmed = args[1] === "confirmed";
        if (!confirmed) {
          console.log(
            "⚠️  WARNING: This will permanently delete items from database and Supabase storage!"
          );
          console.log('Run with "confirmed" parameter to proceed:');
          console.log("node cleanup.js delete confirmed");
          break;
        }

        // First analyze to populate items to delete
        await cleanup.analyzeItems();
        const result = await cleanup.deleteItems(true);
        console.log(JSON.stringify(result, null, 2));
        break;

      case "help":
      default:
        console.log(`
Database Cleanup Tool

Commands:
  analyze  - Show items that will be kept vs deleted
  delete confirmed - Actually delete the invalid items (requires confirmation)

Examples:
  node cleanup.js analyze
  node cleanup.js delete confirmed
        `);
        break;
    }
  } catch (error) {
    logger.error("Script execution error:", error);
    process.exit(1);
  } finally {
    await cleanup.disconnect();
  }
}

// Export for use as module
module.exports = DatabaseCleanup;

// Run if called directly
if (require.main === module) {
  main();
}
