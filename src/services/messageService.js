const messageRepository = require('../repositories/messageRepository');
const { Match } = require('../models');
const { Op } = require('sequelize');

class MessageService {

  // Verify user belongs to match
  async _verifyMatchAccess(matchId, userId) {
    const match = await Match.findOne({
      where: {
        id: matchId,
        [Op.or]: [{ userId }, { matchedUserId: userId }]
      }
    });
    if (!match) throw new Error('Match not found or access denied');
    if (match.status === 'blocked') throw new Error('This conversation has been blocked');
    return match;
  }

  // GET /messages/:matchId — paginated chat messages
  async getMessages(matchId, userId, page, limit) {
    await this._verifyMatchAccess(matchId, userId);
    return await messageRepository.findByMatchId(matchId, { page, limit });
  }

  // POST /messages/send-image
  async sendImage(matchId, userId, file, text) {
    await this._verifyMatchAccess(matchId, userId);
    if (!file) throw new Error('Image file is required');
    return await messageRepository.create({
      matchId, senderId: userId,
      text: text || null,
      messageType: 'image',
      mediaUrl: `/uploads/chat-media/${file.filename}`
    });
  }

  // POST /messages/send-gif
  async sendGif(matchId, userId, gifUrl, text) {
    await this._verifyMatchAccess(matchId, userId);
    if (!gifUrl) throw new Error('GIF URL is required');
    return await messageRepository.create({
      matchId, senderId: userId,
      text: text || null,
      messageType: 'gif',
      mediaUrl: gifUrl
    });
  }

  // POST /messages/send-voice
  async sendVoice(matchId, userId, file) {
    await this._verifyMatchAccess(matchId, userId);
    if (!file) throw new Error('Voice file is required');
    return await messageRepository.create({
      matchId, senderId: userId,
      text: null,
      messageType: 'voice',
      mediaUrl: `/uploads/chat-media/${file.filename}`
    });
  }

  // PUT /messages/:messageId — edit message
  async editMessage(messageId, userId, newText) {
    const message = await messageRepository.findById(messageId);
    if (!message) throw new Error('Message not found');
    if (message.senderId !== userId) throw new Error('You can only edit your own messages');
    if (message.messageType !== 'text') throw new Error('Only text messages can be edited');
    return await messageRepository.update(messageId, { text: newText, isEdited: true });
  }

  // DELETE /messages/:messageId — delete message
  async deleteMessage(messageId, userId) {
    const message = await messageRepository.findById(messageId);
    if (!message) throw new Error('Message not found');
    if (message.senderId !== userId) throw new Error('You can only delete your own messages');
    return await messageRepository.delete(messageId);
  }

  // DELETE /messages/chat/:matchId — delete entire conversation
  async deleteChat(matchId, userId) {
    await this._verifyMatchAccess(matchId, userId);
    const count = await messageRepository.deleteByMatchId(matchId);
    return { deletedCount: count };
  }

  // PUT /messages/read — mark messages as read
  async markAsRead(matchId, userId) {
    await this._verifyMatchAccess(matchId, userId);
    const [count] = await messageRepository.markAsRead(matchId, userId);
    return { markedRead: count };
  }

  // PUT /messages/delivered — mark messages as delivered
  async markAsDelivered(messageIds, userId) {
    if (!messageIds || messageIds.length === 0) throw new Error('messageIds array is required');
    const [count] = await messageRepository.markAsDelivered(messageIds);
    return { markedDelivered: count };
  }

  // GET /messages/unread-count
  async getUnreadCount(userId) {
    const count = await messageRepository.getUnreadCount(userId);
    return { unreadCount: count };
  }

  // POST /messages/typing — typing indicator (stateless)
  async typingIndicator(matchId, userId) {
    await this._verifyMatchAccess(matchId, userId);
    return { matchId, userId, typing: true };
  }

  // GET /messages/message/:messageId — get single message
  async getMessage(messageId, userId) {
    const message = await messageRepository.findById(messageId);
    if (!message) throw new Error('Message not found');
    return message;
  }

  // GET /messages/search
  async searchMessages(matchId, userId, query, page, limit) {
    await this._verifyMatchAccess(matchId, userId);
    if (!query) throw new Error('Search query is required');
    return await messageRepository.searchMessages(matchId, query, page, limit);
  }

  // POST /messages/react — react to a message
  async reactToMessage(messageId, userId, reaction) {
    const message = await messageRepository.findById(messageId);
    if (!message) throw new Error('Message not found');
    return await messageRepository.update(messageId, { reaction });
  }

  // POST /messages/pin — pin a message
  async pinMessage(messageId, userId) {
    const message = await messageRepository.findById(messageId);
    if (!message) throw new Error('Message not found');
    await this._verifyMatchAccess(message.matchId, userId);
    return await messageRepository.update(messageId, { isPinned: true });
  }

  // DELETE /messages/unpin/:messageId
  async unpinMessage(messageId, userId) {
    const message = await messageRepository.findById(messageId);
    if (!message) throw new Error('Message not found');
    await this._verifyMatchAccess(message.matchId, userId);
    return await messageRepository.update(messageId, { isPinned: false });
  }

  // POST /messages/report
  async reportMessage(messageId, userId, reason) {
    const message = await messageRepository.findById(messageId);
    if (!message) throw new Error('Message not found');
    if (message.senderId === userId) throw new Error('You cannot report your own message');
    return await messageRepository.update(messageId, { isReported: true, reportReason: reason || 'Inappropriate content' });
  }

  // POST /messages/forward
  async forwardMessage(messageId, targetMatchId, userId) {
    const original = await messageRepository.findById(messageId);
    if (!original) throw new Error('Original message not found');
    await this._verifyMatchAccess(targetMatchId, userId);
    return await messageRepository.create({
      matchId: targetMatchId,
      senderId: userId,
      text: original.text,
      messageType: original.messageType,
      mediaUrl: original.mediaUrl
    });
  }

  // GET /messages/media/:matchId
  async getSharedMedia(matchId, userId, page, limit) {
    await this._verifyMatchAccess(matchId, userId);
    return await messageRepository.getMediaMessages(matchId, page, limit);
  }

  // POST /messages/block-user
  async blockUserFromChat(matchId, userId) {
    const match = await this._verifyMatchAccess(matchId, userId);
    return await match.update({ status: 'blocked' });
  }

  // POST /messages/unblock-user
  async unblockUser(matchId, userId) {
    const match = await Match.findOne({
      where: { id: matchId, status: 'blocked', [Op.or]: [{ userId }, { matchedUserId: userId }] }
    });
    if (!match) throw new Error('No blocked match found');
    return await match.update({ status: 'mutual_match' });
  }

  // GET /messages/chat-list
  async getChatList(userId) {
    return await messageRepository.getChatList(userId);
  }

  // GET /messages/latest/:matchId
  async getLatestMessage(matchId, userId) {
    await this._verifyMatchAccess(matchId, userId);
    const msg = await messageRepository.getLatestMessage(matchId);
    if (!msg) throw new Error('No messages in this chat');
    return msg;
  }

  // POST /messages/reply
  async replyToMessage(matchId, userId, replyToId, text, messageType, file) {
    await this._verifyMatchAccess(matchId, userId);
    const original = await messageRepository.findById(replyToId);
    if (!original) throw new Error('Original message not found');
    if (original.matchId !== parseInt(matchId)) throw new Error('Cannot reply to a message from a different chat');

    const data = {
      matchId, senderId: userId, replyToId, messageType: messageType || 'text'
    };
    if (file) {
      data.mediaUrl = `/uploads/chat-media/${file.filename}`;
      data.text = text || null;
    } else {
      if (!text) throw new Error('Text is required for reply');
      data.text = text;
    }
    return await messageRepository.create(data);
  }

  // POST /messages/star
  async starMessage(messageId, userId) {
    const message = await messageRepository.findById(messageId);
    if (!message) throw new Error('Message not found');
    return await messageRepository.update(messageId, { isStarred: true });
  }

  // DELETE /messages/unstar/:messageId
  async unstarMessage(messageId, userId) {
    const message = await messageRepository.findById(messageId);
    if (!message) throw new Error('Message not found');
    return await messageRepository.update(messageId, { isStarred: false });
  }
}

module.exports = new MessageService();
