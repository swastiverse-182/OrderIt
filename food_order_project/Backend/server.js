// Handle Uncaught Exceptions - must be first
process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err.stack}`);
  console.log("Shutting down server due to uncaught exception");
  process.exit(1);
});

// Load env variables - must be before any other imports
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

// Import app and database
const app = require("./app");
const connectDatabase = require("./db");

// Connect to database
connectDatabase();

// Start the server
const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

// Handle Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
  console.log(`ERROR: ${err.message}`);
  console.log("Shutting down server due to unhandled promise rejection");
  server.close(() => process.exit(1));
});