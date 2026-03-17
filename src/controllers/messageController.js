const messageService = require('../services/messageService');
const apiResponse = require('../utils/apiResponse');

class MessageController {

  // GET /messages/:matchId
  async getMessages(req, res) {
    try {
      const { matchId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const result = await messageService.getMessages(parseInt(matchId), req.user.id, page, limit);
      return apiResponse.success(res, 'Messages retrieved successfully', result);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // POST /messages/send-image
  async sendImage(req, res) {
    try {
      const { matchId, text } = req.body;
      if (!matchId) return apiResponse.error(res, 'matchId is required', 400);
      const message = await messageService.sendImage(parseInt(matchId), req.user.id, req.file, text);
      return apiResponse.success(res, 'Image sent successfully', message, 201);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // POST /messages/send-gif
  async sendGif(req, res) {
    try {
      const { matchId, gifUrl, text } = req.body;
      if (!matchId) return apiResponse.error(res, 'matchId is required', 400);
      const message = await messageService.sendGif(parseInt(matchId), req.user.id, gifUrl, text);
      return apiResponse.success(res, 'GIF sent successfully', message, 201);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // POST /messages/send-voice
  async sendVoice(req, res) {
    try {
      const { matchId } = req.body;
      if (!matchId) return apiResponse.error(res, 'matchId is required', 400);
      const message = await messageService.sendVoice(parseInt(matchId), req.user.id, req.file);
      return apiResponse.success(res, 'Voice message sent successfully', message, 201);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // PUT /messages/:messageId
  async editMessage(req, res) {
    try {
      const { messageId } = req.params;
      const { text } = req.body;
      if (!text) return apiResponse.error(res, 'text is required', 400);
      const message = await messageService.editMessage(parseInt(messageId), req.user.id, text);
      return apiResponse.success(res, 'Message edited successfully', message);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // DELETE /messages/:messageId
  async deleteMessage(req, res) {
    try {
      const { messageId } = req.params;
      await messageService.deleteMessage(parseInt(messageId), req.user.id);
      return apiResponse.success(res, 'Message deleted successfully');
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // DELETE /messages/chat/:matchId
  async deleteChat(req, res) {
    try {
      const { matchId } = req.params;
      const result = await messageService.deleteChat(parseInt(matchId), req.user.id);
      return apiResponse.success(res, 'Conversation deleted successfully', result);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // PUT /messages/read
  async markAsRead(req, res) {
    try {
      const { matchId } = req.body;
      if (!matchId) return apiResponse.error(res, 'matchId is required', 400);
      const result = await messageService.markAsRead(parseInt(matchId), req.user.id);
      return apiResponse.success(res, 'Messages marked as read', result);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // PUT /messages/delivered
  async markAsDelivered(req, res) {
    try {
      const { messageIds } = req.body;
      const result = await messageService.markAsDelivered(messageIds, req.user.id);
      return apiResponse.success(res, 'Messages marked as delivered', result);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // GET /messages/unread-count
  async getUnreadCount(req, res) {
    try {
      const result = await messageService.getUnreadCount(req.user.id);
      return apiResponse.success(res, 'Unread count retrieved', result);
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }

  // POST /messages/typing
  async typingIndicator(req, res) {
    try {
      const { matchId } = req.body;
      if (!matchId) return apiResponse.error(res, 'matchId is required', 400);
      const result = await messageService.typingIndicator(parseInt(matchId), req.user.id);
      return apiResponse.success(res, 'Typing indicator sent', result);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // GET /messages/message/:messageId
  async getMessage(req, res) {
    try {
      const { messageId } = req.params;
      const message = await messageService.getMessage(parseInt(messageId), req.user.id);
      return apiResponse.success(res, 'Message retrieved', message);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // GET /messages/search
  async searchMessages(req, res) {
    try {
      const { matchId, query, page = 1, limit = 20 } = req.query;
      if (!matchId || !query) return apiResponse.error(res, 'matchId and query are required', 400);
      const result = await messageService.searchMessages(parseInt(matchId), req.user.id, query, page, limit);
      return apiResponse.success(res, 'Search results', result);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // POST /messages/react
  async reactToMessage(req, res) {
    try {
      const { messageId, reaction } = req.body;
      if (!messageId || !reaction) return apiResponse.error(res, 'messageId and reaction are required', 400);
      const message = await messageService.reactToMessage(parseInt(messageId), req.user.id, reaction);
      return apiResponse.success(res, 'Reaction added', message);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // POST /messages/pin
  async pinMessage(req, res) {
    try {
      const { messageId } = req.body;
      if (!messageId) return apiResponse.error(res, 'messageId is required', 400);
      const message = await messageService.pinMessage(parseInt(messageId), req.user.id);
      return apiResponse.success(res, 'Message pinned', message);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // DELETE /messages/unpin/:messageId
  async unpinMessage(req, res) {
    try {
      const { messageId } = req.params;
      const message = await messageService.unpinMessage(parseInt(messageId), req.user.id);
      return apiResponse.success(res, 'Message unpinned', message);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // POST /messages/report
  async reportMessage(req, res) {
    try {
      const { messageId, reason } = req.body;
      if (!messageId) return apiResponse.error(res, 'messageId is required', 400);
      const message = await messageService.reportMessage(parseInt(messageId), req.user.id, reason);
      return apiResponse.success(res, 'Message reported', message);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // POST /messages/forward
  async forwardMessage(req, res) {
    try {
      const { messageId, targetMatchId } = req.body;
      if (!messageId || !targetMatchId) return apiResponse.error(res, 'messageId and targetMatchId are required', 400);
      const message = await messageService.forwardMessage(parseInt(messageId), parseInt(targetMatchId), req.user.id);
      return apiResponse.success(res, 'Message forwarded', message, 201);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // GET /messages/media/:matchId
  async getSharedMedia(req, res) {
    try {
      const { matchId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const result = await messageService.getSharedMedia(parseInt(matchId), req.user.id, page, limit);
      return apiResponse.success(res, 'Shared media retrieved', result);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // POST /messages/block-user
  async blockUser(req, res) {
    try {
      const { matchId } = req.body;
      if (!matchId) return apiResponse.error(res, 'matchId is required', 400);
      const result = await messageService.blockUserFromChat(parseInt(matchId), req.user.id);
      return apiResponse.success(res, 'User blocked from chat', result);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // POST /messages/unblock-user
  async unblockUser(req, res) {
    try {
      const { matchId } = req.body;
      if (!matchId) return apiResponse.error(res, 'matchId is required', 400);
      const result = await messageService.unblockUser(parseInt(matchId), req.user.id);
      return apiResponse.success(res, 'User unblocked', result);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // GET /messages/chat-list
  async getChatList(req, res) {
    try {
      const result = await messageService.getChatList(req.user.id);
      return apiResponse.success(res, 'Chat list retrieved', result);
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }

  // GET /messages/latest/:matchId
  async getLatestMessage(req, res) {
    try {
      const { matchId } = req.params;
      const message = await messageService.getLatestMessage(parseInt(matchId), req.user.id);
      return apiResponse.success(res, 'Latest message retrieved', message);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // POST /messages/reply
  async replyToMessage(req, res) {
    try {
      const { matchId, replyToId, text } = req.body;
      if (!matchId || !replyToId) return apiResponse.error(res, 'matchId and replyToId are required', 400);
      const message = await messageService.replyToMessage(parseInt(matchId), req.user.id, parseInt(replyToId), text, req.file ? 'image' : 'text', req.file);
      return apiResponse.success(res, 'Reply sent', message, 201);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // POST /messages/star
  async starMessage(req, res) {
    try {
      const { messageId } = req.body;
      if (!messageId) return apiResponse.error(res, 'messageId is required', 400);
      const message = await messageService.starMessage(parseInt(messageId), req.user.id);
      return apiResponse.success(res, 'Message starred', message);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // DELETE /messages/unstar/:messageId
  async unstarMessage(req, res) {
    try {
      const { messageId } = req.params;
      const message = await messageService.unstarMessage(parseInt(messageId), req.user.id);
      return apiResponse.success(res, 'Message unstarred', message);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = new MessageController();
