const mongoose = require("mongoose");

const consumptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // relation
    required: true,
  },
  type: {
    type: String,
    enum: ["electricity", "water", "waste"],
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("Consumption", consumptionSchema);