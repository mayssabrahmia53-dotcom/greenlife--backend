const Consumption = require("../models/Consumption");

// Ajouter consommation
exports.addConsumption = async (req, res) => {
  const consumption = new Consumption({
    ...req.body,
    user: req.userId
  });

  await consumption.save();
  res.status(201).json(consumption);
};

// Lister consommations user
exports.getMyConsumptions = async (req, res) => {
  const data = await Consumption.find({ user: req.userId });
  res.json(data);
};