const router = require("express").Router();
const Consumption = require("../models/Consumption");
const auth = require("../middlewares/authMiddleware");

const unitMap = {
  energie: "kWh",
  water: "L",
  waste: "kg",
};

// ================= GET ALL
router.get("/", auth, async (req, res) => {
  try {
    const data =
      req.user.role === "admin"
        ? await Consumption.find().populate("user")
        : await Consumption.find({ user: req.user.id });

    res.json(data);
  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= GET LATEST
router.get("/latest", auth, async (req, res) => {
  try {
    const data = await Consumption.find({ user: req.user.id });

    let result = {
      energie: 0,
      water: 0,
      waste: 0,
    };

    data.forEach((c) => {
      if (c.type === "energie") result.energie = c.value;
      if (c.type === "water") result.water = c.value;
      if (c.type === "waste") result.waste = c.value;
    });

    res.json(result);
  } catch (err) {
    console.error("LATEST ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= CREATE (SMART + AUTO UNIT)
router.post("/", auth, async (req, res) => {
  try {
    const { type, value, date } = req.body;

    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    if (!type || value === undefined) {
      return res.status(400).json({
        message: "type and value required",
      });
    }

    const newConsumption = new Consumption({
      user: req.user.id,
      type,
      value: Number(value),

      // 🔥 AUTO UNIT FROM BACKEND (MAIN FIX)
      unit: unitMap[type] || "unknown",

      date: date ? new Date(date) : new Date(),
    });

    const saved = await newConsumption.save();

    res.status(201).json(saved);
  } catch (err) {
    console.error("🔥 FULL ERROR:", err);
    res.status(500).json({
      message: err.message,
      type: err.name,
    });
  }
});

// ================= UPDATE
router.put("/:id", auth, async (req, res) => {
  try {
    const consumption = await Consumption.findById(req.params.id);

    if (!consumption) {
      return res.status(404).json({ message: "Not found" });
    }

    if (
      req.user.role !== "admin" &&
      consumption.user.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { value, date } = req.body;

    if (value !== undefined) consumption.value = Number(value);
    if (date !== undefined) consumption.date = date;

    const updated = await consumption.save();

    res.json(updated);
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= DELETE
router.delete("/:id", auth, async (req, res) => {
  try {
    const consumption = await Consumption.findById(req.params.id);

    if (!consumption) {
      return res.status(404).json({ message: "Not found" });
    }

    if (
      req.user.role !== "admin" &&
      consumption.user.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await consumption.deleteOne();

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;