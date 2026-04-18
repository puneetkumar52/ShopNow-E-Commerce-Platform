import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../features/products/productSlice';
import { addToCart } from '../features/cart/cartSlice';
import { toggleWishlist } from '../features/wishlist/wishlistSlice';
import RatingStars from '../components/RatingStars';
import ReviewSection from '../components/ReviewSection';
import Loader from '../components/Loader';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FlashOnIcon from '@mui/icons-material/FlashOn';

const fmt = (p) => `₹${p?.toLocaleString('en-IN')}`;

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading } = useSelector((s) => s.products);
  const { userInfo } = useSelector((s) => s.auth);
  const { items: wishlistItems } = useSelector((s) => s.wishlist);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  const isWishlisted = wishlistItems?.some((p) => (p._id || p) === id);

  useEffect(() => {
    dispatch(fetchProductById(id));
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <Loader />;
  if (!product) return <div className="empty-state"><div className="empty-state-title">Product not found</div></div>;

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discountPct = product.discountPrice > 0 ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  const handleAddToCart = () => {
    if (!userInfo) return navigate('/login');
    dispatch(addToCart({ productId: product._id, quantity: qty }));
  };

  const handleBuyNow = () => {
    if (!userInfo) return navigate('/login');
    dispatch(addToCart({ productId: product._id, quantity: qty }));
    navigate('/cart');
  };

  return (
    <div className="page-padding">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '4rem' }}>
          {/* Images */}
          <div>
            <div style={{ borderRadius: 20, overflow: 'hidden', background: 'var(--surface-2)', aspectRatio: '1', marginBottom: '1rem', border: '1px solid var(--border)' }}>
              <img
                src={product.images?.[activeImg]?.url}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.3s' }}
              />
            </div>
            {product.images?.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} style={{
                    width: 70, height: 70, borderRadius: 10, overflow: 'hidden', border: `2px solid ${i === activeImg ? 'var(--primary)' : 'var(--border)'}`, cursor: 'pointer', background: 'none', padding: 0, transition: 'all 0.2s',
                  }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary-light)' }}>{product.category} • {product.brand}</span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.75rem 0', lineHeight: 1.3 }}>{product.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <RatingStars rating={product.rating} size="md" showCount count={product.numReviews} />
            </div>

            {/* Price */}
            <div style={{ background: 'var(--surface-2)', borderRadius: 16, padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 900 }}>{fmt(price)}</span>
                {product.discountPrice > 0 && (
                  <>
                    <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{fmt(product.price)}</span>
                    <span style={{ background: 'rgba(76,175,80,0.15)', color: '#81C784', fontSize: '0.85rem', fontWeight: 700, padding: '0.2rem 0.7rem', borderRadius: 20 }}>{discountPct}% OFF</span>
                  </>
                )}
              </div>
              {product.discountPrice > 0 && (
                <p style={{ fontSize: '0.85rem', color: '#81C784', marginTop: '0.5rem' }}>
                  You save {fmt(product.price - product.discountPrice)}!
                </p>
              )}
            </div>

            {/* Stock */}
            <div style={{ marginBottom: '1.5rem' }}>
              {product.stock > 0 ? (
                <span style={{ color: '#81C784', fontSize: '0.9rem', fontWeight: 600 }}>
                  ✅ In Stock ({product.stock} available)
                  {product.stock <= 5 && <span style={{ color: '#EF9A9A', marginLeft: '0.5rem' }}>— Only {product.stock} left!</span>}
                </span>
              ) : (
                <span style={{ color: '#EF9A9A', fontSize: '0.9rem', fontWeight: 600 }}>❌ Out of Stock</span>
              )}
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>QUANTITY</label>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                  <span className="qty-value">{qty}</span>
                  <button className="qty-btn" onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" style={{ flex: 1, padding: '1rem', fontSize: '1rem', justifyContent: 'center' }} disabled={product.stock === 0} onClick={handleAddToCart}>
                <ShoppingCartIcon /> Add to Cart
              </button>
              <button className="btn btn-secondary" style={{ flex: 1, padding: '1rem', fontSize: '1rem', justifyContent: 'center', background: 'rgba(255,193,7,0.12)', borderColor: 'rgba(255,193,7,0.3)', color: '#FFD700' }} disabled={product.stock === 0} onClick={handleBuyNow}>
                <FlashOnIcon /> Buy Now
              </button>
              <button
                onClick={() => { if (!userInfo) navigate('/login'); else dispatch(toggleWishlist(product._id)); }}
                style={{ width: 52, height: 52, borderRadius: 12, border: `1px solid ${isWishlisted ? 'var(--secondary)' : 'var(--border)'}`, background: isWishlisted ? 'rgba(255,101,132,0.1)' : 'var(--surface-2)', color: isWishlisted ? 'var(--secondary)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              >
                {isWishlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </button>
            </div>

            {/* Delivery info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[['🚚', 'Free Delivery', 'On orders above ₹500'], ['↩️', '10 Day Return', 'Easy returns policy'], ['🔒', 'Secure Payment', '100% safe checkout'], ['⭐', 'Genuine Product', 'Brand authorized product']].map(([icon, title, desc]) => (
                <div key={title} style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '0.75rem', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{icon}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{title}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{desc}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>About this product</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8 }}>{product.description}</p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '2rem' }}>
          <ReviewSection productId={id} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
