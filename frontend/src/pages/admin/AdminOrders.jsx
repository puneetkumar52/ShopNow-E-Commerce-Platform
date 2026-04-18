import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const fmt = (p) => `₹${Number(p || 0).toLocaleString('en-IN')}`;

const statusColors = {
  placed: { bg: 'rgba(33,150,243,0.12)', color: '#64B5F6' },
  processing: { bg: 'rgba(255,193,7,0.12)', color: '#FFD700' },
  shipped: { bg: 'rgba(156,39,176,0.12)', color: '#CE93D8' },
  delivered: { bg: 'rgba(76,175,80,0.12)', color: '#81C784' },
  cancelled: { bg: 'rgba(244,67,54,0.12)', color: '#EF9A9A' },
};

const NEXT_STATUS = {
  placed: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [updating, setUpdating] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filter) params.set('status', filter);
      const res = await axiosInstance.get(`/admin/orders?${params}`);
      setOrders(res.data.orders);
      setTotal(res.data.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [page, filter]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await axiosInstance.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setUpdating(null);
  };

  return (
    <div className="page-padding">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>📦 All Orders</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{total} total orders</p>
          </div>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['', 'placed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => {
            const label = s || 'All';
            const c = statusColors[s];
            return (
              <button key={s} onClick={() => { setFilter(s); setPage(1); }}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: 20,
                  border: `1px solid ${filter === s ? (c?.color || 'var(--primary)') : 'var(--border)'}`,
                  background: filter === s ? (c?.bg || 'rgba(108,99,255,0.12)') : 'transparent',
                  color: filter === s ? (c?.color || 'var(--primary-light)') : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: filter === s ? 700 : 400,
                  transition: 'all 0.2s',
                  textTransform: 'capitalize',
                }}>
                {label}
              </button>
            );
          })}
        </div>

        {loading ? <Loader /> : (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const s = statusColors[order.orderStatus] || statusColors.placed;
                  const nextStatus = NEXT_STATUS[order.orderStatus];
                  return (
                    <tr key={order._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>#{order._id.slice(-8).toUpperCase()}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order.user?.name || 'N/A'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.user?.email}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem' }}>{order.items.length}</td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, fontSize: '0.9rem' }}>{fmt(order.totalAmount)}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontSize: '0.8rem', color: order.paymentStatus === 'paid' ? '#81C784' : '#FFD700', fontWeight: 600 }}>
                          {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Unpaid'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ background: s.bg, color: s.color, padding: '0.25rem 0.7rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' }}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {nextStatus && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, nextStatus)}
                            disabled={updating === order._id}
                            className="btn btn-primary"
                            style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', textTransform: 'capitalize' }}
                          >
                            {updating === order._id ? '...' : `→ ${nextStatus}`}
                          </button>
                        )}
                        {order.orderStatus === 'placed' && (
                          <button onClick={() => handleStatusUpdate(order._id, 'cancelled')} className="btn btn-danger" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', marginLeft: '0.4rem' }}>Cancel</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
