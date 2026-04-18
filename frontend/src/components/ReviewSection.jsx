import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

const ReviewCard = ({ review }) => (
  <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6C63FF, #FF6584)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem' }}>
          {review.user?.name?.charAt(0) || 'U'}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{review.user?.name || 'Anonymous'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1,2,3,4,5].map((s) => (
          <span key={s} style={{ color: s <= review.rating ? '#FFD700' : 'var(--text-muted)', fontSize: '1rem' }}>★</span>
        ))}
      </div>
    </div>
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{review.comment}</p>
  </div>
);

const ReviewSection = ({ productId }) => {
  const { userInfo } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/reviews/${productId}`);
        setReviews(res.data.reviews || []);
      } catch {}
      setLoading(false);
    };
    if (productId) fetchReviews();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error('Please select a rating');
    if (!comment.trim()) return toast.error('Please write a comment');
    setSubmitting(true);
    try {
      await axiosInstance.post('/reviews', { productId, rating, comment });
      toast.success('Review submitted!');
      setRating(0); setComment('');
      const res = await axiosInstance.get(`/reviews/${productId}`);
      setReviews(res.data.reviews || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    }
    setSubmitting(false);
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Customer Reviews ({reviews.length})
      </h3>

      {userInfo && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', marginBottom: '2rem' }}>
          <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Write a Review</h4>
          <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
            {[1,2,3,4,5].map((s) => (
              <span key={s}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(s)}
                style={{ fontSize: '1.75rem', cursor: 'pointer', color: s <= (hovered || rating) ? '#FFD700' : 'var(--text-muted)', transition: 'transform 0.1s', transform: s <= hovered ? 'scale(1.2)' : 'scale(1)' }}>★</span>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={4}
            style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.75rem 1rem', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', outline: 'none', resize: 'vertical', marginBottom: '1rem' }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading reviews...</div> : reviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <div className="empty-state-title">No reviews yet</div>
          <p>Be the first to review this product!</p>
        </div>
      ) : (
        reviews.map((r) => <ReviewCard key={r._id} review={r} />)
      )}
    </div>
  );
};

export default ReviewSection;
