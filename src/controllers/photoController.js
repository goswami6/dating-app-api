const photoService = require('../services/photoService');
const apiResponse = require('../utils/apiResponse');

class PhotoController {

    // GET /api/users/:id/photos
    async getPhotos(req, res) {
        try {
            const photos = await photoService.getPhotosByUserId(parseInt(req.params.id));
            return apiResponse.success(res, 'Photos retrieved successfully', photos);
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }

    // POST /api/users/:id/photos — upload single photo
    async uploadPhoto(req, res) {
        try {
            if (!req.file) {
                return apiResponse.error(res, 'No file uploaded. Please upload an image (jpeg, png, gif, webp).', 400);
            }

            const userId = parseInt(req.params.id);
            const filePath = `/uploads/gallery/${req.file.filename}`;
            const { isPrimary, caption, sortOrder } = req.body;

            const photo = await photoService.addPhoto(userId, filePath, {
                isPrimary: isPrimary === 'true' || isPrimary === true,
                caption: caption || null,
                sortOrder: sortOrder ? parseInt(sortOrder) : 0,
            });

            return apiResponse.success(res, 'Photo uploaded successfully', photo, 201);
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }

    // POST /api/users/:id/photos/bulk — upload multiple photos
    async uploadMultiplePhotos(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                return apiResponse.error(res, 'No files uploaded. Please upload at least one image.', 400);
            }

            const userId = parseInt(req.params.id);
            const photos = await photoService.addMultiplePhotos(userId, req.files);

            return apiResponse.success(res, `${photos.length} photo(s) uploaded successfully`, photos, 201);
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }

    // PATCH /api/users/:id/photos/:photoId/primary — set as primary
    async setPrimary(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const photoId = parseInt(req.params.photoId);

            const photo = await photoService.setPrimary(photoId, userId);
            return apiResponse.success(res, 'Photo set as primary', photo);
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }

    // PUT /api/users/:id/photos/:photoId — update caption/order
    async updatePhoto(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const photoId = parseInt(req.params.photoId);

            const photo = await photoService.updatePhoto(photoId, userId, req.body);
            return apiResponse.success(res, 'Photo updated successfully', photo);
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }

    // DELETE /api/users/:id/photos/:photoId — delete a photo
    async deletePhoto(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const photoId = parseInt(req.params.photoId);

            const result = await photoService.deletePhoto(photoId, userId);
            return apiResponse.success(res, result.message);
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }

    // DELETE /api/users/:id/photos — delete all photos
    async deleteAllPhotos(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const result = await photoService.deleteAllPhotos(userId);
            return apiResponse.success(res, result.message);
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }
}

module.exports = new PhotoController();
