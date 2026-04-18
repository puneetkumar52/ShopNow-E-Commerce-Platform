import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserOrders } from '../features/orders/orderSlice';
import Loader from '../components/Loader';

const fmt = (p) => `₹${Number(p || 0).toLocaleString('en-IN')}`;

const statusColors = {
  placed: { bg: 'rgba(33,150,243,0.12)', color: '#64B5F6', label: '📋 Placed' },
  processing: { bg: 'rgba(255,193,7,0.12)', color: '#FFD700', label: '⚙️ Processing' },
  shipped: { bg: 'rgba(156,39,176,0.12)', color: '#CE93D8', label: '🚚 Shipped' },
  delivered: { bg: 'rgba(76,175,80,0.12)', color: '#81C784', label: '✅ Delivered' },
  cancelled: { bg: 'rgba(244,67,54,0.12)', color: '#EF9A9A', label: '❌ Cancelled' },
};

const OrderHistory = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchUserOrders()); }, []);

  if (loading) return <Loader />;

  return (
    <div className="page-padding">
      <div className="container" style={{ maxWidth: 860 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem' }}>📦 My Orders</h1>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-title">No orders yet</div>
            <p>Start shopping to see your orders here</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Shop Now</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {orders.map((order) => {
              const s = statusColors[order.orderStatus] || statusColors.placed;
              return (
                <Link key={order._id} to={`/orders/${order._id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', transition: 'all 0.2s', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(108,99,255,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Order ID</div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', fontFamily: 'monospace' }}>#{order._id.slice(-10).toUpperCase()}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ background: s.bg, color: s.color, padding: '0.3rem 0.9rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>{s.label}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    {/* Items preview */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', overflowX: 'auto' }}>
                      {order.items.slice(0, 4).map((item, i) => (
                        <img key={i} src={item.image} alt={item.name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', flexShrink: 0 }} />
                      ))}
                      {order.items.length > 4 && (
                        <div style={{ width: 56, height: 56, borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                      <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>{fmt(order.totalAmount)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
