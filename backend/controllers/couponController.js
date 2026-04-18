const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');

// @desc    Validate coupon
// @route   POST /api/coupons/validate
const validateCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
    expiresAt: { $gte: new Date() },
    $expr: { $lt: ['$usedCount', '$maxUses'] },
  });

  if (!coupon) {
    res.status(400);
    throw new Error('Invalid or expired coupon code');
  }

  res.json({
    success: true,
    coupon: {
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      minOrderAmount: coupon.minOrderAmount,
    },
  });
});

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, coupons });
});

// @desc    Create coupon (Admin)
// @route   POST /api/coupons
const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

// @desc    Delete coupon (Admin)
// @route   DELETE /api/coupons/:id
const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Coupon deleted' });
});

module.exports = { validateCoupon, getCoupons, createCoupon, deleteCoupon };
