require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./backend/config/db');
const { notFound, errorHandler } = require('./backend/middleware/errorMiddleware');

// Route imports
const authRoutes = require('./backend/routes/authRoutes');
const { registerUser, loginUser } = require('./backend/controllers/authController');
const productRoutes = require('./backend/routes/productRoutes');
const cartRoutes = require('./backend/routes/cartRoutes');
const orderRoutes = require('./backend/routes/orderRoutes');
const reviewRoutes = require('./backend/routes/reviewRoutes');
const wishlistRoutes = require('./backend/routes/wishlistRoutes');
const couponRoutes = require('./backend/routes/couponRoutes');
const paymentRoutes = require('./backend/routes/paymentRoutes');
const adminRoutes = require('./backend/routes/adminRoutes');

const app = express();

// Connect DB
connectDB();

// CORS
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Legacy routes
app.post('/signup', registerUser);
app.post('/signin', loginUser);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// ✅ PRODUCTION: Serve frontend
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.resolve(__dirname, 'dist');

  // Serve static files
  app.use(express.static(frontendPath));

  // Catch-all (ONLY for non-API routes)
  app.get('*', (req, res) => {
    if (req.originalUrl.startsWith('/api')) return res.status(404).end();
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Error middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});