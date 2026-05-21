const mongoose = require("mongoose");

const recommendationSchema =
  new mongoose.Schema(

    {

      userId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true
      },

      consoActuelle: {

        energie_kwh: {

          type: Number,

          required: true
        }
      },

      predictions: {

        energie_moyenne_kwh: {

          type: Number,

          required: true
        },

        tendance_energie: {

          type: String,

          enum: [
            "hausse",
            "baisse",
            "stable"
          ],

          default: "stable"
        }
      },

      variation_pct: {

        energie: {

          type: Number,

          default: 0
        }
      },

      recommendations: [

        {

          title: String,

          description: String,

          action: String,

          saving: String,

          priority: {

            type: String,

            enum: [
              "haute",
              "moyenne",
              "faible"
            ],

            default: "moyenne"
          }
        }
      ],

      bert_score: {

        type: Number,

        default: 0
      }
    },

    {
      timestamps: true
    }
  );

module.exports =
  mongoose.model(
    "Recommendation",
    recommendationSchema
  );