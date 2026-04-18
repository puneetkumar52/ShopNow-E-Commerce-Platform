import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct } from '../../features/products/productSlice';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const fmt = (p) => `₹${Number(p || 0).toLocaleString('en-IN')}`;

const AdminProducts = () => {
  const dispatch = useDispatch();
  const { products, loading, total } = useSelector((s) => s.products);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = { page, limit: 15 };
    if (search) params.keyword = search;
    dispatch(fetchProducts(params));
  }, [page, search]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const result = await dispatch(deleteProduct(id));
    if (deleteProduct.fulfilled.match(result)) toast.success('Product deleted');
  };

  return (
    <div className="page-padding">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>🛍️ Products</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{total} total products</p>
          </div>
          <Link to="/admin/products/new" className="btn btn-primary">+ Add Product</Link>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="form-input"
            style={{ maxWidth: 400 }}
          />
        </div>

        {loading ? <Loader /> : (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  {['Product', 'Category', 'Price', 'Stock', 'Rating', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={product.images?.[0]?.url} alt={product.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8 }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <span style={{ background: 'rgba(108,99,255,0.12)', color: 'var(--primary-light)', fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.65rem', borderRadius: 20 }}>{product.category}</span>
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem', fontWeight: 700, fontSize: '0.9rem' }}>
                      {product.discountPrice > 0 ? (
                        <span>{fmt(product.discountPrice)} <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 400 }}>{fmt(product.price)}</span></span>
                      ) : fmt(product.price)}
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <span style={{ color: product.stock === 0 ? '#EF9A9A' : product.stock <= 5 ? '#FFD700' : '#81C784', fontWeight: 700, fontSize: '0.875rem' }}>
                        {product.stock === 0 ? '❌ Out' : product.stock <= 5 ? `⚠️ ${product.stock}` : product.stock}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <span style={{ color: '#FFD700', fontSize: '0.875rem' }}>★ {product.rating?.toFixed(1) || '0.0'}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.3rem' }}>({product.numReviews})</span>
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/admin/products/${product._id}/edit`} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>Edit</Link>
                        <button onClick={() => handleDelete(product._id, product.name)} className="btn btn-danger" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
