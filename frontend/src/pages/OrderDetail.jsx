import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById, cancelOrder } from '../features/orders/orderSlice';
import OrderTracker from '../components/OrderTracker';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const fmt = (p) => `₹${Number(p || 0).toLocaleString('en-IN')}`;

const OrderDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { order, loading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchOrderById(id)); }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    const result = await dispatch(cancelOrder({ id, reason: 'Cancelled by customer' }));
    if (cancelOrder.fulfilled.match(result)) toast.success('Order cancelled');
  };

  if (loading) return <Loader />;
  if (!order) return <div className="empty-state"><div className="empty-state-title">Order not found</div></div>;

  return (
    <div className="page-padding">
      <div className="container" style={{ maxWidth: 860 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => navigate('/orders')} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.5rem 1rem', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            ← Back to Orders
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Order Details</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>#{order._id.toUpperCase()}</p>
          </div>
        </div>

        {/* Tracker */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Order Status</h3>
          <OrderTracker status={order.orderStatus} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            {['placed', 'processing'].includes(order.orderStatus) && (
              <button onClick={handleCancel} className="btn btn-danger" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                Cancel Order
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Shipping */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>📍 Shipping Address</h3>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <strong style={{ color: 'var(--text-primary)' }}>{order.shippingAddress?.fullName}</strong><br />
              {order.shippingAddress?.phone}<br />
              {order.shippingAddress?.street}<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}<br />
              {order.shippingAddress?.country}
            </div>
          </div>

          {/* Payment */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>💳 Payment Info</h3>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Method</span><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{order.paymentMethod === 'razorpay' ? '💳 Razorpay' : '💵 Cash on Delivery'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Status</span>
                <span style={{ color: order.paymentStatus === 'paid' ? '#81C784' : '#FFD700', fontWeight: 600 }}>
                  {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total</span><span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{fmt(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '1rem' }}>📦 Order Items</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {order.items.map((item) => (
              <div key={item._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem', background: 'var(--surface-2)', borderRadius: 12 }}>
                <img src={item.image} alt={item.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10 }} />
                <div style={{ flex: 1 }}>
                  <Link to={`/products/${item.product}`} style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.95rem' }}>{item.name}</Link>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Qty: {item.quantity} × {fmt(item.price)}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{fmt(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '1.5rem', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[['Items', fmt(order.itemsPrice)], ['Shipping', order.shippingPrice === 0 ? 'FREE' : fmt(order.shippingPrice)], ['Tax (GST 18%)', fmt(order.taxPrice)]].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ color: value === 'FREE' ? '#81C784' : 'var(--text-primary)' }}>{value}</span>
              </div>
            ))}
            {order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: '#81C784' }}>Coupon Discount</span>
                <span style={{ color: '#81C784' }}>-{fmt(order.discount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1.15rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
              <span>Grand Total</span>
              <span style={{ background: 'linear-gradient(135deg, #6C63FF, #FF6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{fmt(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
