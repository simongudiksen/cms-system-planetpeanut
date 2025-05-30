require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const winston = require("winston");

// Import utilities and middleware
const database = require("./utils/database");
const { globalErrorHandler, notFound } = require("./middleware/errorHandler");

// Import routes
const itemRoutes = require("./routes/items");

// Initialize Express app
const app = express();

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Middleware setup
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  const dbStatus = database.getConnectionStatus();

  res.json({
    status: "ok",
    timestamp: new Date(),
    uptime: process.uptime(),
    database: {
      connected: dbStatus.isConnected,
      readyState: dbStatus.readyState,
      host: dbStatus.host,
      name: dbStatus.name,
    },
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
  });
});

// API routes
app.use("/api/items", itemRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Planet Peanut CMS API",
    version: "1.0.0",
    documentation: "/api/docs",
    health: "/health",
  });
});

// Handle 404 routes
app.use(notFound);

// Global error handling middleware
app.use(globalErrorHandler);

// Start server function
async function startServer() {
  try {
    // Connect to database
    await database.connect();

    // Start server
    const PORT = process.env.PORT || 3001;
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(
        `📊 Health check available at http://localhost:${PORT}/health`
      );
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info("HTTP server closed");

        try {
          await database.gracefulShutdown(signal);
        } catch (error) {
          logger.error("Error during shutdown:", error);
          process.exit(1);
        }
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();
