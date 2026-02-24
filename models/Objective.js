const mongoose = require("mongoose");

const objectiveSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["electricity", "water", "waste"],
    required: true,
  },
  target_value: Number,
  unit: String,
  start_date: Date,
  end_date: Date,
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed"],
    default: "pending",
  }
}, { timestamps: true });

module.exports = mongoose.model("Objective", objectiveSchema);