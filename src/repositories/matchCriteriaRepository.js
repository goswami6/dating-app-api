const { MatchCriteria } = require('../models');

class MatchCriteriaRepository {
    async findByUserId(userId) {
        return await MatchCriteria.findOne({ where: { userId } });
    }

    async createOrUpdate(userId, data) {
        const existing = await this.findByUserId(userId);
        if (existing) {
            return await existing.update(data);
        }
        return await MatchCriteria.create({ userId, ...data });
    }

    async delete(userId) {
        const criteria = await this.findByUserId(userId);
        if (!criteria) return null;
        await criteria.destroy();
        return true;
    }
}

module.exports = new MatchCriteriaRepository();
