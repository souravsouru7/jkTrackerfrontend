import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import config from '../../config';

const API = axios.create({
  baseURL: config.API_URL,
});

// Fetch custom categories
export const fetchCustomCategories = createAsyncThunk(
  'categories/fetchCustomCategories',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await API.get(`/api/categories/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Add custom category
export const addCustomCategory = createAsyncThunk(
  'categories/addCustomCategory',
  async ({ userId, type, category }, { rejectWithValue }) => {
    try {
      const response = await API.post('/api/categories', {
        userId,
        type,
        category
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    customCategories: {
      Expense: [],
      Income: []
    },
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomCategories.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCustomCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.customCategories = action.payload;
        state.error = null;
      })
      .addCase(fetchCustomCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addCustomCategory.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addCustomCategory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { type, category } = action.payload;
        if (!state.customCategories[type].includes(category)) {
          state.customCategories[type].push(category);
        }
        state.error = null;
      })
      .addCase(addCustomCategory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export default categorySlice.reducer; 