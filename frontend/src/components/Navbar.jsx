import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SearchBar from './SearchBar';
import toast from 'react-hot-toast';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((s) => s.auth);
  const { items } = useSelector((s) => s.cart);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully!');
    navigate('/');
    setProfileOpen(false);
  };

  return (
    <nav style={{
      background: 'rgba(10, 10, 15, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      padding: '0.75rem 0',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem',
          }}>🛍️</div>
          <span style={{ fontSize: '1.4rem', fontWeight: 900, background: 'linear-gradient(135deg, #6C63FF, #FF6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ShopNow
          </span>
        </Link>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 500 }}>
          <SearchBar />
        </div>

        {/* Nav Items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
          {/* Cart */}
          <Link to="/cart" style={{ position: 'relative', color: 'var(--text-secondary)', padding: '0.5rem', borderRadius: '50%', transition: 'all 0.2s', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
            <ShoppingCartIcon />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                color: 'white', fontSize: '0.65rem', fontWeight: 700,
                width: 18, height: 18, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{cartCount > 9 ? '9+' : cartCount}</span>
            )}
          </Link>

          {/* Wishlist */}
          {userInfo && (
            <Link to="/wishlist" style={{ color: 'var(--text-secondary)', padding: '0.5rem', borderRadius: '50%', display: 'flex', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#FF6584'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              <FavoriteIcon />
            </Link>
          )}

          {/* Profile */}
          {userInfo ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: 50, padding: '0.4rem 0.75rem',
                  color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700, color: 'white',
                }}>
                  {userInfo.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userInfo.name?.split(' ')[0]}
                </span>
              </button>

              {profileOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', padding: '0.5rem',
                  minWidth: 180, boxShadow: 'var(--shadow-lg)', zIndex: 100,
                  animation: 'fadeIn 0.2s ease',
                }}>
                  <Link to="/profile" onClick={() => setProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: 8, color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'all 0.2s', textDecoration: 'none' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                    <PersonIcon fontSize="small" /> Profile
                  </Link>
                  <Link to="/orders" onClick={() => setProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: 8, color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'all 0.2s', textDecoration: 'none' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                    📦 My Orders
                  </Link>
                  {userInfo.role === 'admin' && (
                    <Link to="/admin" onClick={() => setProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: 8, color: 'var(--primary-light)', fontSize: '0.9rem', transition: 'all 0.2s', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <DashboardIcon fontSize="small" /> Admin Dashboard
                    </Link>
                  )}
                  <div style={{ height: 1, background: 'var(--border)', margin: '0.25rem 0' }} />
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: 8, color: '#F44336', fontSize: '0.9rem', transition: 'all 0.2s', border: 'none', background: 'transparent', cursor: 'pointer', width: '100%' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,67,54,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <LogoutIcon fontSize="small" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Register</Link>
            </div>
          )}
        </div>
      </div>
      {profileOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setProfileOpen(false)} />}
    </nav>
  );
};

export default Navbar;
