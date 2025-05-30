# Planet Peanut CMS

A comprehensive Content Management System for managing avatar items, accessories, and digital assets for the Planet Peanut learning app.

## 🚀 Current Status: Backend Foundation Complete (Step 1.3)

✅ **Completed Features:**

- Full CRUD operations for avatar items
- Advanced filtering and pagination
- Comprehensive data validation
- MongoDB Atlas integration
- RESTful API with proper error handling
- Item statistics and analytics
- Item duplication and archiving
- Multi-status management (draft/published/archived)

🔄 **Next Steps:**

- Step 1.4: Supabase integration for image upload
- Step 2: Frontend development with Next.js
- Step 3: Authentication & deployment

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [API Documentation](#api-documentation)
4. [Database Schema](#database-schema)
5. [Architecture](#architecture)
6. [Tech Stack](#tech-stack)
7. [Development Status](#development-status)

## Overview

The Planet Peanut CMS provides a web-based admin interface for creating, managing, and publishing avatar items. It serves as the backend for the Planet Peanut React Native learning app to retrieve item data and images through a REST API.

### Key Features

- **Complete Item Management**: Create, edit, update, delete avatar items with rich metadata
- **Advanced Filtering**: Filter by clothing type, currency, level, tags, price ranges
- **Multi-Status Workflow**: Draft → Published → Archived lifecycle
- **Comprehensive Validation**: Field-level validation with detailed error messages
- **Statistics & Analytics**: Item distribution and usage statistics
- **Item Operations**: Publish, unpublish, archive, duplicate items
- **Image Processing**: Ready for Supabase Storage integration (next step)
- **Role-based Access**: JWT authentication framework in place
- **API-First Design**: RESTful endpoints optimized for mobile app consumption

### System Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Admin UI      │    │   Express API    │    │   Planet Peanut │
│   (Next.js)     │───▶│   (Node.js)      │───▶│   Mobile App    │
│   [Coming Soon] │    │   ✅ COMPLETE    │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │                       ▼
         │              ┌──────────────────┐
         │              │   MongoDB Atlas  │
         │              │   ✅ CONNECTED   │
         │              └──────────────────┘
         │
         ▼
┌─────────────────┐
│ Supabase Storage│
│   [Next Step]   │
└─────────────────┘
```

## Quick Start

### Prerequisites

- Node.js (>=18.0.0)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Git

### Backend Setup (Currently Available)

```bash
# Clone the repository
git clone https://github.com/simongudiksen/cms-system-planetpeanut.git
cd cms-system-planetpeanut

# Install backend dependencies
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Add your MongoDB Atlas connection string and other config

# Start development server
npm run dev
```

### Environment Variables (.env)

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Configuration
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

## API Documentation

### Base URL

```
http://localhost:3001/api
```

### Authentication

All write operations require JWT authentication:

```bash
Authorization: Bearer <jwt-token>
```

### Endpoints Overview

| Method | Endpoint               | Description                          | Auth Required |
| ------ | ---------------------- | ------------------------------------ | ------------- |
| GET    | `/items`               | List items with filtering/pagination | No            |
| GET    | `/items/:id`           | Get single item                      | No            |
| POST   | `/items`               | Create new item                      | Yes           |
| PUT    | `/items/:id`           | Update item                          | Yes           |
| DELETE | `/items/:id`           | Delete item                          | Yes           |
| POST   | `/items/:id/publish`   | Publish item                         | Yes           |
| POST   | `/items/:id/unpublish` | Unpublish item                       | Yes           |
| POST   | `/items/:id/archive`   | Archive item                         | Yes           |
| POST   | `/items/:id/duplicate` | Duplicate item                       | Yes           |
| GET    | `/items/stats/summary` | Get statistics                       | Yes           |

### Detailed API Examples

#### 1. Create Item

```bash
POST /api/items
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Plasma Visor",
  "description": "Advanced heads-up display for space exploration",
  "price": 150,
  "currency": "peanuts",
  "level": 10,
  "clothingType": "space gear",
  "layer": "head_layer1",
  "tags": ["space", "utility"],
  "color": "Electric Blue"
}
```

#### 2. Get Items with Filtering

```bash
# Filter by multiple criteria
GET /api/items?clothingType=space%20gear&currency=peanuts&minLevel=5&maxLevel=20&tags=space,utility&sortBy=price&sortOrder=asc&page=1&limit=10

# Response
{
  "success": true,
  "data": {
    "items": [...],
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
      "level": {"min": "5", "max": "20"},
      "tags": ["space", "utility"]
    }
  }
}
```

#### 3. Get Statistics

```bash
GET /api/items/stats/summary
Authorization: Bearer <token>

# Response
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
      "averagePrice": 125.50,
      "averageLevel": 15.2
    },
    "clothingTypeDistribution": [
      {"_id": "space gear", "count": 8},
      {"_id": "utility gear", "count": 6}
    ],
    "layerDistribution": [
      {"_id": "head_layer1", "count": 10},
      {"_id": "body_layer1", "count": 8}
    ]
  }
}
```

### Available Filters

- **status**: `draft`, `published`, `archived`
- **currency**: `diamonds`, `peanuts`
- **clothingType**: `weapons`, `Official Planet Peanut Work Wear`, `space gear`, `utility gear`, `Planetary Governance Wear`, `battle armor`, `tribal wear`, `experimental tech`, `casual wear`
- **layer**: `body_layer1`, `body_layer2`, `body_layer3`, `body_layer_full`, `head_layer1`, `head_layer2`, `head_layer3`, `head_layer_full`, `pants_layer1`, `pants_layer2`, `pants_layer3`, `pants_layer_full`, `accessory`, `accessoryBack`, `fullbody1`, `fullbody2`
- **tags**: `weapons`, `official`, `space`, `utility`, `governance`, `armor`, `primal`, `experimental`, `casual`
- **level**: 1-100 (exact or min/max range)
- **price**: min/max range
- **search**: Text search in title and description
- **sortBy**: `title`, `price`, `level`, `createdAt`, `updatedAt`, `releaseDate`
- **sortOrder**: `asc`, `desc`

## Database Schema

### Item Model

```javascript
{
  // Basic Information
  title: String (required, max 100 chars)
  description: String (max 1000 chars)

  // Categorization
  tags: [String] // enum values
  clothingType: String (required) // enum values

  // Pricing & Requirements
  price: Number (required, min 0)
  currency: String (required) // 'diamonds' | 'peanuts'
  level: Number (required, 1-100)

  // Visual Properties
  color: String (max 50 chars)
  layer: String (required) // enum values for avatar layering

  // Image URLs (populated after Supabase upload)
  imageRaisedUrl: String // Full resolution for raised state
  imageShopUrl: String // Shop display version
  imageThumbnailUrl: String // Small preview
  imageMediumUrl: String // Medium size

  // Availability Control
  status: String // 'draft' | 'published' | 'archived'
  releaseDate: Date (indexed)
  retireDate: Date (optional)

  // Metadata
  createdBy: String // User ID
  updatedBy: String // User ID
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Virtual Properties

- `isPublished`: boolean - true if status is 'published'
- `isAvailable`: boolean - true if published and within date range
- `images`: object - complete image URL set

## Architecture

### Current Implementation (Step 1.3)

```
┌─────────────────────────────────────────────────────────────┐
│                    Express.js Backend                      │
├─────────────────────────────────────────────────────────────┤
│  Routes          Controllers         Models                │
│  ┌─────────┐     ┌─────────────┐    ┌─────────────────┐    │
│  │ /items  │────▶│itemController│───▶│   Item Model    │    │
│  │         │     │             │    │   (Mongoose)    │    │
│  │ CRUD +  │     │ - getAllItems│    │                 │    │
│  │ Actions │     │ - getById   │    │ - Full Schema   │    │
│  │         │     │ - create    │    │ - Validation    │    │
│  └─────────┘     │ - update    │    │ - Virtuals      │    │
│                  │ - delete    │    │ - Methods       │    │
│  Middleware      │ - publish   │    └─────────────────┘    │
│  ┌─────────┐     │ - archive   │             │             │
│  │ Auth    │     │ - duplicate │             │             │
│  │ Validation│   │ - stats     │             │             │
│  │ Error   │     └─────────────┘             │             │
│  └─────────┘                                 ▼             │
└─────────────────────────────────────────────────────────────┘
                                   ┌─────────────────┐
                                   │  MongoDB Atlas  │
                                   │                 │
                                   │ - Indexes       │
                                   │ - Aggregation   │
                                   │ - Text Search   │
                                   └─────────────────┘
```

### Core Features Implemented

1. **Complete CRUD Operations**

   - Create, Read, Update, Delete items
   - Advanced filtering and pagination
   - Text search capabilities

2. **Item Lifecycle Management**

   - Draft → Published → Archived workflow
   - Status change endpoints
   - Date-based availability control

3. **Data Validation & Security**

   - Comprehensive field validation
   - JWT authentication framework
   - Error handling with detailed messages

4. **Analytics & Operations**
   - Statistics aggregation
   - Item duplication
   - Distribution analytics

## Tech Stack

### Backend (✅ Implemented)

```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "express-validator": "^7.0.1",
  "jsonwebtoken": "^9.0.2",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "winston": "^3.11.0",
  "morgan": "^1.10.0",
  "nodemon": "^3.0.1"
}
```

### Frontend (🔄 Next Phase)

```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "tailwindcss": "^3.3.6",
  "@supabase/supabase-js": "^2.38.0",
  "react-hook-form": "^7.47.0"
}
```

### Image Processing (🔄 Next Step)

```json
{
  "multer": "^1.4.5",
  "sharp": "^0.32.0"
}
```

## Development Status

### ✅ Phase 1: Backend Foundation (COMPLETE)

**Step 1.1: Project Setup**

- ✅ Express server with middleware stack
- ✅ MongoDB Atlas connection
- ✅ Basic authentication framework
- ✅ Error handling and logging
- ✅ CORS and security headers

**Step 1.2: Database & Models**

- ✅ Mongoose connection with retry logic
- ✅ Item model with complete schema
- ✅ Validation rules and indexes
- ✅ Virtual properties and methods

**Step 1.3: CRUD Implementation**

- ✅ Complete controller with all operations
- ✅ Advanced filtering and pagination
- ✅ Comprehensive validation middleware
- ✅ Statistics and analytics endpoints
- ✅ Item operations (publish, archive, duplicate)

### 🔄 Phase 2: Image Processing (Next)

**Step 1.4: Supabase Integration**

- 🔄 Supabase client setup
- 🔄 Image upload endpoints
- 🔄 Sharp image processing pipeline
- 🔄 Multi-size image generation

### 🔄 Phase 3: Frontend Development

**Step 2: Admin Interface**

- 🔄 Next.js setup with Tailwind
- 🔄 Item management interface
- 🔄 Image upload UI
- 🔄 Authentication flow

### 🔄 Phase 4: Deployment & Production

**Step 3: Production Setup**

- 🔄 Environment configuration
- 🔄 Deployment pipeline
- 🔄 Performance optimization

## Testing the API

The backend server is fully functional. Test the API with these examples:

```bash
# Health check
curl http://localhost:3001/health

# Create an item
curl -X POST http://localhost:3001/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer stub-token" \
  -d '{
    "title": "Space Helmet MK-II",
    "price": 200,
    "currency": "diamonds",
    "clothingType": "space gear",
    "layer": "head_layer2",
    "level": 15,
    "description": "Advanced space exploration helmet",
    "tags": ["space", "armor"],
    "color": "Cosmic Blue"
  }'

# Get filtered items
curl "http://localhost:3001/api/items?currency=diamonds&minLevel=10&tags=space"

# Get statistics
curl -H "Authorization: Bearer stub-token" \
  http://localhost:3001/api/items/stats/summary
```

## Contributing

This project is designed for AI-assisted development. Each implementation step includes comprehensive documentation and examples for efficient AI collaboration.

## License

Private project for Planet Peanut learning app.
