const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const Challenge = require('../models/Challenge');
const Consumption = require('../models/Consumption');
const User = require('../models/User'); // تأكد من استيراد User
const UserBadge = require('../models/UserBadge');

// --- Routes pour tous les utilisateurs authentifiés (création, modification, suppression) ---
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, target, unit, type, startDate, endDate, rewardBadgeId } = req.body;
    const newChallenge = new Challenge({
      title, description, target, unit, type, startDate, endDate, rewardBadgeId,
      participants: []
    });
    await newChallenge.save();
    res.status(201).json(newChallenge);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Challenge.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Défi non trouvé' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Challenge.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Défi non trouvé' });
    res.json({ message: 'Défi supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Récupérer tous les défis (pour l'admin)
router.get('/all', auth, async (req, res) => {
  try {
    const challenges = await Challenge.find()
      .populate('rewardBadgeId', 'name icon')
      .populate('participants', 'name');
    res.json(challenges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Récupérer la liste des badges (pour le sélecteur)
router.get('/badges', auth, async (req, res) => {
  try {
    const badges = await Badge.find();
    res.json(badges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lister les défis actifs (non terminés)
router.get('/', auth, async (req, res) => {
  try {
    const now = new Date();
    const challenges = await Challenge.find({
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('participants', 'name');
    res.json(challenges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rejoindre un défi
router.post('/join/:challengeId', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.challengeId);
    if (!challenge) return res.status(404).json({ message: 'Défi non trouvé' });
    
    // Vérifier si le défi est toujours actif
    const now = new Date();
    if (now > challenge.endDate) {
      return res.status(400).json({ message: 'Ce défi est terminé, vous ne pouvez plus rejoindre' });
    }
    if (now < challenge.startDate) {
      return res.status(400).json({ message: 'Le défi n\'a pas encore commencé' });
    }
    
    if (challenge.participants.includes(req.user.id)) {
      return res.status(400).json({ message: 'Déjà participant' });
    }
    challenge.participants.push(req.user.id);
    await challenge.save();
    res.json({ message: 'Défi rejoint' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtenir le classement des participants pour un défi (et attribuer les badges si terminé)
router.get('/ranking/:challengeId', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.challengeId);
    if (!challenge) return res.status(404).json({ message: 'Défi non trouvé' });

    const rankings = [];
    for (const userId of challenge.participants) {
      const firstCons = await Consumption.findOne({
        user: userId,
        type: challenge.type,
        createdAt: { $gte: challenge.startDate }
      }).sort({ createdAt: 1 });
      const lastCons = await Consumption.findOne({
        user: userId,
        type: challenge.type,
        createdAt: { $lte: challenge.endDate }
      }).sort({ createdAt: -1 });
      let reduction = 0;
      if (firstCons && lastCons) {
        reduction = firstCons.value - lastCons.value;
        if (reduction < 0) reduction = 0;
      }
      const user = await User.findById(userId).select('name');
      rankings.push({ user: user.name, userId, reduction });
    }
    // Trier par réduction décroissante
    rankings.sort((a, b) => b.reduction - a.reduction);

    // Si le défi est terminé et que la récompense n'a pas encore été donnée
    const now = new Date();
    if (now > challenge.endDate && !challenge.rewardGiven && challenge.rewardBadgeId && rankings.length > 0) {
      // Attribuer le badge au premier (ou aux trois premiers)
      const winner = rankings[0];
      await UserBadge.findOneAndUpdate(
        { user: winner.userId, badge: challenge.rewardBadgeId },
        { user: winner.userId, badge: challenge.rewardBadgeId },
        { upsert: true }
      );
      challenge.rewardGiven = true;
      challenge.winner = winner.userId;
      await challenge.save();
      // Optionnel : envoyer notification au gagnant
    }

    res.json({ rankings, finished: now > challenge.endDate, rewardGiven: challenge.rewardGiven });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;