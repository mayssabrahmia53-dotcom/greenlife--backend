const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

router.post("/predict", aiController.predict);

module.exports = router;