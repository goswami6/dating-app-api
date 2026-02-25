const { Match, User, Message } = require('../models');
const { Op } = require('sequelize');

class MatchRepository {
    async findAll(options = {}) {
        return await Match.findAll(options);
    }

    async findById(id) {
        return await Match.findByPk(id);
    }

    async findByUsers(userId, matchedUserId) {
        return await Match.findOne({
            where: {
                [Op.or]: [
                    { userId, matchedUserId },
                    { userId: matchedUserId, matchedUserId: userId }
                ]
            }
        });
    }

    async create(data) {
        return await Match.create(data);
    }

    async update(id, data) {
        const match = await Match.findByPk(id);
        if (!match) return null;
        return await match.update(data);
    }

    async delete(id) {
        const match = await Match.findByPk(id);
        if (!match) return null;
        await match.destroy();
        return true;
    }

    async findMatchesForUser(userId) {
        return await Match.findAll({
            where: {
                status: 'mutual_match',
                [Op.or]: [
                    { userId },
                    { matchedUserId: userId }
                ]
            },
            order: [['matchedAt', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'Initiator',
                    attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'age', 'location']
                },
                {
                    model: User,
                    as: 'MatchedUser',
                    attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'age', 'location']
                },
                {
                    model: Message,
                    as: 'Messages',
                    limit: 1,
                    order: [['sentAt', 'DESC']],
                    attributes: ['id', 'text', 'senderId', 'sentAt']
                }
            ]
        });
    }

    async findMatchWithMessages(matchId) {
        return await Match.findByPk(matchId, {
            include: [
                {
                    model: User,
                    as: 'Initiator',
                    attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'age']
                },
                {
                    model: User,
                    as: 'MatchedUser',
                    attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'age']
                },
                {
                    model: Message,
                    as: 'Messages',
                    order: [['sentAt', 'ASC']],
                    attributes: ['id', 'text', 'senderId', 'sentAt'],
                    include: [
                        {
                            model: User,
                            as: 'Sender',
                            attributes: ['id', 'firstName']
                        }
                    ]
                }
            ]
        });
    }

    async count(where = {}) {
        return await Match.count({ where });
    }
}

module.exports = new MatchRepository();
