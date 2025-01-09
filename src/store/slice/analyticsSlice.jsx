import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'https://modernbakery.shop';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchMonthlyExpenses = createAsyncThunk(
  'analytics/fetchMonthlyExpenses',
  async ({ userId, projectId }) => {
    const response = await axios.get(`${BASE_URL}/analytics/monthly-expenses?userId=${userId}&projectId=${projectId}`);
    return response.data;
  }
);

export const fetchIncomeVsExpense = createAsyncThunk(
  'analytics/fetchIncomeVsExpense',
  async ({ userId, projectId }) => {
    const response = await axios.get(`${BASE_URL}/analytics/income-vs-expense?userId=${userId}&projectId=${projectId}`);
    return response.data;
  }
);

export const fetchCategoryExpenses = createAsyncThunk(
  'analytics/fetchCategoryExpenses',
  async ({ userId, projectId }) => {
    const response = await axios.get(`${BASE_URL}/analytics/category-expenses?userId=${userId}&projectId=${projectId}`);
    return response.data;
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    monthlyExpenses: [],
    incomeVsExpense: [],
    categoryExpenses: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Monthly Expenses
      .addCase(fetchMonthlyExpenses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMonthlyExpenses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.monthlyExpenses = action.payload;
      })
      .addCase(fetchMonthlyExpenses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Income vs Expense
      .addCase(fetchIncomeVsExpense.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchIncomeVsExpense.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.incomeVsExpense = action.payload;
      })
      .addCase(fetchIncomeVsExpense.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Category Expenses
      .addCase(fetchCategoryExpenses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategoryExpenses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categoryExpenses = action.payload;
      })
      .addCase(fetchCategoryExpenses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default analyticsSlice.reducer;