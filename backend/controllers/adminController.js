const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalUsers = await User.countDocuments({ role: 'user' });

  const revenueResult = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);
  const totalRevenue = revenueResult[0]?.total || 0;

  // Monthly revenue (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyRevenue = await Order.aggregate([
    { $match: { paymentStatus: 'paid', createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Orders by status
  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
  ]);

  // Top selling products
  const topProducts = await Order.aggregate([
    { $unwind: '$items' },
    { $group: { _id: '$items.product', name: { $first: '$items.name' }, sold: { $sum: '$items.quantity' } } },
    { $sort: { sold: -1 } },
    { $limit: 5 },
  ]);

  // Recent orders
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('user', 'name email');

  res.json({
    success: true,
    stats: {
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue,
    },
    monthlyRevenue,
    ordersByStatus,
    topProducts,
    recentOrders,
  });
});

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.status) query.orderStatus = req.query.status;

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'name email');

  res.json({ success: true, orders, total, pages: Math.ceil(total / limit) });
});

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:id/status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const validTransitions = {
    placed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  if (!validTransitions[order.orderStatus]?.includes(status)) {
    res.status(400);
    throw new Error(`Cannot change status from ${order.orderStatus} to ${status}`);
  }

  order.orderStatus = status;
  if (status === 'delivered') order.deliveredAt = new Date();
  if (status === 'shipped') order.shippedAt = new Date();
  if (status === 'cancelled') {
    order.cancelledAt = new Date();
    order.cancelReason = req.body.reason || 'Cancelled by admin';
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
  }

  await order.save();
  res.json({ success: true, order });
});

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, users });
});

// @desc    Delete user (Admin)
// @route   DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot delete admin user');
  }
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
});

module.exports = { getDashboardStats, getAllOrders, updateOrderStatus, getAllUsers, deleteUser };
