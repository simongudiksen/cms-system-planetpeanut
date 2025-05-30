# API Specification

## Overview

The Planet Peanut CMS API provides RESTful endpoints for managing avatar items. This specification covers all endpoints, request/response formats, authentication, and integration patterns.

## Base Configuration

- **Base URL**: `https://api.planetpeanut.com/v1`
- **Content-Type**: `application/json`
- **Authentication**: Bearer JWT tokens
- **Rate Limiting**: 1000 requests/hour per API key

## Authentication

### JWT Token Format

```javascript
// Token payload structure
{
  "sub": "user_abc123",           // Supabase user ID
  "email": "admin@planetpeanut.com",
  "role": "admin",                // admin | editor
  "iat": 1642680000,             // Issued at
  "exp": 1642683600              // Expires at (1 hour)
}