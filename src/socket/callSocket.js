const jwt = require('jsonwebtoken');
const callService = require('../services/callService');
const walletService = require('../services/walletService');

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

  io.on('connection', (socket) => {
    const userId = socket.userId;
    connectedUsers.set(userId, socket.id);

    // Join user's personal room for targeted events
    socket.join(`user_${userId}`);
    console.log(`User ${userId} connected (socket: ${socket.id})`);

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
        const call = await callService.answerCall(callId, userId);
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
        // Notify receiver too
        socket.emit('call:accepted', acceptedData);

        if (typeof ack === 'function') ack(acceptedData);
      } catch (err) {
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

    // Broadcast online status to connected users
    io.emit('user:online', { userId });


    // Handle disconnect — end any active call
    socket.on('disconnect', async () => {
      connectedUsers.delete(userId);
      io.emit('user:offline', { userId });
      console.log(`User ${userId} disconnected`);

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
