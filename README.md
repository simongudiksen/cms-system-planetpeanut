# Planet Peanut CMS

A comprehensive Content Management System for managing avatar items, accessories, and digital assets for the Planet Peanut learning app.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Documentation Structure](#documentation-structure)
4. [Architecture](#architecture)
5. [Tech Stack](#tech-stack)
6. [Development Workflow](#development-workflow)
7. [API Integration](#api-integration)

## Overview

The Planet Peanut CMS provides a web-based admin interface for creating, managing, and publishing avatar items. It serves as the backend for the Planet Peanut React Native learning app to retrieve item data and images through a REST API.

### Key Features

- **Item Management**: Create, edit, and publish avatar items with rich metadata
- **Image Processing**: Automatic multi-size image generation and optimization
- **Live Preview**: Real-time avatar preview with item layering
- **Role-based Access**: Secure admin authentication via Supabase
- **CDN Delivery**: Fast global image delivery through Supabase Storage
- **API Integration**: RESTful endpoints for mobile app consumption

### System Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Admin UI      │    │   Express API    │    │   Planet Peanut │
│   (Next.js)     │───▶│   (Node.js)      │───▶│   Mobile App    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │                       ▼
         │              ┌──────────────────┐
         │              │    MongoDB       │
         │              │   (Item Data)    │
         │              └──────────────────┘
         │
         ▼
┌─────────────────┐
│ Supabase Storage│
│   (Images +     │
│   Auth)         │
└─────────────────┘
```

## Quick Start

### Prerequisites

- Node.js (>=18.0.0)
- npm or yarn
- MongoDB instance (local or Atlas)
- Supabase project with Storage enabled
- Git

### Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd planet-peanut-cms

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development servers
npm run dev
```

## Documentation Structure

This project includes comprehensive documentation for AI-assisted development:

- **[Technical Architecture](./docs/01-architecture.md)** - System design and component relationships
- **[Database Schema](./docs/02-database-schema.md)** - MongoDB models and data structures
- **[API Specification](./docs/03-api-specification.md)** - REST endpoints and integration guide
- **[Image Processing](./docs/04-image-processing.md)** - Upload pipeline and storage management
- **[Frontend Components](./docs/05-frontend-components.md)** - Admin UI structure and components
- **[Authentication & Security](./docs/06-authentication.md)** - Auth flow and security measures
- **[Development Guide](./docs/07-development-guide.md)** - Implementation steps and best practices
- **[Deployment Guide](./docs/08-deployment.md)** - Production setup and CI/CD

## Architecture

### Core Technologies

- **Backend**: Express.js + MongoDB + Mongoose
- **Frontend**: Next.js + React + Tailwind CSS
- **Storage**: Supabase Storage (images + CDN)
- **Authentication**: Supabase Auth
- **Image Processing**: Sharp.js
- **API**: RESTful with JWT authentication

### Data Flow

1. **Admin creates item** → Next.js admin interface
2. **Images uploaded** → Sharp processing → Supabase Storage
3. **Metadata saved** → MongoDB via Express API
4. **Mobile app requests** → Express API → MongoDB query → JSON response
5. **Images served** → Direct CDN URLs from Supabase

## Tech Stack

### Backend

```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "multer": "^1.4.5",
  "sharp": "^0.32.0",
  "@supabase/supabase-js": "^2.38.0",
  "jsonwebtoken": "^9.0.2",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "winston": "^3.11.0"
}
```

### Frontend

```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "tailwindcss": "^3.3.6",
  "@supabase/supabase-js": "^2.38.0",
  "react-hook-form": "^7.47.0",
  "react-markdown": "^9.0.0",
  "lucide-react": "^0.263.1"
}
```

## Development Workflow

### Phase 1: Backend Foundation (Days 1-2)

- Set up Express server with basic middleware
- Create MongoDB connection and Mongoose models
- Implement core CRUD API endpoints
- Add basic authentication middleware

### Phase 2: Image Processing (Day 3)

- Implement Sharp-based image processing pipeline
- Set up Supabase Storage integration
- Create image upload endpoints with multi-size generation

### Phase 3: Admin Interface (Days 4-6)

- Build Next.js admin dashboard structure
- Create item management forms and interfaces
- Implement image upload UI with preview
- Add live avatar preview system

### Phase 4: Integration & Polish (Days 7-8)

- Connect frontend to backend APIs
- Add error handling and loading states
- Implement authentication flow
- Add data validation and security measures

### Phase 5: Deployment (Day 9)

- Set up production environment
- Configure CI/CD pipeline
- Deploy to staging and production
- Document deployment process

## API Integration

The CMS exposes RESTful endpoints for the Planet Peanut mobile app:

```javascript
// Get all published items
GET /api/items?status=published&page=1&limit=20

// Get items by category
GET /api/items?tags=space gear&currency=diamonds

// Get single item
GET /api/items/:id

// Response format
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "64f...",
        "title": "Echo Visor",
        "price": 859,
        "currency": "diamonds",
        "level": 13,
        "color": "Purple",
        "layer": "head_layer1",
        "imageRaisedUrl": "https://cdn.supabase.co/...",
        "imageShopUrl": "https://cdn.supabase.co/...",
        "clothingType": "experimental",
        "releaseDate": "2024-01-15T00:00:00.000Z"
      }
    ],
    "totalPages": 5,
    "currentPage": 1
  }
}
```

## Getting Started for AI Development

1. **Read the architecture documentation** to understand system design
2. **Review the database schema** to understand data structures
3. **Follow the development guide** for step-by-step implementation
4. **Use the API specification** for endpoint implementation details
5. **Reference component documentation** for frontend development

Each documentation file includes specific implementation details, code examples, and best practices to guide AI development of the system.

## Support

For questions or issues during development, refer to the detailed documentation in the `/docs` folder or check the implementation guides for specific components.
