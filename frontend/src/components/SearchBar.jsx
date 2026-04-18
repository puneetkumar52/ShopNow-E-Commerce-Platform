import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/?keyword=${encodeURIComponent(query.trim())}`);
    }
  };

  // Debounced search
  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (val.trim().length > 2) {
        navigate(`/?keyword=${encodeURIComponent(val.trim())}`);
      } else if (val.trim() === '') {
        navigate('/');
      }
    }, 400);
  };

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  return (
    <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search products, brands..."
        style={{
          width: '100%',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 50,
          padding: '0.6rem 1rem 0.6rem 2.75rem',
          color: 'var(--text-primary)',
          fontSize: '0.9rem',
          fontFamily: 'Inter, sans-serif',
          outline: 'none',
          transition: 'all 0.2s',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.15)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
      />
      <SearchIcon
        style={{
          position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)', fontSize: '1.1rem', pointerEvents: 'none',
        }}
      />
    </form>
  );
};

export default SearchBar;
