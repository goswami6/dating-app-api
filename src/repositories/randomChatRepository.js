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
        { model: User, as: 'User1', attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isOnline', 'lastSeen', 'age', 'location'] },
        { model: User, as: 'User2', attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isOnline', 'lastSeen', 'age', 'location'] }
      ],
      order: [['updatedAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    return { chats: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) };
  }

  // Full chat history (active + ended) with last message & unread count
  async getChatHistory(userId, page = 1, limit = 20, status = null) {
    const offset = (page - 1) * limit;
    const where = {
      [Op.or]: [{ user1Id: userId }, { user2Id: userId }]
    };
    if (status) where.status = status;

    const { rows, count } = await RandomChat.findAndCountAll({
      where,
      include: [
        { model: User, as: 'User1', attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isOnline', 'lastSeen', 'age', 'location'] },
        { model: User, as: 'User2', attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isOnline', 'lastSeen', 'age', 'location'] }
      ],
      order: [['updatedAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    // Enrich each chat with last message and unread count
    const chats = [];
    for (const chat of rows) {
      const otherUser = chat.user1Id === userId ? chat.User2 : chat.User1;

      const lastMessage = await RandomChatMessage.findOne({
        where: { chatId: chat.id },
        order: [['sentAt', 'DESC']],
        attributes: ['id', 'text', 'messageType', 'senderId', 'sentAt', 'isRead']
      });

      const unreadCount = await RandomChatMessage.count({
        where: { chatId: chat.id, senderId: { [Op.ne]: userId }, isRead: false }
      });

      chats.push({
        chatId: chat.id,
        status: chat.status,
        otherUser: otherUser ? {
          id: otherUser.id,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          profilePicture: otherUser.profilePicture,
          isOnline: otherUser.isOnline,
          lastSeen: otherUser.lastSeen,
          age: otherUser.age,
          location: otherUser.location
        } : null,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          text: lastMessage.text,
          messageType: lastMessage.messageType,
          senderId: lastMessage.senderId,
          sentAt: lastMessage.sentAt,
          isRead: lastMessage.isRead
        } : null,
        unreadCount,
        totalMessages: chat.totalMessages,
        totalSpent: chat.totalSpent,
        startedAt: chat.startedAt,
        endedAt: chat.endedAt
      });
    }

    return { chats, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) };
  }

  // Delete chat (soft — removes for the user, actually deletes messages)
  async deleteChat(chatId) {
    await RandomChatMessage.destroy({ where: { chatId } });
    await RandomChat.destroy({ where: { id: chatId } });
    return true;
  }

  // Get chat detail with full stats
  async getChatDetail(chatId) {
    const chat = await RandomChat.findByPk(chatId, {
      include: [
        { model: User, as: 'User1', attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isOnline', 'lastSeen', 'age', 'location', 'bio', 'occupation'] },
        { model: User, as: 'User2', attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isOnline', 'lastSeen', 'age', 'location', 'bio', 'occupation'] }
      ]
    });
    return chat;
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
