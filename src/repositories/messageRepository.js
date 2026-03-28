const { Message, User, Match } = require('../models');
const { Op } = require('sequelize');

class MessageRepository {
    async findAll(options = {}) {
        return await Message.findAll(options);
    }

    async findById(id) {
        return await Message.findByPk(id, {
            include: [
                { model: User, as: 'Sender', attributes: ['id', 'firstName', 'lastName', 'profilePicture'] },
                { model: Message, as: 'ReplyTo', attributes: ['id', 'text', 'senderId', 'messageType'] }
            ]
        });
    }

    async create(data) {
        return await Message.create(data);
    }

    async findByMatchId(matchId, options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 50;
        const offset = (page - 1) * limit;

        const { count, rows } = await Message.findAndCountAll({
            where: { matchId },
            order: [['sentAt', 'DESC']],
            limit,
            offset,
            include: [
                { model: User, as: 'Sender', attributes: ['id', 'firstName', 'lastName', 'profilePicture'] },
                { model: Message, as: 'ReplyTo', attributes: ['id', 'text', 'senderId', 'messageType'] }
            ]
        });

        return {
            messages: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: Math.ceil(count / limit)
            }
        };
    }

    async update(id, data) {
        const message = await Message.findByPk(id);
        if (!message) return null;
        return await message.update(data);
    }

    async delete(id) {
        const message = await Message.findByPk(id);
        if (!message) return null;
        await message.destroy();
        return true;
    }

    async count(where = {}) {
        return await Message.count({ where });
    }

    async deleteByMatchId(matchId) {
        return await Message.destroy({ where: { matchId } });
    }

    async markAsRead(matchId, userId) {
        return await Message.update(
            { isRead: true, readAt: new Date() },
            { where: { matchId, senderId: { [Op.ne]: userId }, isRead: false } }
        );
    }

    async markAsDelivered(messageIds) {
        return await Message.update(
            { isDelivered: true, deliveredAt: new Date() },
            { where: { id: { [Op.in]: messageIds }, isDelivered: false } }
        );
    }

    async getUnreadCount(userId) {
        // Find all matches where user is involved
        const matches = await Match.findAll({
            where: {
                [Op.or]: [{ userId }, { matchedUserId: userId }],
                status: 'mutual_match'
            },
            attributes: ['id']
        });
        const matchIds = matches.map(m => m.id);
        if (matchIds.length === 0) return 0;

        return await Message.count({
            where: {
                matchId: { [Op.in]: matchIds },
                senderId: { [Op.ne]: userId },
                isRead: false
            }
        });
    }

    async searchMessages(matchId, query, page = 1, limit = 20) {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 20;
        const offset = (page - 1) * limit;
        const { count, rows } = await Message.findAndCountAll({
            where: {
                matchId,
                text: { [Op.like]: `%${query}%` }
            },
            order: [['sentAt', 'DESC']],
            limit,
            offset,
            include: [
                { model: User, as: 'Sender', attributes: ['id', 'firstName', 'lastName', 'profilePicture'] }
            ]
        });
        return {
            messages: rows,
            pagination: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) }
        };
    }

    async getMediaMessages(matchId, page = 1, limit = 20) {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 20;
        const offset = (page - 1) * limit;
        const { count, rows } = await Message.findAndCountAll({
            where: {
                matchId,
                messageType: { [Op.in]: ['image', 'gif', 'voice', 'video'] }
            },
            order: [['sentAt', 'DESC']],
            limit,
            offset,
            include: [
                { model: User, as: 'Sender', attributes: ['id', 'firstName', 'lastName'] }
            ]
        });
        return {
            media: rows,
            pagination: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) }
        };
    }

    async getPinnedMessages(matchId) {
        return await Message.findAll({
            where: { matchId, isPinned: true },
            order: [['sentAt', 'DESC']],
            include: [
                { model: User, as: 'Sender', attributes: ['id', 'firstName', 'lastName'] }
            ]
        });
    }

    async getStarredMessages(matchId) {
        return await Message.findAll({
            where: { matchId, isStarred: true },
            order: [['sentAt', 'DESC']],
            include: [
                { model: User, as: 'Sender', attributes: ['id', 'firstName', 'lastName'] }
            ]
        });
    }

    async getLatestMessage(matchId) {
        return await Message.findOne({
            where: { matchId },
            order: [['sentAt', 'DESC']],
            include: [
                { model: User, as: 'Sender', attributes: ['id', 'firstName', 'lastName'] }
            ]
        });
    }

    async getChatList(userId) {
        const matches = await Match.findAll({
            where: {
                [Op.or]: [{ userId }, { matchedUserId: userId }],
                status: 'mutual_match'
            },
            include: [
                { model: User, as: 'Initiator', attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isOnline', 'lastSeen'] },
                { model: User, as: 'MatchedUser', attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isOnline', 'lastSeen'] }
            ],
            order: [['updatedAt', 'DESC']]
        });

        const chatList = [];
        for (const match of matches) {
            const otherUser = match.userId === userId ? match.MatchedUser : match.Initiator;
            const latestMsg = await this.getLatestMessage(match.id);
            const unread = await Message.count({
                where: { matchId: match.id, senderId: { [Op.ne]: userId }, isRead: false }
            });

            chatList.push({
                matchId: match.id,
                user: otherUser,
                lastMessage: latestMsg ? {
                    id: latestMsg.id,
                    text: latestMsg.text,
                    messageType: latestMsg.messageType,
                    senderId: latestMsg.senderId,
                    sentAt: latestMsg.sentAt,
                    isRead: latestMsg.isRead
                } : null,
                unreadCount: unread,
                matchedAt: match.matchedAt
            });
        }

        // Sort by latest message time
        chatList.sort((a, b) => {
            const aTime = a.lastMessage ? new Date(a.lastMessage.sentAt) : new Date(a.matchedAt);
            const bTime = b.lastMessage ? new Date(b.lastMessage.sentAt) : new Date(b.matchedAt);
            return bTime - aTime;
        });

        return chatList;
    }
}

module.exports = new MessageRepository();
