const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, orderId } = req.body;

  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'your_razorpay_key_id') {
    // Mock response for development without Razorpay keys
    return res.json({
      success: true,
      order: { id: 'order_mock_' + Date.now(), amount: amount * 100, currency: 'INR' },
      key: 'mock_key',
    });
  }

  const razorpay = getRazorpayInstance();
  const options = {
    amount: Math.round(amount * 100), // in paise
    currency: 'INR',
    receipt: orderId || 'receipt_' + Date.now(),
  };

  const order = await razorpay.orders.create(options);

  res.json({
    success: true,
    order,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// @desc    Verify Razorpay payment signature
// @route   POST /api/payment/verify
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  // Mock verification for dev
  if (razorpayOrderId && razorpayOrderId.startsWith('order_mock_')) {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: 'paid', orderStatus: 'processing', paymentInfo: { razorpayOrderId, razorpayPaymentId: 'mock_payment', razorpaySignature: 'mock_sig' } },
      { new: true }
    );
    return res.json({ success: true, message: 'Payment verified (mock)', order });
  }

  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    res.status(400);
    throw new Error('Payment verification failed');
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      paymentStatus: 'paid',
      orderStatus: 'processing',
      paymentInfo: { razorpayOrderId, razorpayPaymentId, razorpaySignature },
    },
    { new: true }
  );

  res.json({ success: true, message: 'Payment verified successfully', order });
});

module.exports = { createRazorpayOrder, verifyPayment };
