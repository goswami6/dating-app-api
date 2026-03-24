const onlineUsersService = require('../services/onlineUsersService');
const { success, error } = require('../utils/apiResponse');

class OnlineUsersController {

  // GET /api/online-users
  async getOnlineUsers(req, res) {
    try {
      const userId = req.user.id;
      const { page, limit, gender, minAge, maxAge } = req.query;
      const result = await onlineUsersService.getOnlineUsers(userId, { page, limit, gender, minAge, maxAge });
      return success(res, 'Online users fetched successfully', result);
    } catch (err) {
      return error(res, err.message, 500);
    }
  }

  // POST /api/online-users/:userId/start-chat
  async startChat(req, res) {
    try {
      const currentUserId = req.user.id;
      const targetUserId = parseInt(req.params.userId);
      const result = await onlineUsersService.startChat(currentUserId, targetUserId);
      return success(res, 'Chat started successfully', result, 201);
    } catch (err) {
      if (err.message.includes('Insufficient wallet')) return error(res, err.message, 402);
      if (err.message.includes('not found')) return error(res, err.message, 404);
      return error(res, err.message, 400);
    }
  }

  // POST /api/online-users/chat/:chatId/message
  async sendMessage(req, res) {
    try {
      const userId = req.user.id;
      const chatId = parseInt(req.params.chatId);
      const { text } = req.body;
      if (!text || !text.trim()) return error(res, 'Message text is required', 400);
      const result = await onlineUsersService.sendMessage(chatId, userId, text);
      return success(res, 'Message sent successfully', result, 201);
    } catch (err) {
      if (err.message.includes('Insufficient wallet')) return error(res, err.message, 402);
      if (err.message.includes('not found') || err.message.includes('not part')) return error(res, err.message, 404);
      return error(res, err.message, 400);
    }
  }

  // GET /api/online-users/chat/:chatId/messages
  async getMessages(req, res) {
    try {
      const userId = req.user.id;
      const chatId = parseInt(req.params.chatId);
      const { page, limit } = req.query;
      const result = await onlineUsersService.getMessages(chatId, userId, page, limit);
      return success(res, 'Messages fetched successfully', result);
    } catch (err) {
      if (err.message.includes('not found') || err.message.includes('not part')) return error(res, err.message, 404);
      return error(res, err.message, 500);
    }
  }

  // GET /api/online-users/my-chats
  async getMyChats(req, res) {
    try {
      const userId = req.user.id;
      const { page, limit } = req.query;
      const result = await onlineUsersService.getMyChats(userId, page, limit);
      return success(res, 'Active chats fetched successfully', result);
    } catch (err) {
      return error(res, err.message, 500);
    }
  }

  // PUT /api/online-users/chat/:chatId/end
  async endChat(req, res) {
    try {
      const userId = req.user.id;
      const chatId = parseInt(req.params.chatId);
      const result = await onlineUsersService.endChat(chatId, userId);
      return success(res, result.message);
    } catch (err) {
      if (err.message.includes('not found') || err.message.includes('not part')) return error(res, err.message, 404);
      return error(res, err.message, 400);
    }
  }

  // POST /api/online-users/:userId/call
  async initiateCall(req, res) {
    try {
      const callerId = req.user.id;
      const receiverId = parseInt(req.params.userId);
      const { callType } = req.body;
      if (!callType || !['voice', 'video'].includes(callType)) {
        return error(res, 'callType must be voice or video', 400);
      }
      const result = await onlineUsersService.canCallOnlineUser(callerId, receiverId, callType);
      return success(res, 'Call can be initiated. Use socket to start the call.', {
        callerId,
        receiverId,
        callType,
        ...result
      });
    } catch (err) {
      if (err.message.includes('Insufficient wallet')) return error(res, err.message, 402);
      if (err.message.includes('not found')) return error(res, err.message, 404);
      if (err.message.includes('offline')) return error(res, err.message, 400);
      return error(res, err.message, 400);
    }
  }
}

module.exports = new OnlineUsersController();
