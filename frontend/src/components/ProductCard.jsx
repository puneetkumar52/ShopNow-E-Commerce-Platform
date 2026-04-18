import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';
import { toggleWishlist } from '../features/wishlist/wishlistSlice';
import RatingStars from './RatingStars';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const formatPrice = (p) => `₹${p?.toLocaleString('en-IN')}`;
const discount = (orig, disc) => orig && disc ? Math.round(((orig - disc) / orig) * 100) : 0;

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((s) => s.auth);
  const { items: wishlistItems } = useSelector((s) => s.wishlist);
  const isWishlisted = wishlistItems?.some((p) => (p._id || p) === product._id);

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const originalPrice = product.discountPrice > 0 ? product.price : null;
  const discountPct = originalPrice ? discount(originalPrice, price) : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userInfo) {
      window.location.href = '/login';
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userInfo) {
      window.location.href = '/login';
      return;
    }
    dispatch(toggleWishlist(product._id));
  };

  return (
    <Link to={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
      <div className="product-card">
        <div className="product-image-wrapper">
          <img
            src={product.images?.[0]?.url || 'https://via.placeholder.com/400x400?text=No+Image'}
            alt={product.name}
            className="product-image"
            loading="lazy"
          />
          {product.stock === 0 && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '1rem', background: 'rgba(244,67,54,0.8)', padding: '0.4rem 1rem', borderRadius: 8 }}>Out of Stock</span>
            </div>
          )}
          {discountPct >= 10 && (
            <div style={{
              position: 'absolute', top: '0.75rem', left: '0.75rem',
              background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
              color: 'white', fontSize: '0.7rem', fontWeight: 700,
              padding: '0.2rem 0.6rem', borderRadius: 20,
            }}>{discountPct}% OFF</div>
          )}
          <div className="product-actions">
            <button className={`action-btn ${isWishlisted ? 'active' : ''}`} onClick={handleWishlist} title="Wishlist">
              {isWishlisted ? <FavoriteIcon sx={{ fontSize: 18 }} /> : <FavoriteBorderIcon sx={{ fontSize: 18 }} />}
            </button>
            <button className="action-btn" onClick={handleAddToCart} title="Add to Cart" disabled={product.stock === 0}>
              <ShoppingCartIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
        </div>
        <div className="product-info">
          <div className="product-category">{product.category}</div>
          <div className="product-name">{product.name}</div>
          <RatingStars rating={product.rating || 0} showCount count={product.numReviews} />
          <div className="product-price-row" style={{ marginTop: '0.5rem' }}>
            <span className="product-price">{formatPrice(price)}</span>
            {originalPrice && <span className="product-original-price">{formatPrice(originalPrice)}</span>}
            {discountPct >= 5 && <span className="product-discount">{discountPct}% off</span>}
          </div>
          {product.stock > 0 && product.stock <= 5 && (
            <p style={{ fontSize: '0.75rem', color: '#EF9A9A', marginTop: '0.3rem' }}>Only {product.stock} left!</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
