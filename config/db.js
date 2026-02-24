// config/db.js
const mongoose = require("mongoose");

// Fonction asynchrone pour se connecter à MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connecté");
  } catch (error) {
    console.error("❌ Erreur MongoDB:", error.message);
    process.exit(1); // arrêter le serveur
  }
};

module.exports = connectDB;