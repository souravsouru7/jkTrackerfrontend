import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import config from '../../config';

const API = axios.create({
  baseURL: config.API_URL,
});

// Create shared expense
export const createSharedExpense = createAsyncThunk(
  'sharedExpense/create',
  async (expenseData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      const payload = {
        userId: user.id,
        amount: parseFloat(expenseData.amount),
        category: expenseData.category,
        description: expenseData.description,
        date: expenseData.date || new Date()
      };

      const response = await API.post(
        '/entries/shared-expense',  // Updated to match backend endpoint
        payload,
        {
          headers: { 'x-auth-token': token }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch shared expenses
export const fetchSharedExpenses = createAsyncThunk(
  'sharedExpense/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      const response = await API.get(
        `/entries/shared-expenses/${user.id}`,  // Updated to match backend endpoint
        {
          headers: { 'x-auth-token': token }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const sharedExpenseSlice = createSlice({
  name: 'sharedExpense',
  initialState: {
    expenses: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createSharedExpense.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createSharedExpense.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Handle the grouped response from the backend
        state.expenses.unshift({
          date: action.payload.entries[0].date,
          originalAmount: action.payload.originalAmount,
          distributedAmount: action.payload.distributedAmount,
          category: action.payload.entries[0].category,
          description: action.payload.entries[0].description,
          projects: action.payload.entries.map(entry => ({
            projectId: entry.projectId,
            amount: entry.amount
          }))
        });
      })
      .addCase(createSharedExpense.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchSharedExpenses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSharedExpenses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.expenses = action.payload;
      })
      .addCase(fetchSharedExpenses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default sharedExpenseSlice.reducer;
