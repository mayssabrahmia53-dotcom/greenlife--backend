const Consumption = require("../models/Consumption");

// ➕ Add consumption (كما هو عندك)
exports.addConsumption = async (req, res) => {
  try {
    console.log("req.userId:", req.userId);
    console.log("req.body:", req.body);

    const { type, value, date, notes } = req.body;

    if (!type || !value) {
      return res.status(400).json({ message: "Type and value are required" });
    }

    let unit = "";
    if (type === "energie") unit = "kWh";
    else if (type === "water") unit = "m³";
    else if (type === "waste") unit = "kg";
    else return res.status(400).json({ message: "Invalid type" });

    const consumption = new Consumption({
      user: req.user.id,
      value,
      unit,
      notes: notes || "",
      date: date ? new Date(date) : new Date(),
    });

    await consumption.save();

    res.status(201).json(consumption);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// 📥 GET RAW (optional)
exports.getMyConsumptions = async (req, res) => {
  try {
    const consumptions = await Consumption.find({ user: req.userId }).sort({
      createdAt: -1,
    });

    res.json(consumptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// 🚀 IMPORTANT: DASHBOARD SUMMARY (FIX YOUR PROBLEM)
eexports.getConsumptionSummary = async (req, res) => {
  try {
    console.log("USER ID:", req.user.id);

    const consumptions = await Consumption.find({
      user: req.user.id,
    });

    console.log("FOUND:", consumptions);

    let electricite = 0;
    let eau = 0;
    let dechets = 0;

    consumptions.forEach((c) => {
      if (c.type === "energie") electricite += c.value;
      if (c.type === "water") eau += c.value;
      if (c.type === "dechets") dechets += c.value;
    });

    res.json({ electricite, eau, dechets });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};