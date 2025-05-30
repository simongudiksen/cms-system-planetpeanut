const express = require("express");
const Item = require("../models/Item");
const {
  validateCreateItem,
  validateUpdateItem,
  validateItemId,
  validateItemQuery,
  sanitizeInput,
} = require("../middleware/validation");
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const { catchAsync, AppError } = require("../middleware/errorHandler");

const router = express.Router();

/**
 * GET /items - List items with pagination and filtering
 */
router.get(
  "/",
  validateItemQuery,
  optionalAuth,
  catchAsync(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      status,
      currency,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) filter.status = status;
    if (currency) filter.currency = currency;

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
      },
    });
  })
);

/**
 * GET /items/:id - Get single item by ID
 */
router.get(
  "/:id",
  validateItemId,
  optionalAuth,
  catchAsync(async (req, res) => {
    const item = await Item.findById(req.params.id);

    if (!item) {
      throw new AppError("Item not found", 404);
    }

    res.json({
      success: true,
      data: { item },
    });
  })
);

/**
 * POST /items - Create new item
 */
router.post(
  "/",
  authenticateToken,
  sanitizeInput,
  validateCreateItem,
  catchAsync(async (req, res) => {
    // Set current user for the model
    Item.currentUser = req.user.id;

    const item = new Item(req.body);
    await item.save();

    res.status(201).json({
      success: true,
      message: "Item created successfully",
      data: { item },
    });
  })
);

/**
 * PUT /items/:id - Update item
 */
router.put(
  "/:id",
  authenticateToken,
  sanitizeInput,
  validateUpdateItem,
  catchAsync(async (req, res) => {
    // Set current user for the model
    Item.currentUser = req.user.id;

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
  })
);

/**
 * DELETE /items/:id - Delete item
 */
router.delete(
  "/:id",
  authenticateToken,
  validateItemId,
  catchAsync(async (req, res) => {
    const item = await Item.findById(req.params.id);

    if (!item) {
      throw new AppError("Item not found", 404);
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Item deleted successfully",
    });
  })
);

/**
 * POST /items/:id/publish - Publish an item
 */
router.post(
  "/:id/publish",
  authenticateToken,
  validateItemId,
  catchAsync(async (req, res) => {
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
  })
);

/**
 * POST /items/:id/unpublish - Unpublish an item
 */
router.post(
  "/:id/unpublish",
  authenticateToken,
  validateItemId,
  catchAsync(async (req, res) => {
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
  })
);

/**
 * GET /items/stats/summary - Get items statistics
 */
router.get(
  "/stats/summary",
  authenticateToken,
  catchAsync(async (req, res) => {
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
          diamondItems: {
            $sum: { $cond: [{ $eq: ["$currency", "diamonds"] }, 1, 0] },
          },
          peanutItems: {
            $sum: { $cond: [{ $eq: ["$currency", "peanuts"] }, 1, 0] },
          },
          averagePrice: { $avg: "$price" },
        },
      },
    ]);

    const summary = stats[0] || {
      totalItems: 0,
      publishedItems: 0,
      draftItems: 0,
      diamondItems: 0,
      peanutItems: 0,
      averagePrice: 0,
    };

    res.json({
      success: true,
      data: { summary },
    });
  })
);

module.exports = router;
