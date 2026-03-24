const { RandomChat, RandomChatMessage, User, UserPhoto } = require('../models');
const { Op } = require('sequelize');

class RandomChatRepository {

  // Find or create an active chat between two users
  async findOrCreateChat(user1Id, user2Id) {
    const existing = await RandomChat.findOne({
      where: {
        status: 'active',
        [Op.or]: [
          { user1Id, user2Id },
          { user1Id: user2Id, user2Id: user1Id }
        ]
      }
    });
    if (existing) return existing;

    return await RandomChat.create({
      user1Id,
      user2Id,
      status: 'active',
      startedAt: new Date()
    });
  }

  async findById(id) {
    return await RandomChat.findByPk(id, {
      include: [
        { model: User, as: 'User1', attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isOnline', 'age', 'location'] },
        { model: User, as: 'User2', attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isOnline', 'age', 'location'] }
      ]
    });
  }

  async findActiveChatsForUser(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows, count } = await RandomChat.findAndCountAll({
      where: {
        status: 'active',
        [Op.or]: [{ user1Id: userId }, { user2Id: userId }]
      },
      include: [
        { model: User, as: 'User1', attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isOnline', 'age', 'location'] },
        { model: User, as: 'User2', attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isOnline', 'age', 'location'] }
      ],
      order: [['updatedAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    return { chats: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) };
  }

  async endChat(chatId) {
    const chat = await RandomChat.findByPk(chatId);
    if (!chat) return null;
    return await chat.update({ status: 'ended', endedAt: new Date() });
  }

  async update(chatId, data) {
    const chat = await RandomChat.findByPk(chatId);
    if (!chat) return null;
    return await chat.update(data);
  }

  // Messages
  async createMessage(data) {
    return await RandomChatMessage.create(data);
  }

  async getMessages(chatId, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const { rows, count } = await RandomChatMessage.findAndCountAll({
      where: { chatId },
      include: [
        { model: User, as: 'Sender', attributes: ['id', 'firstName', 'lastName', 'profilePicture'] }
      ],
      order: [['sentAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    return { messages: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) };
  }

  async markMessagesRead(chatId, userId) {
    await RandomChatMessage.update(
      { isRead: true },
      { where: { chatId, senderId: { [Op.ne]: userId }, isRead: false } }
    );
  }
}

module.exports = new RandomChatRepository();
