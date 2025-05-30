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

    // Pricing
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

    // Status
    status: {
      type: String,
      enum: {
        values: ["draft", "published"],
        message: "Status must be either draft or published",
      },
      default: "draft",
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
ItemSchema.index({ status: 1, createdAt: -1 }); // Published items by date
ItemSchema.index({ currency: 1, price: 1 }); // Price range queries
ItemSchema.index({ title: "text" }); // Text search

// Virtual for checking if item is published
ItemSchema.virtual("isPublished").get(function () {
  return this.status === "published";
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

// Static method to find published items
ItemSchema.statics.findPublished = function (filter = {}) {
  return this.find({ ...filter, status: "published" });
};

// Static method to find by currency
ItemSchema.statics.findByCurrency = function (currency, filter = {}) {
  return this.find({ ...filter, currency });
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

const Item = mongoose.model("Item", ItemSchema);

module.exports = Item;
