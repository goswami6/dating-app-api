const { Message, User } = require('../models');

class MessageRepository {
    async findAll(options = {}) {
        return await Message.findAll(options);
    }

    async findById(id) {
        return await Message.findByPk(id);
    }

    async create(data) {
        return await Message.create(data);
    }

    async findByMatchId(matchId, options = {}) {
        return await Message.findAll({
            where: { matchId },
            order: [['sentAt', 'ASC']],
            include: [
                {
                    model: User,
                    as: 'Sender',
                    attributes: ['id', 'firstName']
                }
            ],
            ...options
        });
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
}

module.exports = new MessageRepository();
