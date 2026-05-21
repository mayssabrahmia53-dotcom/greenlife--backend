const aiService = require("../services/ai.service");

exports.predict = async (req, res) => {
  try {
    const data = req.body.data;

    const result = await aiService.predictEnergy(data);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};