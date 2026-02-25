const userService = require('../services/userService');
const apiResponse = require('../utils/apiResponse');
const fs = require('fs');
const path = require('path');

class UserController {

    // POST /api/users
    async create(req, res) {
        try {
            // If profile picture was uploaded, add its path to the body
            if (req.file) {
                req.body.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
            }

            const user = await userService.createUser(req.body);
            return apiResponse.success(res, 'User created successfully', user, 201);
        } catch (error) {
            // Delete uploaded file if user creation fails
            if (req.file) {
                const filePath = path.join(__dirname, '../../', 'uploads/profile-pictures', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            return apiResponse.error(res, error.message, 400);
        }
    }

    // GET /api/users
    async getAll(req, res) {
        try {
            const users = await userService.getAllUsers();
            return apiResponse.success(res, 'Users retrieved successfully', users);
        } catch (error) {
            return apiResponse.error(res, error.message);
        }
    }

    // GET /api/users/:id
    async getById(req, res) {
        try {
            const user = await userService.getUserById(parseInt(req.params.id));
            return apiResponse.success(res, 'User retrieved successfully', user);
        } catch (error) {
            return apiResponse.error(res, error.message, 404);
        }
    }

    // PUT /api/users/:id
    async update(req, res) {
        try {
            const user = await userService.updateUser(parseInt(req.params.id), req.body);
            return apiResponse.success(res, 'User updated successfully', user);
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }

    // DELETE /api/users/:id
    async delete(req, res) {
        try {
            const result = await userService.deleteUser(parseInt(req.params.id));
            return apiResponse.success(res, result.message);
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }

    // PATCH /api/users/:id/activate
    async activate(req, res) {
        try {
            const user = await userService.activateAccount(parseInt(req.params.id));
            return apiResponse.success(res, 'Account activated successfully', user);
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }

    // PATCH /api/users/:id/suspend
    async suspend(req, res) {
        try {
            const user = await userService.suspendAccount(parseInt(req.params.id));
            return apiResponse.success(res, 'Account suspended successfully', user);
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }

    // POST /api/users/:id/profile-picture
    async uploadProfilePicture(req, res) {
        try {
            if (!req.file) {
                return apiResponse.error(res, 'No file uploaded. Please upload an image (jpeg, png, gif, webp).', 400);
            }

            // Delete old profile picture if it exists
            const existingUser = await userService.getUserById(parseInt(req.params.id));
            if (existingUser.profilePicture) {
                const oldFilePath = path.join(__dirname, '../../', existingUser.profilePicture);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }

            const profilePicturePath = `/uploads/profile-pictures/${req.file.filename}`;
            const user = await userService.updateUser(parseInt(req.params.id), {
                profilePicture: profilePicturePath,
            });

            return apiResponse.success(res, 'Profile picture uploaded successfully', {
                profilePicture: profilePicturePath,
                user,
            });
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }
}

module.exports = new UserController();
