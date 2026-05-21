// models/Challenge.js
const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  target: { type: Number, required: true }, // objectif collectif (ex: 5000 L)
  unit: { type: String, enum: ['kWh', 'L', 'kg'], required: true },
  type: { type: String, enum: ['energie', 'water', 'waste'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rewardBadgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }, // badge pour le(s) gagnant(s)
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ou plusieurs gagnants (tableau)
  rewardGiven: { type: Boolean, default: false },
  achieved: { type: Boolean, default: false } // si objectif collectif atteint (optionnel)
}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);