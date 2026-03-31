// controllers/consumptionController.js
const Consumption = require("../models/Consumption");

// ➕ Add a new consumption
exports.addConsumption = async (req, res) => {
  try {
    // 🔹 Debug info
    console.log("req.userId:", req.userId);
    console.log("req.body:", req.body);

    const { type, value, date, notes } = req.body;

    // 🔹 Check required fields
    if (!type || !value) {
      return res.status(400).json({ message: "Type and value are required" });
    }

    // 🔹 Determine unit
    let unit = "";
    if (type === "energie") unit = "kWh";
    else if (type === "water") unit = "m³";
    else if (type === "waste") unit = "kg";
    else return res.status(400).json({ message: "Invalid type" });

    // 🔹 Create consumption
    const consumption = new Consumption({
      user: req.userId, 
      value,
      unit,
      notes: notes || "",
      date: date ? new Date(date) : new Date(),
    });

    // 🔹 Save to DB
    await consumption.save();

    res.status(201).json(consumption);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📥 Get all consumptions of the logged-in user
exports.getMyConsumptions = async (req, res) => {
  try {
    console.log("Fetching consumptions for user:", req.userId);

    const consumptions = await Consumption.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(consumptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};