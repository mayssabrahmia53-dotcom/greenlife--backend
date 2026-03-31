const mongoose = require("mongoose");

const objectiveSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["energie", "water", "waste"],
    required: true,
  },
  target: {
    type: Number,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
   title: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Objective", objectiveSchema);