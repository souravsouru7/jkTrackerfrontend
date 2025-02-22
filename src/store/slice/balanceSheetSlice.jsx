// features/balanceSheetSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import config from '../../config';

const API_URL = config.API_URL;

// Fetch summary for selected project
export const fetchBalanceSummary = createAsyncThunk(
  'balanceSheet/fetchSummary',
  async (userId, { getState }) => {
    const selectedProject = getState().projects.selectedProject;
    if (!selectedProject) return null;

    const response = await axios.get(`${API_URL}/balance-sheet/summary`, {
      params: {
        userId,
        projectId: selectedProject._id
      }
    });
    return response.data;
  }
);

// Fetch overall summary across all projects
export const fetchTotalCalculations = createAsyncThunk(
  'balanceSheet/fetchTotalCalculations',
  async (userId) => {
    const response = await axios.get(`${API_URL}/balance-sheet/user/total-calculations`, {
      params: { userId }
    });
    return response.data;
  }
);

// Fetch detailed project balance sheet
export const fetchProjectDetails = createAsyncThunk(
  'balanceSheet/fetchProjectDetails',
  async ({ userId, projectId }) => {
    const response = await axios.get(`${API_URL}/balance-sheet/project-details/${projectId}`, {
      params: { userId }
    });
    return response.data;
  }
);

// Generate PDF balance sheet with selected items
export const generateBalanceSheetPDF = createAsyncThunk(
  'balanceSheet/generatePDF',
  async ({ userId, projectId, selectedItems }) => {
    // Transform selected items into categories format expected by backend
    const categories = [...new Set(selectedItems.map(item => item.category))];
    
    const response = await axios.post(
      `${API_URL}/balance-sheet/generate-pdf`,
      { 
        userId, 
        projectId, 
        selectedCategories: categories,
        selectedItems: selectedItems 
      },
      {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      }
    );
    
    // Create blob URL and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'balance-sheet.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return true;
  }
);

const balanceSheetSlice = createSlice({
  name: 'balanceSheet',
  initialState: {
    summary: {
      data: null,
      loading: false,
      error: null
    },
    totalCalculations: {
      data: null,
      loading: false,
      error: null
    },
    projectDetails: {
      data: null,
      loading: false,
      error: null
    },
    pdfGeneration: {
      loading: false,
      error: null
    },
    selectedItems: []
  },
  reducers: {
    toggleSelectedItem: (state, action) => {
      const item = action.payload;
      const existingIndex = state.selectedItems.findIndex(
        i => i.id === item.id && i.type === item.type
      );
      
      if (existingIndex >= 0) {
        state.selectedItems.splice(existingIndex, 1);
      } else {
        state.selectedItems.push(item);
      }
    },
    clearSelectedItems: (state) => {
      state.selectedItems = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Summary reducers
      .addCase(fetchBalanceSummary.pending, (state) => {
        state.summary.loading = true;
        state.summary.error = null;
      })
      .addCase(fetchBalanceSummary.fulfilled, (state, action) => {
        state.summary.loading = false;
        state.summary.data = action.payload;
      })
      .addCase(fetchBalanceSummary.rejected, (state, action) => {
        state.summary.loading = false;
        state.summary.error = action.error.message;
      })
      // Total calculations reducers
      .addCase(fetchTotalCalculations.pending, (state) => {
        state.totalCalculations.loading = true;
        state.totalCalculations.error = null;
      })
      .addCase(fetchTotalCalculations.fulfilled, (state, action) => {
        state.totalCalculations.loading = false;
        state.totalCalculations.data = action.payload.data;
      })
      .addCase(fetchTotalCalculations.rejected, (state, action) => {
        state.totalCalculations.loading = false;
        state.totalCalculations.error = action.error.message;
      })
      // Project details reducers
      .addCase(fetchProjectDetails.pending, (state) => {
        state.projectDetails.loading = true;
        state.projectDetails.error = null;
      })
      .addCase(fetchProjectDetails.fulfilled, (state, action) => {
        state.projectDetails.loading = false;
        state.projectDetails.data = action.payload.data;
      })
      .addCase(fetchProjectDetails.rejected, (state, action) => {
        state.projectDetails.loading = false;
        state.projectDetails.error = action.error.message;
      })
      // PDF Generation reducers
      .addCase(generateBalanceSheetPDF.pending, (state) => {
        state.pdfGeneration.loading = true;
        state.pdfGeneration.error = null;
      })
      .addCase(generateBalanceSheetPDF.fulfilled, (state) => {
        state.pdfGeneration.loading = false;
      })
      .addCase(generateBalanceSheetPDF.rejected, (state, action) => {
        state.pdfGeneration.loading = false;
        state.pdfGeneration.error = action.error.message;
      });
  },
});

// Export actions
export const { toggleSelectedItem, clearSelectedItems } = balanceSheetSlice.actions;

export default balanceSheetSlice.reducer;