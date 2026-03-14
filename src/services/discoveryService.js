const { User, UserPhoto, Badge, Match, MatchCriteria } = require('../models');
const { Op } = require('sequelize');

class DiscoveryService {

  // ── Get users for swipe screen ──────────────────────────
  async getDiscoverableUsers(userId, query = {}) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const offset = (page - 1) * limit;

    // Get current user's match criteria (preferences)
    const criteria = await MatchCriteria.findOne({ where: { userId } });
    const prefs = criteria || {
      minAge: 18,
      maxAge: 50,
      gender: 'all',
      onlineOnly: false,
      interests: []
    };

    // Get IDs to exclude: self + already liked/matched users
    const existingMatches = await Match.findAll({
      where: {
        [Op.or]: [
          { userId },
          { matchedUserId: userId }
        ]
      },
      attributes: ['userId', 'matchedUserId']
    });

    const excludeIds = new Set([userId]);
    for (const m of existingMatches) {
      excludeIds.add(m.userId);
      excludeIds.add(m.matchedUserId);
    }

    // Also exclude users who have incognito mode on
    const incognitoUsers = await MatchCriteria.findAll({
      where: { incognitoMode: true },
      attributes: ['userId']
    });
    for (const inc of incognitoUsers) {
      excludeIds.add(inc.userId);
    }

    // Build where clause
    const where = {
      id: { [Op.notIn]: Array.from(excludeIds) },
      accountStatus: 'active',
      age: { [Op.between]: [prefs.minAge, prefs.maxAge] }
    };

    // Gender filter
    if (prefs.gender && prefs.gender !== 'all') {
      where.gender = prefs.gender;
    }

    // Online-only filter
    if (prefs.onlineOnly) {
      where.isOnline = true;
    }

    // Fetch users
    const { rows: users, count: total } = await User.findAndCountAll({
      where,
      attributes: [
        'id', 'firstName', 'lastName', 'age', 'gender',
        'profilePicture', 'location', 'bio', 'interests',
        'occupation', 'education', 'isOnline', 'isPremium'
      ],
      include: [
        {
          model: UserPhoto,
          as: 'Photos',
          attributes: ['id', 'url', 'isPrimary', 'sortOrder'],
          order: [['sortOrder', 'ASC']]
        },
        {
          model: Badge,
          as: 'Badges',
          attributes: ['id', 'name', 'icon', 'color', 'isPremium'],
          through: { attributes: [] }
        }
      ],
      limit,
      offset,
      order: [['id', 'DESC']]
    });

    // Format response
    const profiles = users.map(user => {
      const images = (user.Photos || []).map(p => p.url);
      if (images.length === 0 && user.profilePicture) {
        images.push(user.profilePicture);
      }

      return {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        gender: user.gender,
        profilePicture: user.profilePicture,
        images,
        location: user.location,
        bio: user.bio,
        interests: user.interests || [],
        occupation: user.occupation,
        education: user.education,
        isOnline: user.isOnline,
        isPremium: user.isPremium,
        badges: (user.Badges || []).map(b => ({
          id: b.id,
          name: b.name,
          icon: b.icon,
          color: b.color,
          isPremium: b.isPremium
        }))
      };
    });

    return {
      profiles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // ── Update user location ────────────────────────────────
  async updateLocation(userId, location, latitude, longitude) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const updateData = {};
    if (location) updateData.location = location;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;

    if (Object.keys(updateData).length === 0) {
      throw new Error('At least location, latitude, or longitude is required');
    }

    await user.update(updateData);
    return {
      location: user.location,
      latitude: user.latitude,
      longitude: user.longitude
    };
  }

  // ── Get discovery settings ──────────────────────────────
  async getDiscoverySettings(userId) {
    const criteria = await MatchCriteria.findOne({ where: { userId } });

    if (!criteria) {
      return {
        minAge: 18,
        maxAge: 50,
        maxDistance: 50,
        gender: 'all',
        interests: [],
        onlineOnly: false,
        incognitoMode: false
      };
    }

    return {
      minAge: criteria.minAge,
      maxAge: criteria.maxAge,
      maxDistance: criteria.maxDistance,
      gender: criteria.gender,
      interests: criteria.interests || [],
      onlineOnly: criteria.onlineOnly,
      incognitoMode: criteria.incognitoMode
    };
  }

  // ── Update discovery settings ───────────────────────────
  async updateDiscoverySettings(userId, settings) {
    const allowedFields = ['minAge', 'maxAge', 'maxDistance', 'gender', 'interests', 'onlineOnly', 'incognitoMode'];
    const updateData = {};

    for (const field of allowedFields) {
      if (settings[field] !== undefined) {
        updateData[field] = settings[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid settings provided');
    }

    // Validate age range
    if (updateData.minAge && updateData.maxAge && updateData.minAge > updateData.maxAge) {
      throw new Error('minAge cannot be greater than maxAge');
    }

    const existing = await MatchCriteria.findOne({ where: { userId } });
    if (existing) {
      await existing.update(updateData);
      return existing;
    }

    return await MatchCriteria.create({ userId, ...updateData });
  }
}

module.exports = new DiscoveryService();
