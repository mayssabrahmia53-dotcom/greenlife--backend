const router = require("express").Router();
const Equipement = require("../models/Equipement");
const auth = require("../middlewares/authMiddleware");

/**
 * ================= GET ALL EQUIPMENTS (per user)
 */
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const equipements = await Equipement.find({ user: userId });

    res.json(equipements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ================= GET STATS
 */
router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const equipements = await Equipement.find({ user: userId });

    const totalEquipements = equipements.length;

    const totalPower = equipements.reduce(
      (sum, eq) => sum + (eq.power || 0),
      0
    );

    const totalConsumption = equipements.reduce(
      (sum, eq) => sum + (eq.consumption || 0),
      0
    );

    res.json({
      totalEquipements,
      totalPower,
      totalConsumption,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ================= CREATE EQUIPMENT
 */
router.post("/", auth, async (req, res) => {
  console.log("ROUTE HIT");

  try {
    const equipement = new Equipement({
      ...req.body,
      user: req.user.id,
    });

    await equipement.save();

    console.log("SAVED ✅");

    res.status(201).json(equipement);
  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

/**
 * ================= DELETE EQUIPMENT
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Equipement.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;