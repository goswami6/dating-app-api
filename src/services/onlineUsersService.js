const { User, UserPhoto } = require('../models');
const { Op } = require('sequelize');
const { connectedUsers } = require('../socket/callSocket');
const randomChatRepository = require('../repositories/randomChatRepository');
const walletService = require('./walletService');

class OnlineUsersService {

  // ── Get Online Users ────────────────────────────────────
  async getOnlineUsers(currentUserId, options = {}) {
    const { page = 1, limit = 20, gender, minAge, maxAge } = options;

    // Get socket-connected user IDs (truly online right now)
    const onlineSocketIds = new Set(connectedUsers.keys());

    // Build where clause - show all active users (with online status)
    const where = {
      id: { [Op.ne]: currentUserId },
      accountStatus: 'active',
      isAdmin: false
    };
    if (gender) where.gender = gender;
    if (minAge) where.age = { ...where.age, [Op.gte]: parseInt(minAge) };
    if (maxAge) where.age = { ...where.age, [Op.lte]: parseInt(maxAge) };

    const offset = (page - 1) * limit;
    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'age', 'gender', 'location', 'bio', 'interests', 'isOnline', 'lastSeen', 'occupation'],
      include: [{ model: UserPhoto, as: 'Photos', attributes: ['id', 'url', 'sortOrder'], limit: 3 }],
      order: [
        ['isOnline', 'DESC'],    // Online users first
        ['updatedAt', 'DESC']
      ],
      limit: parseInt(limit),
      offset
    });

    return {
      users: rows.map(u => this._formatUser(u, onlineSocketIds.has(u.id) || u.isOnline)),
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    };
  }

  // ── Start Chat with Online User ─────────────────────────
  async startChat(userId, targetUserId) {
    if (userId === targetUserId) throw new Error('Cannot chat with yourself');

    // Check target user exists and is online
    const targetUser = await User.findOne({
      where: { id: targetUserId, isAdmin: false },
      attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isOnline', 'age', 'location', 'accountStatus']
    });
    if (!targetUser) throw new Error('User not found');
    if (targetUser.accountStatus !== 'active') throw new Error('User is not available');

    // Check wallet balance
    const canChat = await walletService.canChat(userId);
    if (!canChat) {
      const wallet = await walletService.getWallet(userId);
      throw new Error(`Insufficient wallet balance. Required: ₹${walletService.getRates().chatPerSession}, Available: ₹${wallet.balance}`);
    }

    // Find or create chat session
    const chat = await randomChatRepository.findOrCreateChat(userId, targetUserId);

    // Deduct wallet for the chat session (charged once per session, not per message)
    await walletService.deductForChatSession(userId, targetUserId);

    // Update chat stats
    await randomChatRepository.update(chat.id, {
      totalSpent: parseFloat(chat.totalSpent || 0) + walletService.getRates().chatPerSession
    });

    return {
      chatId: chat.id,
      status: chat.status,
      targetUser: {
        id: targetUser.id,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        profilePicture: targetUser.profilePicture,
        isOnline: connectedUsers.has(targetUser.id) || targetUser.isOnline,
        age: targetUser.age,
        location: targetUser.location
      },
      startedAt: chat.startedAt
    };
  }

  // ── Send Message in Random Chat ─────────────────────────
  async sendMessage(chatId, senderId, text) {
    const chat = await randomChatRepository.findById(chatId);
    if (!chat) throw new Error('Chat not found');
    if (chat.status !== 'active') throw new Error('Chat has ended');

    // Verify sender is part of this chat
    if (chat.user1Id !== senderId && chat.user2Id !== senderId) {
      throw new Error('You are not part of this chat');
    }

    // Create message (no wallet deduction here — charged per session in startChat)
    const message = await randomChatRepository.createMessage({
      chatId,
      senderId,
      text,
      sentAt: new Date()
    });

    // Update chat stats
    await randomChatRepository.update(chatId, {
      totalMessages: chat.totalMessages + 1
    });

    return {
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      text: message.text,
      messageType: message.messageType,
      sentAt: message.sentAt
    };
  }

  // ── Get Messages ────────────────────────────────────────
  async getMessages(chatId, userId, page = 1, limit = 50) {
    const chat = await randomChatRepository.findById(chatId);
    if (!chat) throw new Error('Chat not found');

    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new Error('You are not part of this chat');
    }

    // Mark messages as read
    await randomChatRepository.markMessagesRead(chatId, userId);

    return await randomChatRepository.getMessages(chatId, page, limit);
  }

  // ── Get My Chats (active only) ─────────────────────────
  async getMyChats(userId, page = 1, limit = 20) {
    return await randomChatRepository.findActiveChatsForUser(userId, page, limit);
  }

  // ── Get Chat History (all chats: active + ended) ──────
  async getChatHistory(userId, page = 1, limit = 20, status = null) {
    return await randomChatRepository.getChatHistory(userId, page, limit, status);
  }

  // ── Get Chat Detail ─────────────────────────────────────
  async getChatDetail(chatId, userId) {
    const chat = await randomChatRepository.getChatDetail(chatId);
    if (!chat) throw new Error('Chat not found');
    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new Error('You are not part of this chat');
    }

    const otherUser = chat.user1Id === userId ? chat.User2 : chat.User1;
    return {
      chatId: chat.id,
      status: chat.status,
      otherUser: otherUser ? {
        id: otherUser.id,
        firstName: otherUser.firstName,
        lastName: otherUser.lastName,
        profilePicture: otherUser.profilePicture,
        isOnline: connectedUsers.has(otherUser.id) || otherUser.isOnline,
        lastSeen: otherUser.lastSeen,
        age: otherUser.age,
        location: otherUser.location,
        bio: otherUser.bio,
        occupation: otherUser.occupation
      } : null,
      totalMessages: chat.totalMessages,
      totalSpent: chat.totalSpent,
      startedAt: chat.startedAt,
      endedAt: chat.endedAt,
      createdAt: chat.createdAt
    };
  }

  // ── Delete Chat ─────────────────────────────────────────
  async deleteChat(chatId, userId) {
    const chat = await randomChatRepository.findById(chatId);
    if (!chat) throw new Error('Chat not found');
    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new Error('You are not part of this chat');
    }
    await randomChatRepository.deleteChat(chatId);
    return { message: 'Chat deleted successfully' };
  }

  // ── End Chat ────────────────────────────────────────────
  async endChat(chatId, userId) {
    const chat = await randomChatRepository.findById(chatId);
    if (!chat) throw new Error('Chat not found');

    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new Error('You are not part of this chat');
    }

    await randomChatRepository.endChat(chatId);
    return { message: 'Chat ended successfully' };
  }

  // ── Initiate Call to Online User (wallet-based, no match needed) ──
  async canCallOnlineUser(callerId, receiverId, callType) {
    if (callerId === receiverId) throw new Error('Cannot call yourself');

    const receiver = await User.findOne({ where: { id: receiverId, isAdmin: false }, attributes: ['id', 'isOnline', 'accountStatus'] });
    if (!receiver) throw new Error('User not found');
    if (receiver.accountStatus !== 'active') throw new Error('User is not available');

    // Check if receiver is online (socket or DB)
    const isReceiverOnline = connectedUsers.has(receiverId) || receiver.isOnline;
    if (!isReceiverOnline) throw new Error('User is currently offline');

    // Check wallet balance
    const canCall = await walletService.canCall(callerId, callType);
    if (!canCall) {
      const wallet = await walletService.getWallet(callerId);
      const rates = walletService.getRates();
      const ratePerMinute = callType === 'video' ? rates.videoCallPerMinute : rates.voiceCallPerMinute;
      throw new Error(`Insufficient wallet balance. Required: ₹${ratePerMinute}/min, Available: ₹${wallet.balance}`);
    }

    return { canCall: true, isReceiverOnline };
  }

  // ── Format User ─────────────────────────────────────────
  _formatUser(user, isOnline) {
    const images = (user.Photos || []).map(p => p.url);
    if (images.length === 0 && user.profilePicture) {
      images.push(user.profilePicture);
    }
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      images,
      age: user.age,
      gender: user.gender,
      location: user.location,
      bio: user.bio,
      interests: user.interests || [],
      occupation: user.occupation,
      isOnline,
      lastSeen: user.lastSeen || null
    };
  }
}

module.exports = new OnlineUsersService();
