const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, getOrderById, updateOrderToPaid, cancelOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/', createOrder);
router.get('/user', getUserOrders);
router.get('/:id', getOrderById);
router.put('/:id/pay', updateOrderToPaid);
router.put('/:id/cancel', cancelOrder);

module.exports = router;
