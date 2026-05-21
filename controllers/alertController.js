const Alert = require("../models/Alert");

// 📥 Get all alerts for logged user
exports.getMyAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({
      user: req.user.id,
    }).sort({ date: -1 });

    res.json(alerts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};