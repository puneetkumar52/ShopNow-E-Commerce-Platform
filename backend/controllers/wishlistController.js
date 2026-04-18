const asyncHandler = require('express-async-handler');
const Wishlist = require('../models/Wishlist');

// @desc    Get wishlist
// @route   GET /api/wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
    'products',
    'name price images rating category brand'
  );

  res.json({ success: true, products: wishlist ? wishlist.products : [] });
});

// @desc    Toggle wishlist item (add/remove)
// @route   POST /api/wishlist/toggle
const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
    return res.json({ success: true, added: true, message: 'Added to wishlist' });
  }

  const alreadyExists = wishlist.products.includes(productId);

  if (alreadyExists) {
    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    await wishlist.save();
    return res.json({ success: true, added: false, message: 'Removed from wishlist' });
  } else {
    wishlist.products.push(productId);
    await wishlist.save();
    return res.json({ success: true, added: true, message: 'Added to wishlist' });
  }
});

module.exports = { getWishlist, toggleWishlist };
