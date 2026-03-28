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
const Call = require('./callModel');
const ShopCategory = require('./shopCategoryModel');
const ShopProduct = require('./shopProductModel');
const ShopCart = require('./shopCartModel');
const ShopWishlist = require('./shopWishlistModel');
const ShopAddress = require('./shopAddressModel');
const { ShopOrder, ShopOrderItem } = require('./shopOrderModel');
const Wallet = require('./walletModel');
const WalletTransaction = require('./walletTransactionModel');
const PaymentGatewayConfig = require('./paymentGatewayConfigModel');
const PaymentOrder = require('./paymentOrderModel');
const RandomChat = require('./randomChatModel');
const RandomChatMessage = require('./randomChatMessageModel');
const Booking = require('./bookingModel');

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
    Call,
    ShopCategory,
    ShopProduct,
    ShopCart,
    ShopWishlist,
    ShopAddress,
    ShopOrder,
    ShopOrderItem,
    Wallet,
    WalletTransaction,
    PaymentGatewayConfig,
    PaymentOrder,
    RandomChat,
    RandomChatMessage,
    Booking,
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

    // User ↔ Call
    User.hasMany(Call, { foreignKey: 'callerId', as: 'OutgoingCalls' });
    User.hasMany(Call, { foreignKey: 'receiverId', as: 'IncomingCalls' });
    Call.belongsTo(User, { foreignKey: 'callerId', as: 'Caller' });
    Call.belongsTo(User, { foreignKey: 'receiverId', as: 'Receiver' });

    // Match ↔ Call
    Match.hasMany(Call, { foreignKey: 'matchId', as: 'Calls' });
    Call.belongsTo(Match, { foreignKey: 'matchId' });

    // Shop: Category self-referencing (parent/child)
    ShopCategory.hasMany(ShopCategory, { foreignKey: 'parentId', as: 'SubCategories' });
    ShopCategory.belongsTo(ShopCategory, { foreignKey: 'parentId', as: 'Parent' });

    // Shop: Category ↔ Product
    ShopCategory.hasMany(ShopProduct, { foreignKey: 'categoryId', as: 'Products' });
    ShopProduct.belongsTo(ShopCategory, { foreignKey: 'categoryId', as: 'Category' });

    // Shop: User ↔ Cart
    User.hasMany(ShopCart, { foreignKey: 'userId', as: 'CartItems' });
    ShopCart.belongsTo(User, { foreignKey: 'userId' });
    ShopProduct.hasMany(ShopCart, { foreignKey: 'productId' });
    ShopCart.belongsTo(ShopProduct, { foreignKey: 'productId', as: 'Product' });

    // Shop: User ↔ Wishlist
    User.hasMany(ShopWishlist, { foreignKey: 'userId', as: 'WishlistItems' });
    ShopWishlist.belongsTo(User, { foreignKey: 'userId' });
    ShopProduct.hasMany(ShopWishlist, { foreignKey: 'productId' });
    ShopWishlist.belongsTo(ShopProduct, { foreignKey: 'productId', as: 'Product' });

    // Shop: User ↔ Address
    User.hasMany(ShopAddress, { foreignKey: 'userId', as: 'Addresses' });
    ShopAddress.belongsTo(User, { foreignKey: 'userId' });

    // Shop: User ↔ Order
    User.hasMany(ShopOrder, { foreignKey: 'userId', as: 'Orders' });
    ShopOrder.belongsTo(User, { foreignKey: 'userId' });

    // Shop: Order ↔ Address
    ShopOrder.belongsTo(ShopAddress, { foreignKey: 'addressId', as: 'Address' });

    // Shop: Order ↔ OrderItem
    ShopOrder.hasMany(ShopOrderItem, { foreignKey: 'orderId', as: 'Items' });
    ShopOrderItem.belongsTo(ShopOrder, { foreignKey: 'orderId' });

    // Shop: OrderItem ↔ Product
    ShopOrderItem.belongsTo(ShopProduct, { foreignKey: 'productId', as: 'Product' });
    ShopProduct.hasMany(ShopOrderItem, { foreignKey: 'productId' });

    // Wallet: User ↔ Wallet (one-to-one)
    User.hasOne(Wallet, { foreignKey: 'userId', as: 'Wallet' });
    Wallet.belongsTo(User, { foreignKey: 'userId' });

    // Wallet: Wallet ↔ WalletTransaction
    Wallet.hasMany(WalletTransaction, { foreignKey: 'walletId', as: 'Transactions' });
    WalletTransaction.belongsTo(Wallet, { foreignKey: 'walletId' });

    // Wallet: User ↔ WalletTransaction
    User.hasMany(WalletTransaction, { foreignKey: 'userId', as: 'WalletTransactions' });
    WalletTransaction.belongsTo(User, { foreignKey: 'userId' });

    // Payments: User ↔ PaymentOrder
    User.hasMany(PaymentOrder, { foreignKey: 'userId', as: 'PaymentOrders' });
    PaymentOrder.belongsTo(User, { foreignKey: 'userId', as: 'User' });

    // Payments: WalletTransaction ↔ PaymentOrder
    WalletTransaction.hasMany(PaymentOrder, { foreignKey: 'walletTransactionId', as: 'PaymentOrders' });
    PaymentOrder.belongsTo(WalletTransaction, { foreignKey: 'walletTransactionId', as: 'WalletTransaction' });

    // RandomChat: User ↔ RandomChat
    User.hasMany(RandomChat, { foreignKey: 'user1Id', as: 'InitiatedRandomChats' });
    User.hasMany(RandomChat, { foreignKey: 'user2Id', as: 'ReceivedRandomChats' });
    RandomChat.belongsTo(User, { foreignKey: 'user1Id', as: 'User1' });
    RandomChat.belongsTo(User, { foreignKey: 'user2Id', as: 'User2' });

    // RandomChat ↔ RandomChatMessage
    RandomChat.hasMany(RandomChatMessage, { foreignKey: 'chatId', as: 'Messages' });
    RandomChatMessage.belongsTo(RandomChat, { foreignKey: 'chatId' });

    // User ↔ RandomChatMessage (sender)
    User.hasMany(RandomChatMessage, { foreignKey: 'senderId', as: 'RandomMessages' });
    RandomChatMessage.belongsTo(User, { foreignKey: 'senderId', as: 'Sender' });

    // User ↔ Booking
    User.hasMany(Booking, { foreignKey: 'requesterId', as: 'SentBookings' });
    User.hasMany(Booking, { foreignKey: 'receiverId', as: 'ReceivedBookings' });
    Booking.belongsTo(User, { foreignKey: 'requesterId', as: 'Requester' });
    Booking.belongsTo(User, { foreignKey: 'receiverId', as: 'Receiver' });
}

setupAssociations();

// Export sequelize instance + all models as a single db object
module.exports = {
    sequelize,
    Sequelize,
    ...models,
};
