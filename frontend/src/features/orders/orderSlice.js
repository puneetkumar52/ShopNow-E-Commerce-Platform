import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const createOrder = createAsyncThunk('orders/create', async (orderData, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post('/orders', orderData);
    return res.data.order;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create order');
  }
});

export const fetchUserOrders = createAsyncThunk('orders/fetchUser', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/orders/user');
    return res.data.orders;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchOrderById = createAsyncThunk('orders/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`/orders/${id}`);
    return res.data.order;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateOrderToPaid = createAsyncThunk('orders/pay', async ({ id, paymentData }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(`/orders/${id}/pay`, paymentData);
    return res.data.order;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const cancelOrder = createAsyncThunk('orders/cancel', async ({ id, reason }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(`/orders/${id}/cancel`, { reason });
    return res.data.order;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    order: null,
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    clearOrderState: (state) => { state.order = null; state.success = false; state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => { state.loading = true; state.success = false; })
      .addCase(createOrder.fulfilled, (state, action) => { state.loading = false; state.success = true; state.order = action.payload; })
      .addCase(createOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchUserOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchUserOrders.fulfilled, (state, action) => { state.loading = false; state.orders = action.payload; })
      .addCase(fetchUserOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchOrderById.pending, (state) => { state.loading = true; state.order = null; })
      .addCase(fetchOrderById.fulfilled, (state, action) => { state.loading = false; state.order = action.payload; })
      .addCase(fetchOrderById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.order = action.payload;
        state.orders = state.orders.map((o) => o._id === action.payload._id ? action.payload : o);
      });
  },
});

export const { clearOrderState } = orderSlice.actions;
export default orderSlice.reducer;
