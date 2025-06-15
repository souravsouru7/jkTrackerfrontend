import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';
import axios from 'axios';

const initialState = {
  bills: [],
  loading: false,
  error: null,
  currentBill: null,
  documentType: null,
  unconnectedBills: [],
  projectBills: [],
  loadingStates: {
    fetchBills: false,
    createBill: false,
    updateBill: false,
    generatePDF: false,
    fetchBillById: false,
    connectingBill: false,
    disconnectingBill: false,
    fetchingUnconnectedBills: false,
    fetchingProjectBills: false
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
  async (billId) => {
    try {
      const response = await API.get(`/api/interior/bills/${billId}/pdf`, {
        headers: getAuthHeader(),
        responseType: 'blob'
      });
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `interior-bill-${billId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw error.response?.data?.message || 'Failed to generate PDF';
    }
  }
);

export const createBill = createAsyncThunk(
  'interiorBilling/createBill',
  async (billData) => {
    try {
      const response = await API.post('/api/interior/bills', billData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Bill Creation Error:', error);
      throw error.response?.data?.message || 'Failed to create bill';
    }
  }
);

export const updateBill = createAsyncThunk(
  'interiorBilling/updateBill',
  async ({ id, billData }, { rejectWithValue }) => {
    try {
      // Calculate totals with quantity
      const calculatedItems = billData.items.map(item => {
        const processedItem = { ...item };
        if (item.unit === 'Sft') {
          processedItem.squareFeet = item.width * item.height;
          processedItem.total = processedItem.squareFeet * item.pricePerUnit * (item.quantity || 1);
        } else {
          processedItem.total = item.pricePerUnit * (item.quantity || 1);
        }
        // Ensure quantity is explicitly set
        processedItem.quantity = item.quantity || 1;
        return processedItem;
      });

      const grandTotal = calculatedItems.reduce((sum, item) => sum + item.total, 0);
      const discountAmount = billData.discountType === 'percentage' 
        ? (billData.discountValue * grandTotal) / 100 
        : billData.discountValue || 0;
      const finalAmount = grandTotal - discountAmount;

      const transformedData = {
        ...billData,
        items: calculatedItems,
        grandTotal,
        discount: discountAmount,
        finalAmount,
        documentType: billData.documentType || 'Invoice',
        date: new Date(billData.billDate).toISOString()
      };
      
      console.log('Sending updated bill data to backend:', transformedData);
      
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

export const duplicateBill = createAsyncThunk(
  'interiorBilling/duplicateBill',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.post(`/api/interior/bills/${id}/duplicate`, {}, {
        headers: getAuthHeader()
      });
      
      // Fetch all bills after successful duplication to get updated list
      const updatedBillsResponse = await API.get('/api/interior/bills', {
        headers: getAuthHeader()
      });
      
      return updatedBillsResponse.data.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized access');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to duplicate bill');
    }
  }
);

// Update the fetchUnconnectedBills thunk
export const fetchUnconnectedBills = createAsyncThunk(
  'interiorBilling/fetchUnconnectedBills',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching unconnected bills...'); // Debug log
      const response = await API.get('/api/interior/bills/unconnected', {
        headers: getAuthHeader()
      });
      console.log('Unconnected bills response:', response.data); // Debug log
      return response.data.data;
    } catch (error) {
      console.error('Error fetching unconnected bills:', error); // Debug log
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unconnected bills');
    }
  }
);

// Update the fetchProjectBills thunk
export const fetchProjectBills = createAsyncThunk(
  'interiorBilling/fetchProjectBills',
  async (projectId, { rejectWithValue }) => {
    try {
      console.log('Fetching project bills for projectId:', projectId); // Debug log
      const response = await API.get(`/api/interior/projects/${projectId}/bills`, {
        headers: getAuthHeader()
      });
      console.log('Project bills response:', response.data); // Debug log
      return response.data.data;
    } catch (error) {
      console.error('Error fetching project bills:', error); // Debug log
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project bills');
    }
  }
);

export const connectBillToProject = createAsyncThunk(
  'interiorBilling/connectBillToProject',
  async ({ billId, projectId }, { rejectWithValue }) => {
    try {
      const response = await API.post(
        `/api/interior/bills/${billId}/connect-project/${projectId}`,
        {},
        { headers: getAuthHeader() }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to connect bill');
    }
  }
);

export const disconnectBillFromProject = createAsyncThunk(
  'interiorBilling/disconnectBillFromProject',
  async (billId, { rejectWithValue }) => {
    try {
      const response = await API.post(
        `/api/interior/bills/${billId}/disconnect-project`,
        {},
        { headers: getAuthHeader() }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to disconnect bill');
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
        state.loading = true;
        state.error = null;
      })
      .addCase(createBill.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = [action.payload, ...state.bills];
        state.error = null;
      })
      .addCase(createBill.rejected, (state, action) => {
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
        state.loading = true;
        state.error = null;
      })
      .addCase(generatePDF.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(generatePDF.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to generate PDF';
      })
      // Duplicate bill
      .addCase(duplicateBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(duplicateBill.fulfilled, (state, action) => {
        state.loading = false;
        // Replace entire bills array with new data
        state.bills = action.payload;
      })
      .addCase(duplicateBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to duplicate bill';
      })
      // Fetch unconnected bills
      .addCase(fetchUnconnectedBills.pending, (state) => {
        state.loadingStates.fetchingUnconnectedBills = true;
      })
      .addCase(fetchUnconnectedBills.fulfilled, (state, action) => {
        state.loadingStates.fetchingUnconnectedBills = false;
        state.unconnectedBills = action.payload;
      })
      .addCase(fetchUnconnectedBills.rejected, (state) => {
        state.loadingStates.fetchingUnconnectedBills = false;
      })
      // Fetch project bills
      .addCase(fetchProjectBills.pending, (state) => {
        state.loadingStates.fetchingProjectBills = true;
      })
      .addCase(fetchProjectBills.fulfilled, (state, action) => {
        state.loadingStates.fetchingProjectBills = false;
        state.projectBills = action.payload;
      })
      .addCase(fetchProjectBills.rejected, (state) => {
        state.loadingStates.fetchingProjectBills = false;
      })
      // Connect bill
      .addCase(connectBillToProject.pending, (state) => {
        state.loadingStates.connectingBill = true;
      })
      .addCase(connectBillToProject.fulfilled, (state, action) => {
        state.loadingStates.connectingBill = false;
        state.unconnectedBills = state.unconnectedBills.filter(
          bill => bill._id !== action.payload._id
        );
        state.projectBills.push(action.payload);
      })
      .addCase(connectBillToProject.rejected, (state) => {
        state.loadingStates.connectingBill = false;
      })
      // Disconnect bill
      .addCase(disconnectBillFromProject.pending, (state) => {
        state.loadingStates.disconnectingBill = true;
      })
      .addCase(disconnectBillFromProject.fulfilled, (state, action) => {
        state.loadingStates.disconnectingBill = false;
        state.projectBills = state.projectBills.filter(
          bill => bill._id !== action.payload._id
        );
        state.unconnectedBills.push(action.payload);
      })
      .addCase(disconnectBillFromProject.rejected, (state) => {
        state.loadingStates.disconnectingBill = false;
      });
  }
});

export const { clearCurrentBill, resetLoadingStates } = interiorBillingSlice.actions;
export default interiorBillingSlice.reducer;
