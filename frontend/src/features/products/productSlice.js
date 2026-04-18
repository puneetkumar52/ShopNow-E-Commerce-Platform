import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await axiosInstance.get(`/products?${query}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
  }
});

export const fetchProductById = createAsyncThunk('products/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`/products/${id}`);
    return res.data.product;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Product not found');
  }
});

export const fetchFeaturedProducts = createAsyncThunk('products/fetchFeatured', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/products/featured');
    return res.data.products;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const createProduct = createAsyncThunk('products/create', async (formData, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.product;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create product');
  }
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.product;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update product');
  }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/products/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete product');
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    product: null,
    featuredProducts: [],
    loading: false,
    error: null,
    page: 1,
    pages: 1,
    total: 0,
  },
  reducers: {
    clearProductError: (state) => { state.error = null; },
    clearProduct: (state) => { state.product = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchProductById.pending, (state) => { state.loading = true; state.product = null; })
      .addCase(fetchProductById.fulfilled, (state, action) => { state.loading = false; state.product = action.payload; })
      .addCase(fetchProductById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => { state.featuredProducts = action.payload; })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p._id !== action.payload);
      });
  },
});

export const { clearProductError, clearProduct } = productSlice.actions;
export default productSlice.reducer;
