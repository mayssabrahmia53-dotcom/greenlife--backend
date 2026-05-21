const mongoose = require("mongoose");

const equipementSchema = new mongoose.Schema({
  name: String,
  type: String,
  power: Number,
  consumption: Number,

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true });

module.exports = mongoose.model("Equipement", equipementSchema);