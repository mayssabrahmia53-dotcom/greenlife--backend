const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  household_size: Number,
  city: String,
  equipment: [String],
  image: String,

  role: {
    type: String,
    enum: ["admin", "foyer"],
    default: "foyer"
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);