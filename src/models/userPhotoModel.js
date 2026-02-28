// src/models/userPhotoModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserPhoto = sequelize.define('UserPhoto', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Path or URL to the photo'
    },
    isPrimary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether this is the primary/profile photo'
    },
    caption: {
        type: DataTypes.STRING,
        allowNull: true
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Display order of the photo in the gallery'
    }
}, {
    tableName: 'user_photos',
    timestamps: true // createdAt serves as uploadDate
});

module.exports = UserPhoto;
