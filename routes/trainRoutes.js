const express = require("express");
const router = express.Router();

const { trainModel } = require("../controllers/trainController");

router.post("/train", trainModel);

module.exports = router;