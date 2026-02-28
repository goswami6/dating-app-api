const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const matchRoutes = require('./matchRoutes');
const photoRoutes = require('./photoRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/users', photoRoutes);  // Nested under /api/users/:id/photos
router.use('/matches', matchRoutes);

module.exports = router;
