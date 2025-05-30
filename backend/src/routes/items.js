const express = require("express");
const router = express.Router();

// Import controller and middleware
const {
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
} = require("../controllers/itemController");

const {
  validateCreateItem,
  validateUpdateItem,
  validateGetItems,
  validateItemId,
} = require("../middleware/validation");

const { authenticateToken } = require("../middleware/auth");

/**
 * @route   GET /api/items
 * @desc    Get all items with filtering and pagination
 * @access  Public (for published items) / Private (for all items)
 */
router.get("/", validateGetItems, getAllItems);

/**
 * @route   GET /api/items/stats/summary
 * @desc    Get item statistics and summary
 * @access  Private
 */
router.get("/stats/summary", authenticateToken, getItemsStats);

/**
 * @route   GET /api/items/:id
 * @desc    Get single item by ID
 * @access  Public
 */
router.get("/:id", validateItemId, getItemById);

/**
 * @route   POST /api/items
 * @desc    Create new item
 * @access  Private
 */
router.post("/", authenticateToken, validateCreateItem, createItem);

/**
 * @route   PUT /api/items/:id
 * @desc    Update item
 * @access  Private
 */
router.put(
  "/:id",
  authenticateToken,
  validateItemId,
  validateUpdateItem,
  updateItem
);

/**
 * @route   DELETE /api/items/:id
 * @desc    Delete item
 * @access  Private
 */
router.delete("/:id", authenticateToken, validateItemId, deleteItem);

/**
 * @route   POST /api/items/:id/publish
 * @desc    Publish an item
 * @access  Private
 */
router.post("/:id/publish", authenticateToken, validateItemId, publishItem);

/**
 * @route   POST /api/items/:id/unpublish
 * @desc    Unpublish an item
 * @access  Private
 */
router.post("/:id/unpublish", authenticateToken, validateItemId, unpublishItem);

/**
 * @route   POST /api/items/:id/archive
 * @desc    Archive an item
 * @access  Private
 */
router.post("/:id/archive", authenticateToken, validateItemId, archiveItem);

/**
 * @route   POST /api/items/:id/duplicate
 * @desc    Duplicate an item
 * @access  Private
 */
router.post("/:id/duplicate", authenticateToken, validateItemId, duplicateItem);

module.exports = router;
