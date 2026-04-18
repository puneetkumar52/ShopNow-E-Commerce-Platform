const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @desc    Create new order (validate cart → check stock → create order)
// @route   POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod = 'razorpay', couponCode } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  // Validate stock for all items
  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);
    if (!product) {
      res.status(404);
      throw new Error(`Product ${item.name} not found`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
    }
  }

  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.name || item.product.name,
    image: item.image || item.product.images[0]?.url,
    price: item.price,
    quantity: item.quantity,
  }));

  const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingPrice = itemsPrice > 500 ? 0 : 49;
  const taxPrice = Math.round(itemsPrice * 0.18);

  let discount = 0;
  let appliedCoupon = null;

  if (couponCode || cart.coupon?.code) {
    const code = couponCode || cart.coupon.code;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (coupon) {
      discount = Math.round((itemsPrice * coupon.discountPercent) / 100);
      appliedCoupon = code.toUpperCase();
      coupon.usedCount += 1;
      await coupon.save();
    }
  }

  const totalAmount = itemsPrice + shippingPrice + taxPrice - discount;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    discount,
    couponCode: appliedCoupon,
    totalAmount,
    paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'unpaid',
    orderStatus: 'placed',
  });

  // Deduct stock
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity },
    });
  }

  // Clear cart
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: undefined });

  res.status(201).json({ success: true, order });
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/user
const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// @desc    Get single order
// @route   GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Only owner or admin can view
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  res.json({ success: true, order });
});

// @desc    Update order to paid (after Razorpay success)
// @route   PUT /api/orders/:id/pay
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.paymentStatus = 'paid';
  order.orderStatus = 'processing';
  order.paymentInfo = {
    razorpayOrderId: req.body.razorpayOrderId,
    razorpayPaymentId: req.body.razorpayPaymentId,
    razorpaySignature: req.body.razorpaySignature,
  };

  await order.save();
  res.json({ success: true, order });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (['shipped', 'delivered'].includes(order.orderStatus)) {
    res.status(400);
    throw new Error('Cannot cancel order that is already shipped or delivered');
  }

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  order.orderStatus = 'cancelled';
  order.cancelledAt = new Date();
  order.cancelReason = req.body.reason || 'Cancelled by user';
  await order.save();

  res.json({ success: true, order });
});

module.exports = { createOrder, getUserOrders, getOrderById, updateOrderToPaid, cancelOrder };
