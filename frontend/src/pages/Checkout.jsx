import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../features/cart/cartSlice';
import { createOrder } from '../features/orders/orderSlice';
import axiosInstance from '../api/axiosInstance';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const fmt = (p) => `₹${Number(p || 0).toLocaleString('en-IN')}`;

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, finalPrice, totalPrice, discountAmount, coupon } = useSelector((s) => s.cart);
  const { userInfo } = useSelector((s) => s.auth);
  const { loading, success, order } = useSelector((s) => s.orders);
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  const [address, setAddress] = useState({
    fullName: userInfo?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  const shipping = (finalPrice || totalPrice) > 500 ? 0 : 49;
  const tax = Math.round((finalPrice || totalPrice) * 0.18);
  const total = (finalPrice || totalPrice) + shipping + tax;

  useEffect(() => { dispatch(fetchCart()); }, []);

  useEffect(() => {
    if (success && order) {
      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully!');
        navigate(`/orders/${order._id}`);
      }
    }
  }, [success, order]);

  const handleAddressChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const handlePlaceOrder = async () => {
    // Validate address
    const required = ['fullName', 'phone', 'street', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!address[field]) return toast.error(`Please fill in ${field}`);
    }

    if (paymentMethod === 'cod') {
      await dispatch(createOrder({ shippingAddress: address, paymentMethod: 'cod', couponCode: coupon?.code }));
      return;
    }

    // Razorpay flow
    try {
      const orderResult = await dispatch(createOrder({ shippingAddress: address, paymentMethod: 'razorpay', couponCode: coupon?.code }));
      if (!createOrder.fulfilled.match(orderResult)) return;

      const createdOrder = orderResult.payload;

      const payRes = await axiosInstance.post('/payment/create-order', {
        amount: createdOrder.totalAmount,
        orderId: createdOrder._id,
      });

      const { order: rzpOrder, key } = payRes.data;

      if (rzpOrder.id.startsWith('order_mock_')) {
        // Dev mode: simulate payment
        await axiosInstance.put(`/orders/${createdOrder._id}/pay`, {
          razorpayOrderId: rzpOrder.id,
          razorpayPaymentId: 'pay_mock_' + Date.now(),
          razorpaySignature: 'mock_signature',
        });
        toast.success('Payment successful! (Dev mode)');
        navigate(`/orders/${createdOrder._id}`);
        return;
      }

      const options = {
        key,
        amount: rzpOrder.amount,
        currency: 'INR',
        name: 'ShopNow',
        description: 'Order Payment',
        order_id: rzpOrder.id,
        handler: async (response) => {
          try {
            await axiosInstance.post('/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: createdOrder._id,
            });
            toast.success('Payment successful! 🎉');
            navigate(`/orders/${createdOrder._id}`);
          } catch {
            toast.error('Payment verification failed');
          }
        },
        prefill: { name: userInfo?.name, email: userInfo?.email },
        theme: { color: '#6C63FF' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Payment initialization failed');
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="page-padding">
      <div className="container">
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem' }}>🏁 Checkout</h1>

        <div className="checkout-layout">
          {/* Left: Address + Payment */}
          <div>
            {/* Shipping Address */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📍 Shipping Address</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { name: 'fullName', label: 'Full Name', span: false },
                  { name: 'phone', label: 'Phone Number', span: false },
                  { name: 'street', label: 'Street Address', span: true },
                  { name: 'city', label: 'City', span: false },
                  { name: 'state', label: 'State', span: false },
                  { name: 'pincode', label: 'Pincode', span: false },
                  { name: 'country', label: 'Country', span: false },
                ].map(({ name, label, span }) => (
                  <div key={name} style={{ gridColumn: span ? '1 / -1' : undefined }} className="form-group">
                    <label className="form-label">{label}</label>
                    <input name={name} value={address[name]} onChange={handleAddressChange} className="form-input" placeholder={label} />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>💳 Payment Method</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { value: 'razorpay', label: '💳 Pay Online (Razorpay)', desc: 'Cards, UPI, NetBanking, Wallets' },
                  { value: 'cod', label: '💵 Cash on Delivery', desc: 'Pay when your order arrives' },
                ].map(({ value, label, desc }) => (
                  <label key={value} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem 1.25rem',
                    border: `2px solid ${paymentMethod === value ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                    background: paymentMethod === value ? 'rgba(108,99,255,0.06)' : 'transparent',
                  }}>
                    <input type="radio" value={value} checked={paymentMethod === value} onChange={(e) => setPaymentMethod(e.target.value)} style={{ marginTop: 4, accentColor: 'var(--primary)' }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.5rem', position: 'sticky', top: 80 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {items.map((item) => (
                <div key={item.product?._id || item.product} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <img src={item.image} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.3 }}>{item.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{fmt(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span><span>{fmt(totalPrice)}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: '#81C784' }}>Discount</span><span style={{ color: '#81C784' }}>-{fmt(discountAmount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
                <span style={{ color: shipping === 0 ? '#81C784' : 'var(--text-primary)' }}>{shipping === 0 ? 'FREE' : fmt(shipping)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Tax (18%)</span><span>{fmt(tax)}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1.15rem' }}>
                <span>Total</span>
                <span style={{ background: 'linear-gradient(135deg, #6C63FF, #FF6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {fmt(total)}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1rem', justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? '⏳ Processing...' : paymentMethod === 'cod' ? '📦 Place Order' : '💳 Proceed to Pay'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              🔒 128-bit SSL Secured Checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
