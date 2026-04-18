const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Create / Update review
// @route   POST /api/reviews
const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if review already exists
  const existingReview = await Review.findOne({ product: productId, user: req.user._id });

  if (existingReview) {
    existingReview.rating = rating;
    existingReview.comment = comment;
    await existingReview.save();
  } else {
    await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      comment,
    });
  }

  // Recalculate product rating
  const reviews = await Review.find({ product: productId });
  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  product.rating = Math.round(avgRating * 10) / 10;
  product.numReviews = reviews.length;
  await product.save();

  res.status(201).json({ success: true, message: 'Review submitted' });
});

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });

  res.json({ success: true, reviews });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  await review.deleteOne();

  // Recalculate rating
  const reviews = await Review.find({ product: review.product });
  const product = await Product.findById(review.product);
  if (product) {
    product.rating = reviews.length ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
    product.numReviews = reviews.length;
    await product.save();
  }

  res.json({ success: true, message: 'Review deleted' });
});

module.exports = { createReview, getProductReviews, deleteReview };
