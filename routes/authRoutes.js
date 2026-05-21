const router = require("express").Router();
const User = require("../models/User");
const PasswordReset = require("../models/PasswordReset"); // À créer
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../utils/email"); // À créer

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, city } = req.body;

    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json("User already exists");
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const user = new User({
      name,
      email,
      city,
      password: hashedPassword,
      role: "foyer"
    });

    await user.save();

    // remove password
    const { password: pwd, ...others } = user._doc;
    res.status(201).json(others);
  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json("Server error");
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json("Wrong password");
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: pwd, ...others } = user._doc;
    res.json({ token, user: others });
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json("Server error");
  }
});

// ================= FORGOT PASSWORD =================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email requis" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email non trouvé" });

    // Générer un code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Sauvegarder ou mettre à jour le code
    await PasswordReset.findOneAndUpdate(
      { email },
      { code, expiresAt },
      { upsert: true, new: true }
    );

    // Envoyer l'email (fonction à implémenter)
    await sendEmail(email, "Code de réinitialisation GreenLife", `Votre code est : ${code}`);

    res.json({ message: "Code envoyé avec succès" });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ================= RESET PASSWORD =================
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const resetEntry = await PasswordReset.findOne({ email, code });
    if (!resetEntry || resetEntry.expiresAt < new Date()) {
      return res.status(400).json({ message: "Code invalide ou expiré" });
    }

    // Hacher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour l'utilisateur
    await User.updateOne({ email }, { password: hashedPassword });

    // Supprimer le code utilisé
    await PasswordReset.deleteOne({ _id: resetEntry._id });

    res.json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;