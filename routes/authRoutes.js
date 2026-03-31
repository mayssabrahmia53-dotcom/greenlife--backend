const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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
      role: "foyer" // role automatique
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

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json("Wrong password");
    }

    // create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // remove password
    const { password: pwd, ...others } = user._doc;

    res.json({
      token,
      user: others
    });

  } catch (err) {

    console.log("LOGIN ERROR:", err);

    res.status(500).json("Server error");

  }
});

module.exports = router;