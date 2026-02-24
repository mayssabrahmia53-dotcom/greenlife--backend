const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: String,
  text: String,
  estimated_saving: Number,
  unit: String,
  status: {
    type: String,
    enum: ["applied", "pending", "ignored"],
    default: "pending",
  }
}, { timestamps: true });

module.exports = mongoose.model("Recommendation", recommendationSchema);