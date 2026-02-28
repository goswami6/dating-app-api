const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Match = sequelize.define('Match', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    matchedUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('like', 'super_like', 'mutual_match', 'hidden', 'blocked'),
        defaultValue: 'like'
    },
    isSuperLike: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether this match was initiated via super like'
    },
    matchedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    isNewMatch: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    hasUnreadMessages: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'matches',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'matchedUserId']
        }
    ]
});

module.exports = Match;
