const mongoose = require("mongoose");
const winston = require("winston");

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
  ],
});

class Database {
  constructor() {
    this.isConnected = false;
    this.retryAttempts = 0;
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
  }

  async connect() {
    try {
      // Simplified options for MongoDB Atlas
      const options = {
        // Remove problematic options and use minimal config
      };

      // Connect to MongoDB with minimal options
      await mongoose.connect(process.env.MONGODB_URI, options);

      this.isConnected = true;
      this.retryAttempts = 0;
      logger.info("✅ Connected to MongoDB successfully");

      // Set up connection event handlers
      this.setupEventHandlers();
    } catch (error) {
      logger.error("❌ MongoDB connection failed:", error.message);
      logger.error("Error details:", {
        code: error.code,
        codeName: error.codeName,
        name: error.name,
      });
      await this.handleConnectionError();
    }
  }

  setupEventHandlers() {
    // Connection successful
    mongoose.connection.on("connected", () => {
      this.isConnected = true;
      logger.info("Mongoose connected to MongoDB");
    });

    // Connection error
    mongoose.connection.on("error", (error) => {
      this.isConnected = false;
      logger.error("Mongoose connection error:", error);
    });

    // Connection disconnected
    mongoose.connection.on("disconnected", () => {
      this.isConnected = false;
      logger.warn("Mongoose disconnected from MongoDB");
    });

    // Connection reconnected
    mongoose.connection.on("reconnected", () => {
      this.isConnected = true;
      logger.info("Mongoose reconnected to MongoDB");
    });

    // Handle application termination
    process.on("SIGINT", () => this.gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => this.gracefulShutdown("SIGTERM"));
  }

  async handleConnectionError() {
    if (this.retryAttempts < this.maxRetries) {
      this.retryAttempts++;
      logger.info(
        `Retrying connection... Attempt ${this.retryAttempts}/${this.maxRetries}`
      );

      setTimeout(() => {
        this.connect();
      }, this.retryDelay);
    } else {
      logger.error("Max retry attempts reached. Exiting application.");
      process.exit(1);
    }
  }

  async gracefulShutdown(signal) {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    try {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed");
      process.exit(0);
    } catch (error) {
      logger.error("Error during graceful shutdown:", error);
      process.exit(1);
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  }
}

module.exports = new Database();
