const { Match, User, UserPhoto } = require('../models');
const { Op } = require('sequelize');

class SwipeService {

  // ── Get swipe history ───────────────────────────────────
  async getSwipeHistory(userId, query = {}) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const offset = (page - 1) * limit;

    // Build filter
    const where = {
      [Op.or]: [
        { userId },
        { matchedUserId: userId }
      ]
    };

    // Optional status filter
    if (query.status) {
      where.status = query.status;
    }

    // Optional direction filter: 'sent' or 'received'
    if (query.direction === 'sent') {
      delete where[Op.or];
      where.userId = userId;
    } else if (query.direction === 'received') {
      delete where[Op.or];
      where.matchedUserId = userId;
    }

    const { rows: swipes, count: total } = await Match.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'Initiator',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'age', 'location', 'isOnline'],
          include: [
            { model: UserPhoto, as: 'Photos', attributes: ['id', 'url', 'isPrimary', 'sortOrder'] }
          ]
        },
        {
          model: User,
          as: 'MatchedUser',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'age', 'location', 'isOnline'],
          include: [
            { model: UserPhoto, as: 'Photos', attributes: ['id', 'url', 'isPrimary', 'sortOrder'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    const history = swipes.map(swipe => {
      const isSent = swipe.userId === userId;
      const otherUser = isSent ? swipe.MatchedUser : swipe.Initiator;

      const images = (otherUser.Photos || []).map(p => p.url);
      if (images.length === 0 && otherUser.profilePicture) {
        images.push(otherUser.profilePicture);
      }

      return {
        matchId: swipe.id,
        direction: isSent ? 'sent' : 'received',
        status: swipe.status,
        isSuperLike: swipe.isSuperLike || false,
        matchedAt: swipe.matchedAt,
        createdAt: swipe.createdAt,
        user: {
          userId: otherUser.id,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          age: otherUser.age,
          profilePicture: otherUser.profilePicture,
          images,
          location: otherUser.location,
          isOnline: otherUser.isOnline
        }
      };
    });

    return {
      history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = new SwipeService();
