# Planet Peanut CMS - Development Guide

## Overview

This guide provides comprehensive information for developers (human and AI) working on the Planet Peanut CMS system. It documents the current implementation status and provides step-by-step guidance for future development.

## Current Implementation Status

### ✅ Phase 1: Backend Foundation (COMPLETE)

The backend API is fully functional with the following completed features:

#### Step 1.1: Project Setup ✅

- Express.js server with production-ready middleware stack
- MongoDB Atlas integration with connection pooling
- JWT authentication framework (stub implementation for testing)
- Comprehensive error handling and logging
- CORS configuration and security headers

#### Step 1.2: Database Models ✅

- Complete Item model with all required fields
- Advanced Mongoose schema with validation, indexes, and virtuals
- Pre-save middleware for user tracking and date validation
- Static and instance methods for common operations

#### Step 1.3: CRUD Implementation ✅

- Full CRUD operations with comprehensive validation
- Advanced filtering system (14+ filter options)
- Pagination with metadata
- Text search capabilities
- Item lifecycle management (draft → published → archived)
- Additional operations: publish, unpublish, archive, duplicate
- Statistics and analytics aggregation

### 🔄 Next Phase: Image Processing Integration

#### Step 1.4: Supabase Storage Integration

- Set up Supabase client and storage configuration
- Implement image upload endpoints with Sharp processing
- Create multi-size image generation pipeline
- Add image validation and error handling

## Architecture Overview

### Current Implementation

```
┌─────────────────────────────────────────────────────────────┐
│                    Backend API Server                      │
│                     (Port 3001)                           │
├─────────────────────────────────────────────────────────────┤
│  Express Middleware Stack:                                │
│  ├─ Helmet (Security Headers)                             │
│  ├─ CORS (Cross-Origin Requests)                          │
│  ├─ Morgan (Request Logging)                              │
│  ├─ Body Parser (JSON/URL-encoded)                        │
│  └─ Custom Error Handler                                  │
├─────────────────────────────────────────────────────────────┤
│  Routes & Controllers:                                     │
│  ├─ /health (Health Check)                                │
│  ├─ /api/items (CRUD + Operations)                        │
│  │   ├─ GET / (List with filtering)                       │
│  │   ├─ GET /:id (Single item)                            │
│  │   ├─ POST / (Create)                                   │
│  │   ├─ PUT /:id (Update)                                 │
│  │   ├─ DELETE /:id (Delete)                              │
│  │   ├─ POST /:id/publish                                 │
│  │   ├─ POST /:id/unpublish                               │
│  │   ├─ POST /:id/archive                                 │
│  │   ├─ POST /:id/duplicate                               │
│  │   └─ GET /stats/summary                                │
│  └─ Authentication Middleware (JWT)                       │
├─────────────────────────────────────────────────────────────┤
│  Data Layer:                                              │
│  ├─ Mongoose ODM                                          │
│  ├─ Item Model (Complete Schema)                          │
│  ├─ Validation Middleware                                 │
│  └─ Database Utilities                                    │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  MongoDB Atlas  │
                    │                 │
                    │ Collections:    │
                    │ ├─ items        │
                    │ └─ (future)     │
                    │                 │
                    │ Features:       │
                    │ ├─ Indexes      │
                    │ ├─ Text Search  │
                    │ └─ Aggregation  │
                    └─────────────────┘
```

## File Structure

```
cms-system-planetpeanut/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── itemController.js     ✅ Complete CRUD + operations
│   │   ├── middleware/
│   │   │   ├── auth.js               ✅ JWT authentication (stub)
│   │   │   ├── errorHandler.js       ✅ Comprehensive error handling
│   │   │   └── validation.js         ✅ Express-validator rules
│   │   ├── models/
│   │   │   └── Item.js               ✅ Complete schema with virtuals
│   │   ├── routes/
│   │   │   └── items.js              ✅ All REST endpoints
│   │   ├── utils/
│   │   │   └── database.js           ✅ MongoDB connection with retry
│   │   └── index.js                  ✅ Express server setup
│   ├── package.json                  ✅ All dependencies installed
│   └── env.example                   ✅ Configuration template
├── frontend/                         🔄 Next phase
├── README.md                         ✅ Updated with current status
├── API_DOCUMENTATION.md              ✅ Comprehensive API docs
└── DEVELOPMENT_GUIDE.md              ✅ This file
```

## Development Environment Setup

### 1. Clone and Install

```bash
git clone https://github.com/simongudiksen/cms-system-planetpeanut.git
cd cms-system-planetpeanut/backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure:

```bash
cp env.example .env
```

Required environment variables:

```bash
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

### 3. Start Development Server

```bash
npm run dev
# Server starts on http://localhost:3001
# Health check: http://localhost:3001/health
```

## API Testing

### Health Check

```bash
curl http://localhost:3001/health
```

### Create Test Item

```bash
curl -X POST http://localhost:3001/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer stub-token" \
  -d '{
    "title": "Test Item",
    "price": 100,
    "currency": "peanuts",
    "clothingType": "space gear",
    "layer": "head_layer1",
    "level": 10,
    "tags": ["space", "utility"]
  }'
```

### Advanced Filtering

```bash
curl "http://localhost:3001/api/items?currency=peanuts&minLevel=5&tags=space&sortBy=price&sortOrder=asc"
```

## Database Schema Documentation

### Item Model Fields

| Field               | Type     | Required | Validation               | Description                 |
| ------------------- | -------- | -------- | ------------------------ | --------------------------- |
| `title`             | String   | Yes      | 1-100 chars              | Item display name           |
| `description`       | String   | No       | Max 1000 chars           | Item description            |
| `price`             | Number   | Yes      | ≥ 0                      | Item cost                   |
| `currency`          | String   | Yes      | diamonds/peanuts         | Payment currency            |
| `level`             | Number   | Yes      | 1-100                    | Required user level         |
| `clothingType`      | String   | Yes      | Enum values              | Item category               |
| `layer`             | String   | Yes      | Enum values              | Avatar layer                |
| `tags`              | [String] | No       | Enum values              | Item tags                   |
| `color`             | String   | No       | Max 50 chars             | Item color                  |
| `status`            | String   | No       | draft/published/archived | Item status                 |
| `releaseDate`       | Date     | No       | ISO date                 | When item becomes available |
| `retireDate`        | Date     | No       | ISO date                 | When item is retired        |
| `imageRaisedUrl`    | String   | No       | Valid URL                | Raised state image          |
| `imageShopUrl`      | String   | No       | Valid URL                | Shop display image          |
| `imageThumbnailUrl` | String   | No       | Valid URL                | Thumbnail image             |
| `imageMediumUrl`    | String   | No       | Valid URL                | Medium size image           |
| `createdBy`         | String   | No       | User ID                  | Creator ID                  |
| `updatedBy`         | String   | No       | User ID                  | Last updater ID             |

### Virtual Properties

- `isPublished`: boolean - true if status is 'published'
- `isAvailable`: boolean - true if published and within date range
- `images`: object - consolidated image URLs

### Indexes

- `{status: 1, releaseDate: -1}` - Published items by date
- `{clothingType: 1, level: 1}` - Filter by type and level
- `{currency: 1, price: 1}` - Price range queries
- `{tags: 1}` - Tag-based filtering
- `{layer: 1}` - Layer-based queries
- `{createdAt: -1}` - Recent items
- `{title: 'text', description: 'text'}` - Text search

## Step-by-Step Implementation Guide

### Next Step: Supabase Integration (Step 1.4)

#### 1. Install Dependencies

```bash
npm install @supabase/supabase-js multer sharp
```

#### 2. Supabase Client Setup

Create `src/utils/supabase.js`:

```javascript
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
```

#### 3. Image Processing Service

Create `src/services/imageService.js`:

```javascript
const sharp = require("sharp");
const supabase = require("../utils/supabase");

class ImageService {
  async processAndUpload(file, itemId) {
    // Generate multiple sizes
    // Upload to Supabase Storage
    // Return URLs for database
  }
}
```

#### 4. Image Upload Routes

Add to `src/routes/images.js`:

```javascript
router.post("/upload", upload.single("image"), uploadImage);
router.delete("/:itemId/:imageType", deleteImage);
```

#### 5. Update Item Model

Add image URL fields and validation.

### Future Steps

#### Step 2: Frontend Development

- Next.js setup with Tailwind CSS
- Admin dashboard components
- Item management interface
- Image upload UI
- Authentication integration

#### Step 3: Production Deployment

- Environment configuration
- CI/CD pipeline setup
- Performance optimization
- Security hardening

## Code Style Guidelines

### File Naming

- `camelCase` for files and variables
- `PascalCase` for classes and models
- `kebab-case` for routes

### Error Handling

- Use `catchAsync` wrapper for async route handlers
- Throw `AppError` for operational errors
- Include detailed error messages for debugging

### Validation

- Use express-validator for request validation
- Include field-level error messages
- Validate both input and output data

### Documentation

- Include JSDoc comments for functions
- Document API endpoints with examples
- Maintain this development guide

## Testing Strategy

### Manual Testing

- Use cURL commands for API testing
- Test all CRUD operations
- Verify filtering and pagination
- Test error scenarios

### Automated Testing (Future)

- Unit tests for models and utilities
- Integration tests for API endpoints
- End-to-end tests for complete workflows

## Performance Considerations

### Database Optimization

- Strategic indexes for common queries
- Aggregation pipelines for statistics
- Connection pooling and retry logic

### API Optimization

- Pagination for large datasets
- Lean queries for list endpoints
- Proper HTTP status codes and caching headers

### Future Optimizations

- Redis caching for frequently accessed data
- CDN for image delivery
- Rate limiting for API protection

## Security Measures

### Current Implementation

- Helmet.js for security headers
- CORS configuration
- JWT authentication framework
- Input validation and sanitization
- Error message sanitization

### Production Security

- Environment variable protection
- Rate limiting
- Input sanitization
- SQL injection prevention (NoSQL)
- XSS protection

## Troubleshooting

### Common Issues

#### MongoDB Connection Failed

```bash
# Check connection string format
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Verify network access in MongoDB Atlas
# Check IP whitelist settings
```

#### Validation Errors

```bash
# Check request body format
# Verify required fields are included
# Check enum values match schema
```

#### Authentication Issues

```bash
# Verify Authorization header format
Authorization: Bearer stub-token

# Check token in middleware
# Verify routes require authentication
```

### Debugging Tools

#### Enable Debug Logging

```bash
DEBUG=true npm run dev
```

#### Database Query Logging

```bash
DB_DEBUG=true npm run dev
```

#### Request Logging

```bash
REQUEST_LOGGING=true npm run dev
```

## Contributing Guidelines

### Development Workflow

1. Create feature branch from main
2. Implement changes with tests
3. Update documentation
4. Submit pull request with description

### Code Quality

- Follow established patterns
- Include error handling
- Add comprehensive validation
- Document complex logic

### AI Development Notes

- Each step includes complete implementation examples
- Error scenarios are documented with solutions
- API responses include full object structures
- Database operations include error handling patterns

## Support and Resources

### Documentation

- [README.md](./README.md) - Project overview and quick start
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Complete API reference
- This file - Development guidelines and implementation details

### External Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Supabase Documentation](https://supabase.com/docs)

### Getting Help

- Check existing API documentation for examples
- Review error logs for debugging information
- Test with provided cURL examples
- Follow implementation patterns from completed code
