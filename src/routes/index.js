const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const matchRoutes = require('./matchRoutes');
const photoRoutes = require('./photoRoutes');
const badgeRoutes = require('./badgeRoutes');
const userBadgeRoutes = require('./userBadgeRoutes');
const matchCriteriaRoutes = require('./matchCriteriaRoutes');
const topPickRoutes = require('./topPickRoutes');
const discoveryRoutes = require('./discoveryRoutes');
const swipeRoutes = require('./swipeRoutes');
const notificationRoutes = require('./notificationRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');
const messageRoutes = require('./messageRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/users', photoRoutes);  // Nested under /api/users/:id/photos
router.use('/users', userBadgeRoutes);  // Nested under /api/users/:userId/badges
router.use('/matches', matchRoutes);
router.use('/badges', badgeRoutes);
router.use('/match-criteria', matchCriteriaRoutes);
router.use('/top-picks', topPickRoutes);
router.use('/discovery', discoveryRoutes);
router.use('/swipes', swipeRoutes);
router.use('/notifications', notificationRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/messages', messageRoutes);

module.exports = router;
