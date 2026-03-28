const jwt = require('jsonwebtoken');
const callService = require('../services/callService');
const walletService = require('../services/walletService');
const bookingService = require('../services/bookingService');
const { User, Message, Match } = require('../models');
const { Op } = require('sequelize');

// Track connected users: userId -> socketId
const connectedUsers = new Map();

function setupSocketHandlers(io) {
  // Authenticate socket connections via JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    connectedUsers.set(userId, socket.id);

    // Join user's personal room for targeted events
    socket.join(`user_${userId}`);
    console.log(`User ${userId} connected (socket: ${socket.id})`);

    // ─── Update DB isOnline = true ───
    try {
      await User.update({ isOnline: true }, { where: { id: userId } });
    } catch (err) {
      console.error('Failed to set user online:', err.message);
    }

    // ─── Call Initiation via Socket ───

    // Caller initiates a call (creates DB record + notifies receiver)
    socket.on('call:initiate', async (data, ack) => {
      try {
        const { receiverId, callType, matchId } = data || {};
        console.log(`[call:initiate] caller=${userId}, data=`, JSON.stringify(data));
        console.log(`[call:initiate] connectedUsers=`, [...connectedUsers.keys()]);

        if (!receiverId || !callType) {
          const err = { success: false, message: 'receiverId and callType are required' };
          socket.emit('call:error', err);
          if (typeof ack === 'function') ack(err);
          return;
        }
        if (!['voice', 'video'].includes(callType)) {
          const err = { success: false, message: 'callType must be voice or video' };
          socket.emit('call:error', err);
          if (typeof ack === 'function') ack(err);
          return;
        }

        // Check wallet balance
        const canCall = await walletService.canCall(userId, callType);
        if (!canCall) {
          const err = { success: false, message: 'Insufficient wallet balance for call' };
          console.log(`[call:initiate] wallet check failed for user ${userId}`);
          socket.emit('call:error', err);
          if (typeof ack === 'function') ack(err);
          return;
        }

        // Check receiver is connected (compare as numbers for type safety)
        const receiverIdNum = parseInt(receiverId);
        const isReceiverOnline = [...connectedUsers.keys()].some(k => parseInt(k) === receiverIdNum);
        if (!isReceiverOnline) {
          const err = { success: false, message: `User ${receiverId} is offline. Connected users: [${[...connectedUsers.keys()].join(', ')}]` };
          console.log(`[call:initiate] receiver ${receiverId} offline`);
          socket.emit('call:error', err);
          if (typeof ack === 'function') ack(err);
          return;
        }

        const result = await callService.initiateCall(userId, receiverId, matchId || null, callType);

        if (result.busy) {
          const busyData = {
            success: false,
            callId: result.call.id,
            receiverId,
            message: 'User is busy on another call'
          };
          socket.emit('call:busy', busyData);
          if (typeof ack === 'function') ack(busyData);
          return;
        }

        const initiatedData = {
          success: true,
          callId: result.call.id,
          receiverId,
          callType,
        };

        // Notify caller of success
        socket.emit('call:initiated', initiatedData);

        // Notify receiver of incoming call
        io.to(`user_${receiverId}`).emit('call:incoming', {
          callId: result.call.id,
          callerId: userId,
          callType,
        });

        if (typeof ack === 'function') ack(initiatedData);
      } catch (err) {
        const errData = { success: false, message: err.message };
        socket.emit('call:error', errData);
        if (typeof ack === 'function') ack(errData);
      }
    });

    // Receiver accepts the call
    socket.on('call:accept', async (data, ack) => {
      try {
        const { callId } = data || {};
        console.log(`[call:accept] user=${userId}, callId=${callId}`);
        const call = await callService.answerCall(callId, userId);
        console.log(`[call:accept] call answered, callerId=${call.callerId}, receiverId=${call.receiverId}`);
        const acceptedData = {
          success: true,
          callId: call.id,
          callType: call.callType,
          callerId: call.callerId,
          receiverId: call.receiverId,
          status: 'ongoing',
        };

        // Notify caller that call is accepted
        io.to(`user_${call.callerId}`).emit('call:accepted', acceptedData);
        // Notify receiver too (current socket)
        socket.emit('call:accepted', acceptedData);
        // Always send ack so Postman shows the response
        if (typeof ack === 'function') ack(acceptedData);
      } catch (err) {
        console.error(`[call:accept] error:`, err.message);
        const errData = { success: false, message: err.message };
        socket.emit('call:error', errData);
        if (typeof ack === 'function') ack(errData);
      }
    });

    // Receiver rejects the call
    socket.on('call:reject', async (data, ack) => {
      try {
        const { callId } = data || {};
        const call = await callService.rejectCall(callId, userId);
        const rejectedData = {
          success: true,
          callId: call.id,
          status: 'rejected',
        };

        io.to(`user_${call.callerId}`).emit('call:rejected', {
          callId: call.id,
          receiverId: userId,
        });

        if (typeof ack === 'function') ack(rejectedData);
      } catch (err) {
        const errData = { success: false, message: err.message };
        socket.emit('call:error', errData);
        if (typeof ack === 'function') ack(errData);
      }
    });

    // ─── WebRTC Signaling ───

    // Caller sends offer to receiver
    socket.on('call:offer', ({ callId, receiverId, offer }) => {
      io.to(`user_${receiverId}`).emit('call:offer', {
        callId,
        callerId: userId,
        offer,
      });
    });

    // Receiver sends answer back to caller
    socket.on('call:answer', ({ callId, callerId, answer }) => {
      io.to(`user_${callerId}`).emit('call:answer', {
        callId,
        receiverId: userId,
        answer,
      });
    });

    // ICE candidate exchange (both directions)
    socket.on('call:ice-candidate', ({ callId, targetUserId, candidate }) => {
      io.to(`user_${targetUserId}`).emit('call:ice-candidate', {
        callId,
        fromUserId: userId,
        candidate,
      });
    });

    // Toggle audio/video during call
    socket.on('call:toggle-media', ({ callId, targetUserId, mediaType, enabled }) => {
      io.to(`user_${targetUserId}`).emit('call:toggle-media', {
        callId,
        fromUserId: userId,
        mediaType, // 'audio' or 'video'
        enabled,
      });
    });

    // Call ended via socket (backup for REST endpoint)
    socket.on('call:end', async (data, ack) => {
      try {
        const { callId } = data || {};
        const call = await callService.endCall(callId, userId);
        const otherUserId = call.callerId === userId ? call.receiverId : call.callerId;

        // Deduct wallet for call duration (caller pays)
        if (call.duration > 0) {
          const durationMinutes = call.duration / 60;
          try {
            if (call.callType === 'video') {
              await walletService.deductForVideoCall(call.callerId, call.receiverId, durationMinutes);
            } else {
              await walletService.deductForVoiceCall(call.callerId, call.receiverId, durationMinutes);
            }
          } catch (walletErr) {
            // Log but don't fail the call end
            console.error('Wallet deduction failed:', walletErr.message);
          }
        }

        const endedData = {
          success: true,
          callId: call.id,
          duration: call.duration,
          endReason: call.endReason,
        };

        io.to(`user_${otherUserId}`).emit('call_ended', endedData);
        socket.emit('call_ended', endedData);

        if (typeof ack === 'function') ack(endedData);
      } catch (err) {
        const errData = { success: false, message: err.message };
        socket.emit('call:error', errData);
        if (typeof ack === 'function') ack(errData);
      }
    });

    // ─── Booking System (Online Users) ───

    // User sends a booking request
    socket.on('booking:request', async (data, ack) => {
      try {
        const { receiverId, bookingDate, bookingTime, purpose, note } = data || {};
        console.log(`[booking:request] requester=${userId}, data=`, JSON.stringify(data));

        if (!receiverId || !bookingDate || !bookingTime || !purpose) {
          const err = { success: false, message: 'receiverId, bookingDate, bookingTime, and purpose are required' };
          socket.emit('booking:error', err);
          if (typeof ack === 'function') ack(err);
          return;
        }

        const booking = await bookingService.createBooking(userId, receiverId, {
          bookingDate,
          bookingTime,
          purpose,
          note,
        });

        const requestData = {
          success: true,
          bookingId: booking.id,
          receiverId: booking.receiverId,
          bookingDate: booking.bookingDate,
          bookingTime: booking.bookingTime,
          purpose: booking.purpose,
          status: booking.status,
        };

        // Notify requester
        socket.emit('booking:requested', requestData);

        // Notify receiver about new booking request
        io.to(`user_${receiverId}`).emit('booking:new_request', {
          bookingId: booking.id,
          requester: booking.Requester,
          bookingDate: booking.bookingDate,
          bookingTime: booking.bookingTime,
          purpose: booking.purpose,
          note: booking.note,
        });

        if (typeof ack === 'function') ack(requestData);
      } catch (err) {
        const errData = { success: false, message: err.message };
        socket.emit('booking:error', errData);
        if (typeof ack === 'function') ack(errData);
      }
    });

    // Receiver accepts a booking
    socket.on('booking:accept', async (data, ack) => {
      try {
        const { bookingId } = data || {};
        console.log(`[booking:accept] user=${userId}, bookingId=${bookingId}`);

        const booking = await bookingService.acceptBooking(bookingId, userId);

        const acceptedData = {
          success: true,
          bookingId: booking.id,
          status: 'accepted',
          bookingDate: booking.bookingDate,
          bookingTime: booking.bookingTime,
          purpose: booking.purpose,
        };

        // Notify requester that booking is accepted
        io.to(`user_${booking.requesterId}`).emit('booking:accepted', {
          bookingId: booking.id,
          receiver: booking.Receiver,
          bookingDate: booking.bookingDate,
          bookingTime: booking.bookingTime,
          purpose: booking.purpose,
        });

        socket.emit('booking:accepted', acceptedData);
        if (typeof ack === 'function') ack(acceptedData);
      } catch (err) {
        const errData = { success: false, message: err.message };
        socket.emit('booking:error', errData);
        if (typeof ack === 'function') ack(errData);
      }
    });

    // Receiver rejects a booking
    socket.on('booking:reject', async (data, ack) => {
      try {
        const { bookingId, rejectionReason } = data || {};
        console.log(`[booking:reject] user=${userId}, bookingId=${bookingId}`);

        const booking = await bookingService.rejectBooking(bookingId, userId, rejectionReason);

        const rejectedData = {
          success: true,
          bookingId: booking.id,
          status: 'rejected',
        };

        // Notify requester that booking is rejected
        io.to(`user_${booking.requesterId}`).emit('booking:rejected', {
          bookingId: booking.id,
          receiver: booking.Receiver,
          rejectionReason: booking.rejectionReason,
        });

        if (typeof ack === 'function') ack(rejectedData);
      } catch (err) {
        const errData = { success: false, message: err.message };
        socket.emit('booking:error', errData);
        if (typeof ack === 'function') ack(errData);
      }
    });

    // ─── Random Chat (Online Users) ───

    // Send a message in random chat (real-time delivery)
    socket.on('random-chat:message', async ({ chatId, text, receiverId }) => {
      // Emit to receiver in real-time
      io.to(`user_${receiverId}`).emit('random-chat:message', {
        chatId,
        senderId: userId,
        text,
        sentAt: new Date().toISOString(),
      });
    });

    // Typing indicator for random chat
    socket.on('random-chat:typing', ({ chatId, receiverId }) => {
      io.to(`user_${receiverId}`).emit('random-chat:typing', {
        chatId,
        userId,
      });
    });

    // Stop typing indicator
    socket.on('random-chat:stop-typing', ({ chatId, receiverId }) => {
      io.to(`user_${receiverId}`).emit('random-chat:stop-typing', {
        chatId,
        userId,
      });
    });

    // Message read acknowledgement
    socket.on('random-chat:read', ({ chatId, receiverId }) => {
      io.to(`user_${receiverId}`).emit('random-chat:read', {
        chatId,
        readBy: userId,
      });
    });

    // ─── Match Messaging via Socket ───

    // Send text message in a match conversation
    socket.on('message:send', async (data, ack) => {
      try {
        const { matchId, text, messageType = 'text', mediaUrl = null, replyToId = null } = data || {};
        if (!matchId || (!text && !mediaUrl)) {
          const err = { success: false, message: 'matchId and text (or mediaUrl) are required' };
          if (typeof ack === 'function') ack(err);
          return;
        }

        // Verify user belongs to match
        const match = await Match.findOne({
          where: { id: matchId, [Op.or]: [{ userId }, { matchedUserId: userId }] }
        });
        if (!match || match.status === 'blocked') {
          const err = { success: false, message: 'Match not found or blocked' };
          if (typeof ack === 'function') ack(err);
          return;
        }

        // Create message in DB
        const message = await Message.create({
          matchId, senderId: userId, text: text || null,
          messageType, mediaUrl, replyToId,
        });

        const msgData = {
          id: message.id, matchId, senderId: userId, text: message.text,
          messageType: message.messageType, mediaUrl: message.mediaUrl,
          replyToId: message.replyToId, sentAt: message.sentAt,
          isRead: false, isDelivered: false,
        };

        // Determine the other user
        const otherId = match.userId === userId ? match.matchedUserId : match.userId;

        // Send to recipient in real-time
        io.to(`user_${otherId}`).emit('message:new', msgData);

        // Auto-mark as delivered if recipient is connected
        if (connectedUsers.has(otherId) || connectedUsers.has(String(otherId))) {
          await Message.update({ isDelivered: true, deliveredAt: new Date() }, { where: { id: message.id } });
          socket.emit('message:delivered', { messageId: message.id, matchId });
        }

        if (typeof ack === 'function') ack({ success: true, message: msgData });
      } catch (err) {
        if (typeof ack === 'function') ack({ success: false, message: err.message });
      }
    });

    // Mark messages as read and notify the sender in real-time
    socket.on('message:read', async (data, ack) => {
      try {
        const { matchId } = data || {};
        if (!matchId) {
          if (typeof ack === 'function') ack({ success: false, message: 'matchId is required' });
          return;
        }

        const match = await Match.findOne({
          where: { id: matchId, [Op.or]: [{ userId }, { matchedUserId: userId }] }
        });
        if (!match) {
          if (typeof ack === 'function') ack({ success: false, message: 'Match not found' });
          return;
        }

        // Mark all messages from the OTHER user as read
        const [count] = await Message.update(
          { isRead: true, readAt: new Date() },
          { where: { matchId, senderId: { [Op.ne]: userId }, isRead: false } }
        );

        // Notify the sender that their messages were read
        const otherId = match.userId === userId ? match.matchedUserId : match.userId;
        io.to(`user_${otherId}`).emit('message:seen', { matchId, readBy: userId, count, readAt: new Date() });

        if (typeof ack === 'function') ack({ success: true, markedRead: count });
      } catch (err) {
        if (typeof ack === 'function') ack({ success: false, message: err.message });
      }
    });

    // Typing indicator for match conversations
    socket.on('message:typing', async ({ matchId }) => {
      try {
        const match = await Match.findOne({
          where: { id: matchId, [Op.or]: [{ userId }, { matchedUserId: userId }] }
        });
        if (!match) return;
        const otherId = match.userId === userId ? match.matchedUserId : match.userId;
        io.to(`user_${otherId}`).emit('message:typing', { matchId, userId });
      } catch (err) { /* ignore */ }
    });

    // Stop typing for match conversations
    socket.on('message:stop-typing', async ({ matchId }) => {
      try {
        const match = await Match.findOne({
          where: { id: matchId, [Op.or]: [{ userId }, { matchedUserId: userId }] }
        });
        if (!match) return;
        const otherId = match.userId === userId ? match.matchedUserId : match.userId;
        io.to(`user_${otherId}`).emit('message:stop-typing', { matchId, userId });
      } catch (err) { /* ignore */ }
    });

    // Check if a specific user is online
    socket.on('user:check-online', (data, ack) => {
      const { targetUserId } = data || {};
      const isOnline = connectedUsers.has(targetUserId) || connectedUsers.has(String(targetUserId)) || [...connectedUsers.keys()].some(k => parseInt(k) === parseInt(targetUserId));
      if (typeof ack === 'function') ack({ userId: targetUserId, isOnline });
    });

    // Broadcast online status to connected users
    io.emit('user:online', { userId });


    // Handle disconnect — end any active call
    socket.on('disconnect', async () => {
      connectedUsers.delete(userId);
      io.emit('user:offline', { userId });
      console.log(`User ${userId} disconnected`);

      // ─── Update DB isOnline = false, lastSeen ───
      try {
        await User.update({ isOnline: false, lastSeen: new Date() }, { where: { id: userId } });
      } catch (err) {
        console.error('Failed to set user offline:', err.message);
      }

      try {
        const activeCall = await callService.getActiveCall(userId);
        if (activeCall) {
          const call = await callService.endCall(activeCall.id, userId);
          const otherUserId = call.callerId === userId ? call.receiverId : call.callerId;

          // Deduct wallet for call duration (caller pays)
          if (call.duration > 0) {
            const durationMinutes = call.duration / 60;
            try {
              if (call.callType === 'video') {
                await walletService.deductForVideoCall(call.callerId, call.receiverId, durationMinutes);
              } else {
                await walletService.deductForVoiceCall(call.callerId, call.receiverId, durationMinutes);
              }
            } catch (walletErr) {
              console.error('Wallet deduction on disconnect failed:', walletErr.message);
            }
          }

          io.to(`user_${otherUserId}`).emit('call_ended', {
            callId: call.id,
            duration: call.duration,
            endReason: 'network_error',
          });
        }
      } catch (err) {
        // Silently handle — user disconnected
      }
    });
  });
}

module.exports = { setupSocketHandlers, connectedUsers };
