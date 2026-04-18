import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={{
    background: 'var(--surface)',
    borderTop: '1px solid var(--border)',
    padding: '3rem 0 1.5rem',
    marginTop: 'auto',
  }}>
    <div className="container">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #6C63FF, #FF6584)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🛍️</div>
            <span style={{ fontSize: '1.2rem', fontWeight: 900, background: 'linear-gradient(135deg, #6C63FF, #FF6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ShopNow</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7 }}>
            India's fastest growing e-commerce platform. Shop from millions of products at the best prices.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Shop</h4>
          {['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Beauty'].map((cat) => (
            <Link key={cat} to={`/?category=${cat}`} style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--primary-light)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>{cat}</Link>
          ))}
        </div>

        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Account</h4>
          {[['My Orders', '/orders'], ['Wishlist', '/wishlist'], ['Profile', '/profile'], ['Login', '/login']].map(([label, to]) => (
            <Link key={label} to={to} style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--primary-light)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>{label}</Link>
          ))}
        </div>

        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Contact</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.8 }}>
            📧 support@shopnow.in<br />
            📞 1800-123-4567<br />
            📍 Mumbai, Maharashtra, India
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            {['🐦', '📘', '📸', '▶️'].map((icon, i) => (
              <div key={i} style={{ width: 36, height: 36, background: 'var(--surface-2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1rem', transition: 'all 0.2s', border: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>{icon}</div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>© 2024 ShopNow. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Privacy Policy', 'Terms of Service', 'Return Policy'].map((item) => (
            <span key={item} style={{ color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--primary-light)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
