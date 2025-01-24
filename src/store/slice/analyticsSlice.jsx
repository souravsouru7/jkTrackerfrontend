import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import config from '../../config';

const BASE_URL = config.API_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper function to format monthly expenses data
const formatMonthlyExpenses = (data) => {
  return data.map(item => ({
    month: item.month,
    amount: Number(item.amount) || 0
  }));
};

// Helper function to format income vs expense data
const formatIncomeVsExpense = (data) => {
  const result = [];
  data.forEach(item => {
    result.push({
      name: item.name,
      value: Number(item.value) || 0
    });
  });
  return result;
};

// Helper function to format category analysis data
const formatCategoryAnalysis = (data) => {
  return data.map(item => ({
    name: item.name || 'Uncategorized',
    value: Number(item.value) || 0
  }));
};

export const fetchMonthlyExpenses = createAsyncThunk(
  'analytics/fetchMonthlyExpenses',
  async ({ userId, projectId }) => {
    const response = await axios.get(
      `${BASE_URL}/analytics/monthly-expenses?userId=${userId}&projectId=${projectId}`,
      { headers: getAuthHeader() }
    );
    return formatMonthlyExpenses(response.data);
  }
);

export const fetchIncomeVsExpense = createAsyncThunk(
  'analytics/fetchIncomeVsExpense',
  async ({ userId, projectId }) => {
    const response = await axios.get(
      `${BASE_URL}/analytics/income-vs-expense?userId=${userId}&projectId=${projectId}`,
      { headers: getAuthHeader() }
    );
    return formatIncomeVsExpense(response.data);
  }
);

export const fetchCategoryExpenses = createAsyncThunk(
  'analytics/fetchCategoryExpenses',
  async ({ userId, projectId }) => {
    const response = await axios.get(
      `${BASE_URL}/analytics/category-expenses?userId=${userId}&projectId=${projectId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  }
);

export const fetchCategoryAnalysis = createAsyncThunk(
  'analytics/fetchCategoryAnalysis',
  async ({ userId, projectId }) => {
    const response = await axios.get(
      `${BASE_URL}/analytics/category-analysis?userId=${userId}&projectId=${projectId}`,
      { headers: getAuthHeader() }
    );
    return formatCategoryAnalysis(response.data);
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    monthlyExpenses: [],
    incomeVsExpense: [],
    categoryExpenses: [],
    categoryAnalysis: [],
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
      })
      // Category Analysis
      .addCase(fetchCategoryAnalysis.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategoryAnalysis.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categoryAnalysis = action.payload;
      })
      .addCase(fetchCategoryAnalysis.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default analyticsSlice.reducer;