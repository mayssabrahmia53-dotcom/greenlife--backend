const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const User = require("../models/User");

// BONUS : upload image de profil
router.put(
  "/upload-image",
  auth,
  upload.single("image"),
  async (req, res) => {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      user.image = req.file.filename;
      await user.save();

      res.json({
        message: "Image de profil mise à jour",
        image: user.image
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;