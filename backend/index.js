// backend/index.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// -------------------------------
// Middleware
// -------------------------------
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173", // ✅ restrict to frontend origin
  credentials: true,
}));
app.use(helmet());
app.use(morgan("dev")); // ✅ logs every request

// -------------------------------
// Routes
// -------------------------------
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Usafi-Mtaani backend running ✅" });
});

// -------------------------------
// Error handling middleware
// -------------------------------
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err.stack || err);
  res.status(500).json({
    error: "Internal server error",
    details: err.message,
  });
});

// -------------------------------
// Start server
// -------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("====================================");
  console.log(`🚀 Usafi-Mtaani backend running on port ${PORT}`);
  console.log(`🌍 API available at http://localhost:${PORT}/api/auth`);
  console.log("====================================");
});
