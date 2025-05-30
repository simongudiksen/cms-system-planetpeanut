# Planet Peanut Image Processing Scripts

**✅ Status**: Step 2.2 Integration Complete - These scripts are now fully integrated with the main Planet Peanut CMS API system.

This directory contains scripts to process and import images from the `ImageRaised` and `ImageShop` folders into the Planet Peanut CMS system.

## Overview

The image processing system handles the challenge of mismatched naming conventions between the `ImageRaised` and `ImageShop` folders by:

- Automatically mapping corresponding images between folders
- Normalizing filenames to handle variations like "3DGlasses" vs "Store3dGlasses"
- Processing images to multiple sizes (thumbnail, medium, full, raised, shop)
- Uploading to Supabase Storage with proper organization
- Creating database entries with intelligent categorization and pricing

## Files

- `processItemImages.js` - Main processing script
- `improveNames.js` - Helper script for improving auto-generated item names
- `README.md` - This documentation file

## Prerequisites

1. **Environment Setup**: Ensure your `.env` file contains:

   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   SUPABASE_STORAGE_BUCKET=item-images
   MONGODB_URI=your_mongodb_connection_string
   ```

2. **Image Folders**: Place your images in:

   - `../../ImageRaised/` - High-resolution raised state images (2079×2954)
   - `../../ImageShop/` - Shop display images (1040×1477)

3. **Server Running**: Make sure your backend server is running for database connections

## Commands

### 1. Analyze Image Mappings

```bash
node scripts/processItemImages.js analyze
```

**Purpose**: Analyzes both image folders and creates mappings between corresponding files.

**Output**: JSON report showing:

- Successfully mapped image pairs
- Missing shop images for raised images
- Orphaned shop images without matching raised images
- Suggested item names and properties

**Example Output**:

```json
{
  "summary": {
    "totalMappings": 46,
    "totalErrors": 13,
    "totalProcessed": 0
  },
  "mappings": [
    {
      "raised": "3DGlasses.png",
      "shop": "Store3dGlasses.png",
      "normalizedName": "3dglasses",
      "suggestedTitle": "3D Glasses",
      "properties": {
        "clothingType": "space gear",
        "layer": "head_layer1",
        "tags": ["space", "utility"],
        "price": 200,
        "currency": "peanuts"
      }
    }
  ]
}
```

### 2. Dry Run Test

```bash
node scripts/processItemImages.js dry-run
```

**Purpose**: Tests the processing pipeline on the first 5 mappings without creating actual database entries or uploading files.

**Use Case**:

- Verify image validation works
- Test database connection
- Preview what items would be created
- Check for any errors before bulk processing

### 3. Process Images

```bash
# Process all mapped images
node scripts/processItemImages.js process

# Process only 10 items
node scripts/processItemImages.js process 10

# Process 5 items starting from index 10
node scripts/processItemImages.js process 5 10
```

**Purpose**: Actually processes and imports images into the CMS system.

**What it does**:

1. Validates both raised and shop images
2. Creates database entry with auto-generated properties
3. Processes images to 5 different sizes
4. Uploads all sizes to Supabase Storage
5. Updates database with image URLs

**Parameters**:

- `limit` (optional): Number of items to process
- `start` (optional): Starting index (default: 0)

## Image Processing Pipeline

### 1. Image Validation

- Checks file size (max 5MB)
- Validates format (PNG, JPEG, WebP)
- Verifies image integrity with Sharp

### 2. Item Classification

The script automatically categorizes items based on filename:

| Keywords                             | Clothing Type                    | Layer       | Tags           | Price        |
| ------------------------------------ | -------------------------------- | ----------- | -------------- | ------------ |
| helmet, mask, hat, headband, glasses | space gear                       | head_layer1 | space, utility | 200 peanuts  |
| gun, knife                           | weapons                          | accessory   | weapons        | 500 diamonds |
| suit, robe                           | Official Planet Peanut Work Wear | fullbody1   | official       | 300 peanuts  |
| belt, cable, gear                    | utility gear                     | accessory   | utility        | 100 peanuts  |
| hoodie, sweats                       | casual wear                      | body_layer1 | casual         | 100 peanuts  |
| _default_                            | casual wear                      | body_layer1 | casual         | 100 peanuts  |

**Valid Tag Values**: `weapons`, `official`, `space`, `utility`, `governance`, `armor`, `primal`, `experimental`, `casual`

### 3. Image Size Generation

Each image is processed into 5 sizes:

| Size      | Dimensions | Quality | Usage                  |
| --------- | ---------- | ------- | ---------------------- |
| thumbnail | 256×256    | 80%     | List views, previews   |
| medium    | 512×512    | 85%     | Medium displays        |
| full      | 1024×1024  | 90%     | Backward compatibility |
| raised    | 2079×2954  | 95%     | Avatar raised state    |
| shop      | 1040×1477  | 90%     | Shop display           |

### 4. Storage Organization

Files are uploaded to Supabase Storage with the structure:

```
item-images/
├── {itemId}/
│   ├── raised_thumb.webp
│   ├── raised_med.webp
│   ├── raised_raised.webp
│   ├── raised_shop.webp
│   ├── raised_full.webp
│   ├── shop_thumb.webp
│   ├── shop_med.webp
│   ├── shop_raised.webp
│   ├── shop_shop.webp
│   └── shop_full.webp
```

## Name Improvements

The `improveNames.js` script provides better titles for common items:

- `3dglasses` → `3D Glasses`
- `gun1` → `Assault Rifle`
- `helmetblue` → `Blue Helmet`
- `christmashat` → `Christmas Hat`

You can extend the `nameImprovements` object to add more custom mappings.

## Error Handling

Common errors and solutions:

### 1. Supabase Configuration Missing

```
Error: Supabase configuration incomplete
```

**Solution**: Check your `.env` file has correct Supabase credentials.

### 2. MongoDB Connection Failed

```
Error: MongoDB connection failed
```

**Solution**: Verify `MONGODB_URI` in `.env` and ensure MongoDB is running.

### 3. Image Validation Failed

```
Error: File size exceeds maximum allowed size
```

**Solution**: Resize images to under 5MB before processing.

### 4. Missing Image Pairs

```
warn: No shop image found for raised image: Ski1.png
```

**Solution**: Either add the missing shop image or process individually.

## Processing Strategy

### For First-Time Setup:

1. Run `analyze` to understand your image collection
2. Run `dry-run` to test the pipeline
3. Process in small batches: `process 5`
4. Monitor results and adjust as needed

### For Large Collections:

1. Process in batches of 10-20 items
2. Add delays between batches to avoid overwhelming services
3. Monitor Supabase storage usage
4. Check database entries for correctness

## Monitoring Progress

The script provides detailed logging:

- Image validation results
- Processing progress with timestamps
- Upload confirmation for each size
- Database update confirmations
- Error details with context

## Example Workflow

```bash
# 1. First, analyze your images
node scripts/processItemImages.js analyze > analysis.json

# 2. Review the analysis results
cat analysis.json | jq '.summary'

# 3. Test with dry run
node scripts/processItemImages.js dry-run

# 4. Process first 5 items
node scripts/processItemImages.js process 5

# 5. Check results in database/Supabase, then continue
node scripts/processItemImages.js process 10 5

# 6. Continue in batches until complete
node scripts/processItemImages.js process
```

## Troubleshooting

### Script Hangs During Processing

- Image processing is CPU-intensive, especially for high-res images
- Large images (2079×2954) can take 10-30 seconds each
- Monitor with `top` or Activity Monitor

### Out of Memory Errors

- Process smaller batches
- Restart Node.js process between large batches
- Consider increasing Node.js memory limit: `node --max-old-space-size=4096`

### Network Timeouts

- Check Supabase service status
- Verify internet connection
- Try processing smaller batches

## Database Schema

Items are created with these fields:

- `title`: Improved name (e.g., "3D Glasses")
- `description`: Auto-generated description
- `clothingType`: Determined from filename
- `layer`: Avatar layer assignment
- `tags`: Array of relevant tags
- `price`: Auto-assigned based on type
- `currency`: "peanuts" or "diamonds"
- `level`: Default 1
- `status`: "draft" (for review)
- `imageRaisedUrl`: URL to raised state image
- `imageShopUrl`: URL to shop display image
- `imageThumbnailUrl`: URL to thumbnail
- `imageMediumUrl`: URL to medium size

## Next Steps

After processing:

1. Review items in database
2. Update titles, descriptions, and prices as needed
3. Set appropriate level requirements
4. Change status from "draft" to "published"
5. Test in frontend application
