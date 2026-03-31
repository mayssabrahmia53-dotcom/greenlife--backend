const express = require("express");
const router = express.Router();
const Consumption = require("../models/Consumption");
const auth = require("../middlewares/authMiddleware");


// ================= GET ALL =================
router.get("/", auth, async (req, res) => {
  try {

    const consumptions = await Consumption.find()
      .populate("user", "name email city")
      .sort({ date: -1 });

    const formatted = consumptions.map(c => ({
      _id: c._id,
      userId: c.user ? c.user._id : null,
      name: c.user ? c.user.name : "Unknown",
      email: c.user ? c.user.email : "",
      city: c.user ? c.user.city : "",

      type: c.type,
      value: c.value,
      unit: c.unit,
      date: c.date
    }));

    res.json(formatted);

  } catch (err) {

    console.error("GET consumptions error:", err);

    res.status(500).json({
      message: "Server error",
      error: err.message
    });

  }
});


// ================= GET USER CONSUMPTIONS =================
router.get("/user/:userId", auth, async (req, res) => {
  try {

    const consumptions = await Consumption.find({
      user: req.params.userId
    })
      .populate("user", "name email city")
      .sort({ date: -1 });

    res.json(consumptions);

  } catch (err) {

    console.error("GET user consumptions error:", err);

    res.status(500).json({
      message: "Server error",
      error: err.message
    });

  }
});


// ================= CREATE =================
router.post("/", auth, async (req, res) => {
  try {

    const { type, value, unit, date } = req.body;

    const consumption = new Consumption({
      user: req.user.id,   // 👈 ناخذ user من token
      type,
      value,
      unit,
      date
    });

    await consumption.save();

    const populated = await consumption.populate(
      "user",
      "name email city"
    );

    res.status(201).json(populated);

  } catch (err) {

    console.error("POST consumption error:", err);

    res.status(500).json({
      message: "Server error",
      error: err.message
    });

  }
});


// ================= UPDATE =================
router.put("/:id", auth, async (req, res) => {
  try {

    const { type, value, unit, date } = req.body;

    const consumption = await Consumption.findByIdAndUpdate(
      req.params.id,
      { type, value, unit, date },
      { new: true }
    ).populate("user", "name email city");

    if (!consumption) {
      return res.status(404).json({
        message: "Consumption not found"
      });
    }

    res.json(consumption);

  } catch (err) {

    console.error("UPDATE consumption error:", err);

    res.status(500).json({
      message: "Server error",
      error: err.message
    });

  }
});


// ================= DELETE =================
router.delete("/:id", auth, async (req, res) => {
  try {

    const deleted = await Consumption.findByIdAndDelete(
      req.params.id
    );

    if (!deleted) {
      return res.status(404).json({
        message: "Consumption not found"
      });
    }

    res.json({
      message: "Consumption deleted"
    });

  } catch (err) {

    console.error("DELETE consumption error:", err);

    res.status(500).json({
      message: "Server error",
      error: err.message
    });

  }
});

module.exports = router;