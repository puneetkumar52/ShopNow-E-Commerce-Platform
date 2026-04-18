const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @desc    Get user cart
// @route   GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product',
    'name price images stock'
  );

  if (!cart) {
    return res.json({ success: true, cart: { items: [], totalPrice: 0 } });
  }

  const totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = cart.coupon
    ? (totalPrice * cart.coupon.discountPercent) / 100
    : 0;

  res.json({
    success: true,
    cart: {
      _id: cart._id,
      items: cart.items,
      coupon: cart.coupon,
      totalPrice,
      discountAmount,
      finalPrice: totalPrice - discountAmount,
    },
  });
});

// @desc    Add item to cart (or increase quantity)
// @route   POST /api/cart/add
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.stock < quantity) {
    res.status(400);
    throw new Error(`Only ${product.stock} items in stock`);
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({
      user: req.user._id,
      items: [],
    });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > product.stock) {
      res.status(400);
      throw new Error(`Cannot add more. Only ${product.stock} in stock`);
    }
    existingItem.quantity = newQty;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      price: product.discountPrice > 0 ? product.discountPrice : product.price,
      name: product.name,
      image: product.images[0]?.url,
    });
  }

  await cart.save();
  const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name price images stock');

  res.json({ success: true, cart: populatedCart });
});

// @desc    Update item quantity
// @route   PUT /api/cart/:productId
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (product && quantity > product.stock) {
    res.status(400);
    throw new Error(`Only ${product.stock} items in stock`);
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) {
    res.status(404);
    throw new Error('Item not in cart');
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  res.json({ success: true, message: 'Cart updated' });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== req.params.productId
  );

  await cart.save();
  res.json({ success: true, message: 'Item removed from cart' });
});

// @desc    Clear cart
// @route   DELETE /api/cart
const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [], coupon: undefined }
  );
  res.json({ success: true, message: 'Cart cleared' });
});

// @desc    Apply coupon
// @route   POST /api/cart/coupon
const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
    expiresAt: { $gte: new Date() },
    $expr: { $lt: ['$usedCount', '$maxUses'] },
  });

  if (!coupon) {
    res.status(400);
    throw new Error('Invalid or expired coupon');
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (totalPrice < coupon.minOrderAmount) {
    res.status(400);
    throw new Error(`Minimum order amount is ₹${coupon.minOrderAmount}`);
  }

  cart.coupon = { code: coupon.code, discountPercent: coupon.discountPercent };
  await cart.save();

  res.json({
    success: true,
    message: `Coupon applied! ${coupon.discountPercent}% off`,
    discountPercent: coupon.discountPercent,
  });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart, applyCoupon };
