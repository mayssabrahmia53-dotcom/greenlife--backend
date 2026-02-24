const Consumption = require("../models/Consumption");

exports.getRecommendations = async (req, res) => {
  try {
    const consumptions = await Consumption.find({ user: req.userId });

    if (consumptions.length === 0) {
      return res.json({ message: "Aucune donnée disponible" });
    }

    let electricityTotal = 0;
    let waterTotal = 0;

    consumptions.forEach((c) => {
      if (c.type === "electricity") electricityTotal += c.value;
      if (c.type === "water") waterTotal += c.value;
    });

    let recommendations = [];

    if (electricityTotal > 300) {
      recommendations.push(
        "Votre consommation électrique est élevée. Pensez à utiliser des appareils économes en énergie."
      );
    }

    if (waterTotal > 200) {
      recommendations.push(
        "Votre consommation d'eau est importante. Vérifiez les fuites et réduisez le temps de douche."
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Bravo ! Votre consommation est dans une plage raisonnable."
      );
    }

    res.json({
      electricityTotal,
      waterTotal,
      recommendations
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};