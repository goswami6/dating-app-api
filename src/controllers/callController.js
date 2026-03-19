const callService = require('../services/callService');
const apiResponse = require('../utils/apiResponse');

class CallController {
  async initiateCall(req, res) {
    try {
      const callerId = req.user.id;
      const { receiverId, matchId, callType } = req.body;

      if (!receiverId || !matchId || !callType) {
        return apiResponse.error(res, 'receiverId, matchId, and callType are required', 400);
      }
      if (!['voice', 'video'].includes(callType)) {
        return apiResponse.error(res, 'callType must be voice or video', 400);
      }

      const result = await callService.initiateCall(callerId, receiverId, matchId, callType);

      if (result.busy) {
        return apiResponse.success(res, 'User is busy on another call', { call: result.call, busy: true }, 200);
      }

      // Emit socket event to receiver
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${receiverId}`).emit('incoming_call', {
          callId: result.call.id,
          callerId,
          callType,
          matchId,
        });
      }

      return apiResponse.success(res, 'Call initiated', { call: result.call }, 201);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  async answerCall(req, res) {
    try {
      const userId = req.user.id;
      const callId = parseInt(req.params.callId);
      const call = await callService.answerCall(callId, userId);

      const io = req.app.get('io');
      if (io) {
        io.to(`user_${call.callerId}`).emit('call_answered', { callId: call.id });
      }

      return apiResponse.success(res, 'Call answered', { call });
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  async rejectCall(req, res) {
    try {
      const userId = req.user.id;
      const callId = parseInt(req.params.callId);
      const call = await callService.rejectCall(callId, userId);

      const io = req.app.get('io');
      if (io) {
        io.to(`user_${call.callerId}`).emit('call_rejected', { callId: call.id });
      }

      return apiResponse.success(res, 'Call rejected', { call });
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  async endCall(req, res) {
    try {
      const userId = req.user.id;
      const callId = parseInt(req.params.callId);
      const call = await callService.endCall(callId, userId);

      const io = req.app.get('io');
      if (io) {
        const otherUserId = call.callerId === userId ? call.receiverId : call.callerId;
        io.to(`user_${otherUserId}`).emit('call_ended', {
          callId: call.id,
          duration: call.duration,
          endReason: call.endReason,
        });
      }

      return apiResponse.success(res, 'Call ended', { call });
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  async getCallHistory(req, res) {
    try {
      const userId = req.user.id;
      const { page, limit, callType } = req.query;
      const result = await callService.getCallHistory(userId, { page, limit, callType });
      return apiResponse.success(res, 'Call history retrieved', result);
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }

  async getCallById(req, res) {
    try {
      const userId = req.user.id;
      const callId = parseInt(req.params.callId);
      const call = await callService.getCallById(callId, userId);
      return apiResponse.success(res, 'Call details retrieved', { call });
    } catch (error) {
      return apiResponse.error(res, error.message, 404);
    }
  }

  async getActiveCall(req, res) {
    try {
      const userId = req.user.id;
      const call = await callService.getActiveCall(userId);
      return apiResponse.success(res, call ? 'Active call found' : 'No active call', { call });
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }

  async getMatchCallHistory(req, res) {
    try {
      const userId = req.user.id;
      const matchId = parseInt(req.params.matchId);
      const { page, limit } = req.query;
      const result = await callService.getMatchCallHistory(matchId, userId, { page, limit });
      return apiResponse.success(res, 'Match call history retrieved', result);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = new CallController();
