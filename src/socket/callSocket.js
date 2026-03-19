const jwt = require('jsonwebtoken');
const callService = require('../services/callService');

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
    socket.on('call:end', async ({ callId }) => {
      try {
        const call = await callService.endCall(callId, userId);
        const otherUserId = call.callerId === userId ? call.receiverId : call.callerId;
        io.to(`user_${otherUserId}`).emit('call_ended', {
          callId: call.id,
          duration: call.duration,
          endReason: call.endReason,
        });
      } catch (err) {
        socket.emit('call:error', { callId, message: err.message });
      }
    });

    // Handle disconnect — end any active call
    socket.on('disconnect', async () => {
      connectedUsers.delete(userId);
      console.log(`User ${userId} disconnected`);

      try {
        const activeCall = await callService.getActiveCall(userId);
        if (activeCall) {
          const call = await callService.endCall(activeCall.id, userId);
          const otherUserId = call.callerId === userId ? call.receiverId : call.callerId;
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
