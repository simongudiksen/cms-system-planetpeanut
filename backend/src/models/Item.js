const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: [true, "Item title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },

    // Original ID from metadata (for tracking imported items)
    originalId: {
      type: String,
      trim: true,
      index: true, // For efficient lookups
    },

    // Categorization
    tags: [
      {
        type: String,
        enum: [
          "weapons",
          "official",
          "space",
          "utility",
          "governance",
          "armor",
          "primal",
          "experimental",
          "casual",
        ],
      },
    ],

    clothingType: {
      type: String,
      required: [true, "Clothing type is required"],
      enum: [
        "weapons",
        "Official Planet Peanut Work Wear",
        "space gear",
        "utility gear",
        "Planetary Governance Wear",
        "battle armor",
        "tribal wear",
        "experimental tech",
        "casual wear",
      ],
    },

    // Pricing and Requirements
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    currency: {
      type: String,
      required: [true, "Currency is required"],
      enum: {
        values: ["diamonds", "peanuts"],
        message: "Currency must be either diamonds or peanuts",
      },
      default: "peanuts",
    },

    level: {
      type: Number,
      required: [true, "Level requirement is required"],
      min: [1, "Level must be at least 1"],
      max: [100, "Level cannot exceed 100"],
      default: 1,
    },

    // Visual Properties
    color: {
      type: String,
      trim: true,
      maxlength: [50, "Color name cannot exceed 50 characters"],
    },

    layer: {
      type: String,
      required: [true, "Layer information is required"],
      enum: [
        // Body layers
        "body_layer1",
        "body_layer2",
        "body_layer3",
        "body_layer_full",
        // Head layers
        "head_layer1",
        "head_layer2",
        "head_layer3",
        "head_layer_full",
        // Pants layers
        "pants_layer1",
        "pants_layer2",
        "pants_layer3",
        "pants_layer_full",
        // Accessory layers
        "accessory",
        "accessoryBack",
        // Full body layers
        "fullbody1",
        "fullbody2",
      ],
    },

    // Image URLs (populated after Supabase upload)
    imageRaisedUrl: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https:\/\/.*\.(jpg|jpeg|png|webp)$/i.test(v);
        },
        message: "Invalid raised image URL format",
      },
    },

    imageShopUrl: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https:\/\/.*\.(jpg|jpeg|png|webp)$/i.test(v);
        },
        message: "Invalid shop image URL format",
      },
    },

    // Additional image sizes
    imageThumbnailUrl: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https:\/\/.*\.(jpg|jpeg|png|webp)$/i.test(v);
        },
        message: "Invalid thumbnail URL format",
      },
    },

    imageMediumUrl: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https:\/\/.*\.(jpg|jpeg|png|webp)$/i.test(v);
        },
        message: "Invalid medium image URL format",
      },
    },

    // Availability Control
    status: {
      type: String,
      enum: {
        values: ["draft", "published", "archived"],
        message: "Status must be draft, published, or archived",
      },
      default: "draft",
    },

    releaseDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    retireDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (v) {
          return !v || v > this.releaseDate;
        },
        message: "Retire date must be after release date",
      },
    },

    // Metadata
    createdBy: {
      type: String, // Will store Supabase user ID later
      default: "system",
    },

    updatedBy: {
      type: String, // Will store Supabase user ID later
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Remove internal fields from JSON output
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
ItemSchema.index({ status: 1, releaseDate: -1 }); // Published items by date
ItemSchema.index({ clothingType: 1, level: 1 }); // Filter by type and level
ItemSchema.index({ currency: 1, price: 1 }); // Price range queries
ItemSchema.index({ tags: 1 }); // Tag-based filtering
ItemSchema.index({ layer: 1 }); // Layer-based queries
ItemSchema.index({ createdAt: -1 }); // Recent items
ItemSchema.index({
  title: "text",
  description: "text",
}); // Text search

// Virtual for checking if item is published
ItemSchema.virtual("isPublished").get(function () {
  return this.status === "published";
});

// Virtual for checking if item is currently available
ItemSchema.virtual("isAvailable").get(function () {
  const now = new Date();
  const released = this.releaseDate <= now;
  const notRetired = !this.retireDate || this.retireDate > now;
  return this.status === "published" && released && notRetired;
});

// Virtual for complete image set
ItemSchema.virtual("images").get(function () {
  return {
    raised: this.imageRaisedUrl,
    shop: this.imageShopUrl,
    thumbnail: this.imageThumbnailUrl,
    medium: this.imageMediumUrl,
  };
});

// Instance method to publish an item
ItemSchema.methods.publish = function () {
  this.status = "published";
  return this.save();
};

// Instance method to unpublish an item
ItemSchema.methods.unpublish = function () {
  this.status = "draft";
  return this.save();
};

// Instance method to archive an item
ItemSchema.methods.archive = function () {
  this.status = "archived";
  return this.save();
};

// Static method to find published items
ItemSchema.statics.findPublished = function (filter = {}) {
  return this.find({ ...filter, status: "published" });
};

// Static method to find by currency
ItemSchema.statics.findByCurrency = function (currency, filter = {}) {
  return this.find({ ...filter, currency });
};

// Static method to find by clothing type
ItemSchema.statics.findByClothingType = function (clothingType, filter = {}) {
  return this.find({ ...filter, clothingType });
};

// Pre-save middleware
ItemSchema.pre("save", function (next) {
  // Set updatedBy field if user is available in context
  if (this.isModified() && !this.isNew && this.constructor.currentUser) {
    this.updatedBy = this.constructor.currentUser;
  }
  next();
});

// Pre-save middleware for new documents
ItemSchema.pre("save", function (next) {
  if (this.isNew && this.constructor.currentUser) {
    this.createdBy = this.constructor.currentUser;
  }
  next();
});

// Pre-save validation for release/retire dates
ItemSchema.pre("save", function (next) {
  if (this.retireDate && this.retireDate <= this.releaseDate) {
    next(new Error("Retire date must be after release date"));
  } else {
    next();
  }
});

const Item = mongoose.model("Item", ItemSchema);

module.exports = Item;
