// routes/objectiveRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const Objective = require("../models/Objective");

// Créer objectif
router.post("/", auth, async (req, res) => {
  const obj = new Objective({
    ...req.body,
    user: req.userId
  });
  await obj.save();
  res.status(201).json(obj);
});

// Lister objectifs
router.get("/", auth, async (req, res) => {
  const objectives = await Objective.find({ user: req.userId });
  res.json(objectives);
});

module.exports = router;