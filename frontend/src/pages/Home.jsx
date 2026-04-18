import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchProducts, fetchFeaturedProducts } from '../features/products/productSlice';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Toys', 'Grocery'];
const SORTS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const Home = () => {
  const dispatch = useDispatch();
  const { products, loading, page, pages, total, featuredProducts } = useSelector((s) => s.products);
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('rating') || '';

  const [priceFrom, setPriceFrom] = useState(minPrice);
  const [priceTo, setPriceTo] = useState(maxPrice);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
  }, []);

  useEffect(() => {
    const params = { page: currentPage, limit: 12, sort };
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (minRating) params.rating = minRating;
    dispatch(fetchProducts(params));
  }, [keyword, category, sort, currentPage, minPrice, maxPrice, minRating]);

  const updateParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const handlePriceFilter = () => {
    const p = new URLSearchParams(searchParams);
    if (priceFrom) p.set('minPrice', priceFrom); else p.delete('minPrice');
    if (priceTo) p.set('maxPrice', priceTo); else p.delete('maxPrice');
    p.delete('page');
    setSearchParams(p);
  };

  const clearAllFilters = () => setSearchParams({});

  const isFiltered = keyword || category || minPrice || maxPrice || minRating;

  return (
    <div>
      {/* Hero Section */}
      {!keyword && !category && currentPage === 1 && (
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <div className="hero-badge">
                🔥 New Arrivals Every Day
              </div>
              <h1 className="hero-title">
                Shop <span className="gradient-text">Smarter,</span><br />
                Live <span className="gradient-text">Better</span>
              </h1>
              <p className="hero-subtitle">
                Discover millions of products at unbeatable prices. From electronics to fashion — everything you love, delivered fast.
              </p>
              <div className="hero-actions">
                <button className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.9rem 2rem' }}
                  onClick={() => document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' })}>
                  🛒 Shop Now
                </button>
                <Link to="/?category=Electronics" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '0.9rem 2rem' }}>
                  Explore Deals
                </Link>
              </div>
              <div className="hero-stats">
                {[['1M+', 'Products'], ['50K+', 'Brands'], ['2M+', 'Customers'], ['4.8★', 'Rating']].map(([num, label]) => (
                  <div key={label}>
                    <div className="hero-stat-number">{num}</div>
                    <div className="hero-stat-label">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Decorative orbs */}
          <div style={{ position: 'absolute', top: '10%', right: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(108,99,255,0.15), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: 250, height: 250, background: 'radial-gradient(circle, rgba(255,101,132,0.1), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        </section>
      )}

      {/* Featured Products */}
      {!keyword && !category && currentPage === 1 && featuredProducts?.length > 0 && (
        <section className="section-padding" style={{ background: 'var(--surface)' }}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">⚡ Featured Products</h2>
              <Link to="/?sort=newest" className="section-link">View All →</Link>
            </div>
            <div className="products-grid">
              {featuredProducts.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Main Products Section */}
      <section id="products-section" className="section-padding">
        <div className="container">
          {/* Categories Strip */}
          <div className="categories-strip" style={{ marginBottom: '1.5rem' }}>
            <button
              className={`category-pill ${!category ? 'active' : ''}`}
              onClick={() => updateParam('category', '')}
            >🏪 All</button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category-pill ${category === cat ? 'active' : ''}`}
                onClick={() => updateParam('category', cat)}
              >
                {cat === 'Electronics' ? '⚡' : cat === 'Fashion' ? '👗' : cat === 'Home & Kitchen' ? '🏠' : cat === 'Books' ? '📚' : cat === 'Sports' ? '⚽' : cat === 'Beauty' ? '💄' : cat === 'Toys' ? '🧸' : '🛒'} {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem', alignItems: 'start' }}>
            {/* Filter Sidebar */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', position: 'sticky', top: '80px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>🔧 Filters</h3>
                {isFiltered && (
                  <button onClick={clearAllFilters} style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Clear All</button>
                )}
              </div>

              {/* Sort */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem' }}>Sort By</label>
                {SORTS.map((s) => (
                  <label key={s.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="sort" value={s.value} checked={sort === s.value} onChange={() => updateParam('sort', s.value)} style={{ accentColor: 'var(--primary)' }} />
                    <span style={{ fontSize: '0.875rem', color: sort === s.value ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{s.label}</span>
                  </label>
                ))}
              </div>

              {/* Price Range */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem' }}>Price Range</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input type="number" placeholder="Min ₹" value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} className="form-input" style={{ padding: '0.5rem' }} />
                  <input type="number" placeholder="Max ₹" value={priceTo} onChange={(e) => setPriceTo(e.target.value)} className="form-input" style={{ padding: '0.5rem' }} />
                </div>
                <button onClick={handlePriceFilter} className="btn btn-outline" style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}>Apply</button>
              </div>

              {/* Rating */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem' }}>Min Rating</label>
                {[4, 3, 2].map((r) => (
                  <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="rating" value={r} checked={minRating === String(r)} onChange={() => updateParam('rating', r)} style={{ accentColor: 'var(--primary)' }} />
                    <span style={{ color: '#FFD700' }}>{'★'.repeat(r)}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>& above</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  {keyword && <h2 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>Results for "<span style={{ color: 'var(--primary)' }}>{keyword}</span>"</h2>}
                  {category && !keyword && <h2 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{category}</h2>}
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{total} products found</p>
                </div>
              </div>

              {loading ? <Loader /> : products.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🔍</div>
                  <div className="empty-state-title">No products found</div>
                  <p>Try different filters or search terms</p>
                  <button onClick={clearAllFilters} className="btn btn-primary" style={{ marginTop: '1rem' }}>Clear Filters</button>
                </div>
              ) : (
                <>
                  <div className="products-grid">
                    {products.map((p) => <ProductCard key={p._id} product={p} />)}
                  </div>
                  <Pagination page={page} pages={pages} onPageChange={(p) => updateParam('page', p)} />
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
