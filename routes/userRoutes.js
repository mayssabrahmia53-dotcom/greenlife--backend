const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Consumption = require('../models/Consumption');
const auth = require("../middlewares/authMiddleware");
// GET all users
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET user by ID with consumptions
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const consumptions = await Consumption.find({ userId: user._id });
    res.json({ user, consumptions });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// --- Get user's badges ---
router.get('/:userId/badges', auth, async (req, res) => {
    try {
        const userBadges = await UserBadge.find({ user: req.params.userId }).populate('badge');
        const badges = userBadges.map(ub => ub.badge);
        res.json(badges);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST create user
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, password, city } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, city });
    await user.save();

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.status(201).json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update user
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, city } = req.body;

    const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
    if (existingUser)
      return res.status(400).json({ message: 'Email already in use' });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, city },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE user
router.delete('/:id', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Consumption.deleteMany({ userId: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;