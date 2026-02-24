// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const upload = require("../middlewares/uploadMiddleware");
// Register
router.post("/register", authController.register);



// Route login
router.post("/login", authController.login);

module.exports = router;