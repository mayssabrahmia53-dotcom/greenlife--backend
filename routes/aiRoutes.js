// routes/aiRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const Consumption = require("../models/Consumption");
const Recommendation = require("../models/Recommendation");
const aiEngine = require("../services/aiEngine");

// Générer recommandations IA
router.post("/generate", auth, async (req, res) => {
  const consumptions = await Consumption.find({ user: req.userId });

  const recommendations = [];

  consumptions.forEach(c => {
    const text = aiEngine.generateRecommendation(c);
    if (text) {
      recommendations.push({
        user: req.userId,
        type: c.type,
        text
      });
    }
  });

  await Recommendation.insertMany(recommendations);
  res.json({ message: "Recommandations générées", recommendations });
});

module.exports = router;