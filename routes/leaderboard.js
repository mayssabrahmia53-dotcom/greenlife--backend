const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const User = require('../models/User');

// Obtenir le top 10 des utilisateurs triés par points décroissants
router.get('/', auth, async (req, res) => {
  try {
    const leaders = await User.find()
      .select('name email points ecoScore')
      .sort({ points: -1 })
      .limit(10);
    res.json(leaders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;