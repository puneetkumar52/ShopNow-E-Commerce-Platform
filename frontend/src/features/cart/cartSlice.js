import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/cart');
    return res.data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addToCart = createAsyncThunk('cart/add', async ({ productId, quantity = 1 }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post('/cart/add', { productId, quantity });
    toast.success('Added to cart!');
    return res.data.cart;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to add to cart');
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ productId, quantity }, { dispatch, rejectWithValue }) => {
  try {
    await axiosInstance.put(`/cart/${productId}`, { quantity });
    dispatch(fetchCart());
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to update cart');
    return rejectWithValue(err.response?.data?.message);
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (productId, { dispatch, rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/cart/${productId}`);
    toast.success('Removed from cart');
    dispatch(fetchCart());
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await axiosInstance.delete('/cart');
    return null;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const applyCoupon = createAsyncThunk('cart/applyCoupon', async (code, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post('/cart/coupon', { code });
    toast.success(res.data.message);
    return { code, discountPercent: res.data.discountPercent };
  } catch (err) {
    toast.error(err.response?.data?.message || 'Invalid coupon');
    return rejectWithValue(err.response?.data?.message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    coupon: null,
    totalPrice: 0,
    discountAmount: 0,
    finalPrice: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearCartState: (state) => {
      state.items = [];
      state.coupon = null;
      state.totalPrice = 0;
      state.discountAmount = 0;
      state.finalPrice = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        const cart = action.payload;
        state.items = cart.items || [];
        state.coupon = cart.coupon || null;
        state.totalPrice = cart.totalPrice || 0;
        state.discountAmount = cart.discountAmount || 0;
        state.finalPrice = cart.finalPrice || cart.totalPrice || 0;
      })
      .addCase(fetchCart.rejected, (state) => { state.loading = false; state.items = []; })
      .addCase(addToCart.fulfilled, (state, action) => {
        const cart = action.payload;
        state.items = cart.items || [];
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.coupon = null;
        state.totalPrice = 0;
        state.discountAmount = 0;
        state.finalPrice = 0;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.coupon = action.payload;
        state.discountAmount = Math.round((state.totalPrice * action.payload.discountPercent) / 100);
        state.finalPrice = state.totalPrice - state.discountAmount;
      });
  },
});

export const { clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
