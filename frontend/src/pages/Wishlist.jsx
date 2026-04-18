import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, toggleWishlist } from '../features/wishlist/wishlistSlice';
import { addToCart } from '../features/cart/cartSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.wishlist);

  useEffect(() => { dispatch(fetchWishlist()); }, []);

  if (loading) return <Loader />;

  return (
    <div className="page-padding">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>❤️ Wishlist <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>({items.length} items)</span></h1>
        </div>

        {items.length === 0 ? (
          <div className="empty-state" style={{ minHeight: '50vh' }}>
            <div className="empty-state-icon">❤️</div>
            <div className="empty-state-title">Your wishlist is empty</div>
            <p>Save your favourite items here!</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Products</Link>
          </div>
        ) : (
          <div className="products-grid">
            {items.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
