const router = require("express").Router();
const Consumption = require("../models/Consumption");
const auth = require("../middlewares/authMiddleware");

router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Consumption.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$value" },
        },
      },
    ]);

    const formatted = stats.map((s) => ({
      type: s._id,
      total: s.total,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;