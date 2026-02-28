const badgeRepository = require('../repositories/badgeRepository');

class BadgeService {

    // ── Badge CRUD ──────────────────────────────────────────
    async getAllBadges() {
        return await badgeRepository.findAll();
    }

    async getBadgeById(id) {
        const badge = await badgeRepository.findById(id);
        if (!badge) throw new Error('Badge not found');
        return badge;
    }

    async createBadge(data) {
        const existing = await badgeRepository.findByName(data.name);
        if (existing) throw new Error('Badge with this name already exists');
        return await badgeRepository.create(data);
    }

    async updateBadge(id, data) {
        const badge = await badgeRepository.update(id, data);
        if (!badge) throw new Error('Badge not found');
        return badge;
    }

    async deleteBadge(id) {
        const result = await badgeRepository.delete(id);
        if (!result) throw new Error('Badge not found');
        return { message: 'Badge deleted successfully' };
    }

    // ── User Badge Operations ───────────────────────────────
    async assignBadge(userId, badgeId) {
        // Verify badge exists
        const badge = await badgeRepository.findById(badgeId);
        if (!badge) throw new Error('Badge not found');

        const [userBadge, created] = await badgeRepository.assignBadgeToUser(userId, badgeId);
        if (!created) throw new Error('User already has this badge');

        return { message: 'Badge assigned successfully', userBadge };
    }

    async removeBadge(userId, badgeId) {
        const result = await badgeRepository.removeBadgeFromUser(userId, badgeId);
        if (!result) throw new Error('User does not have this badge');
        return { message: 'Badge removed successfully' };
    }

    async getUserBadges(userId) {
        const userBadges = await badgeRepository.findBadgesForUser(userId);
        return userBadges.map(ub => ({
            id: ub.Badge.id,
            name: ub.Badge.name,
            icon: ub.Badge.icon,
            description: ub.Badge.description,
            requiredMonth: ub.Badge.requiredMonth,
            color: ub.Badge.color,
            isPremium: ub.Badge.isPremium,
            earnedAt: ub.earnedAt
        }));
    }
}

module.exports = new BadgeService();
