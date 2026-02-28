const { Badge, UserBadge, User } = require('../models');

class BadgeRepository {
    async findAll() {
        return await Badge.findAll({ order: [['requiredMonth', 'ASC']] });
    }

    async findById(id) {
        return await Badge.findByPk(id);
    }

    async findByName(name) {
        return await Badge.findOne({ where: { name } });
    }

    async create(data) {
        return await Badge.create(data);
    }

    async update(id, data) {
        const badge = await Badge.findByPk(id);
        if (!badge) return null;
        return await badge.update(data);
    }

    async delete(id) {
        const badge = await Badge.findByPk(id);
        if (!badge) return null;
        await badge.destroy();
        return true;
    }

    // ── UserBadge operations ────────────────────────────────
    async assignBadgeToUser(userId, badgeId) {
        return await UserBadge.findOrCreate({
            where: { userId, badgeId },
            defaults: { userId, badgeId, earnedAt: new Date() }
        });
    }

    async removeBadgeFromUser(userId, badgeId) {
        const ub = await UserBadge.findOne({ where: { userId, badgeId } });
        if (!ub) return null;
        await ub.destroy();
        return true;
    }

    async findBadgesForUser(userId) {
        return await UserBadge.findAll({
            where: { userId },
            include: [{ model: Badge, as: 'Badge' }],
            order: [['earnedAt', 'DESC']]
        });
    }

    async userHasBadge(userId, badgeId) {
        return await UserBadge.findOne({ where: { userId, badgeId } });
    }
}

module.exports = new BadgeRepository();
