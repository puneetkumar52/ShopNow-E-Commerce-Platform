const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { uploadToCloudinary } = require('../middleware/uploadMiddleware');
const cloudinary = require('../config/cloudinary');

// @desc    Get all products with search, filter, pagination
// @route   GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const query = {};

  // Text search
  if (req.query.keyword) {
    query.$text = { $search: req.query.keyword };
  }

  // Category filter
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Brand filter
  if (req.query.brand) {
    query.brand = req.query.brand;
  }

  // Price range
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
  }

  // Rating filter
  if (req.query.rating) {
    query.rating = { $gte: Number(req.query.rating) };
  }

  // Sorting
  let sortBy = {};
  switch (req.query.sort) {
    case 'price_asc':
      sortBy = { price: 1 };
      break;
    case 'price_desc':
      sortBy = { price: -1 };
      break;
    case 'rating':
      sortBy = { rating: -1 };
      break;
    case 'newest':
      sortBy = { createdAt: -1 };
      break;
    default:
      sortBy = { createdAt: -1 };
  }

  const total = await Product.countDocuments(query);
  const products = await Product.find(query).sort(sortBy).skip(skip).limit(limit);

  res.json({
    success: true,
    products,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('seller', 'name');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, product });
});

// @desc    Create product (Admin)
// @route   POST /api/products
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, discountPrice, category, brand, stock, featured, tags } = req.body;

  let images = [];

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, 'ecommerce/products');
      images.push({ public_id: result.public_id, url: result.secure_url });
    }
  } else {
    // Default placeholder images
    images = [
      { public_id: 'placeholder', url: 'https://via.placeholder.com/500x500?text=Product+Image' },
    ];
  }

  const product = await Product.create({
    name,
    description,
    price,
    discountPrice: discountPrice || 0,
    category,
    brand,
    stock,
    images,
    featured: featured || false,
    tags: tags ? tags.split(',').map((t) => t.trim()) : [],
    seller: req.user._id,
  });

  res.status(201).json({ success: true, product });
});

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const updates = { ...req.body };
  if (req.files && req.files.length > 0) {
    const images = [];
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, 'ecommerce/products');
      images.push({ public_id: result.public_id, url: result.secure_url });
    }
    updates.images = images;
  }

  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, product: updatedProduct });
});

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Delete images from Cloudinary
  for (const img of product.images) {
    if (img.public_id !== 'placeholder') {
      await cloudinary.uploader.destroy(img.public_id);
    }
  }

  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
});

// @desc    Get featured products
// @route   GET /api/products/featured
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ featured: true }).limit(8);
  res.json({ success: true, products });
});

// @desc    Get top rated products
// @route   GET /api/products/top
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ rating: -1 }).limit(6);
  res.json({ success: true, products });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getTopProducts,
};
