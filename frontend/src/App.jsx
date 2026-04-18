import React, { useEffect } from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from './features/cart/cartSlice';
import { fetchWishlist } from './features/wishlist/wishlistSlice';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import OrderDetail from './pages/OrderDetail';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProductForm from './pages/admin/AdminProductForm';

const Layout = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((s) => s.auth);

  // Load cart and wishlist when user logs in
  useEffect(() => {
    if (userInfo) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [userInfo]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      {/* Public Routes */}
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="products/:id" element={<ProductDetail />} />
      <Route path="cart" element={<Cart />} />

      {/* Protected Routes */}
      <Route path="checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
      <Route path="orders" element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
      <Route path="orders/:id" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
      <Route path="wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
      <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

      {/* Admin Routes */}
      <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
      <Route path="admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
      <Route path="admin/products/new" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
      <Route path="admin/products/:id/edit" element={<AdminRoute><AdminProductForm /></AdminRoute>} />

      {/* 404 */}
      <Route path="*" element={
        <div className="empty-state" style={{ minHeight: '60vh' }}>
          <div style={{ fontSize: '5rem' }}>🔍</div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, margin: '1rem 0 0.5rem' }}>404</h1>
          <div className="empty-state-title">Page Not Found</div>
          <p>The page you're looking for doesn't exist.</p>
          <a href="/" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>🏠 Go Home</a>
        </div>
      } />
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

export default router;
