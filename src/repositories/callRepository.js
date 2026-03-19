const { Op } = require('sequelize');
const Call = require('../models/callModel');
const User = require('../models/userModel');

class CallRepository {
  async create(data) {
    return await Call.create(data);
  }

  async findById(id) {
    return await Call.findByPk(id, {
      include: [
        { model: User, as: 'Caller', attributes: ['id', 'firstName', 'lastName', 'profilePicture'] },
        { model: User, as: 'Receiver', attributes: ['id', 'firstName', 'lastName', 'profilePicture'] },
      ],
    });
  }

  async update(id, data) {
    const call = await Call.findByPk(id);
    if (!call) return null;
    return await call.update(data);
  }

  async findCallHistory(userId, { page = 1, limit = 20, callType } = {}) {
    const where = {
      [Op.or]: [{ callerId: userId }, { receiverId: userId }],
    };
    if (callType) where.callType = callType;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    return await Call.findAndCountAll({
      where,
      include: [
        { model: User, as: 'Caller', attributes: ['id', 'firstName', 'lastName', 'profilePicture'] },
        { model: User, as: 'Receiver', attributes: ['id', 'firstName', 'lastName', 'profilePicture'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
  }

  async findActiveCall(userId) {
    return await Call.findOne({
      where: {
        [Op.or]: [{ callerId: userId }, { receiverId: userId }],
        status: { [Op.in]: ['ringing', 'ongoing'] },
      },
    });
  }

  async findMatchCalls(matchId, { page = 1, limit = 20 } = {}) {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    return await Call.findAndCountAll({
      where: { matchId },
      include: [
        { model: User, as: 'Caller', attributes: ['id', 'firstName', 'lastName', 'profilePicture'] },
        { model: User, as: 'Receiver', attributes: ['id', 'firstName', 'lastName', 'profilePicture'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
  }
}

module.exports = new CallRepository();
