const Item = require("../models/Item");
const { catchAsync, AppError } = require("../middleware/errorHandler");

/**
 * Get all items with advanced filtering and pagination
 */
const getAllItems = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    currency,
    clothingType,
    level,
    minLevel,
    maxLevel,
    minPrice,
    maxPrice,
    tags,
    layer,
    sortBy = "createdAt",
    sortOrder = "desc",
    search,
  } = req.query;

  // Build filter object
  const filter = {};

  if (status) filter.status = status;
  if (currency) filter.currency = currency;
  if (clothingType) filter.clothingType = clothingType;
  if (layer) filter.layer = layer;

  // Level filtering
  if (level) {
    filter.level = parseInt(level);
  } else {
    if (minLevel || maxLevel) {
      filter.level = {};
      if (minLevel) filter.level.$gte = parseInt(minLevel);
      if (maxLevel) filter.level.$lte = parseInt(maxLevel);
    }
  }

  // Price filtering
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  // Tags filtering (supports multiple tags)
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : tags.split(",");
    filter.tags = { $in: tagArray };
  }

  // Add text search if provided
  if (search) {
    filter.$text = { $search: search };
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const sortObj = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  // Execute query with pagination
  const [items, totalCount] = await Promise.all([
    Item.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit)).lean(),
    Item.countDocuments(filter),
  ]);

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.json({
    success: true,
    data: {
      items,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: parseInt(limit),
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        status,
        currency,
        clothingType,
        level: level || { min: minLevel, max: maxLevel },
        price: { min: minPrice, max: maxPrice },
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(",")) : undefined,
        layer,
        search,
      },
    },
  });
});

/**
 * Get single item by ID
 */
const getItemById = catchAsync(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    throw new AppError("Item not found", 404);
  }

  res.json({
    success: true,
    data: { item },
  });
});

/**
 * Create new item
 */
const createItem = catchAsync(async (req, res) => {
  // Set current user for the model
  Item.currentUser = req.user?.id || "system";

  // Validate image URL format if provided
  const { imageRaisedUrl, imageShopUrl, imageThumbnailUrl, imageMediumUrl } =
    req.body;

  // URL validation regex
  const urlPattern = /^https:\/\/.*\.(jpg|jpeg|png|webp)$/i;

  if (imageRaisedUrl && !urlPattern.test(imageRaisedUrl)) {
    throw new AppError("Invalid raised image URL format", 400);
  }

  if (imageShopUrl && !urlPattern.test(imageShopUrl)) {
    throw new AppError("Invalid shop image URL format", 400);
  }

  if (imageThumbnailUrl && !urlPattern.test(imageThumbnailUrl)) {
    throw new AppError("Invalid thumbnail URL format", 400);
  }

  if (imageMediumUrl && !urlPattern.test(imageMediumUrl)) {
    throw new AppError("Invalid medium image URL format", 400);
  }

  const item = new Item(req.body);
  await item.save();

  res.status(201).json({
    success: true,
    message: "Item created successfully",
    data: { item },
  });
});

/**
 * Update item
 */
const updateItem = catchAsync(async (req, res) => {
  // Set current user for the model
  Item.currentUser = req.user?.id || "system";

  const item = await Item.findById(req.params.id);

  if (!item) {
    throw new AppError("Item not found", 404);
  }

  // Update item fields
  Object.assign(item, req.body);
  await item.save();

  res.json({
    success: true,
    message: "Item updated successfully",
    data: { item },
  });
});

/**
 * Delete item
 */
const deleteItem = catchAsync(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    throw new AppError("Item not found", 404);
  }

  await Item.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Item deleted successfully",
    data: { deletedItem: { id: req.params.id, title: item.title } },
  });
});

/**
 * Publish an item
 */
const publishItem = catchAsync(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    throw new AppError("Item not found", 404);
  }

  await item.publish();

  res.json({
    success: true,
    message: "Item published successfully",
    data: { item },
  });
});

/**
 * Unpublish an item
 */
const unpublishItem = catchAsync(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    throw new AppError("Item not found", 404);
  }

  await item.unpublish();

  res.json({
    success: true,
    message: "Item unpublished successfully",
    data: { item },
  });
});

/**
 * Archive an item
 */
const archiveItem = catchAsync(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    throw new AppError("Item not found", 404);
  }

  await item.archive();

  res.json({
    success: true,
    message: "Item archived successfully",
    data: { item },
  });
});

/**
 * Get items statistics
 */
const getItemsStats = catchAsync(async (req, res) => {
  const stats = await Item.aggregate([
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        publishedItems: {
          $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] },
        },
        draftItems: {
          $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
        },
        archivedItems: {
          $sum: { $cond: [{ $eq: ["$status", "archived"] }, 1, 0] },
        },
        diamondItems: {
          $sum: { $cond: [{ $eq: ["$currency", "diamonds"] }, 1, 0] },
        },
        peanutItems: {
          $sum: { $cond: [{ $eq: ["$currency", "peanuts"] }, 1, 0] },
        },
        averagePrice: { $avg: "$price" },
        averageLevel: { $avg: "$level" },
      },
    },
  ]);

  // Get clothing type distribution
  const clothingTypeStats = await Item.aggregate([
    { $group: { _id: "$clothingType", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Get layer distribution
  const layerStats = await Item.aggregate([
    { $group: { _id: "$layer", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const summary = stats[0] || {
    totalItems: 0,
    publishedItems: 0,
    draftItems: 0,
    archivedItems: 0,
    diamondItems: 0,
    peanutItems: 0,
    averagePrice: 0,
    averageLevel: 0,
  };

  res.json({
    success: true,
    data: {
      summary,
      clothingTypeDistribution: clothingTypeStats,
      layerDistribution: layerStats,
    },
  });
});

/**
 * Duplicate an item
 */
const duplicateItem = catchAsync(async (req, res) => {
  const originalItem = await Item.findById(req.params.id);

  if (!originalItem) {
    throw new AppError("Item not found", 404);
  }

  // Create a copy without the _id and timestamps
  const itemData = originalItem.toObject();
  delete itemData._id;
  delete itemData.createdAt;
  delete itemData.updatedAt;
  delete itemData.__v;

  // Modify title to indicate it's a copy
  itemData.title = `${itemData.title} (Copy)`;
  itemData.status = "draft"; // Always create copies as draft

  // Set current user
  Item.currentUser = req.user?.id || "system";

  const duplicatedItem = new Item(itemData);
  await duplicatedItem.save();

  res.status(201).json({
    success: true,
    message: "Item duplicated successfully",
    data: { item: duplicatedItem },
  });
});

/**
 * Update item images
 */
const updateItemImages = catchAsync(async (req, res) => {
  // Set current user for the model
  Item.currentUser = req.user?.id || "system";

  const item = await Item.findById(req.params.id);

  if (!item) {
    throw new AppError("Item not found", 404);
  }

  const { imageRaisedUrl, imageShopUrl, imageThumbnailUrl, imageMediumUrl } =
    req.body;

  // URL validation regex
  const urlPattern = /^https:\/\/.*\.(jpg|jpeg|png|webp)$/i;

  // Validate URLs if provided
  if (imageRaisedUrl && !urlPattern.test(imageRaisedUrl)) {
    throw new AppError("Invalid raised image URL format", 400);
  }

  if (imageShopUrl && !urlPattern.test(imageShopUrl)) {
    throw new AppError("Invalid shop image URL format", 400);
  }

  if (imageThumbnailUrl && !urlPattern.test(imageThumbnailUrl)) {
    throw new AppError("Invalid thumbnail URL format", 400);
  }

  if (imageMediumUrl && !urlPattern.test(imageMediumUrl)) {
    throw new AppError("Invalid medium image URL format", 400);
  }

  // Update only the image fields that are provided
  const updateFields = {};
  if (imageRaisedUrl !== undefined)
    updateFields.imageRaisedUrl = imageRaisedUrl;
  if (imageShopUrl !== undefined) updateFields.imageShopUrl = imageShopUrl;
  if (imageThumbnailUrl !== undefined)
    updateFields.imageThumbnailUrl = imageThumbnailUrl;
  if (imageMediumUrl !== undefined)
    updateFields.imageMediumUrl = imageMediumUrl;

  // Update item with new image URLs
  Object.assign(item, updateFields);
  await item.save();

  res.json({
    success: true,
    message: "Item images updated successfully",
    data: {
      item,
      updatedFields: Object.keys(updateFields),
    },
  });
});

/**
 * Delete specific image type from item
 */
const deleteItemImage = catchAsync(async (req, res) => {
  // Set current user for the model
  Item.currentUser = req.user?.id || "system";

  const { id, type } = req.params;

  const item = await Item.findById(id);

  if (!item) {
    throw new AppError("Item not found", 404);
  }

  // Map image types to field names
  const imageTypeMap = {
    raised: "imageRaisedUrl",
    shop: "imageShopUrl",
    thumbnail: "imageThumbnailUrl",
    medium: "imageMediumUrl",
  };

  const fieldName = imageTypeMap[type];

  if (!fieldName) {
    throw new AppError(
      "Invalid image type. Valid types: raised, shop, thumbnail, medium",
      400
    );
  }

  // Check if the image field exists and has a value
  if (!item[fieldName]) {
    throw new AppError(`No ${type} image found for this item`, 404);
  }

  // Store the old URL for response
  const removedUrl = item[fieldName];

  // Remove the image URL
  item[fieldName] = undefined;
  await item.save();

  res.json({
    success: true,
    message: `${type} image removed successfully`,
    data: {
      item,
      removedImageType: type,
      removedUrl,
    },
  });
});

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  publishItem,
  unpublishItem,
  archiveItem,
  getItemsStats,
  duplicateItem,
  updateItemImages,
  deleteItemImage,
};
