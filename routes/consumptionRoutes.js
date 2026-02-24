// routes/consumptionRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const consumptionController = require("../controllers/consumptionController");

// Ajouter consommation
router.post("/", auth, consumptionController.addConsumption);

// Récupérer consommations utilisateur
router.get("/", auth, consumptionController.getMyConsumptions);

module.exports = router;



