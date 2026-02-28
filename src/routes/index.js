const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const matchRoutes = require('./matchRoutes');
const photoRoutes = require('./photoRoutes');
const badgeRoutes = require('./badgeRoutes');
const matchCriteriaRoutes = require('./matchCriteriaRoutes');
const topPickRoutes = require('./topPickRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/users', photoRoutes);  // Nested under /api/users/:id/photos
router.use('/matches', matchRoutes);
router.use('/badges', badgeRoutes);
router.use('/match-criteria', matchCriteriaRoutes);
router.use('/top-picks', topPickRoutes);

module.exports = router;
