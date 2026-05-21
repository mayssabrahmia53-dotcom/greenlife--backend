const router = require("express").Router();

const Alert = require("../models/Alert");
const authMiddleware = require("../middlewares/authMiddleware");
const { getMyAlerts } = require("../controllers/alertController");


router.post("/", authMiddleware, async (req, res) => {
  try {
    const newAlert = new Alert({
      ...req.body,
      user: req.user.id,
    });

    const saved = await newAlert.save();
    res.json(saved);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/", authMiddleware, getMyAlerts);

module.exports = router;