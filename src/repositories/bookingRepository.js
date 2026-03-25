const { Op } = require('sequelize');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');

const userAttributes = ['id', 'firstName', 'lastName', 'profilePicture'];

class BookingRepository {
  async create(data) {
    return await Booking.create(data);
  }

  async findById(id) {
    return await Booking.findByPk(id, {
      include: [
        { model: User, as: 'Requester', attributes: userAttributes },
        { model: User, as: 'Receiver', attributes: userAttributes },
      ],
    });
  }

  async update(id, data) {
    const booking = await Booking.findByPk(id);
    if (!booking) return null;
    return await booking.update(data);
  }

  async findUserBookings(userId, { page = 1, limit = 20, status, type } = {}) {
    const where = {};

    if (type === 'sent') {
      where.requesterId = userId;
    } else if (type === 'received') {
      where.receiverId = userId;
    } else {
      where[Op.or] = [{ requesterId: userId }, { receiverId: userId }];
    }

    if (status) where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    return await Booking.findAndCountAll({
      where,
      include: [
        { model: User, as: 'Requester', attributes: userAttributes },
        { model: User, as: 'Receiver', attributes: userAttributes },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
  }

  async findPendingBetweenUsers(requesterId, receiverId) {
    return await Booking.findOne({
      where: {
        requesterId,
        receiverId,
        status: 'pending',
      },
    });
  }
}

module.exports = new BookingRepository();
