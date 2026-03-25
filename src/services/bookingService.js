const bookingRepository = require('../repositories/bookingRepository');
const User = require('../models/userModel');

class BookingService {
  async createBooking(requesterId, receiverId, { bookingDate, bookingTime, purpose, note }) {
    if (requesterId === receiverId) {
      throw new Error('You cannot book yourself');
    }

    // Check receiver exists
    const receiver = await User.findByPk(receiverId);
    if (!receiver) throw new Error('Receiver user not found');

    // Check no pending booking already exists between these users
    const existingPending = await bookingRepository.findPendingBetweenUsers(requesterId, receiverId);
    if (existingPending) {
      throw new Error('You already have a pending booking request with this user');
    }

    const booking = await bookingRepository.create({
      requesterId,
      receiverId,
      bookingDate,
      bookingTime,
      purpose,
      note: note || null,
      status: 'pending',
    });

    return await bookingRepository.findById(booking.id);
  }

  async acceptBooking(bookingId, userId) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error('Booking not found');
    if (booking.receiverId !== userId) throw new Error('Only the receiver can accept this booking');
    if (booking.status !== 'pending') throw new Error('Booking is not pending');

    await bookingRepository.update(bookingId, {
      status: 'accepted',
      respondedAt: new Date(),
    });

    return await bookingRepository.findById(bookingId);
  }

  async rejectBooking(bookingId, userId, rejectionReason) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error('Booking not found');
    if (booking.receiverId !== userId) throw new Error('Only the receiver can reject this booking');
    if (booking.status !== 'pending') throw new Error('Booking is not pending');

    await bookingRepository.update(bookingId, {
      status: 'rejected',
      respondedAt: new Date(),
      rejectionReason: rejectionReason || null,
    });

    return await bookingRepository.findById(bookingId);
  }

  async cancelBooking(bookingId, userId) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error('Booking not found');
    if (booking.requesterId !== userId) throw new Error('Only the requester can cancel this booking');
    if (!['pending', 'accepted'].includes(booking.status)) {
      throw new Error('Booking cannot be cancelled in its current state');
    }

    await bookingRepository.update(bookingId, {
      status: 'cancelled',
    });

    return await bookingRepository.findById(bookingId);
  }

  async completeBooking(bookingId, userId) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error('Booking not found');
    if (booking.requesterId !== userId && booking.receiverId !== userId) {
      throw new Error('You are not a participant in this booking');
    }
    if (booking.status !== 'accepted') throw new Error('Only accepted bookings can be completed');

    await bookingRepository.update(bookingId, {
      status: 'completed',
    });

    return await bookingRepository.findById(bookingId);
  }

  async getBookings(userId, options) {
    const result = await bookingRepository.findUserBookings(userId, options);
    return {
      bookings: result.rows,
      total: result.count,
      page: parseInt(options.page) || 1,
      limit: parseInt(options.limit) || 20,
    };
  }

  async getBookingById(bookingId, userId) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error('Booking not found');
    if (booking.requesterId !== userId && booking.receiverId !== userId) {
      throw new Error('You are not a participant in this booking');
    }
    return booking;
  }
}

module.exports = new BookingService();
