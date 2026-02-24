// Calcul simple d'impact CO2
exports.calculateCO2 = (type, value) => {
  if (type === "electricity") return value * 0.7;
  if (type === "water") return value * 0.0003;
  if (type === "waste") return value * 1.2;
};