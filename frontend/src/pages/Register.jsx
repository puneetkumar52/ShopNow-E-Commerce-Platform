import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    const result = await dispatch(registerUser({ name: form.name, email: form.email, password: form.password }));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Welcome to ShopNow 🎉');
      navigate('/');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'radial-gradient(ellipse at 70% 40%, rgba(255,101,132,0.08), transparent 50%), var(--background)' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #6C63FF, #FF6584)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', margin: '0 auto 1rem' }}>🎯</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.25rem' }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)' }}>Join ShopNow for exclusive deals</p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>
          {error && (
            <div style={{ background: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#EF9A9A', fontSize: '0.875rem' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input name="name" type="text" value={form.name} onChange={handleChange} className="form-input" placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className="form-input" placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} className="form-input" placeholder="Min. 6 characters" required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input name="confirm" type="password" value={form.confirm} onChange={handleChange} className="form-input" placeholder="Repeat password" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '0.5rem', justifyContent: 'center' }} disabled={loading}>
              {loading ? '⏳ Creating account...' : '🚀 Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
