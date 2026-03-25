const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  requesterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'User who requests the booking',
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'User who receives the booking request',
  },
  bookingDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Date of the booking (YYYY-MM-DD)',
  },
  bookingTime: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Time of the booking (HH:MM:SS)',
  },
  purpose: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Purpose/reason for the booking',
  },
  note: {
    type: DataTypes.STRING(1000),
    allowNull: true,
    comment: 'Optional note from requester',
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'cancelled', 'completed'),
    allowNull: false,
    defaultValue: 'pending',
  },
  respondedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the receiver responded',
  },
  rejectionReason: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Reason for rejection (optional)',
  },
}, {
  tableName: 'bookings',
  timestamps: true,
});

module.exports = Booking;
