const Objective = require("../models/Objective");

exports.createObjective = async (req, res) => {
  try {
    const { type, targetValue } = req.body;

    const objective = await Objective.create({
      user: req.userId,
      type,
      targetValue
    });

    res.status(201).json(objective);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getObjectives = async (req, res) => {
  try {
    const objectives = await Objective.find({ user: req.userId });
    res.json(objectives);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};