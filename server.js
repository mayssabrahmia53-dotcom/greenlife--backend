// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

// routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const equipementRoutes = require("./routes/equipementRoutes");
const objectiveRoutes = require("./routes/objectiveRoutes");
const consumptionRoutes = require("./routes/consumptionRoutes");
const alertRoutes = require("./routes/alertRoutes");
const statsRoutes = require("./routes/statsRoutes");
const reportRoutes = require("./routes/reportRoutes");
const recommandationsRoutes = require("./routes/recommandations");
const aiRoutes = require("./routes/ai");

// load environment variables
dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/equipements", equipementRoutes);
app.use("/api/objectives", objectiveRoutes);
app.use("/api/consumptions", consumptionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/recommendations", recommandationsRoutes);

// static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: err.message || "Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});