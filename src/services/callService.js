const callRepository = require('../repositories/callRepository');
const Match = require('../models/matchModel');
const { Op } = require('sequelize');

class CallService {
  async initiateCall(callerId, receiverId, matchId, callType) {
    // If matchId provided, verify match exists and is mutual
    if (matchId) {
      const match = await Match.findOne({
        where: {
          id: matchId,
          status: 'mutual_match',
          [Op.or]: [
            { userId: callerId, matchedUserId: receiverId },
            { userId: receiverId, matchedUserId: callerId },
          ],
        },
      });
      if (!match) throw new Error('Cannot call — no mutual match with this user');
    }

    // Check if either user is already in a call
    const activeCallCaller = await callRepository.findActiveCall(callerId);
    if (activeCallCaller) throw new Error('You are already in an active call');

    const activeCallReceiver = await callRepository.findActiveCall(receiverId);
    if (activeCallReceiver) {
      // Create a busy call record
      const busyCall = await callRepository.create({
        matchId: matchId || null,
        callerId,
        receiverId,
        callType,
        status: 'busy',
        endReason: 'receiver_busy',
      });
      return { call: busyCall, busy: true };
    }

    const call = await callRepository.create({
      matchId: matchId || null,
      callerId,
      receiverId,
      callType,
      status: 'ringing',
    });

    return { call, busy: false };
  }

  async answerCall(callId, userId) {
    const call = await callRepository.findById(callId);
    if (!call) throw new Error('Call not found');
    if (call.receiverId !== userId) throw new Error('Only the receiver can answer this call');
    if (call.status !== 'ringing') throw new Error('Call is not ringing');

    await callRepository.update(callId, {
      status: 'ongoing',
      startedAt: new Date(),
    });

    return await callRepository.findById(callId);
  }

  async rejectCall(callId, userId) {
    const call = await callRepository.findById(callId);
    if (!call) throw new Error('Call not found');
    if (call.receiverId !== userId) throw new Error('Only the receiver can reject this call');
    if (call.status !== 'ringing') throw new Error('Call is not ringing');

    await callRepository.update(callId, {
      status: 'rejected',
      endedAt: new Date(),
      endReason: 'receiver_rejected',
    });

    return await callRepository.findById(callId);
  }

  async endCall(callId, userId) {
    const call = await callRepository.findById(callId);
    if (!call) throw new Error('Call not found');
    if (call.callerId !== userId && call.receiverId !== userId) {
      throw new Error('You are not a participant in this call');
    }

    const now = new Date();
    let endReason = 'completed';
    let duration = 0;

    if (call.status === 'ringing') {
      endReason = call.callerId === userId ? 'caller_cancelled' : 'receiver_rejected';
    } else if (call.status === 'ongoing' && call.startedAt) {
      duration = Math.round((now - new Date(call.startedAt)) / 1000);
    }

    await callRepository.update(callId, {
      status: 'ended',
      endedAt: now,
      duration,
      endReason,
    });

    return await callRepository.findById(callId);
  }

  async getCallHistory(userId, options) {
    const result = await callRepository.findCallHistory(userId, options);
    return {
      calls: result.rows,
      total: result.count,
      page: parseInt(options.page) || 1,
      limit: parseInt(options.limit) || 20,
    };
  }

  async getCallById(callId, userId) {
    const call = await callRepository.findById(callId);
    if (!call) throw new Error('Call not found');
    if (call.callerId !== userId && call.receiverId !== userId) {
      throw new Error('You are not a participant in this call');
    }
    return call;
  }

  async getActiveCall(userId) {
    return await callRepository.findActiveCall(userId);
  }

  async getMatchCallHistory(matchId, userId, options) {
    // Verify user is part of this match
    const match = await Match.findOne({
      where: {
        id: matchId,
        [Op.or]: [{ userId }, { matchedUserId: userId }],
      },
    });
    if (!match) throw new Error('Match not found');

    const result = await callRepository.findMatchCalls(matchId, options);
    return {
      calls: result.rows,
      total: result.count,
      page: parseInt(options.page) || 1,
      limit: parseInt(options.limit) || 20,
    };
  }
}

module.exports = new CallService();
