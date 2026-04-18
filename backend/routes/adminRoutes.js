const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllOrders, updateOrderStatus, getAllUsers, deleteUser } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);
router.get('/stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;
