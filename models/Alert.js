const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  type: String,
  message: String,
  level: String,
 
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Alert", alertSchema);