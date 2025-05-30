# Database Schema Documentation

## Overview

The Planet Peanut CMS uses MongoDB as the primary database for storing item metadata. This document defines the complete schema structure, relationships, and validation rules.

## Core Collections

### Items Collection

The main collection storing all avatar items, accessories, and digital assets.

#### Mongoose Schema Definition

```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ItemSchema = new Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Item title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  
  // Categorization
  tags: [{
    type: String,
    enum: [
      'weapons', 'official', 'space', 'utility', 'governance', 
      'armor', 'primal', 'experimental', 'casual'
    ]
  }],
  
  clothingType: {
    type: String,
    required: [true, 'Clothing type is required'],
    enum: [
      'weapons', 'Official Planet Peanut Work Wear', 'space gear',
      'utility gear', 'Planetary Governance Wear', 'battle armor',
      'tribal wear', 'experimental tech', 'casual wear'
    ]
  },
  
  // Pricing and Requirements
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    enum: ['diamonds', 'peanuts'],
    default: 'peanuts'
  },
  
  level: {
    type: Number,
    required: [true, 'Level requirement is required'],
    min: [1, 'Level must be at least 1'],
    max: [100, 'Level cannot exceed 100'],
    default: 1
  },
  
  // Visual Properties
  color: {
    type: String,
    trim: true,
    maxlength: [50, 'Color name cannot exceed 50 characters']
  },
  
  layer: {
    type: String,
    required: [true, 'Layer information is required'],
    enum: [
      // Body layers
      'body_layer1', 'body_layer2', 'body_layer3', 'body_layer_full',
      // Head layers  
      'head_layer1', 'head_layer2', 'head_layer3', 'head_layer_full',
      // Pants layers
      'pants_layer1', 'pants_layer2', 'pants_layer3', 'pants_layer_full',
      // Accessory layers
      'accessory', 'accessoryBack',
      // Full body layers
      'fullbody1', 'fullbody2'
    ]
  },
  
  // Image URLs (populated after Supabase upload)
  imageRaisedUrl: {
    type: String,
    required: [true, 'Raised image URL is required'],
    validate: {
      validator: function(v) {
        return /^https:\/\/.*\.(jpg|jpeg|png|webp)$/i.test(v);
      },
      message: 'Invalid image URL format'
    }
  },
  
  imageShopUrl: {
    type: String,
    required: [true, 'Shop image URL is required'],
    validate: {
      validator: function(v) {
        return /^https:\/\/.*\.(jpg|jpeg|png|webp)$/i.test(v);
      },
      message: 'Invalid image URL format'
    }
  },
  
  // Additional image sizes
  imageThumbnailUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https:\/\/.*\.(jpg|jpeg|png|webp)$/i.test(v);
      },
      message: 'Invalid thumbnail URL format'
    }
  },
  
  imageMediumUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https:\/\/.*\.(jpg|jpeg|png|webp)$/i.test(v);
      },
      message: 'Invalid medium image URL format'
    }
  },
  
  // Availability Control
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  
  releaseDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  retireDate: {
    type: Date,
    default: null,
    validate: {
      validator: function(v) {
        return !v || v > this.releaseDate;
      },
      message: 'Retire date must be after release date'
    }
  },
  
  // Metadata
  createdBy: {
    type: String, // Supabase user ID
    required: true
  },
  
  updatedBy: {
    type: String // Supabase user ID
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { updatedAt: true }, // Auto-update updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
```

#### Schema Indexes

```javascript
// Performance indexes for common queries
ItemSchema.index({ status: 1, releaseDate: -1 }); // Published items by date
ItemSchema.index({ clothingType: 1, level: 1 });   // Filter by type and level
ItemSchema.index({ currency: 1, price: 1 });       // Price range queries
ItemSchema.index({ tags: 1 });                     // Tag-based filtering
ItemSchema.index({ layer: 1 });                    // Layer-based queries
ItemSchema.index({ createdAt: -1 });               // Recent items
ItemSchema.index({ 
  title: 'text', 
  description: 'text' 
}); // Text search
```

#### Virtual Properties

```javascript
// Virtual for checking if item is currently available
ItemSchema.virtual('isAvailable').get(function() {
  const now = new Date();
  const released = this.releaseDate <= now;
  const notRetired = !this.retireDate || this.retireDate > now;
  return this.status === 'published' && released && notRetired;
});

// Virtual for complete image set
ItemSchema.virtual('images').get(function() {
  return {
    raised: this.imageRaisedUrl,
    shop: this.imageShopUrl,
    thumbnail: this.imageThumbnailUrl,
    medium: this.imageMediumUrl
  };
});
```

#### Pre-save Middleware

```javascript
// Update modifiedAt timestamp
ItemSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

// Validate release/retire date logic
ItemSchema.pre('save', function(next) {
  if (this.retireDate && this.retireDate <= this.releaseDate) {
    next(new Error('Retire date must be after release date'));
  } else {
    next();
  }
});
```

## Reference Data

### Layer Definitions

```javascript
const LAYERS = {
  body: {
    1: "body_layer1",
    2: "body_layer2", 
    3: "body_layer3",
    full: "body_layer_full"
  },
  head: {
    1: "head_layer1",
    2: "head_layer2",
    3: "head_layer3", 
    full: "head_layer_full"
  },
  pants: {
    1: "pants_layer1",
    2: "pants_layer2",
    3: "pants_layer3",
    full: "pants_layer_full"
  },
  accessory: {
    1: "accessory",
    back: "accessoryBack"
  },
  fullbody: {
    1: "fullbody1",
    2: "fullbody2"
  }
};
```

### Clothing Types

```javascript
const CLOTHING_TYPES = {
  weapons: "weapons",
  official: "Official Planet Peanut Work Wear",
  space: "space gear", 
  utility: "utility gear",
  governance: "Planetary Governance Wear",
  armor: "battle armor",
  primal: "tribal wear",
  experimental: "experimental tech",
  casual: "casual wear"
};
```

### Currency Types

```javascript
const CURRENCIES = {
  diamonds: "diamonds",
  peanuts: "peanuts"
};
```

## Sample Data Structure

### Complete Item Document

```javascript
{
  "_id": ObjectId("64f1234567890abcdef12345"),
  "title": "Echo Visor",
  "description": "A high-tech visor that enhances visual perception and provides tactical information overlay.",
  "tags": ["experimental", "utility"],
  "clothingType": "experimental tech",
  "price": 859,
  "currency": "diamonds",
  "level": 13,
  "color": "Purple",
  "layer": "head_layer1",
  "imageRaisedUrl": "https://example.supabase.co/storage/v1/object/public/items/echo-visor-raised-1024.png",
  "imageShopUrl": "https://example.supabase.co/storage/v1/object/public/items/echo-visor-shop-1024.png",
  "imageThumbnailUrl": "https://example.supabase.co/storage/v1/object/public/items/echo-visor-thumb-256.png",
  "imageMediumUrl": "https://example.supabase.co/storage/v1/object/public/items/echo-visor-med-512.png",
  "status": "published",
  "releaseDate": ISODate("2024-01-15T00:00:00.000Z"),
  "retireDate": null,
  "createdBy": "user_abc123",
  "updatedBy": "user_abc123",
  "createdAt": ISODate("2024-01-10T14:30:00.000Z"),
  "updatedAt": ISODate("2024-01-12T09:15:00.000Z")
}
```

## Query Patterns

### Common Queries for Mobile App

```javascript
// Get all published items
db.items.find({ 
  status: "published",
  releaseDate: { $lte: new Date() },
  $or: [
    { retireDate: null },
    { retireDate: { $gt: new Date() }}
  ]
}).sort({ releaseDate: -1 });

// Get items by clothing type
db.items.find({ 
  status: "published",
  clothingType: "space gear"
});

// Get items within level range
db.items.find({
  status: "published", 
  level: { $gte: 10, $lte: 20 }
});

// Get items by currency and price range
db.items.find({
  status: "published",
  currency: "diamonds",
  price: { $gte: 100, $lte: 1000 }
});
```

### Admin Queries

```javascript
// Get all items (including drafts)
db.items.find({}).sort({ updatedAt: -1 });

// Search items by text
db.items.find({
  $text: { $search: "visor tech experimental" }
});

// Get items by layer for preview
db.items.find({ 
  layer: { $regex: "^head_" },
  status: "published" 
});
```

## Data Validation Rules

### Business Rules

1. **Price Rules**:
   - Must be non-negative
   - Diamond items typically > 100
   - Peanut items typically < 1000

2. **Level Rules**:
   - Range: 1-100
   - Higher-tier items should have higher level requirements

3. **Date Rules**:
   - Release date can be future (for scheduling)
   - Retire date must be after release date
   - Items can be published before release date

4. **Image Rules**:
   - Both raised and shop images required
   - URLs must be HTTPS
   - Images should be different (raised vs shop view)

### Data Integrity

```javascript
// Compound validation example
ItemSchema.pre('save', function(next) {
  // Expensive items should require higher levels
  if (this.currency === 'diamonds' && this.price > 500 && this.level < 10) {
    next(new Error('High-value diamond items should require level 10+'));
  }
  
  // Full body items shouldn't have other layers
  if (this.layer.includes('fullbody') && this.clothingType !== 'armor') {
    next(new Error('Full body layers are typically armor items'));
  }
  
  next();
});
```

This schema provides a robust foundation for the Planet Peanut CMS, with built-in validation, indexing for performance, and flexibility for future enhancements.