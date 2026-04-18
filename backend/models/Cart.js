const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  name: String,
  image: String,
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    coupon: {
      code: String,
      discountPercent: Number,
    },
  },
  { timestamps: true }
);

// Virtual: total price
cartSchema.virtual('totalPrice').get(function () {
  return this.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
});

module.exports = mongoose.model('Cart', cartSchema);
