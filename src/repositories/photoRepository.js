const { UserPhoto } = require('../models');

class PhotoRepository {

    async findAllByUserId(userId) {
        return await UserPhoto.findAll({
            where: { userId },
            order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
        });
    }

    async findById(id) {
        return await UserPhoto.findByPk(id);
    }

    async findPrimary(userId) {
        return await UserPhoto.findOne({
            where: { userId, isPrimary: true },
        });
    }

    async create(data) {
        return await UserPhoto.create(data);
    }

    async bulkCreate(dataArray) {
        return await UserPhoto.bulkCreate(dataArray);
    }

    async update(id, data) {
        const photo = await UserPhoto.findByPk(id);
        if (!photo) return null;
        return await photo.update(data);
    }

    async delete(id) {
        const photo = await UserPhoto.findByPk(id);
        if (!photo) return null;
        await photo.destroy();
        return photo; // Return deleted photo so caller can delete file
    }

    async deleteAllByUserId(userId) {
        const photos = await UserPhoto.findAll({ where: { userId } });
        await UserPhoto.destroy({ where: { userId } });
        return photos; // Return all deleted photos for file cleanup
    }

    async count(userId) {
        return await UserPhoto.count({ where: { userId } });
    }

    async clearPrimary(userId) {
        return await UserPhoto.update(
            { isPrimary: false },
            { where: { userId, isPrimary: true } }
        );
    }

    async setPrimary(id, userId) {
        // Clear existing primary
        await this.clearPrimary(userId);
        // Set new primary
        return await this.update(id, { isPrimary: true });
    }
}

module.exports = new PhotoRepository();
