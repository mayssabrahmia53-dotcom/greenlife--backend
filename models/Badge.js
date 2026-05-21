const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    icon: String, //例えば '🔥', '⭐', '🏆'
    requirementType: {
        type: String,
        enum: ['posts_count', 'comments_count', 'likes_received', 'streak'],
        required: true
    },
    requirementValue: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Badge', badgeSchema);