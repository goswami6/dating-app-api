const bookingService = require('../services/bookingService');
const apiResponse = require('../utils/apiResponse');

class BookingController {
  async createBooking(req, res) {
    try {
      const requesterId = req.user.id;
      const { receiverId, bookingDate, bookingTime, purpose, note } = req.body;

      if (!receiverId || !bookingDate || !bookingTime || !purpose) {
        return apiResponse.error(res, 'receiverId, bookingDate, bookingTime, and purpose are required', 400);
      }

      const booking = await bookingService.createBooking(requesterId, receiverId, {
        bookingDate,
        bookingTime,
        purpose,
        note,
      });

      // Emit socket event to receiver
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${receiverId}`).emit('booking:new_request', {
          bookingId: booking.id,
          requester: booking.Requester,
          bookingDate,
          bookingTime,
          purpose,
        });
      }

      return apiResponse.success(res, 'Booking request sent', { booking }, 201);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  async acceptBooking(req, res) {
    try {
      const userId = req.user.id;
      const bookingId = parseInt(req.params.bookingId);

      const booking = await bookingService.acceptBooking(bookingId, userId);

      const io = req.app.get('io');
      if (io) {
        io.to(`user_${booking.requesterId}`).emit('booking:accepted', {
          bookingId: booking.id,
          receiver: booking.Receiver,
          bookingDate: booking.bookingDate,
          bookingTime: booking.bookingTime,
          purpose: booking.purpose,
        });
      }

      return apiResponse.success(res, 'Booking accepted', { booking });
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  async rejectBooking(req, res) {
    try {
      const userId = req.user.id;
      const bookingId = parseInt(req.params.bookingId);
      const { rejectionReason } = req.body;

      const booking = await bookingService.rejectBooking(bookingId, userId, rejectionReason);

      const io = req.app.get('io');
      if (io) {
        io.to(`user_${booking.requesterId}`).emit('booking:rejected', {
          bookingId: booking.id,
          receiver: booking.Receiver,
          rejectionReason: booking.rejectionReason,
        });
      }

      return apiResponse.success(res, 'Booking rejected', { booking });
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  async cancelBooking(req, res) {
    try {
      const userId = req.user.id;
      const bookingId = parseInt(req.params.bookingId);

      const booking = await bookingService.cancelBooking(bookingId, userId);

      const io = req.app.get('io');
      if (io) {
        io.to(`user_${booking.receiverId}`).emit('booking:cancelled', {
          bookingId: booking.id,
          requester: booking.Requester,
        });
      }

      return apiResponse.success(res, 'Booking cancelled', { booking });
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  async completeBooking(req, res) {
    try {
      const userId = req.user.id;
      const bookingId = parseInt(req.params.bookingId);

      const booking = await bookingService.completeBooking(bookingId, userId);

      const io = req.app.get('io');
      if (io) {
        const otherUserId = booking.requesterId === userId ? booking.receiverId : booking.requesterId;
        io.to(`user_${otherUserId}`).emit('booking:completed', {
          bookingId: booking.id,
        });
      }

      return apiResponse.success(res, 'Booking completed', { booking });
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  async getBookings(req, res) {
    try {
      const userId = req.user.id;
      const { page, limit, status, type } = req.query;
      const result = await bookingService.getBookings(userId, { page, limit, status, type });
      return apiResponse.success(res, 'Bookings retrieved', result);
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }

  async getBookingById(req, res) {
    try {
      const userId = req.user.id;
      const bookingId = parseInt(req.params.bookingId);
      const booking = await bookingService.getBookingById(bookingId, userId);
      return apiResponse.success(res, 'Booking details retrieved', { booking });
    } catch (error) {
      return apiResponse.error(res, error.message, 404);
    }
  }
}

module.exports = new BookingController();
