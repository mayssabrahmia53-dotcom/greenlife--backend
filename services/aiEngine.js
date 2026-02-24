// IA basée sur règles simples
exports.generateRecommendation = (consumption) => {
  if (consumption.type === "electricity" && consumption.value > 10) {
    return "Réduire l'utilisation du climatiseur";
  }

  if (consumption.type === "water" && consumption.value > 150) {
    return "Réduire la durée des douches";
  }

  return null;
};