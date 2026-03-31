const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  city: {
    type: String,
    required: true
  },

  role: {
    type: String,
    default: "foyer"
  }

});

module.exports = mongoose.model("User", userSchema);