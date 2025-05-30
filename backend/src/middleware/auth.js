const jwt = require("jsonwebtoken");

/**
 * Authentication middleware for JWT verification
 * This is a stub implementation that will be expanded later
 */

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access token required",
    });
  }

  // For now, this is a stub - we'll implement proper JWT verification later
  // TODO: Implement proper JWT verification with Supabase
  if (token === "stub-token") {
    req.user = {
      id: "stub-user-id",
      email: "admin@planetpeanut.com",
      role: "admin",
    };
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
};

/**
 * Optional authentication middleware
 * Adds user info if token is present but doesn't require it
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token && token === "stub-token") {
    req.user = {
      id: "stub-user-id",
      email: "admin@planetpeanut.com",
      role: "admin",
    };
  }

  next();
};

/**
 * Role-based authorization middleware
 * Requires authentication first
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions",
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
};
