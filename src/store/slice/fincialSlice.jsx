import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://modernbakery.shop';

export const fetchFinancialSummary = createAsyncThunk(
  'summary/fetchFinancialSummary',
  async (userId) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_URL}/api/projects/project-summary?userId=${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
);

const summarySlice = createSlice({
  name: 'summary',
  initialState: {
    overall: {
      totalIncome: 0,
      totalExpenses: 0,
      totalBalance: 0
    },
    projects: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFinancialSummary.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFinancialSummary.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.overall = action.payload.overall;
        state.projects = action.payload.projects;
      })
      .addCase(fetchFinancialSummary.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export default summarySlice.reducer;