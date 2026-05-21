const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Report", reportSchema);