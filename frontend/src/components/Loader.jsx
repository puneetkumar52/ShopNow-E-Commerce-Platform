import React from 'react';

const Loader = ({ fullPage = false, size = 48 }) => {
  const wrapper = fullPage
    ? { position: 'fixed', inset: 0, background: 'rgba(10,10,15,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }
    : { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' };

  return (
    <div style={wrapper}>
      <div style={{
        width: size, height: size,
        border: '3px solid rgba(108,99,255,0.2)',
        borderTop: '3px solid var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  );
};

export default Loader;
