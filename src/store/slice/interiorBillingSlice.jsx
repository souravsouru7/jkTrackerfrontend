import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

const initialState = {
  bills: [],
  loading: false,
  error: null,
  currentBill: null,
  documentType: null,
  loadingStates: {
    fetchBills: false,
    createBill: false,
    updateBill: false,
    generatePDF: false,
    fetchBillById: false
  }
};

// Add this helper function at the top
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'x-auth-token': token } : {};
};

export const fetchAllBills = createAsyncThunk(
  'interiorBilling/fetchAllBills',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/api/interior/bills', {
        headers: getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized access');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bills');
    }
  }
);

export const fetchBillById = createAsyncThunk(
  'interiorBilling/fetchBillById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.get(`/api/interior/bills/${id}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized access');
      }
      return rejectWithValue(error.response.data);
    }
  }
);

export const generatePDF = createAsyncThunk(
  'interiorBilling/generatePDF',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.get(`/api/interior/bills/${id}/pdf`, {
        headers: getAuthHeader(),
        responseType: 'blob'
      });

      // Create a blob from the PDF stream
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bill-${id}.pdf`);
      
      // Append to body, click, and cleanup
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return id;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized access');
      }
      return rejectWithValue(error.response?.data || 'Failed to generate PDF');
    }
  }
);

export const createBill = createAsyncThunk(
  'interiorBilling/createBill',
  async (billData, { rejectWithValue }) => {
    try {
      // Ensure documentType is set, default to 'Invoice' if not provided
      const billDataWithType = {
        ...billData,
        documentType: billData.documentType || 'Invoice'
      };
      
      const response = await API.post('/api/interior/bills', billDataWithType, {
        headers: getAuthHeader()
      });
      if (!response.data || !response.data._id) {
        throw new Error('Invalid response from server');
      }

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized access');
      }
      console.error('Create bill error:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create bill');
    }
  }
);

export const updateBill = createAsyncThunk(
  'interiorBilling/updateBill',
  async ({ id, billData }, { rejectWithValue }) => {
    try {
      // Transform customerName to clientName for backend compatibility
      const transformedData = {
        ...billData,
        clientName: billData.clientName,
        documentType: billData.documentType || 'Invoice'
      };
      delete transformedData.customerName; // Remove the old field
      
      const response = await API.put(`/api/interior/bills/${id}`, transformedData, {
        headers: getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized access');
      }
      return rejectWithValue(error.response.data);
    }
  }
);

const interiorBillingSlice = createSlice({
  name: 'interiorBilling',
  initialState,
  reducers: {
    clearCurrentBill: (state) => {
      state.currentBill = null;
    },
    resetLoadingStates: (state) => {
      state.loadingStates = initialState.loadingStates;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all bills
      .addCase(fetchAllBills.pending, (state) => {
        state.loadingStates.fetchBills = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBills.fulfilled, (state, action) => {
        state.loadingStates.fetchBills = false;
        state.loading = false;
        state.bills = action.payload;
        state.error = null;
      })
      .addCase(fetchAllBills.rejected, (state, action) => {
        state.loadingStates.fetchBills = false;
        state.loading = false;
        state.error = action.payload || 'Failed to fetch bills';
        state.bills = [];
      })
      // Fetch single bill
      .addCase(fetchBillById.pending, (state) => {
        state.loadingStates.fetchBillById = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillById.fulfilled, (state, action) => {
        state.loadingStates.fetchBillById = false;
        state.loading = false;
        state.currentBill = action.payload;
      })
      .addCase(fetchBillById.rejected, (state, action) => {
        state.loadingStates.fetchBillById = false;
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch bill';
      })
      // Create bill
      .addCase(createBill.pending, (state) => {
        state.loadingStates.createBill = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(createBill.fulfilled, (state, action) => {
        state.loadingStates.createBill = false;
        state.loading = false;
        state.bills.unshift(action.payload);
      })
      .addCase(createBill.rejected, (state, action) => {
        state.loadingStates.createBill = false;
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create bill';
      })
      // Update bill
      .addCase(updateBill.pending, (state) => {
        state.loadingStates.updateBill = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBill.fulfilled, (state, action) => {
        state.loadingStates.updateBill = false;
        state.loading = false;
        const index = state.bills.findIndex(bill => bill._id === action.payload._id);
        if (index !== -1) {
          state.bills[index] = action.payload;
        }
      })
      .addCase(updateBill.rejected, (state, action) => {
        state.loadingStates.updateBill = false;
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update bill';
      })
      // Generate PDF
      .addCase(generatePDF.pending, (state) => {
        state.loadingStates.generatePDF = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(generatePDF.fulfilled, (state) => {
        state.loadingStates.generatePDF = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(generatePDF.rejected, (state, action) => {
        state.loadingStates.generatePDF = false;
        state.loading = false;
        state.error = action.payload || 'Failed to generate PDF';
      });
  }
});

export const { clearCurrentBill, resetLoadingStates } = interiorBillingSlice.actions;
export default interiorBillingSlice.reducer;
