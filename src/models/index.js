const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Import all models
const User = require('./userModel');
const Match = require('./matchModel');
const Message = require('./messageModel');
const UserPhoto = require('./userPhotoModel');

// Register all models
const models = {
    User,
    Match,
    Message,
    UserPhoto,
};

// Define associations
function setupAssociations() {
    // User ↔ Match
    User.hasMany(Match, { foreignKey: 'userId', as: 'InitiatedMatches' });
    User.hasMany(Match, { foreignKey: 'matchedUserId', as: 'ReceivedMatches' });
    Match.belongsTo(User, { foreignKey: 'userId', as: 'Initiator' });
    Match.belongsTo(User, { foreignKey: 'matchedUserId', as: 'MatchedUser' });

    // Match ↔ Message
    Match.hasMany(Message, { foreignKey: 'matchId', as: 'Messages' });
    Message.belongsTo(Match, { foreignKey: 'matchId' });

    // User ↔ Message (sender)
    User.hasMany(Message, { foreignKey: 'senderId', as: 'SentMessages' });
    Message.belongsTo(User, { foreignKey: 'senderId', as: 'Sender' });

    // User ↔ UserPhoto (gallery)
    User.hasMany(UserPhoto, { foreignKey: 'userId', as: 'Photos' });
    UserPhoto.belongsTo(User, { foreignKey: 'userId', as: 'Owner' });
}

setupAssociations();

// Export sequelize instance + all models as a single db object
module.exports = {
    sequelize,
    Sequelize,
    ...models,
};
