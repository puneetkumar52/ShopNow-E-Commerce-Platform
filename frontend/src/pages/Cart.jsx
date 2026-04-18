import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartItem, removeFromCart, applyCoupon } from '../features/cart/cartSlice';
import Loader from '../components/Loader';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const fmt = (p) => `₹${Number(p || 0).toLocaleString('en-IN')}`;

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPrice, discountAmount, finalPrice, coupon, loading } = useSelector((s) => s.cart);
  const { userInfo } = useSelector((s) => s.auth);
  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (userInfo) dispatch(fetchCart());
  }, [userInfo]);

  const handleQty = (productId, qty) => {
    if (qty < 1) return;
    dispatch(updateCartItem({ productId, quantity: qty }));
  };

  const handleRemove = (productId) => dispatch(removeFromCart(productId));

  const handleCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplying(true);
    await dispatch(applyCoupon(couponCode.trim()));
    setApplying(false);
    setCouponCode('');
  };

  if (!userInfo) return (
    <div className="empty-state" style={{ minHeight: '60vh' }}>
      <div className="empty-state-icon">🛒</div>
      <div className="empty-state-title">Please login to view your cart</div>
      <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>Login</Link>
    </div>
  );

  if (loading) return <Loader />;

  if (items.length === 0) return (
    <div className="empty-state" style={{ minHeight: '60vh' }}>
      <div className="empty-state-icon">🛒</div>
      <div className="empty-state-title">Your cart is empty</div>
      <p>Add some products to get started!</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Products</Link>
    </div>
  );

  const shipping = finalPrice > 500 ? 0 : 49;
  const tax = Math.round(finalPrice * 0.18);
  const grandTotal = finalPrice + shipping + tax - discountAmount;

  return (
    <div className="page-padding">
      <div className="container">
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem' }}>🛒 Shopping Cart <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 400 }}>({items.length} items)</span></h1>

        <div className="cart-container">
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((item) => (
              <div key={item.product?._id || item.product} className="cart-item">
                <img
                  src={item.image || item.product?.images?.[0]?.url || 'https://via.placeholder.com/90'}
                  alt={item.name}
                  className="cart-item-image"
                />
                <div style={{ flex: 1 }}>
                  <Link to={`/products/${item.product?._id || item.product}`} style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', textDecoration: 'none' }}
                    onMouseEnter={e => e.target.style.color = 'var(--primary)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-primary)'}>
                    {item.name}
                  </Link>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0.5rem 0', color: 'var(--text-primary)' }}>
                    {fmt(item.price)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => handleQty(item.product?._id || item.product, item.quantity - 1)}>−</button>
                      <span className="qty-value">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => handleQty(item.product?._id || item.product, item.quantity + 1)}>+</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
                        {fmt(item.price * item.quantity)}
                      </span>
                      <button onClick={() => handleRemove(item.product?._id || item.product)} className="btn btn-danger" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                        <DeleteOutlineIcon sx={{ fontSize: 16 }} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.5rem', position: 'sticky', top: 80 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>Order Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
              {[['Subtotal', fmt(totalPrice)], ['Shipping', shipping === 0 ? '🎉 FREE' : fmt(shipping)], ['Tax (18% GST)', fmt(tax)]].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontWeight: 600, color: value === '🎉 FREE' ? '#81C784' : 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: '#81C784' }}>Coupon ({coupon?.code})</span>
                  <span style={{ fontWeight: 600, color: '#81C784' }}>−{fmt(discountAmount)}</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
                <span>Total</span>
                <span style={{ background: 'linear-gradient(135deg, #6C63FF, #FF6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {fmt(Math.max(0, finalPrice + shipping + tax))}
                </span>
              </div>
            </div>

            {/* Coupon */}
            {!coupon && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Apply Coupon</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="WELCOME10" className="form-input" style={{ fontSize: '0.875rem', letterSpacing: '0.05em' }} />
                  <button onClick={handleCoupon} className="btn btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }} disabled={applying}>
                    {applying ? '...' : 'Apply'}
                  </button>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Try: WELCOME10, SAVE20, FLAT50</p>
              </div>
            )}

            {coupon && (
              <div style={{ background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.3)', borderRadius: 10, padding: '0.75rem', marginBottom: '1.25rem', fontSize: '0.875rem', color: '#81C784', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🎉 Coupon <strong>{coupon.code}</strong> applied! {coupon.discountPercent}% off
              </div>
            )}

            <button onClick={() => navigate('/checkout')} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', justifyContent: 'center' }}>
              Proceed to Checkout →
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              🔒 Secure Checkout • 100% Safe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
