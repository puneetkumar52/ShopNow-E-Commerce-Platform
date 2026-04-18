import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

const Profile = () => {
  const dispatch = useDispatch();
  const { userInfo, loading } = useSelector((s) => s.auth);
  const [form, setForm] = useState({
    name: userInfo?.name || '',
    password: '',
    street: userInfo?.address?.street || '',
    city: userInfo?.address?.city || '',
    state: userInfo?.address?.state || '',
    pincode: userInfo?.address?.pincode || '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: form.name,
      address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
    };
    if (form.password) data.password = form.password;
    const result = await dispatch(updateProfile(data));
    if (updateProfile.fulfilled.match(result)) toast.success('Profile updated!');
  };

  return (
    <div className="page-padding">
      <div className="container" style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem' }}>👤 My Profile</h1>

        {/* Avatar area */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #6C63FF, #FF6584)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {userInfo?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{userInfo?.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{userInfo?.email}</div>
            <span style={{ display: 'inline-block', marginTop: '0.35rem', background: userInfo?.role === 'admin' ? 'rgba(108,99,255,0.15)' : 'rgba(76,175,80,0.15)', color: userInfo?.role === 'admin' ? 'var(--primary-light)' : '#81C784', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: 20 }}>
              {userInfo?.role === 'admin' ? '👑 Admin' : '👤 User'}
            </span>
          </div>
        </div>

        {/* Edit form */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '2rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Edit Profile</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="form-input" placeholder="Your name" />
            </div>
            <div className="form-group">
              <label className="form-label">New Password (leave blank to keep current)</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} className="form-input" placeholder="••••••••" />
            </div>
            <div style={{ borderTop: '1px solid var(--border)', margin: '1.5rem 0', paddingTop: '1.5rem' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>📍 Default Address</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[['street', 'Street Address', true], ['city', 'City', false], ['state', 'State', false], ['pincode', 'Pincode', false]].map(([name, label, span]) => (
                  <div key={name} style={{ gridColumn: span ? '1 / -1' : undefined }} className="form-group">
                    <label className="form-label">{label}</label>
                    <input name={name} value={form[name]} onChange={handleChange} className="form-input" placeholder={label} />
                  </div>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 2rem' }} disabled={loading}>
              {loading ? 'Saving...' : '✅ Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
