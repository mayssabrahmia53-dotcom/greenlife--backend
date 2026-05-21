const express = require("express");
const axios = require("axios");

const router = express.Router();

const Recommendation = require("../models/recommendations");
const Consumption = require("../models/Consumption");

// =====================================================
// GENERATE AI RECOMMENDATIONS
// =====================================================

router.post("/generate", async (req, res) => {
  try {
    const { userId } = req.body;

    // -------------------------
    // 1. VALIDATION
    // -------------------------
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }

    // -------------------------
    // 2. RÉCUPÉRER DERNIÈRE CONSO
    // -------------------------
    const latestConsumption = await Consumption.findOne({
      user: userId,
      type: "energie"
    }).sort({ createdAt: -1 });

    if (!latestConsumption) {
      return res.status(404).json({
        success: false,
        message: "No energy consumption found for this user"
      });
    }

    // -------------------------
    // 3. HISTORIQUE (12 derniers mois)
    // -------------------------
    const consumptions = await Consumption.find({
      user: userId,
      type: "energie"
    })
      .sort({ createdAt: -1 })
      .limit(12);

    const energyData = consumptions
      .map((c) => Number(c.value))
      .filter((v) => !isNaN(v) && v > 0);

    if (energyData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid numeric energy data found"
      });
    }

    const currentEnergy = Number(latestConsumption.value);
    if (isNaN(currentEnergy)) {
      return res.status(400).json({
        success: false,
        message: "Current energy value is invalid"
      });
    }

    // -------------------------
    // 4. APPEL AU SERVICE FLASK (AI)
    // -------------------------
    let aiData = {};
    let aiAvailable = false;

    try {
      const aiResponse = await axios.post(
        "http://127.0.0.1:5001/analyze",
        {
          data: energyData,
          current: currentEnergy
        },
        { timeout: 120000 } // 120 secondes max
      );

      if (aiResponse.status === 200 && aiResponse.data) {
        aiData = aiResponse.data;
        aiAvailable = true;
        console.log("✅ AI service responded");
      } else {
        console.warn("⚠️ AI service returned non-200 status:", aiResponse.status);
      }
    } catch (err) {
      console.error("❌ AI service error:", err.code || err.message);
      // On continue sans IA (fallback plus bas)
    }

    // -------------------------
    // 5. FALLBACK SI IA INDISPONIBLE
    // -------------------------
    let prediction = currentEnergy;
    let recommendations = [];
    let bertScore = 0;

    if (aiAvailable && aiData) {
      // Prediction
      if (aiData.prediction !== undefined && !isNaN(Number(aiData.prediction))) {
        prediction = Number(aiData.prediction);
      } else {
        console.warn("⚠️ Missing or invalid prediction in AI response, using fallback");
      }

      // Recommendations
      if (Array.isArray(aiData.recommendations) && aiData.recommendations.length > 0) {
        recommendations = aiData.recommendations.map((rec) => ({
          title: String(rec.title || "Conseil énergétique").slice(0, 100),
          action: String(rec.action || "").slice(0, 200),
          description: String(rec.description || "").slice(0, 500),
          priority: ["haute", "moyenne", "faible"].includes(rec.priority?.toLowerCase())
            ? rec.priority.toLowerCase()
            : "moyenne",
          saving: String(rec.saving || "").slice(0, 100)
        }));
      } else {
        console.warn("⚠️ No recommendations from AI, using default");
        recommendations = getDefaultRecommendations(currentEnergy);
      }

      // BERT score
      if (aiData.bert_score !== undefined && !isNaN(Number(aiData.bert_score))) {
        bertScore = Number(aiData.bert_score);
      }
    } else {
      console.log("ℹ️ AI unavailable – using fallback logic");
      prediction = computeSimplePrediction(energyData, currentEnergy);
      recommendations = getDefaultRecommendations(currentEnergy);
    }

    // -------------------------
    // 6. CALCUL TREND & VARIATION
    // -------------------------
    let trend = "stable";
    if (prediction > currentEnergy) trend = "hausse";
    if (prediction < currentEnergy) trend = "baisse";

    const variation = currentEnergy !== 0
      ? (((prediction - currentEnergy) / currentEnergy) * 100).toFixed(2)
      : 0;

    // -------------------------
    // 7. SAUVEGARDE EN BDD
    // -------------------------
    const saved = await Recommendation.create({
      userId,
      consoActuelle: {
        energie_kwh: currentEnergy
      },
      predictions: {
        energie_moyenne_kwh: prediction,
        tendance_energie: trend
      },
      variation_pct: {
        energie: Number(variation)
      },
      recommendations,
      bert_score: bertScore
    });

    return res.status(200).json({
      success: true,
      data: saved
    });

  } catch (err) {
    console.error("❌ GENERATE FATAL ERROR:", err.stack || err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error while generating recommendations"
    });
  }
});

// -------------------------
// FONCTIONS UTILITAIRES (FALLBACK)
// -------------------------

function computeSimplePrediction(history, current) {
  if (!history.length) return current;
  const avg = history.reduce((a, b) => a + b, 0) / history.length;
  // Régression linéaire basique sur les 3 derniers points
  if (history.length >= 3) {
    const last3 = history.slice(-3);
    const slope = (last3[2] - last3[0]) / 2;
    return Math.max(0, current + slope);
  }
  return (current + avg) / 2;
}

function getDefaultRecommendations(currentKwh) {
  if (currentKwh > 500) {
    return [
      {
        title: "Réduire la consommation de chauffage",
        action: "Baisser le thermostat de 1°C",
        description: "Chaque degré en moins réduit la facture de 7% environ.",
        priority: "haute",
        saving: "Jusqu'à 10% sur la facture"
      },
      {
        title: "Éteindre les appareils en veille",
        action: "Utiliser une multiprise avec interrupteur",
        description: "La veille peut représenter 10% de votre consommation électrique.",
        priority: "haute",
        saving: "Environ 100 kWh/an"
      }
    ];
  } else if (currentKwh > 200) {
    return [
      {
        title: "Optimiser l'éclairage",
        action: "Passer aux ampoules LED",
        description: "Les LED consomment jusqu'à 80% d'énergie en moins.",
        priority: "moyenne",
        saving: "Jusqu'à 50 kWh/an"
      }
    ];
  } else {
    return [
      {
        title: "Félicitations !",
        action: "Maintenez vos bonnes habitudes",
        description: "Votre consommation est déjà faible. Continuez ainsi.",
        priority: "faible",
        saving: "0"
      }
    ];
  }
}

// =====================================================
// GET LATEST RECOMMENDATION
// =====================================================

router.get("/latest", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId required" });
    }

    const latest = await Recommendation.findOne({ userId }).sort({ createdAt: -1 });
    return res.json({
      success: true,
      data: latest || null
    });
  } catch (err) {
    console.error("❌ /latest error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// =====================================================
// HISTORY
// =====================================================

router.get("/history", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId required" });
    }

    const history = await Recommendation.find({ userId }).sort({ createdAt: -1 });
    return res.json({
      success: true,
      data: history
    });
  } catch (err) {
    console.error("❌ /history error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;