const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Import all models
const User = require('./userModel');
const Match = require('./matchModel');
const Message = require('./messageModel');
const UserPhoto = require('./userPhotoModel');
const Badge = require('./badgeModel');
const UserBadge = require('./userBadgeModel');
const MatchCriteria = require('./matchCriteriaModel');
const TopPick = require('./topPickModel');
const Notification = require('./notificationModel');
const SubscriptionPlan = require('./subscriptionPlanModel');
const Subscription = require('./userSubscriptionModel');

// Register all models
const models = {
    User,
    Match,
    Message,
    UserPhoto,
    Badge,
    UserBadge,
    MatchCriteria,
    TopPick,
    Notification,
    SubscriptionPlan,
    Subscription,
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

    // Message ↔ Message (reply)
    Message.belongsTo(Message, { foreignKey: 'replyToId', as: 'ReplyTo' });
    Message.hasMany(Message, { foreignKey: 'replyToId', as: 'Replies' });

    // User ↔ UserPhoto (gallery)
    User.hasMany(UserPhoto, { foreignKey: 'userId', as: 'Photos' });
    UserPhoto.belongsTo(User, { foreignKey: 'userId', as: 'Owner' });

    // User ↔ Badge (many-to-many through UserBadge)
    User.belongsToMany(Badge, { through: UserBadge, foreignKey: 'userId', as: 'Badges' });
    Badge.belongsToMany(User, { through: UserBadge, foreignKey: 'badgeId', as: 'Users' });
    User.hasMany(UserBadge, { foreignKey: 'userId', as: 'UserBadges' });
    UserBadge.belongsTo(User, { foreignKey: 'userId' });
    UserBadge.belongsTo(Badge, { foreignKey: 'badgeId', as: 'Badge' });

    // User ↔ MatchCriteria (one-to-one)
    User.hasOne(MatchCriteria, { foreignKey: 'userId', as: 'MatchCriteria' });
    MatchCriteria.belongsTo(User, { foreignKey: 'userId' });

    // User ↔ TopPick
    User.hasMany(TopPick, { foreignKey: 'userId', as: 'MyTopPicks' });
    User.hasMany(TopPick, { foreignKey: 'pickedUserId', as: 'PickedByOthers' });
    TopPick.belongsTo(User, { foreignKey: 'userId', as: 'ForUser' });
    TopPick.belongsTo(User, { foreignKey: 'pickedUserId', as: 'PickedUser' });

    // User ↔ Notification
    User.hasMany(Notification, { foreignKey: 'userId', as: 'Notifications' });
    Notification.belongsTo(User, { foreignKey: 'userId', as: 'ForUser' });

    // User ↔ Subscription
    User.hasMany(Subscription, { foreignKey: 'userId', as: 'Subscriptions' });
    Subscription.belongsTo(User, { foreignKey: 'userId', as: 'Subscriber' });

    // SubscriptionPlan ↔ Subscription
    SubscriptionPlan.hasMany(Subscription, { foreignKey: 'planId', as: 'Subscriptions' });
    Subscription.belongsTo(SubscriptionPlan, { foreignKey: 'planId', as: 'Plan' });
}

setupAssociations();

// Export sequelize instance + all models as a single db object
module.exports = {
    sequelize,
    Sequelize,
    ...models,
};
