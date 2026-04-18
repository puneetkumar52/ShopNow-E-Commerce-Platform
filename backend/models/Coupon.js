const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountPercent: {
      type: Number,
      required: [true, 'Discount percent is required'],
      min: 1,
      max: 100,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    maxUses: {
      type: Number,
      default: 100,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
