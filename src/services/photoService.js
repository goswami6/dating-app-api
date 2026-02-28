const photoRepository = require('../repositories/photoRepository');
const userRepository = require('../repositories/userRepository');
const fs = require('fs');
const path = require('path');

const MAX_PHOTOS_PER_USER = 10;

class PhotoService {

    // ── Get all photos for a user ───────────────────────────
    async getPhotosByUserId(userId) {
        const user = await userRepository.findById(userId);
        if (!user) throw new Error('User not found');
        return await photoRepository.findAllByUserId(userId);
    }

    // ── Get single photo ────────────────────────────────────
    async getPhotoById(photoId) {
        const photo = await photoRepository.findById(photoId);
        if (!photo) throw new Error('Photo not found');
        return photo;
    }

    // ── Upload single photo ─────────────────────────────────
    async addPhoto(userId, filePath, { isPrimary = false, caption = null, sortOrder = 0 } = {}) {
        const user = await userRepository.findById(userId);
        if (!user) throw new Error('User not found');

        // Check photo limit
        const currentCount = await photoRepository.count(userId);
        if (currentCount >= MAX_PHOTOS_PER_USER) {
            throw new Error(`Maximum ${MAX_PHOTOS_PER_USER} photos allowed per user`);
        }

        // If setting as primary, clear existing primary
        if (isPrimary) {
            await photoRepository.clearPrimary(userId);
        }

        // If this is the first photo, auto-set as primary
        if (currentCount === 0) {
            isPrimary = true;
        }

        const photo = await photoRepository.create({
            userId,
            url: filePath,
            isPrimary,
            caption,
            sortOrder,
        });

        // Also update user's profilePicture if this is primary
        if (isPrimary) {
            await userRepository.update(userId, { profilePicture: filePath });
        }

        return photo;
    }

    // ── Upload multiple photos ──────────────────────────────
    async addMultiplePhotos(userId, files, options = {}) {
        const user = await userRepository.findById(userId);
        if (!user) throw new Error('User not found');

        const currentCount = await photoRepository.count(userId);
        if (currentCount + files.length > MAX_PHOTOS_PER_USER) {
            throw new Error(`Cannot upload ${files.length} photos. You have ${currentCount}/${MAX_PHOTOS_PER_USER} photos. Max ${MAX_PHOTOS_PER_USER - currentCount} more allowed.`);
        }

        const isFirstUpload = currentCount === 0;
        const photos = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const filePath = `/uploads/gallery/${file.filename}`;
            const isPrimary = isFirstUpload && i === 0; // First photo of first upload becomes primary

            const photo = await photoRepository.create({
                userId,
                url: filePath,
                isPrimary,
                caption: null,
                sortOrder: currentCount + i,
            });

            if (isPrimary) {
                await userRepository.update(userId, { profilePicture: filePath });
            }

            photos.push(photo);
        }

        return photos;
    }

    // ── Set a photo as primary ──────────────────────────────
    async setPrimary(photoId, userId) {
        const photo = await photoRepository.findById(photoId);
        if (!photo) throw new Error('Photo not found');
        if (photo.userId !== userId) throw new Error('Photo does not belong to this user');

        const updated = await photoRepository.setPrimary(photoId, userId);

        // Update user's profilePicture
        await userRepository.update(userId, { profilePicture: photo.url });

        return updated;
    }

    // ── Update photo caption/order ──────────────────────────
    async updatePhoto(photoId, userId, data) {
        const photo = await photoRepository.findById(photoId);
        if (!photo) throw new Error('Photo not found');
        if (photo.userId !== userId) throw new Error('Photo does not belong to this user');

        // Only allow updating caption and sortOrder
        const allowedUpdates = {};
        if (data.caption !== undefined) allowedUpdates.caption = data.caption;
        if (data.sortOrder !== undefined) allowedUpdates.sortOrder = data.sortOrder;

        return await photoRepository.update(photoId, allowedUpdates);
    }

    // ── Delete a photo ──────────────────────────────────────
    async deletePhoto(photoId, userId) {
        const photo = await photoRepository.findById(photoId);
        if (!photo) throw new Error('Photo not found');
        if (photo.userId !== userId) throw new Error('Photo does not belong to this user');

        // Delete file from disk
        this._deleteFile(photo.url);

        const wasPrimary = photo.isPrimary;
        await photoRepository.delete(photoId);

        // If deleted photo was primary, set next photo as primary
        if (wasPrimary) {
            const remaining = await photoRepository.findAllByUserId(userId);
            if (remaining.length > 0) {
                await photoRepository.setPrimary(remaining[0].id, userId);
                await userRepository.update(userId, { profilePicture: remaining[0].url });
            } else {
                await userRepository.update(userId, { profilePicture: null });
            }
        }

        return { message: 'Photo deleted successfully' };
    }

    // ── Delete all photos for user ──────────────────────────
    async deleteAllPhotos(userId) {
        const photos = await photoRepository.deleteAllByUserId(userId);
        photos.forEach(photo => this._deleteFile(photo.url));
        await userRepository.update(userId, { profilePicture: null });
        return { message: `${photos.length} photo(s) deleted` };
    }

    // ── Helper: delete file from disk ───────────────────────
    _deleteFile(fileUrl) {
        try {
            const filePath = path.join(__dirname, '../../', fileUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (err) {
            console.error('⚠️  Failed to delete file:', fileUrl, err.message);
        }
    }
}

module.exports = new PhotoService();
