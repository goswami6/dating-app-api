const topPickRepository = require('../repositories/topPickRepository');
const userRepository = require('../repositories/userRepository');
const matchRepository = require('../repositories/matchRepository');
const { User, UserPhoto } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

class TopPickService {

    // ── Get Top Picks for User ──────────────────────────────
    async getTopPicks(userId) {
        // Clean up expired picks first
        await topPickRepository.deleteExpired();

        const picks = await topPickRepository.findActiveForUser(userId);

        return picks.map(p => {
            const user = p.PickedUser;
            const primaryPhoto = user.Photos && user.Photos.length > 0
                ? user.Photos[0].url
                : user.profilePicture;

            // Calculate time left
            const now = new Date();
            const expires = new Date(p.expiresAt);
            const diffMs = expires - now;
            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const timeLeft = diffHrs > 0 ? `${diffHrs}h ${diffMins}m` : `${diffMins}m`;

            return {
                topPickId: p.id,
                name: user.firstName,
                age: user.age,
                image: primaryPhoto,
                isOnline: user.isOnline,
                timeLeft,
                expiresAt: p.expiresAt
            };
        });
    }

    // ── Generate Top Picks (daily refresh) ──────────────────
    async generateTopPicks(userId, count = 10) {
        // Clean expired first
        await topPickRepository.deleteExpired();

        // Check how many active picks user already has
        const activeCount = await topPickRepository.count(userId);
        if (activeCount >= count) {
            return { message: 'Top picks already generated for today', count: activeCount };
        }

        const remaining = count - activeCount;

        // Get IDs of users already matched/liked/picked
        const existingMatches = await matchRepository.findAll({
            where: {
                [Op.or]: [{ userId }, { matchedUserId: userId }]
            },
            attributes: ['userId', 'matchedUserId']
        });

        const excludeIds = new Set([userId]);
        existingMatches.forEach(m => {
            excludeIds.add(m.userId);
            excludeIds.add(m.matchedUserId);
        });

        // Get already picked user IDs
        const existingPicks = await topPickRepository.findActiveForUser(userId);
        existingPicks.forEach(p => excludeIds.add(p.pickedUserId));

        // Find random eligible users
        const eligibleUsers = await User.findAll({
            where: {
                id: { [Op.notIn]: Array.from(excludeIds) },
                accountStatus: 'active',
                isAdmin: false
            },
            attributes: ['id'],
            order: sequelize.random(),
            limit: remaining
        });

        if (eligibleUsers.length === 0) {
            return { message: 'No eligible users for top picks', count: activeCount };
        }

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const pickData = eligibleUsers.map(u => ({
            userId,
            pickedUserId: u.id,
            expiresAt
        }));

        await topPickRepository.bulkCreate(pickData);

        return { message: 'Top picks generated successfully', count: activeCount + eligibleUsers.length };
    }
}

module.exports = new TopPickService();
