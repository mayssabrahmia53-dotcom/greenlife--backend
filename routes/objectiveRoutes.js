const router = require("express").Router();
const Objective = require("../models/Objective");
const User = require("../models/User");       
const Consumption = require("../models/Consumption"); 
const auth = require("../middlewares/authMiddleware");

// 📥 GET ALL
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const objectives = await Objective.find({ user: userId });
    res.json(objectives);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ➕ CREATE
router.post("/", auth, async (req, res) => {
  try {
    const newObj = new Objective({
      ...req.body,
      title: req.body.title,
      user: req.user.id,
    });
    const saved = await newObj.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✏️ UPDATE (avec attribution de points si objectif atteint)
router.put("/:id", auth, async (req, res) => {
  try {
    const exists = await Objective.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!exists) {
      return res.status(404).json({ message: "Objective not found" });
    }

    // Mettre à jour l'objectif
    const updated = await Objective.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" }
    );

    // --- Vérifier si l'objectif vient d'être atteint ---
    // 1. Récupérer la dernière consommation de l'utilisateur pour ce type
    const lastConsumption = await Consumption.findOne({
      user: req.user.id,
      type: updated.type,
    }).sort({ createdAt: -1 });

    const currentValue = lastConsumption ? lastConsumption.value : 0;
    const target = updated.target;

    // L'objectif est atteint si la consommation actuelle <= cible
    const isAchieved = target > 0 && currentValue <= target;

    // 2. Vérifier si l'objectif était déjà atteint avant la modification
    // Pour cela, on regarde l'ancien objectif (exists)
    const oldLastConsumption = await Consumption.findOne({
      user: req.user.id,
      type: exists.type,
    }).sort({ createdAt: -1 });
    const oldCurrent = oldLastConsumption ? oldLastConsumption.value : 0;
    const wasAchieved = exists.target > 0 && oldCurrent <= exists.target;

    // 3. Si maintenant atteint et avant non atteint -> on attribue les points
    if (isAchieved && !wasAchieved) {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { points: 10, ecoScore: 5 }
      });
      console.log(`Points attribués à l'utilisateur ${req.user.id} pour l'objectif ${updated.title}`);
    }
  


    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ❌ DELETE
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Objective.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!deleted) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;