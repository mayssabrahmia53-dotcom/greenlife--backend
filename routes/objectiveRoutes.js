const router = require("express").Router();
const Objective = require("../models/Objective");
const auth = require("../middlewares/authMiddleware");


// 📥 GET ALL

router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const objectives = await Objective.find({ user: userId });

    res.json(objectives);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// ➕ CREATE
router.post("/", auth, async (req, res) => {
  try {
    const newObj = new Objective({
      ...req.body,
      title: req.body.title, 
      user: req.user.id,
    });

    const saved = await newObj.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✏️ UPDATE (FIXED)
router.put("/:id", auth, async (req, res) => {
  try {
    const exists = await Objective.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!exists) {
      return res.status(404).json({ message: "Objective not found" });
    }

    const updated = await Objective.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" } 
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ❌ DELETE
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Objective.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;