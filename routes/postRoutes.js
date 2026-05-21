const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const { sendNotification } = require('../server');


// ===============================
// 🎯 BADGES FUNCTION
// ===============================
async function checkAndAwardBadges(userId) {
    const userPostsCount = await Post.countDocuments({ author: userId });
    const userCommentsCount = await Comment.countDocuments({ author: userId });

    const userPosts = await Post.find({ author: userId });
    const userComments = await Comment.find({ author: userId });

    let totalLikesReceived = 0;
    userPosts.forEach(p => totalLikesReceived += p.likes.length);
    userComments.forEach(c => totalLikesReceived += c.likes.length);

    const badges = await Badge.find({
        $or: [
            { requirementType: 'posts_count', requirementValue: { $lte: userPostsCount } },
            { requirementType: 'comments_count', requirementValue: { $lte: userCommentsCount } },
            { requirementType: 'likes_received', requirementValue: { $lte: totalLikesReceived } }
        ]
    });

    for (const badge of badges) {
        try {
            await UserBadge.create({ user: userId, badge: badge._id });
        } catch (err) {
            if (err.code !== 11000) console.error(err);
        }
    }
}


// ===============================
// 📝 CREATE POST
// ===============================
router.post('/', auth, async (req, res) => {
    try {
        const post = await new Post({
            author: req.user.id,
            content: req.body.content
        }).save();

        await User.findByIdAndUpdate(req.user.id, {
            $inc: { points: 2, ecoScore: 1 }
        });

        await checkAndAwardBadges(req.user.id);

        res.status(201).json(post);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});


// ===============================
// 📥 GET POSTS
// ===============================
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('author', 'name email')
            .populate('likes', 'name');

        res.json(posts);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});


// ===============================
// 👍 LIKE / UNLIKE POST
// ===============================
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        const alreadyLiked = post.likes.includes(req.user.id);

        if (alreadyLiked) {
            post.likes = post.likes.filter(id => id.toString() !== req.user.id);
        } else {
            post.likes.unshift(req.user.id);

            await User.findByIdAndUpdate(post.author, {
                $inc: { points: 1, ecoScore: 1 }
            });

            await checkAndAwardBadges(post.author);

            if (post.author.toString() !== req.user.id) {
                const user = await User.findById(req.user.id);
                sendNotification(post.author.toString(), {
                    type: 'like',
                    message: `${user.name} a aimé votre publication`,
                    postId: post._id,
                    createdAt: new Date()
                });
            }
        }

        await post.save();
        res.json(post.likes);

    } catch (err) {
        res.status(500).send('Server Error');
    }
});


// ===============================
// 💬 ADD COMMENT
// ===============================
router.post('/comment/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        const comment = await new Comment({
            author: req.user.id,
            post: req.params.id,
            content: req.body.content
        }).save();

        post.commentsCount += 1;
        await post.save();

        await User.findByIdAndUpdate(req.user.id, {
            $inc: { points: 1, ecoScore: 1 }
        });

        await checkAndAwardBadges(req.user.id);

        res.status(201).json(comment);

    } catch (err) {
        res.status(500).send('Server Error');
    }
});


// ===============================
// 📥 GET COMMENTS
// ===============================
router.get('/comments/:postId', auth, async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId })
            .sort({ createdAt: -1 })
            .populate('author', 'name email')
            .populate('likes', 'name');

        res.json(comments);

    } catch (err) {
        res.status(500).send('Server Error');
    }
});


// ===============================
// 👍 LIKE / UNLIKE COMMENT
// ===============================
router.put('/comment/like/:id', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ msg: 'Comment not found' });

        const alreadyLiked = comment.likes.includes(req.user.id);

        if (alreadyLiked) {
            comment.likes = comment.likes.filter(id => id.toString() !== req.user.id);
        } else {
            comment.likes.unshift(req.user.id);

            await User.findByIdAndUpdate(comment.author, {
                $inc: { points: 1 }
            });

            await checkAndAwardBadges(comment.author);
        }

        await comment.save();
        res.json(comment.likes);

    } catch (err) {
        res.status(500).send('Server Error');
    }
});


// ===============================
// 🗑️ DELETE COMMENT
// ===============================
router.delete('/comment/:id', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ msg: 'Comment not found' });

        const post = await Post.findById(comment.post);

        if (
            comment.author.toString() !== req.user.id &&
            post.author.toString() !== req.user.id
        ) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        await comment.deleteOne();

        post.commentsCount -= 1;
        await post.save();

        res.json({ msg: 'Comment deleted' });

    } catch (err) {
        res.status(500).send('Server Error');
    }
});


module.exports = router;