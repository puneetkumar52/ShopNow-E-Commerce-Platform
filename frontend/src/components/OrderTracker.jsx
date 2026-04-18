import React from 'react';

const OrderTracker = ({ status }) => {
  const steps = [
    { key: 'placed', label: 'Placed', icon: '📋' },
    { key: 'processing', label: 'Processing', icon: '⚙️' },
    { key: 'shipped', label: 'Shipped', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '✅' },
  ];

  const cancelled = status === 'cancelled';
  const currentIndex = cancelled ? -1 : steps.findIndex((s) => s.key === status);

  if (cancelled) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(244,67,54,0.06)', borderRadius: 12, border: '1px solid rgba(244,67,54,0.2)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>❌</div>
        <div style={{ color: '#EF9A9A', fontWeight: 700, fontSize: '1.1rem' }}>Order Cancelled</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
        {steps.map((step, index) => {
          const isDone = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <React.Fragment key={step.key}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem',
                  background: isDone ? 'var(--primary)' : isActive ? 'rgba(108,99,255,0.15)' : 'var(--surface-2)',
                  border: `2px solid ${isDone ? 'var(--primary)' : isActive ? 'var(--primary)' : 'var(--border)'}`,
                  boxShadow: isActive ? '0 0 20px rgba(108,99,255,0.4)' : 'none',
                  transition: 'all 0.3s',
                  animation: isActive ? 'pulse-glow 2s ease-in-out infinite' : 'none',
                }}>
                  {step.icon}
                </div>
                <span style={{
                  fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center',
                  color: isDone || isActive ? 'var(--primary-light)' : 'var(--text-muted)',
                  fontWeight: isDone || isActive ? 700 : 400,
                }}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div style={{
                  flex: 1, height: 2, marginTop: 24,
                  background: index < currentIndex ? 'var(--primary)' : 'var(--border)',
                  transition: 'background 0.3s',
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTracker;
