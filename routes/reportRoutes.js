const router = require("express").Router();
const Consumption = require("../models/Consumption");
const auth = require("../middlewares/authMiddleware");

// GET /api/report/:month (format YYYY-MM)
router.get("/:month", auth, async (req, res) => {
  try {
    const { month } = req.params; // ex: "2026-03"
    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1); // premier jour du mois suivant

    const data = await Consumption.find({
      user: req.user.id,
      date: { $gte: start, $lt: end },
    }).sort({ date: 1 });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// POST /api/consumption (pour enregistrer une conso)
router.post("/consumption", auth, async (req, res) => {
  try {
    const { type, value, date } = req.body;
    const newConsumption = new Consumption({
      user: req.user.id,
      type,
      value,
      date: date ? new Date(date) : new Date(),
    });
    await newConsumption.save();
    res.status(201).json(newConsumption);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;