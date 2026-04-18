import React from 'react';

const RatingStars = ({ rating, size = 'sm', showCount = false, count = 0 }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  const starSize = size === 'lg' ? '1.4rem' : size === 'md' ? '1.1rem' : '0.9rem';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} style={{ fontSize: starSize, color: '#FFD700' }}>★</span>
      ))}
      {hasHalf && <span style={{ fontSize: starSize, color: '#FFD700' }}>☆</span>}
      {[...Array(Math.max(0, emptyStars))].map((_, i) => (
        <span key={`empty-${i}`} style={{ fontSize: starSize, color: 'var(--text-muted)' }}>★</span>
      ))}
      {showCount && (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.3rem' }}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
};

export default RatingStars;
