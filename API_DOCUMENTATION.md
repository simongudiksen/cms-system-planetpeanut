# Planet Peanut CMS - API Documentation

## Overview

The Planet Peanut CMS API provides RESTful endpoints for managing avatar items in the Planet Peanut learning app. This API supports full CRUD operations, advanced filtering, pagination, and item lifecycle management.

## Base Configuration

**Base URL:** `http://localhost:3001/api`  
**Content-Type:** `application/json`  
**Authentication:** JWT Bearer tokens for write operations

## Authentication

### JWT Token Format

```bash
Authorization: Bearer <jwt-token>
```

**Current Implementation:** Uses `stub-token` for testing during development. Production will integrate with Supabase Auth.

## Standard Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data varies by endpoint
  },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "isOperational": true,
    "details": [] // Array of detailed error information
  }
}
```

### Validation Error Response

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "statusCode": 400,
    "isOperational": [
      {
        "field": "price",
        "message": "Price must be a positive number",
        "value": -50
      }
    ]
  }
}
```

## Endpoints

### Health Check

#### GET /health

Check server and database status.

**Authentication:** None required

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-05-30T13:49:58.071Z",
  "uptime": 7.397212792,
  "database": {
    "connected": true,
    "readyState": 1,
    "host": "cluster.mongodb.net",
    "name": "planet-peanut-cms"
  },
  "environment": "development",
  "version": "1.0.0"
}
```

---

## Items Endpoints

### 1. List Items with Filtering

#### GET /items

Retrieve items with advanced filtering, pagination, and sorting.

**Authentication:** None required

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | integer | Page number (default: 1) | `1` |
| `limit` | integer | Items per page (1-100, default: 10) | `20` |
| `status` | string | Filter by status | `published` |
| `currency` | string | Filter by currency | `diamonds` |
| `clothingType` | string | Filter by clothing type | `space gear` |
| `layer` | string | Filter by layer | `head_layer1` |
| `level` | integer | Exact level match | `15` |
| `minLevel` | integer | Minimum level | `5` |
| `maxLevel` | integer | Maximum level | `20` |
| `minPrice` | float | Minimum price | `100.0` |
| `maxPrice` | float | Maximum price | `500.0` |
| `tags` | string | Comma-separated tags | `space,utility` |
| `search` | string | Text search in title/description | `helmet` |
| `sortBy` | string | Sort field | `price` |
| `sortOrder` | string | Sort direction (asc/desc) | `desc` |

**Example Request:**

```bash
GET /api/items?clothingType=space%20gear&currency=peanuts&minLevel=5&maxLevel=20&tags=space,utility&sortBy=price&sortOrder=asc&page=1&limit=10
```

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "6839b79b382c0ffd1ef3df2b",
        "title": "Plasma Visor",
        "description": "Advanced heads-up display for space exploration",
        "tags": ["space", "utility"],
        "clothingType": "space gear",
        "price": 150,
        "currency": "peanuts",
        "level": 10,
        "color": "Electric Blue",
        "layer": "head_layer1",
        "status": "published",
        "retireDate": null,
        "createdBy": "user-123",
        "releaseDate": "2025-05-30T13:50:19.116Z",
        "createdAt": "2025-05-30T13:50:19.116Z",
        "updatedAt": "2025-05-30T13:50:19.116Z",
        "isPublished": true,
        "isAvailable": true,
        "id": "6839b79b382c0ffd1ef3df2b"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 25,
      "limit": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "clothingType": "space gear",
      "currency": "peanuts",
      "level": { "min": "5", "max": "20" },
      "price": { "min": null, "max": null },
      "tags": ["space", "utility"],
      "layer": null,
      "search": null
    }
  }
}
```

### 2. Get Single Item

#### GET /items/:id

Retrieve a specific item by ID.

**Authentication:** None required

**Parameters:**

- `id` (string, required): MongoDB ObjectId

**Example Request:**

```bash
GET /api/items/6839b79b382c0ffd1ef3df2b
```

**Response:**

```json
{
  "success": true,
  "data": {
    "item": {
      "_id": "6839b79b382c0ffd1ef3df2b",
      "title": "Plasma Visor",
      "description": "Advanced heads-up display for space exploration",
      "tags": ["space", "utility"],
      "clothingType": "space gear",
      "price": 150,
      "currency": "peanuts",
      "level": 10,
      "color": "Electric Blue",
      "layer": "head_layer1",
      "status": "published",
      "imageRaisedUrl": null,
      "imageShopUrl": null,
      "imageThumbnailUrl": null,
      "imageMediumUrl": null,
      "retireDate": null,
      "createdBy": "user-123",
      "releaseDate": "2025-05-30T13:50:19.116Z",
      "createdAt": "2025-05-30T13:50:19.116Z",
      "updatedAt": "2025-05-30T13:50:19.116Z",
      "isPublished": true,
      "isAvailable": true,
      "images": {
        "raised": null,
        "shop": null,
        "thumbnail": null,
        "medium": null
      },
      "id": "6839b79b382c0ffd1ef3df2b"
    }
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": {
    "message": "Item not found",
    "statusCode": 404,
    "isOperational": true
  }
}
```

### 3. Create Item

#### POST /items

Create a new item.

**Authentication:** Required (`Authorization: Bearer <token>`)

**Request Body:**

```json
{
  "title": "Plasma Visor",
  "description": "Advanced heads-up display for space exploration",
  "price": 150,
  "currency": "peanuts",
  "level": 10,
  "clothingType": "space gear",
  "layer": "head_layer1",
  "tags": ["space", "utility"],
  "color": "Electric Blue",
  "status": "draft",
  "releaseDate": "2025-06-01T00:00:00.000Z",
  "retireDate": "2025-12-31T23:59:59.999Z"
}
```

**Required Fields:**

- `title` (string, 1-100 chars)
- `price` (number, ≥ 0)
- `currency` (string, "diamonds" | "peanuts")
- `clothingType` (string, enum value)
- `layer` (string, enum value)
- `level` (integer, 1-100)

**Optional Fields:**

- `description` (string, max 1000 chars)
- `tags` (array of strings)
- `color` (string, max 50 chars)
- `status` (string, default: "draft")
- `releaseDate` (ISO date, default: now)
- `retireDate` (ISO date)
- Image URLs (populated later via upload)

**Response:**

```json
{
  "success": true,
  "message": "Item created successfully",
  "data": {
    "item": {
      "_id": "6839b79b382c0ffd1ef3df2b",
      "title": "Plasma Visor",
      "description": "Advanced heads-up display for space exploration",
      "tags": ["space", "utility"],
      "clothingType": "space gear",
      "price": 150,
      "currency": "peanuts",
      "level": 10,
      "color": "Electric Blue",
      "layer": "head_layer1",
      "status": "draft",
      "retireDate": null,
      "createdBy": "user-123",
      "releaseDate": "2025-05-30T13:50:19.116Z",
      "createdAt": "2025-05-30T13:50:19.116Z",
      "updatedAt": "2025-05-30T13:50:19.116Z",
      "isPublished": false,
      "isAvailable": false,
      "id": "6839b79b382c0ffd1ef3df2b"
    }
  }
}
```

### 4. Update Item

#### PUT /items/:id

Update an existing item (partial updates supported).

**Authentication:** Required (`Authorization: Bearer <token>`)

**Parameters:**

- `id` (string, required): MongoDB ObjectId

**Request Body (partial update example):**

```json
{
  "price": 175,
  "tags": ["space", "utility", "premium"],
  "color": "Cosmic Blue",
  "status": "published"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Item updated successfully",
  "data": {
    "item": {
      // Updated item object
    }
  }
}
```

### 5. Delete Item

#### DELETE /items/:id

Permanently delete an item.

**Authentication:** Required (`Authorization: Bearer <token>`)

**Parameters:**

- `id` (string, required): MongoDB ObjectId

**Response:**

```json
{
  "success": true,
  "message": "Item deleted successfully",
  "data": {
    "deletedItem": {
      "id": "6839b79b382c0ffd1ef3df2b",
      "title": "Plasma Visor"
    }
  }
}
```

### 6. Publish Item

#### POST /items/:id/publish

Change item status to "published".

**Authentication:** Required (`Authorization: Bearer <token>`)

**Parameters:**

- `id` (string, required): MongoDB ObjectId

**Response:**

```json
{
  "success": true,
  "message": "Item published successfully",
  "data": {
    "item": {
      // Item with status: "published"
    }
  }
}
```

### 7. Unpublish Item

#### POST /items/:id/unpublish

Change item status to "draft".

**Authentication:** Required (`Authorization: Bearer <token>`)

**Parameters:**

- `id` (string, required): MongoDB ObjectId

**Response:**

```json
{
  "success": true,
  "message": "Item unpublished successfully",
  "data": {
    "item": {
      // Item with status: "draft"
    }
  }
}
```

### 8. Archive Item

#### POST /items/:id/archive

Change item status to "archived".

**Authentication:** Required (`Authorization: Bearer <token>`)

**Parameters:**

- `id` (string, required): MongoDB ObjectId

**Response:**

```json
{
  "success": true,
  "message": "Item archived successfully",
  "data": {
    "item": {
      // Item with status: "archived"
    }
  }
}
```

### 9. Duplicate Item

#### POST /items/:id/duplicate

Create a copy of an existing item with "(Copy)" suffix.

**Authentication:** Required (`Authorization: Bearer <token>`)

**Parameters:**

- `id` (string, required): MongoDB ObjectId

**Response:**

```json
{
  "success": true,
  "message": "Item duplicated successfully",
  "data": {
    "item": {
      "_id": "6839b7c5382c0ffd1ef3df38",
      "title": "Plasma Visor (Copy)",
      "description": "Advanced heads-up display for space exploration",
      "status": "draft"
      // ... other fields copied from original
    }
  }
}
```

### 10. Get Statistics

#### GET /items/stats/summary

Get comprehensive item statistics and distribution data.

**Authentication:** Required (`Authorization: Bearer <token>`)

**Response:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalItems": 25,
      "publishedItems": 18,
      "draftItems": 5,
      "archivedItems": 2,
      "diamondItems": 8,
      "peanutItems": 17,
      "averagePrice": 125.5,
      "averageLevel": 15.2
    },
    "clothingTypeDistribution": [
      { "_id": "space gear", "count": 8 },
      { "_id": "utility gear", "count": 6 },
      { "_id": "battle armor", "count": 4 }
    ],
    "layerDistribution": [
      { "_id": "head_layer1", "count": 10 },
      { "_id": "body_layer1", "count": 8 },
      { "_id": "head_layer2", "count": 4 }
    ]
  }
}
```

## Upload Endpoints

### Upload Service Health

#### GET /upload/health

Check upload service status and Supabase Storage connectivity.

**Authentication:** None required

**Response:**

```json
{
  "success": true,
  "message": "Upload service healthy",
  "data": {
    "supabase": {
      "connected": true,
      "error": null
    },
    "imageService": {
      "configured": true,
      "maxFileSize": "5MB",
      "allowedTypes": ["image/jpeg", "image/png", "image/webp"],
      "imageSizes": ["thumbnail", "medium", "raised", "shop", "full"]
    }
  }
}
```

### Upload Item Images

#### POST /upload/item-images

Upload both raised and shop images for item creation. Processes images and returns URLs for all generated sizes.

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Form Fields:**

- `imageRaised` (file, optional): Raised state image file (PNG, JPG, WebP, max 5MB)
- `imageShop` (file, optional): Shop display image file (PNG, JPG, WebP, max 5MB)

**Note:** At least one image file is required.

**Example Request:**

```bash
curl -X POST http://localhost:3001/api/upload/item-images \
  -H "Authorization: Bearer your-jwt-token" \
  -F "imageRaised=@echo-visor-raised.png" \
  -F "imageShop=@echo-visor-shop.png"
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully processed raised and shop images",
  "data": {
    "imageUrls": {
      "raised": "https://supabase.co/storage/v1/object/public/item-images/temp_1234567890_raised/raised.webp",
      "raisedThumbnail": "https://supabase.co/storage/v1/object/public/item-images/temp_1234567890_raised/thumbnail.webp",
      "raisedMedium": "https://supabase.co/storage/v1/object/public/item-images/temp_1234567890_raised/medium.webp",
      "shop": "https://supabase.co/storage/v1/object/public/item-images/temp_1234567891_shop/shop.webp",
      "shopThumbnail": "https://supabase.co/storage/v1/object/public/item-images/temp_1234567891_shop/thumbnail.webp",
      "shopMedium": "https://supabase.co/storage/v1/object/public/item-images/temp_1234567891_shop/medium.webp"
    },
    "processedSizes": ["raised", "shop"]
  }
}
```

### Upload Single Item Image

#### POST /upload/item/:itemId

Upload and update a single image for an existing item.

**Authentication:** Required

**Parameters:**

- `itemId` (string, required): MongoDB ObjectId of the item

**Body:**

- `imageType` (string, optional): Type of image ("raised", "shop", "thumbnail", "medium", "item")

**Content-Type:** `multipart/form-data`

**Form Fields:**

- `image` (file, required): Image file (PNG, JPG, WebP, max 5MB)

**Example Request:**

```bash
curl -X POST http://localhost:3001/api/upload/item/6839b79b382c0ffd1ef3df2b \
  -H "Authorization: Bearer your-jwt-token" \
  -F "image=@new-helmet.png" \
  -F "imageType=raised"
```

### Update Item Images

#### PUT /items/:id/images

Update image URLs for an existing item. Used after uploading images to associate URLs with the item.

**Authentication:** Required

**Parameters:**

- `id` (string, required): MongoDB ObjectId of the item

**Request Body:**

```json
{
  "imageRaisedUrl": "https://supabase.co/storage/v1/object/public/item-images/item123/raised.webp",
  "imageShopUrl": "https://supabase.co/storage/v1/object/public/item-images/item123/shop.webp",
  "imageThumbnailUrl": "https://supabase.co/storage/v1/object/public/item-images/item123/thumbnail.webp",
  "imageMediumUrl": "https://supabase.co/storage/v1/object/public/item-images/item123/medium.webp"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Item images updated successfully",
  "data": {
    "item": {
      "_id": "6839b79b382c0ffd1ef3df2b",
      "title": "Echo Visor",
      "imageRaisedUrl": "https://supabase.co/storage/v1/object/public/item-images/item123/raised.webp",
      "imageShopUrl": "https://supabase.co/storage/v1/object/public/item-images/item123/shop.webp",
      "imageThumbnailUrl": "https://supabase.co/storage/v1/object/public/item-images/item123/thumbnail.webp",
      "imageMediumUrl": "https://supabase.co/storage/v1/object/public/item-images/item123/medium.webp"
      // ... other item fields
    },
    "updatedFields": [
      "imageRaisedUrl",
      "imageShopUrl",
      "imageThumbnailUrl",
      "imageMediumUrl"
    ]
  }
}
```

### Delete Item Image

#### DELETE /items/:id/images/:type

Remove a specific image type from an item.

**Authentication:** Required

**Parameters:**

- `id` (string, required): MongoDB ObjectId of the item
- `type` (string, required): Image type to remove ("raised", "shop", "thumbnail", "medium")

**Example Request:**

```bash
curl -X DELETE http://localhost:3001/api/items/6839b79b382c0ffd1ef3df2b/images/thumbnail \
  -H "Authorization: Bearer your-jwt-token"
```

**Response:**

```json
{
  "success": true,
  "message": "thumbnail image removed successfully",
  "data": {
    "item": {
      "_id": "6839b79b382c0ffd1ef3df2b",
      "title": "Echo Visor",
      "imageRaisedUrl": "https://supabase.co/storage/v1/object/public/item-images/item123/raised.webp",
      "imageShopUrl": "https://supabase.co/storage/v1/object/public/item-images/item123/shop.webp",
      "imageThumbnailUrl": null,
      "imageMediumUrl": "https://supabase.co/storage/v1/object/public/item-images/item123/medium.webp"
      // ... other item fields
    },
    "removedImageType": "thumbnail",
    "removedUrl": "https://supabase.co/storage/v1/object/public/item-images/item123/thumbnail.webp"
  }
}
```

### Image Processing Specifications

**Generated Image Sizes:**

- **Thumbnail**: 256x256 pixels, quality 80%, fit 'cover' (square crop)
- **Medium**: 512x512 pixels, quality 85%, fit 'cover' (square crop)
- **Raised**: 2079x2954 pixels, quality 95%, fit 'contain' (1:1.42 aspect ratio, portrait)
- **Shop**: 1040x1477 pixels, quality 90%, fit 'contain' (1:1.42 aspect ratio, portrait)
- **Full**: 1024x1024 pixels, quality 90%, fit 'cover' (backward compatibility)

**File Format:** All processed images are converted to WebP for optimal compression and quality.

**Storage:** Images are stored in Supabase Storage in the `item-images` bucket with organized folder structure.

### Complete Item Creation Workflow

**Step 1: Upload Images**

```bash
curl -X POST http://localhost:3001/api/upload/item-images \
  -H "Authorization: Bearer your-jwt-token" \
  -F "imageRaised=@echo-visor-raised.png" \
  -F "imageShop=@echo-visor-shop.png"
```

**Step 2: Create Item with Image URLs**

```bash
curl -X POST http://localhost:3001/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "title": "Echo Visor",
    "price": 859,
    "currency": "diamonds",
    "clothingType": "experimental tech",
    "layer": "head_layer1",
    "level": 13,
    "tags": ["experimental"],
    "description": "Advanced experimental visor with echo technology",
    "imageRaisedUrl": "https://supabase.co/.../raised.webp",
    "imageShopUrl": "https://supabase.co/.../shop.webp",
    "imageThumbnailUrl": "https://supabase.co/.../thumbnail.webp",
    "imageMediumUrl": "https://supabase.co/.../medium.webp"
  }'
```

---

## Data Models

### Item Schema

```javascript
{
  // Basic Information
  title: String (required, 1-100 chars)
  description: String (max 1000 chars)

  // Categorization
  tags: [String] // enum: weapons, official, space, utility, governance, armor, primal, experimental, casual
  clothingType: String (required) // enum: weapons, Official Planet Peanut Work Wear, space gear, utility gear, Planetary Governance Wear, battle armor, tribal wear, experimental tech, casual wear

  // Pricing & Requirements
  price: Number (required, min 0)
  currency: String (required) // "diamonds" | "peanuts"
  level: Number (required, 1-100)

  // Visual Properties
  color: String (max 50 chars)
  layer: String (required) // enum: body_layer1, body_layer2, body_layer3, body_layer_full, head_layer1, head_layer2, head_layer3, head_layer_full, pants_layer1, pants_layer2, pants_layer3, pants_layer_full, accessory, accessoryBack, fullbody1, fullbody2

  // Image URLs (populated after Supabase upload)
  imageRaisedUrl: String // URL validation
  imageShopUrl: String // URL validation
  imageThumbnailUrl: String // URL validation
  imageMediumUrl: String // URL validation

  // Availability Control
  status: String // "draft" | "published" | "archived"
  releaseDate: Date (indexed, default: now)
  retireDate: Date (optional, must be > releaseDate)

  // Metadata
  createdBy: String // User ID
  updatedBy: String // User ID
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Virtual Properties

- `isPublished`: boolean - true if status is "published"
- `isAvailable`: boolean - true if published and within date range
- `images`: object - complete image URL set

## Error Handling

### HTTP Status Codes

| Code | Meaning               | Description                         |
| ---- | --------------------- | ----------------------------------- |
| 200  | OK                    | Request successful                  |
| 201  | Created               | Resource created successfully       |
| 400  | Bad Request           | Validation error or invalid request |
| 401  | Unauthorized          | Missing or invalid authentication   |
| 404  | Not Found             | Resource not found                  |
| 500  | Internal Server Error | Server error                        |

### Common Error Scenarios

#### Validation Error (400)

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "statusCode": 400,
    "isOperational": [
      {
        "field": "price",
        "message": "Price must be a positive number",
        "value": -50
      },
      {
        "field": "currency",
        "message": "Currency must be one of: diamonds, peanuts",
        "value": "invalid"
      }
    ]
  }
}
```

#### Authentication Error (401)

```json
{
  "success": false,
  "error": {
    "message": "No token provided",
    "statusCode": 401,
    "isOperational": true
  }
}
```

#### Not Found Error (404)

```json
{
  "success": false,
  "error": {
    "message": "Item not found",
    "statusCode": 404,
    "isOperational": true
  }
}
```

## Rate Limiting

Currently no rate limiting implemented. Will be added in production.

## Testing Examples

### Using cURL

```bash
# Health check
curl http://localhost:3001/health

# Create item
curl -X POST http://localhost:3001/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer stub-token" \
  -d '{
    "title": "Quantum Sword",
    "price": 500,
    "currency": "diamonds",
    "clothingType": "weapons",
    "layer": "accessory",
    "level": 25,
    "description": "Legendary quantum-powered weapon",
    "tags": ["weapons", "primal"],
    "color": "Void Black"
  }'

# Get items with filtering
curl "http://localhost:3001/api/items?currency=diamonds&minLevel=20&tags=weapons&sortBy=price&sortOrder=desc"

# Update item
curl -X PUT http://localhost:3001/api/items/ITEM_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer stub-token" \
  -d '{"price": 600, "status": "published"}'

# Publish item
curl -X POST http://localhost:3001/api/items/ITEM_ID/publish \
  -H "Authorization: Bearer stub-token"

# Get statistics
curl -H "Authorization: Bearer stub-token" \
  http://localhost:3001/api/items/stats/summary
```

### Using JavaScript/Fetch

```javascript
// Create item
const createItem = async () => {
  const response = await fetch("http://localhost:3001/api/items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer stub-token",
    },
    body: JSON.stringify({
      title: "Nano Armor",
      price: 300,
      currency: "peanuts",
      clothingType: "battle armor",
      layer: "body_layer1",
      level: 18,
      tags: ["armor", "experimental"],
    }),
  });

  const data = await response.json();
  console.log(data);
};

// Get filtered items
const getItems = async () => {
  const params = new URLSearchParams({
    clothingType: "battle armor",
    currency: "peanuts",
    minLevel: "15",
    tags: "armor,experimental",
    sortBy: "level",
    sortOrder: "desc",
  });

  const response = await fetch(`http://localhost:3001/api/items?${params}`);
  const data = await response.json();
  console.log(data);
};
```

## Version History

- **v1.0.0** - Initial API implementation with complete CRUD operations
- **v1.1.0** - Step 2.2: Image Upload Integration
  - Added POST /upload/item-images for dual image upload
  - Added PUT /items/:id/images for image URL updates
  - Added DELETE /items/:id/images/:type for specific image removal
  - Added GET /upload/health for service monitoring
  - Implemented Sharp-based image processing with 5 size variants
  - Integrated Supabase Storage with organized folder structure
  - Added comprehensive URL validation and error handling
