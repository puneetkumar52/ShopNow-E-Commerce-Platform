import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createProduct, updateProduct, fetchProductById } from '../../features/products/productSlice';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Toys', 'Grocery'];

const AdminProductForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading } = useSelector((s) => s.products);
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '', description: '', price: '', discountPrice: '',
    category: 'Electronics', brand: '', stock: '', featured: false, tags: '',
  });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) dispatch(fetchProductById(id));
  }, [id]);

  useEffect(() => {
    if (isEdit && product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        discountPrice: product.discountPrice || '',
        category: product.category || 'Electronics',
        brand: product.brand || '',
        stock: product.stock || '',
        featured: product.featured || false,
        tags: product.tags?.join(', ') || '',
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    images.forEach((img) => formData.append('images', img));

    const result = isEdit
      ? await dispatch(updateProduct({ id, formData }))
      : await dispatch(createProduct(formData));

    setSubmitting(false);

    if ((isEdit ? updateProduct : createProduct).fulfilled.match(result)) {
      toast.success(isEdit ? 'Product updated!' : 'Product created!');
      navigate('/admin/products');
    } else {
      toast.error(result.payload || 'Operation failed');
    }
  };

  if (isEdit && loading) return <Loader />;

  return (
    <div className="page-padding">
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => navigate('/admin/products')} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.5rem 1rem', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem' }}>← Back</button>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900 }}>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Product Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className="form-input" placeholder="e.g. iPhone 15 Pro Max" required />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="form-input" placeholder="Product description..." rows={5} required style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} className="form-input" placeholder="0" required min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Discount Price (₹)</label>
              <input name="discountPrice" type="number" value={form.discountPrice} onChange={handleChange} className="form-input" placeholder="0 (optional)" min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} className="form-input">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Brand *</label>
              <input name="brand" value={form.brand} onChange={handleChange} className="form-input" placeholder="e.g. Apple" required />
            </div>
            <div className="form-group">
              <label className="form-label">Stock *</label>
              <input name="stock" type="number" value={form.stock} onChange={handleChange} className="form-input" placeholder="0" required min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input name="tags" value={form.tags} onChange={handleChange} className="form-input" placeholder="smartphone, 5g, apple" />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input type="checkbox" name="featured" id="featured" checked={form.featured} onChange={handleChange} style={{ accentColor: 'var(--primary)', width: 18, height: 18 }} />
              <label htmlFor="featured" style={{ fontSize: '0.9rem', fontWeight: 600 }}>⭐ Featured Product (show on homepage)</label>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Product Images</label>
              <input type="file" multiple accept="image/*" onChange={(e) => setImages([...e.target.files])} className="form-input" style={{ padding: '0.5rem' }} />
              {images.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  {images.map((img, i) => (
                    <img key={i} src={URL.createObjectURL(img)} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                  ))}
                </div>
              )}
              {isEdit && product?.images?.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Current images:</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {product.images.map((img, i) => (
                      <img key={i} src={img.url} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, opacity: 0.7, border: '1px solid var(--border)' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 2rem' }} disabled={submitting}>
              {submitting ? '⏳ Saving...' : isEdit ? '✅ Update Product' : '🚀 Create Product'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/products')} style={{ padding: '0.85rem 1.5rem' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;
