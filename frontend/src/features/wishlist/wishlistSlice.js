import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/wishlist');
    return res.data.products;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post('/wishlist/toggle', { productId });
    toast.success(res.data.message);
    return { productId, added: res.data.added };
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed');
    return rejectWithValue(err.response?.data?.message);
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => { state.items = action.payload; })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { productId, added } = action.payload;
        if (added) {
          // Will be refreshed on next fetch
        } else {
          state.items = state.items.filter((p) => p._id !== productId);
        }
      });
  },
});

export default wishlistSlice.reducer;
