const User = require("../models/User");

exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, mdp } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email déjà utilisé" });

    const user = await User.create({
      nom,
      prenom,
      email,
      mdp,
      image: req.file ? req.file.filename : null
    });

    res.status(201).json({
      _id: user._id,
      nom: user.nom,
      email: user.email,
      image: user.image
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.uploadImage = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    user.image = req.file.filename;
    await user.save();

    res.json({
      message: "Image mise à jour",
      image: user.image
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};