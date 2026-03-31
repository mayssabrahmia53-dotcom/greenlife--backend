const mongoose = require("mongoose");

const consumptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    water: {
      type: Number,
      default: 0,
    },

    energy: {
      type: Number,
      default: 0,
    },

    waste: {
      type: Number,
      default: 0,
    },

    month: {
      type: String,
      required: true,
    },

    equipmentData: [
      {
        name: String,
        consumption: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Consumption", consumptionSchema);