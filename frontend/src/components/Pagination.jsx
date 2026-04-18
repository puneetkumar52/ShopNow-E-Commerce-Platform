import React from 'react';

const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;

  const pageNumbers = [];
  const delta = 2;
  const range = [];
  const rangeWithDots = [];

  for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
    range.push(i);
  }

  if (range[0] > 2) rangeWithDots.push('...');
  rangeWithDots.unshift(1);
  range.forEach((p) => rangeWithDots.push(p));
  if (range[range.length - 1] < pages - 1) rangeWithDots.push('...');
  if (pages > 1) rangeWithDots.push(pages);

  return (
    <div className="pagination">
      <button
        className="page-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >←</button>

      {rangeWithDots.map((p, i) =>
        p === '...' ? (
          <span key={`dot-${i}`} style={{ color: 'var(--text-muted)', padding: '0 0.25rem' }}>…</span>
        ) : (
          <button
            key={p}
            className={`page-btn ${p === page ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
          >{p}</button>
        )
      )}

      <button
        className="page-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
      >→</button>
    </div>
  );
};

export default Pagination;
