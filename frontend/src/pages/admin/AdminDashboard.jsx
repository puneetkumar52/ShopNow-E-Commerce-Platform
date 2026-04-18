import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';
import Loader from '../../components/Loader';

const fmt = (p) => `₹${Number(p || 0).toLocaleString('en-IN')}`;

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#6C63FF','#FF6584','#43D9B5','#FFD700','#FF8C42'];

const statusColors = {
  placed: '#64B5F6', processing: '#FFD700', shipped: '#CE93D8',
  delivered: '#81C784', cancelled: '#EF9A9A',
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/admin/stats').then((res) => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (!data) return <div className="empty-state"><div className="empty-state-title">Failed to load dashboard</div></div>;

  const { stats, monthlyRevenue, ordersByStatus, topProducts, recentOrders } = data;

  const chartData = monthlyRevenue.map((m) => ({
    name: MONTHS[m._id.month - 1],
    revenue: m.revenue,
    orders: m.orders,
  }));

  const pieData = ordersByStatus.map((s) => ({ name: s._id, value: s.count }));

  const statCards = [
    { icon: '💰', label: 'Total Revenue', value: fmt(stats.totalRevenue), color: '#6C63FF', trend: '+12.5%', up: true },
    { icon: '📦', label: 'Total Orders', value: stats.totalOrders?.toLocaleString(), color: '#FF6584', trend: '+8.2%', up: true },
    { icon: '🛍️', label: 'Total Products', value: stats.totalProducts?.toLocaleString(), color: '#43D9B5', trend: '+3.1%', up: true },
    { icon: '👥', label: 'Total Users', value: stats.totalUsers?.toLocaleString(), color: '#FFD700', trend: '+15.7%', up: true },
  ];

  return (
    <div className="page-padding">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>📊 Admin Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Welcome back! Here's what's happening today.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/admin/products" className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>Manage Products</Link>
            <Link to="/admin/orders" className="btn btn-primary" style={{ fontSize: '0.875rem' }}>Manage Orders</Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {statCards.map((card) => (
            <div key={card.label} className="stat-card">
              <div className="stat-icon" style={{ background: card.color + '22' }}>
                <span style={{ fontSize: '1.5rem' }}>{card.icon}</span>
              </div>
              <div className="stat-number" style={{ color: card.color }}>{card.value}</div>
              <div className="stat-label">{card.label}</div>
              <div className={`stat-trend ${card.up ? 'up' : 'down'}`}>{card.up ? '↑' : '↓'} {card.trend} from last month</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Revenue Chart */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.75rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>📈 Revenue Overview (Last 6 Months)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#9999BB', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: '#9999BB', fontSize: 12 }} axisLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: '#1C1C28', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#F0F0FF' }} formatter={(v) => [fmt(v), 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#6C63FF" strokeWidth={3} dot={{ fill: '#6C63FF', r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Orders by Status Pie */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.75rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>🥧 Orders by Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1C1C28', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#F0F0FF' }} />
                <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'capitalize' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Top Products */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.75rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>🏆 Top Selling Products</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topProducts.map((p, i) => (
                <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: i < 3 ? '#0A0A0F' : 'var(--text-muted)', flexShrink: 0 }}>{i + 1}</span>
                  <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}>{p.sold} sold</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontWeight: 700 }}>🕐 Recent Orders</h3>
              <Link to="/admin/orders" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>View All →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {recentOrders.slice(0, 5).map((order) => (
                <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem', background: 'var(--surface-2)', borderRadius: 10 }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{order.user?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>#{order._id.slice(-6).toUpperCase()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{fmt(order.totalAmount)}</div>
                    <span style={{ fontSize: '0.7rem', color: statusColors[order.orderStatus], fontWeight: 600 }}>{order.orderStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
