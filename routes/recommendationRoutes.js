// routes/recommendationRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const Recommendation = require("../models/Recommendation");

// Lister recommandations utilisateur
router.get("/", auth, async (req, res) => {
  const recos = await Recommendation.find({ user: req.userId });
  res.json(recos);
});

// Mettre à jour statut (applied / ignored)
router.put("/:id", auth, async (req, res) => {
  const reco = await Recommendation.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  res.json(reco);
});

module.exports = router;