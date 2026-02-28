const { TopPick, User, UserPhoto } = require('../models');
const { Op } = require('sequelize');

class TopPickRepository {
    async findActiveForUser(userId) {
        return await TopPick.findAll({
            where: {
                userId,
                expiresAt: { [Op.gt]: new Date() }
            },
            include: [
                {
                    model: User,
                    as: 'PickedUser',
                    attributes: ['id', 'firstName', 'lastName', 'age', 'profilePicture', 'isOnline'],
                    include: [
                        {
                            model: UserPhoto,
                            as: 'Photos',
                            attributes: ['id', 'url', 'isPrimary'],
                            limit: 1,
                            order: [['isPrimary', 'DESC']]
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    async create(data) {
        return await TopPick.create(data);
    }

    async bulkCreate(data) {
        return await TopPick.bulkCreate(data, { ignoreDuplicates: true });
    }

    async deleteExpired() {
        return await TopPick.destroy({
            where: { expiresAt: { [Op.lt]: new Date() } }
        });
    }

    async findByUserAndPick(userId, pickedUserId) {
        return await TopPick.findOne({
            where: { userId, pickedUserId, expiresAt: { [Op.gt]: new Date() } }
        });
    }

    async count(userId) {
        return await TopPick.count({
            where: { userId, expiresAt: { [Op.gt]: new Date() } }
        });
    }
}

module.exports = new TopPickRepository();
